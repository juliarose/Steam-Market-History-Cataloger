'use strict';

import { escapeHTML, escapeRegExp, printDate } from '../helpers/utils.js';
import { download } from '../helpers/download.js';
import { formatMoney } from '../money.js';
import { buildFile } from '../buildFile.js';

/**
 * Builds a table for records.
 * @param {Array} records - Records to display.
 * @param {Object} Class - Class of items in 'records'.
 * @param {Object} options - Options for formatting table.
 * @param {Object} [options.locales] - Locale strings.
 * @param {Stirng} [options.title] - Title to display above table.
 * @param {Boolean} [options.keep_page] - Keep page from previously rendered table.
 * @param {Boolean} [options.no_download] - Do not display download button when set to true.
 * @param {Array} [options.columns] - Array of names of columns to render.
 * @param {Number} [options.page] - Current page for pagination.
 * @param {Number} [options.count] - Number of results to show per page.
 * @param {Currency} options.currency - Currency to format money values in.
 * @returns {HTMLElement} DOM element of table.
 * @namespace Layout.buildTable
 */
function buildTable(records, Class, options) {
    const classDisplay = Class.display;
    const display = classDisplay.table || {};
    // sorting keys for each column
    const sorts = display.sorts || {};
    // columns to render
    const columns = options.columns || display.columns;
    // columns that are currencies
    const currencyFields = classDisplay.currency_fields || [];
    // get classes for each column pre-made to improve performance
    const classLists = getColumnClasses(display, columns);
    // class of the table
    const tableClass = Class.identifier + '-table';
    // container element for table
    const tableEl = document.createElement('div');
    // strings used in table
    const locales = (
        options.locales &&
        options.locales.tables
    ) || {
        empty: 'Nothing to display.',
        download: 'Download',
        next: 'Next',
        previous: 'Previous'
    };
    const currency = options.currency;
    // object for storing table elements
    let page = {};
    // pagination helpers
    const pagination = {
        // current page for pagination
        page: options.page || 1,
        // number of results to show per page
        count: options.count || 100,
        /**
         * Gets records for current page.
         * @returns {Array} Array of records.
         */
        getRecords: function() {
            const start = this.getIndex();
            const end = start + this.count;
            
            return records.slice(start, end);
        },
        /*
         * Gets total number of pages available
         * @returns {Number} Number of pages
         */
        getTotalPages: function() {
            return Math.ceil(records.length / this.count);
        },
        /**
         * Gets starting index based on page number and count.
         * @returns {Number} Index to slice at.
         */
        getIndex: function() {
            return (this.page - 1) * this.count;
        },
        /**
         * Get text used for current page.
         * @returns {String} Text for index, e.g. "5 / 24".
         */
        getIndexText: function() {
            return `${this.page} / ${this.getTotalPages()}`;
        },
        /**
         * Changes page.
         * @param {Number} difference - Number of pages to add to current page.
         * @returns {Boolean} Whether the resulting difference has changed the page or not.
         */
        changePage: function(difference) {
            const page = this.page;
            const desired = page + difference;
            
            return this.goTo(desired);
        },
        /**
         * Go to page.
         * @param {Number} desired - Desired page.
         * @returns {Boolean} Whether the page was changed or not.
         */
        goTo: function(desired) {
            const page = this.page;
            
            if (desired >= 1 && desired <= this.getTotalPages()) {
                this.page = desired;
            }
            
            // page changed
            return this.page !== page;
        },
        /**
         * Updates pagination state.
         * @returns {undefined}
         */
        update: function() {
            /**
             * Adds or removes "disabled" class to every element in 'list'.
             * @param {Array} list - List of nodes.
             * @param {String} [method='remove'] - "add" or "remove".
             * @returns {undefined}
             */
            function modify(list, method = 'add') {
                list.forEach((el) => el.classList[method]('disabled'));
            }
            
            // update pagination control buttons
            if (this.page <= 1) {
                // reached beginning
                modify(page.pagination.previousList, 'add');
                modify(page.pagination.nextList, 'remove');
            } else if (this.page >= this.getTotalPages()) {
                // reached end
                modify(page.pagination.nextList, 'add');
                modify(page.pagination.previousList, 'remove');
            } else {
                // in-between
                modify(page.pagination.controls, 'remove');
            }
            
            // update the index text
            page.pagination.indexList.forEach((element) => {
                element.textContent = this.getIndexText();
                element.setAttribute('data-page', this.page);
            });
            // update the body
            page.body.innerHTML = getHTML.body();
        },
        /*
         * Resets page number back to start
         * @returns {undefined}
         */
        reset: function() {
            this.page = 1;
        }
    };
    const getHTML = {
        // no records to display
        empty: function() {
            return `<div class="${tableClass} empty-table">${locales.empty}</div>`;
        },
        controls: function(location, canAddDownloadControls) {
            const downloadControls = () => {
                return (
                    '<div class="item dropdown">' +
                        `<div class="button">${locales.download}</div>` +
                        '<div class="dropdown-content hidden">' +
                          '<a data-value="csv" href="#">CSV</a>' +
                          '<a data-value="json" href="#">JSON</a>' +
                        '</div>' +
                    '</div>'
                );
            };
            const paginationControls = () => {
                return (
                    '<div class="item pagination">' +
                        // page input - may add in later
                        // `<div class="index"><input type="number" value="${page}" min="1" ` +
                        // `max="${getTotalPages()}"/><div class="range">${getIndexText()}</div></div>` +
                        `<div class="index" data-page="${pagination.page}">${pagination.getIndexText()}</div>` +
                        `<div class="button control previous disabled">${locales.previous}</div>` +
                        `<div class="button control next">${locales.next}</div>` +
                    '</div>'
                );
            };
            const totalPages = pagination.getTotalPages();
            const canAddPaginationControls = totalPages > 1;
            let contents = '';
            
            if (location === 'top' && options.title) {
                contents += getHTML.title();
            }
            
            if (canAddPaginationControls) {
                contents += paginationControls();
            }
            
            if (canAddDownloadControls) {
                contents += downloadControls();
            }
            
            if (records.length === 0 || contents.length === 0) {
                // nothing to be done
                return '';
            } else {
                return `<div class="table-controls controls ${location}">${contents}</div>`;
            }
        },
        title: function() {
            if (options.title) {
                return `<h4 class="table-title">${escapeHTML(options.title)}</h4>`;
            } else {
                return '';
            }
        },
        table: function() {
            const getHead = () => {
                const getHeadingCell = (column) => {
                    const getColumnName = (column) => {
                        return (display.column_names || {})[column] || '';
                    };
                    const getAttributes = () => {
                        const sortColumn = sorts[column];
                        let attributes = [
                            `data-column="${column}"`,
                        ];
                        let classList = classLists[column];
                        
                        if (sortColumn) {
                            // add sortable to class list
                            classList = [classList, 'sortable'].filter(a => a).join(' ');
                            attributes.push(`data-sort-column="${sortColumn}"`);
                        }
                        
                        if (classList) {
                            attributes.push(`class="${classList}"`);
                        }
                        
                        return attributes.join(' ');
                    };
                    
                    const attributes = getAttributes();
                    const contents = escapeHTML(getColumnName(column));
                    
                    return `<th ${attributes}>${contents}</th>`;
                };
                const contents = columns.map(getHeadingCell).join('');
                
                return `<tr>${contents}</tr>`;
            };
            const getBody = () => {
                return getHTML.body();
            };
            
            const head = getHead();
            const body = getBody();
            const contents = (
                `<thead>${head}</thead>` +
                `<tbody>${body}</tbody>`
            );
            
            return `<table class="${tableClass}">${contents}</table>`;
        },
        body: function() {
            const getCell = (column, value) => {
                const classList = classLists[column];
                const attributes = (classList ? 'class="' + classList + '"' : '');
                
                return `<td ${attributes}>${value}</td>`;
            };
            const printItem = (record, key) => {
                const formatter = formatters[key];
                let val = record[key];
                
                // special formatter for value
                if (formatter) {
                    // can contain raw html
                    return formatter(val, record);
                } else if (val === null || val === undefined) {
                    val = '';
                } else if (val instanceof Date) {
                    val = printDate(val);
                } else if (currencyFields.indexOf(key) > -1) {
                    val = formatMoney(val, currency);
                } else {
                    val = val.toString();
                }
                
                return escapeHTML(val);
            };
            const getRow = (record) => {
                const classList = display.row_class && display.row_class(record).join(' ');
                const primaryKey = Class.primary_key;
                const attributes = [
                    primaryKey ? `id="${Class.identifier}_${record[primaryKey]}"` : null,
                    classList ? `class="${classList}"` : null
                ].filter(Boolean).join(' ');
                const contents = columns.map((column) => {
                    return getCell(column, printItem(record, column));
                }).join('');
                
                return `<tr ${attributes}>${contents}</tr>`;
            };
            
            // get current page of results
            const displayRecords = pagination.getRecords();
            const formatters = display.cell_value || {};
            const contents = displayRecords.map(getRow).join('');
            
            return contents;
        }
    };
    
    function getTable() {
        function bindEvents() {
            // use sort from existing table
            function getSort() {
                const existingEl = document.querySelector(`table.${tableClass} th[data-direction]`);
                
                if (existingEl == null) {
                    return;
                }
                
                const data = existingEl.dataset;
                const column = data.column;
                const foundEl = tableEl.querySelector(`th[data-column="${column}"]`);
                
                if (foundEl == null) {
                    return;
                }
                
                const direction = parseInt(data.direction) * -1;
                const event = new Event('click');
                
                foundEl.setAttribute('data-direction', direction);
                foundEl.dispatchEvent(event);
            }
            
            function getPage() {
                if (!options.keep_page) {
                    return;
                }
                
                const existingTableEl = document.querySelector(`table.${tableClass}`);
                const indexEl = (
                    existingTableEl &&
                    existingTableEl.parentNode.querySelector('.pagination .index')
                );
                
                if (indexEl != null) {
                    const data = indexEl.dataset;
                    const page = data.page && parseInt(data.page);
                    // the page has changed
                    const pageChanged = Boolean(
                        page &&
                        // this will go to the given page, if possible,
                        // and return whether the page was changed or not
                        pagination.goTo(page)
                    );
                    
                    if (pageChanged) {
                        // the table is re-drawn
                        // but will effectively look like it did before it was re-rendered
                        // update the pagination
                        pagination.update();
                    }
                }
            }
            
            function bindRowEvents() {
                // this will only work with items that contain a primary key
                // may redo this later to work with data that does not include a primary key
                if (!Class.primary_key || !page.body || !display.events) {
                    return;
                }
                
                function bindEvent(eventName) {
                    // this will get the record from the target of the row
                    function getRecord(target) {
                        const pattern = new RegExp(`^${escapeRegExp(Class.identifier)}_`);
                        // extract the id from the row class by replacing its identifier
                        const id = (target.closest('tr').id || '').replace(pattern, '');
                        const primaryKey = Class.primary_key;
                        
                        return records.find((record) => {
                            // type-agnostic check
                            // the id value will always be a string but the value from a record may not
                            return record[primaryKey] == id;
                        });
                    }
                    
                    page.body.addEventListener(eventName, (e) => {
                        const record = getRecord(e.target);
                        
                        if (record != null) {
                            display.events[eventName](e, record);
                        }
                    });
                }
                
                Object.keys(display.events).forEach(bindEvent);
            }
            
            function bind() {
                // changes the page
                function changePage(e) {
                    const controlEl = e.target;
                    // get whether to add/subtract based on which button was pressed
                    const difference = controlEl.classList.contains('previous') ? -1 : 1;
                    
                    // the page has changed
                    if (pagination.changePage(difference)) {
                        pagination.update();
                    }
                }
                
                // downloads the records
                function downloadRecords(e) {
                    // the format option selected
                    const format = e.target.dataset.value;
                    // generate the data for this format
                    const data = buildFile(records, Class, options, format);
                    
                    if (data) {
                        const filename = 'records.' + format;
                        
                        download(filename, data);
                    }
                }
                
                // sorts the column selected
                function sortColumn(e) {
                    // resets a column's attributes
                    const resetColumn = (el) => {
                        el.removeAttribute('data-direction');
                        el.classList.remove('asc');
                        el.classList.remove('desc');
                    };
                    const columnEl = e.target;
                    const data = columnEl.dataset;
                    const key = data.sortColumn;
                    const direction = data.direction || -1;
                    // pick sort direction
                    const directionClassName = direction > 0 ? 'desc': 'asc';
                    // list of sortable columns
                    const sortableList = page.sortable;
                    
                    // reset columns
                    sortableList.forEach(resetColumn);
                    columnEl.setAttribute('data-direction', direction * -1);
                    columnEl.classList.add(directionClassName);
                    
                    // update the records
                    records = sortByType(key, Class.types[key], records, direction > 0);
                    // reset to page 1
                    pagination.reset();
                    // then update
                    pagination.update();
                }
                
                // adds listeners to a list of elements
                function addListeners(list, event, fn) {
                    list.forEach((el) => el.addEventListener(event, fn));
                }
                
                addListeners(page.sortable, 'click', sortColumn);
                addListeners(page.dropdowns, 'click', downloadRecords);
                addListeners(page.pagination.controls, 'click', changePage);
            }
            
            // bind events to columns and pagiation constrols
            bind();
            // bind events to the table rows
            bindRowEvents();
            // get the current sort
            getSort();
            // get the current page
            getPage();
        }
        
        if (records.length === 0) {
            // our table is empty
            tableEl.classList.add('table-wrapper');
            tableEl.innerHTML = getHTML.empty();
        } else {
            // draw the table
            tableEl.classList.add('table-wrapper');
            tableEl.innerHTML = [
                getHTML.controls('top', !options.no_download && true),
                getHTML.table(),
                getHTML.controls('bottom')
            ].join('');
            // get table elements for binding events
            page = {
                body: tableEl.querySelector('tbody'),
                rows: tableEl.querySelectorAll('tbody tr'),
                sortable: tableEl.querySelectorAll('th[data-sort-column]'),
                dropdowns: tableEl.querySelectorAll('.dropdown .dropdown-content a'),
                pagination: {
                    controls: tableEl.querySelectorAll('.pagination .next, .pagination .previous'),
                    previousList: tableEl.querySelectorAll('.pagination .previous'),
                    nextList: tableEl.querySelectorAll('.pagination .next'),
                    indexList: tableEl.querySelectorAll('.pagination .index')
                }
            };
            bindEvents();
        }
        
        return tableEl;
    }
    
    return getTable();
}

/**
 * Sorts an array by key based on data type.
 *
 * The sorting methods are based on the type of data we are sorting.
 * @param {String} key - Sort key.
 * @param {Object} type - Class object of data type e.g. Number, Date...
 * @param {Array} arr - Array to sort.
 * @param {Boolean} reverse - Sort in reverse?
 * @returns {Array} Sorted array.
 */
function sortByType(key, type, arr, reverse) {
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
 * Gets list of classes for each column in 'columns'.
 * @param {Object} display - Object to draw class values from.
 * @param {Array} columns - Array of column names.
 * @returns {Object} Object containing classes for each column.
 */
function getColumnClasses(display, columns) {
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

export { buildTable };