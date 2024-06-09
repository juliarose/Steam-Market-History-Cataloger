'use strict';

import { escapeHTML, escapeRegExp, printDate } from '../helpers/utils.js';
import { download, downloadCollection } from '../helpers/download.js';
import { formatMoney } from '../money.js';
import { buildFile, getStreamDownloadOptions } from '../buildFile.js';
import { Pagination, getColumnClasses, sortByType } from './helpers.js';

/**
 * @typedef {import('../currency.js').Currency} Currency
 * @typedef {import('../classes/localization.js').Localization} Localization
 */

/**
 * Options for building a table.
 * @typedef {Object} BuildTableOptions
 * @property {Localization} locales - Locale strings.
 * @property {Currency} currency - Currency to format money values in.
 * @property {string} [title] - Title to display above table.
 * @property {boolean} [keep_page] - Keep page from previously rendered table.
 * @property {boolean} [no_download] - Do not display download button when set to true.
 * @property {string[]} [columns] - Array of names of columns to render.
 * @property {number} [page] - Current page for pagination.
 * @property {number} [count] - Number of results to show per page.
 */

/**
 * Builds a table for records.
 * @param {Array} records - Records to display.
 * @param {Object} Class - Class of items in 'records'.
 * @param {BuildTableOptions} options - Options for formatting table.
 * @returns {HTMLElement} DOM element of table.
 * @namespace Layout.buildTable
 */
