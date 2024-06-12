import { range, arrToKeys, groupBy, transformObj } from '../../helpers/utils.js';
import { buildTable } from '../../layout/buildTable.js';
import { applist } from '../../data/applist.js';
import { AnnualTotal } from '../../classes/totals/annualtotal.js';
import { MonthlyTotal } from '../../classes/totals/monthlytotal.js';
import { DailyTotal } from '../../classes/totals/dailytotal.js';
import { AppTotal } from '../../classes/totals/apptotal.js';

/**
 * @typedef {import('../../currency.js').Currency} Currency
 * @typedef {import('../../classes/localization.js').Localization} Localization
 */

/**
 * Builds summary tables for listings.
 * @param {Array} records - Records to summarize.
 * @param {Object} Class - Listing class object.
 * @param {Object} options - Options.
 * @param {Currency} options.currency - Currency to use for displaying prices.
 * @param {Localization} [options.locales] - Locale strings.
 * @returns {HTMLElement} Document fragment.
 */
export function buildSummaries(records, Class, options = {}) {
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
                return (today - record.date_acted) < THIRTY_DAYS;
            });
            const byDay = groupBy(filtered, (record) => {
                // group by difference in days
                return Math.floor((today - record.date_acted) / ONE_DAY);
            });
            // get a day for each day within the range
            const daysRange = arrToKeys(range(0, DAYS_RANGE), []);
            
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
            const prices = {
                sale: 0,
                purchase: 0
            };
            // will transform the above object but suffix the keys with "_count"
            const counts = transformObj(prices, {
                keys: countKey
            });
            
            return Object.assign(prices, counts);
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
        function draw(records, Class, title) {
            const tableOptions = Object.assign({}, options, {
                title
            });
            
            return buildTable(records, Class, tableOptions);
        }
        
        function createRecord(total, mix) {
            return Object.assign(total, mix);
        }
        
        function annual(index) {
            let records = [];
            
            for (let year in index) {
                const total = index[year];
                const record = createRecord(total, {
                    year: parseInt(year)
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
                    const record = createRecord(total, {
                        year: parseInt(year),
                        month: parseInt(month)
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
                const record = createRecord(total, {
                    appname: applist[appid] || appid.toString(),
                    appid: parseInt(appid)
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
                const record = createRecord(total, {
                    date: date
                });
                
                records.push(record);
            }
            
            return draw(records, DailyTotal, uiLocales.titles.last_n_days.replace('%s', 30));
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
    const fragment = document.createDocumentFragment();
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
    const tables = Object.keys(totals).reduce((result, key) => {
        // draw table for totals
        result[key] = drawTable[key](totals[key]);
        
        return result;
    }, {});
    // the order we want to display the tables in
    const orderedNames = [
        'annual',
        'monthly',
        'daily',
        'app'
    ];
    
    orderedNames
        .map((name) => tables[name])
        .forEach((table) => {
            // then add them to the fragment in this order
            fragment.appendChild(table);
        });
    
    return fragment;
}
