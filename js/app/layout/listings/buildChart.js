import { partition, groupBy, arrAverage } from '../../helpers/utils.js';
import { formatMoney } from '../../money.js';

/**
 * @typedef {import('../../currency.js').Currency} Currency
 * @typedef {import('../../classes/localization.js').Localization} Localization
 */

/**
 * Clusters records by date.
 * @param {Object[]} records - Objects to cluster.
 * @param {Function} [sum] - Sum function.
 * @returns {Object[]} Clustered records.
 */
function cluster(records, sum) {
    const groups = groupBy(records, (item) => {
        return Math.round(item.date_acted / 1000);
    });
    const times = Object.keys(groups);
    const total = function(values) {
        return values.reduce((a, b) => a + b);
    };
    const fn = sum ? total : arrAverage;
    
    return times.map((time) => {
        const dayRecords = groups[time];
        // create new record from first record in group
        const record = Object.assign({}, dayRecords[0]); 
        const values = dayRecords.map(a => a.price);
        
        // get number of records on that day
        record.count = dayRecords.length;
        record.price = fn(values);
        
        return record;
    });
}

/**
 * Builds chart for listings.
 * @param {Object[]} records - Records to chart.
 * @param {HTMLElement} element - DOM element to render inside.
 * @param {Object} options - Options.
 * @param {Currency} options.currency - Currency to use for displaying prices.
 * @param {Localization} options.locales - Locale strings.
 */
export function buildChart(records, element, options) {
    function getPlot(record) {
        return {
            x: record.date_acted,
            y: record.price
        };
    }
    
    function onZoom(chart, reset) {
        resetFn = reset;
    }
    
    function resetZoom() {
        if (resetFn) resetFn();
    }
    
    let resetFn;
    const { currency, locales } = options;
    const uiLocales = locales.ui;
    const keyNames = [1, 0];
    const keys = keyNames.map((name) => uiLocales.values.is_credit[name]);
    const classNames = ['sales', 'purchases'];
    const split = partition(records, (record) => {
        return record.is_credit;
    });
    const series = split.map((records, i) => {
        return {
            name: keys[i],
            className: classNames[i],
            data: cluster(records).map(getPlot)
        };
    });
    const chartData = {
        labels: keys,
        series: series
    };
    const chart = new Chartist.Line(element, chartData, {
        showPoint: true,
        lineSmooth: false,
        chartPadding: 0,
        height: 300,
        labels: keys,
        axisX: {
            type: Chartist.FixedScaleAxis,
            divisor: 12,
            labelInterpolationFnc: function(value) {
                return moment(value).format('MMM YYYY');
            }
        },
        axisY: {
            // should fit most labels
            offset: 54,
            type: Chartist.AutoScaleAxis,
            labelInterpolationFnc: function(value) {
                return formatMoney(value, currency);
            }
        },
        plugins: [
            Chartist.plugins.legend({
                legendNames: keys.filter((key, i) => {
                    return split[i].length > 0;
                }),
                classNames: classNames.filter((className, i) => {
                    return split[i].length > 0;
                }),
                position: 'bottom'
            }),
            Chartist.plugins.zoom({
                onZoom,
                // if set to true, a right click in the zoom area, will reset zoom.
                resetOnRightMouseBtn: true 
            })
        ]
    });
    const chartContainer = chart.container;
    
    chartContainer.addEventListener('dblclick', resetZoom);
}