export function buildTable(records, Class, options) {
    const { locales } = options;
    const classDisplay = Class.makeDisplay(locales);
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
    const tableLocales = (
        options.locales.ui &&
        options.locales.ui.tables
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
    const pagination = new Pagination({
        page: options.page,
        count: options.count,
        records
    });
    // functions for generating HTML
    const getHTML = {
        // no records to display
        empty() {
            return `<div class="${tableClass} empty-table">${tableLocales.empty}</div>`;
        },
        // draw controls for table
        controls(location, canAddDownloadControls) {
            const totalPages = pagination.getTotalPages();
            const canAddPaginationControls = totalPages > 1;
            let contents = '';
            
            if (location === 'top' && options.title) {
                contents += getHTML.title();
            }
            
            if (canAddPaginationControls) {
                contents += (
                    '<div class="item pagination">' +
                        // page input - may add in later
                        // `<div class="index"><input type="number" value="${page}" min="1" ` +
                        // `max="${getTotalPages()}"/><div class="range">${getIndexText()}</div></div>` +
                        `<div class="index" data-page="${pagination.page}">${pagination.getIndexText()}</div>` +
                        `<div class="button control previous disabled">${tableLocales.previous}</div>` +
                        `<div class="button control next">${tableLocales.next}</div>` +
                    '</div>'
                );
            }
            
            if (canAddDownloadControls) {
                contents += (
                    '<div class="item dropdown">' +
                        `<div class="button">${tableLocales.download}</div>` +
                        '<div class="dropdown-content hidden">' +
                          '<a data-value="csv" href="#">CSV</a>' +
                          '<a data-value="json" href="#">JSON</a>' +
                        '</div>' +
                    '</div>'
                );
            }
            
            return `<div class="table-controls controls ${location}">${contents}</div>`;
        },
        // draw title for table
        title() {
            if (!options.title) {
                return '';
            }
            
            return `<h4 class="table-title">${escapeHTML(options.title)}</h4>`;
        },
        // draw the table
        table() {
            const head = (function() {
                const contents = columns
                    .map((column) => {
                        const attributes = (function() {
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
                        }());
                        const columnName = (display.column_names || {})[column] || '';
                        const contents = escapeHTML(columnName);
                        
                        return `<th ${attributes}>${contents}</th>`;
                    })
                    .join('');
                
                return `<tr>${contents}</tr>`;
            }());
            const body = getHTML.body();
            const contents = (
                `<thead>${head}</thead>` +
                `<tbody>${body}</tbody>`
            );
            
            return `<table class="${tableClass}">${contents}</table>`;
        },
        body() {
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
            // get current page of results
            const displayRecords = pagination.getRecords();
            const formatters = display.cell_value || {};
            const contents = displayRecords
                .map((record) => {
                    const classList = display.row_class && display.row_class(record).join(' ');
                    const primaryKey = Class.primary_key;
                    const attributes = [
                        primaryKey ? `id="${Class.identifier}_${record[primaryKey]}"` : null,
                        classList ? `class="${classList}"` : null
                    ].filter(Boolean).join(' ');
                    const contents = columns.map((column) => {
                        const value = printItem(record, column);
                        const classList = classLists[column];
                        const attributes = (classList ? 'class="' + classList + '"' : '');
                        
                        return `<td ${attributes}>${value}</td>`;
                    }).join('');
                    
                    return `<tr ${attributes}>${contents}</tr>`;
                })
                .join('');
            
            return contents;
        }
    };
    
    /**
     * Updates the paginaton layout.
     * @param {Pagination} pagination 
     */
    function updatePagination(pagination) {
        /**
         * Adds or removes "disabled" class to every element in 'list'.
         * @param {Array} list - List of nodes.
         * @param {string} [method='remove'] - "add" or "remove".
         */
        function modify(list, method = 'add') {
            list.forEach((el) => el.classList[method]('disabled'));
        }
        
        // update pagination control buttons
        if (pagination.page <= 1) {
            // reached beginning
            modify(page.pagination.previousList, 'add');
            modify(page.pagination.nextList, 'remove');
        } else if (pagination.page >= pagination.getTotalPages()) {
            // reached end
            modify(page.pagination.nextList, 'add');
            modify(page.pagination.previousList, 'remove');
        } else {
            // in-between
            modify(page.pagination.controls, 'remove');
        }
        
        // update the index text
        page.pagination.indexList.forEach((element) => {
            element.textContent = pagination.getIndexText();
            element.setAttribute('data-page', pagination.page);
        });
        // update the body
        page.body.innerHTML = getHTML.body();
    }
    
    function getTable() {
        if (records.length > 0) {
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
            // bind events to columns and pagination controls
            (function () {
                // changes the page
                function changePage(e) {
                    const controlEl = e.target;
                    // get whether to add/subtract based on which button was pressed
                    const difference = controlEl.classList.contains('previous') ? -1 : 1;
                    
                    // the page has changed
                    if (pagination.changePage(difference)) {
                        updatePagination(pagination);
                    }
                }
                
                // downloads the records
                function downloadRecords(e) {
                    function downloadStatic() {
                        const data = buildFile(records, Class, options, format);
                        
                        if (data) {
                            download(filename, data);
                        }
                    }
                    
                    // the format option selected
                    const format = e.target.dataset.value;
                    const filename = 'records.' + format;
                    // generate the data for this format
                    const { table, collection } = options;
                    
                    if (collection) {
                        collection.count()
                            .then((count) => {
                                // we already loaded all the records
                                // this is much faster
                                if (count === records.length) {
                                    downloadStatic();
                                } else {
                                    const downloadOptions = getStreamDownloadOptions(Class, options, format);
                                    
                                    downloadCollection(filename, table, collection, downloadOptions);
                                }
                            });
                    } else {
                        downloadStatic();
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
                    updatePagination(pagination);
                }
                
                // adds listeners to a list of elements
                function addListeners(list, event, fn) {
                    list.forEach((el) => el.addEventListener(event, fn));
                }
                
                addListeners(page.sortable, 'click', sortColumn);
                addListeners(page.dropdowns, 'click', downloadRecords);
                addListeners(page.pagination.controls, 'click', changePage);
            }());
            // bind events to the table rows
            (function() {
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
            }());
            // get the current sort
            (function () {
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
            }());
            // get the current page
            (function () {
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
                        updatePagination(pagination);
                    }
                }
            }());
        } else {
            // our table is empty
            tableEl.classList.add('table-wrapper');
            tableEl.innerHTML = getHTML.empty();
        }
        
        return tableEl;
    }
    
    return getTable();
}