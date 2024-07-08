// @ts-check

import { groupBy } from '../../helpers/utils.js';
import { buildTable } from '../../layout/buildTable.js';
import { applist } from '../../data/applist.js';
import { AnnualTotal } from '../../models/totals/AnnualTotal.js';
import { MonthlyTotal } from '../../models/totals/MonthlyTotal.js';
import { DailyTotal } from '../../models/totals/DailyTotal.js';
import { AppTotal } from '../../models/totals/AppTotal.js';

/**
 * @typedef {import('../../currency.js').Currency} Currency
 * @typedef {import('../../models/Localization.js').Localization} Localization
 * @typedef {import('../../models/helpers/createClass.js').Displayable} Displayable
 */

/**
 * @typedef {Object} SummaryOptions
 * @property {Currency} currency - Currency to use for displaying prices.
 * @property {Localization} locales - Locale strings.
 * @property {number} count - Number of items for pagination results.
 */

/**
 * Builds summary tables for listings.
 * @param {Object[]} records - Records to summarize.
 * @param {SummaryOptions} options - Options.
 * @returns {DocumentFragment} Document fragment.
 */
export function buildSummaries(records, options) {
    const buildIndex = (function() {
        function date() {
            let index = {};
            
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                const date = record.date_acted;
                const year = date.getFullYear();
                const month = date.getMonth();
                
                if (!index[year]) {
                    index[year] = {};
                }
                
                if (!index[year][month]) {
                    index[year][month] = [];
                }
                
                index[year][month].push(record);
            }
            
            return index;
        }
        
        function daily() {
            const DAYS_RANGE = 30;
            const ONE_DAY = 24 * 60 * 60 * 1000;
            const THIRTY_DAYS = ONE_DAY * DAYS_RANGE;
            const now = new Date();
            // use mid-day in utc time
            const today = new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                12
            ));
            const filtered = records.filter((record) => {
                return (today.getTime() - record.date_acted.getTime()) < THIRTY_DAYS;
            });
            const byDay = groupBy(filtered, (record) => {
                // group by difference in days
                return Math.floor((today.getTime() - record.date_acted.getTime()) / ONE_DAY);
            });
            const daysRange = {};
            
            // get a day for each day within the range
            for (let i = 0; i < DAYS_RANGE; i++) {
                daysRange[i] = [];
            }
            
            // daysRange will fill in missing days from date range
            return Object.assign(daysRange, byDay);
        }
        
        function app() {
            return groupBy(records, (record) => {
                return record.appid;
            });
        }
        
        return {
            date,
            daily,
            app
        };
    }());
    const getTotal = (function() {
        // starting value for reducing totals
        function getStart() {
            return {
                sale: 0,
                sale_count: 0,
                purchase: 0,
                purchase_count: 0
            };
        }
        
        // the key for the count of the sale type
        function countKey(saleType) {
            return `${saleType}_count`;
        }
        
        function saleTypeKey(isCredit) {
            return isCredit ? 'sale' : 'purchase';
        }
        
        function reduceRecord(result, record) {
            const saleType = saleTypeKey(record.is_credit);
            const saleTypeCount = countKey(saleType);
            
            // add 1 to the count of the sale type
            result[saleTypeCount] += 1;
            // add to the price of the sale type
            result[saleType] += record.price;
            
            return result;
        }
        
        function annual(index) {
            function reduceMonth(result, month) {
                for (let key in result) {
                    result[key] += month[key];
                }
                
                return result;
            }
            
            let totals = {};
            
            for (let year in index) {
                totals[year] = Object.values(index[year]).reduce(reduceMonth, getStart());
            }
            
            return totals;
        }
        
        function monthly(index) {
            let totals = {};
            
            for (let year in index) {
                totals[year] = {};
                
                for (let month in index[year]) {
                    totals[year][month] = index[year][month].reduce(reduceRecord, getStart());
                }
            }
            
            return totals;
        }
        
        function basic(index) {
            let totals = {};
            
            for (let appid in index) {
                totals[appid] = index[appid].reduce(reduceRecord, getStart());
            }
            
            return totals;
        }
        
        function app(index) {
            return basic(index);
        }
        
        function daily(index) {
            return basic(index);
        }
        
        return {
            annual,
            monthly,
            daily,
            app
        };
    }());
    const drawTable = (function() {
        /**
         * Draws the table.
         * @param {Object[]} records - Records to display.
         * @param {Displayable} Displayable - Class to display. 
         * @param {string} title - Title of the table.
         * @returns 
         */
        function draw(records, Displayable, title) {
            const tableOptions = {
                title,
                ...options
            };
            
            return buildTable(records, Displayable, tableOptions);
        }
        
        function annual(index) {
            let records = [];
            
            for (let year in index) {
                const total = index[year];
                const record = new AnnualTotal({
                    year: parseInt(year),
                    ...total
                });
                
                records.push(record);
            }
            
            return draw(records.reverse(), AnnualTotal, uiLocales.titles.annual);
        }
        
        function monthly(index) {
            let records = [];
            
            for (let year in index) {
                for (let month in index[year]) {
                    const total = index[year][month];
                    const record = new MonthlyTotal({
                        year: parseInt(year),
                        month: parseInt(month),
                        ...total
                    });
                    
                    records.push(record);
                }
            }
            
            return draw(records.reverse(), MonthlyTotal, uiLocales.titles.monthly);
        }
        
        function app(index) {
            let records = [];
            
            for (let appid in index) {
                const total = index[appid];
                const record = new AppTotal({
                    appname: applist[appid] || appid.toString(),
                    appid: parseInt(appid),
                    ...total
                });
                
                records.push(record);
            }
            
            return draw(records.reverse(), AppTotal, uiLocales.titles.app);
        }
        
        function daily(index) {
            let records = [];
            
            function getDate(day) {
                const date = new Date();
                
                date.setDate(date.getDate() - parseInt(day));
                
                return date;
            }
            
            for (let day in index) {
                const date = getDate(day);
                const total = index[day];
                const record = new DailyTotal({
                    date,
                    ...total
                });
                
                records.push(record);
            }
            
            return draw(records, DailyTotal, uiLocales.titles.last_n_days.replace('%s', '30'));
        }
        
        return {
            annual,
            monthly,
            daily,
            app
        };
    }());
    
    const { locales } = options;
    const uiLocales = locales.ui;
    const indices = {
        date: buildIndex.date(),
        app: buildIndex.app(),
        daily: buildIndex.daily()
    };
    // we'll use this to build annual totals as well
    const monthlyTotals = getTotal.monthly(indices.date);
    const totals = {
        // annual totals are made from monthly totals
        annual: getTotal.annual(monthlyTotals),
        monthly: monthlyTotals,
        app: getTotal.app(indices.app),
        daily: getTotal.daily(indices.daily)
    };
    // the order we want to display the tables in
    const orderedNames = [
        'annual',
        'monthly',
        'daily',
        'app'
    ];
    const fragment = document.createDocumentFragment();
    
    orderedNames
        .forEach((name) => {
            // Draw the table for each name
            const table = drawTable[name](totals[name]);
            
            // then add them to the fragment in this order
            fragment.appendChild(table);
        });
    
    return fragment;
}
