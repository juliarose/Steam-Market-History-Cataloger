
/**
 * Gets list of classes for each column in 'columns'.
 * @param {Object} display - Object to draw class values from.
 * @param {string[]} columns - Array of column names.
 * @returns {Object} Object containing classes for each column.
 */
export function getColumnClasses(display, columns) {
    if (!display.column_class) {
        return {};
    }
    
    return columns.reduce((result, column) => {
        if (display.column_class[column]) {
            result[column] = display.column_class[column].join(' ');
        }
        
        return result;
    }, {});
}

/**
 * Sorts an array by key based on data type.
 *
 * The sorting methods are based on the type of data we are sorting.
 * @param {string} key - Sort key.
 * @param {Object} type - Class object of data type e.g. Number, Date...
 * @param {Object[]} arr - Array to sort.
 * @param {boolean} reverse - Sort in reverse?
 * @returns {Object[]} Sorted array.
 */
export function sortByType(key, type, arr, reverse) {
    // picking a function based on the data type we're sorting as well as the direction
    // depending on how many records the user has this can make the sorting noticeably more responsive
    // sorting numbers on 140,000+ records took ~40ms 
    // sorting dates on 140,000+ records took ~60ms
    // however, for some reason the performance is worse on the first sort and is much faster there-after
    // these are the numbers for performance after the first sort
    // the first sort is generally 2-4 times slower
    function getComparisonFunction(type, reverse) {
        switch (type) {
            case Number:
            case Boolean: {
                if (reverse) {
                    return function(a, b) {
                        return a[key] - b[key];
                    };
                }
                
                return function(a, b) {
                    return b[key] - a[key];
                };
            }
            case Date: {
                if (reverse) {
                    return function(a, b) {
                        // date.getTime is a little faster than using raw date
                        return a[key].getTime() - b[key].getTime();
                    };
                }
                
                return function(a, b) {
                    // date.getTime is a little faster than using raw date
                    return b[key].getTime() - a[key].getTime();
                };
            }
            case String:
            default: {
                if (reverse) {
                    return function(a, b) {
                        return (a[key]).localeCompare(b[key]);
                    };
                }
                
                return function(a, b) {
                    return (b[key]).localeCompare(a[key]);
                };
            }
        }
    }
    
    const compare = getComparisonFunction(type, reverse);
    
    // sorted array
    return arr.sort(compare);
}

/**
 * Pagination.
 */
export class Pagination {
    /**
     * Current page for pagination.
     * @type {number}
     */
    page = 1;
    /**
     * Number of results to show per page.
     * @type {number}
     */
    count = 100;
    /**
     * Array of records.
     * @type {Object[]}
     */
    #records = [];
    
    /**
     * Creates a new Pagination.
     * @param {Object} options - Options for pagination.
     * @param {number} [options.page] - Current page for pagination.
     * @param {number} [options.count] - Number of results to show per page.
     * @param {Object[]} options.records - Array of records.
     */
    constructor({ page, count, records }) {
        this.page = page || 1;
        this.count = count || 100;
        this.#records = records || [];
    }
    
    /**
     * Gets records for current page.
     * @returns {Object[]} Slice of records based on pagination.
     */
    getRecords() {
        const start = this.getIndex();
        const end = start + this.count;
        
        return this.#records.slice(start, end);
    }
    
    /**
     * Gets total number of pages available.
     * @returns {Number} Number of pages.
     */
    getTotalPages() {
        return Math.ceil(this.#records.length / this.count);
    }
    
    /**
     * Gets starting index based on page number and count.
     * @returns {number} Index to slice at.
     */
    getIndex() {
        return (this.page - 1) * this.count;
    }
    
    /**
     * Get text used for current page.
     * @returns {string} Text for index, e.g. "5 / 24".
     */
    getIndexText() {
        return `${this.page} / ${this.getTotalPages()}`;
    }
    
    /**
     * Changes page.
     * @param {number} difference - Number of pages to add to current page.
     * @returns {boolean} Whether the resulting difference has changed the page or not.
     */
    changePage(difference) {
        const page = this.page;
        const desired = page + difference;
        
        return this.goTo(desired);
    }
    
    /**
     * Go to page.
     * @param {number} desired - Desired page.
     * @returns {boolean} Whether the page was changed or not.
     */
    goTo(desired) {
        const page = this.page;
        
        if (desired >= 1 && desired <= this.getTotalPages()) {
            this.page = desired;
        }
        
        // page changed
        return this.page !== page;
    }
    
    /**
     * Resets page number back to start.
     */
    reset() {
        this.page = 1;
    }
}
