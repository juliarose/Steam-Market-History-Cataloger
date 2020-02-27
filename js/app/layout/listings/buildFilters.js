'use strict';

import { applist } from '../../data/applist.js';
import { uniq } from '../../helpers/utils.js';

/**
 * Builds filters for listings.
 * @param {Array} records - Records to draw filters from.
 * @param {Object} Class - Listing class object.
 * @param {Object} [options={}] - Options.
 * @param {Object} [options.locales] - Locale strings.
 * @param {Function} [options.onChange] - Function to call on filter change.
 * @returns {HTMLElement} DOM element.
 * @namespace Layout.listings.buildFilters
 */
function buildFilters(records, Class, options = {}) {
    /**
     * Builds index of options.
     * @returns {Object} Index of records.
     */
    function buildIndex() {
        let index = {};
        
        index.market_name = '';
        index.dates = {};
        
        [
            'appid',
            'name_color',
            'is_credit'
        ].forEach((k) => {
            index[k] = uniq(records.map(record => record[k]));
        });
        
        index.name_color = index.name_color.filter((a) => a);
        
        if (records.length > 0) {
            // records are sorted from newest to oldest
            const first = records[records.length - 1];
            const last = records[0];
            
            index.dates = {
                start: first.date_acted,
                end: last.date_acted
            };
        }
        
        for (let k in index) {
            // remove single or 0 value indices
            if (Array.isArray(index[k]) && index[k].length <= 1) {
                delete index[k];
            }
        }
        
        return index;
    }
    
    /**
     * Draws options.
     * @param {Object} index - Index to draw.
     * @returns  {undefined}
     */
    function drawIndex(index) {
        const fragment = document.createDocumentFragment();
        const dateContainer = document.createElement('div');
        const display = Class.display;
        const events = {
            dropdownChange: function(e) {
                const linkEl = e.target;
                const dropdownEl = linkEl.parentNode.parentNode;
                const buttonEl = dropdownEl.getElementsByClassName('button')[0];
                const text = linkEl.textContent;
                const name = dropdownEl.getAttribute('data-name');
                const value = linkEl.dataset.value;
                
                if (value == undefined) {
                    buttonEl.classList.remove('active');
                    buttonEl.textContent = dropdownEl.getAttribute('data-default');
                    removeQuery(name);
                } else {
                    buttonEl.classList.add('active');
                    buttonEl.textContent = text;
                    
                    queryChange(name, value);
                }
            },
            textFieldChange: function(e) {
                const inputEl = e.target;
                const name = inputEl.dataset.name;
                const value = inputEl.value;
                
                checkInputState(inputEl);
                
                if (value === '') {
                    removeQuery(name);
                } else {
                    queryChange(name, value);
                }
            },
            textFieldInput: function(e) {
                const inputEl = e.target;
                
                checkInputState(inputEl);
                
                // this is important for the event to function properly
                return e;
            },
            textFieldKeyUp: function(e) {
                const inputEl = e.target;
                
                // on enter
                if (e.which == 13) {
                    // update the field
                    inputEl.dispatchEvent(new Event('change'));
                }
            }
        };
        const draw = {
            dateField: function(id, name, dates) {
                if (!dates.start) return;
                
                function bindEvents() {
                    inputEl.addEventListener('change', events.textFieldChange);
                }
                
                function formatDate(date) {
                    return [
                        date.getUTCFullYear(),
                        date.getUTCMonth() + 1,
                        date.getUTCDate()
                    ].join('-');
                }
                
                const startDate = formatDate(dates.start);
                const endDate = formatDate(dates.end);
                const containerEl = document.createElement('div');
                const inputEl = document.createElement('input');
                const labelEl = document.createElement('label');
                
                containerEl.classList.add('item', 'date-box');
                labelEl.textContent = getName(name);
                labelEl.setAttribute('for', name);
                inputEl.type = 'date';
                inputEl.setAttribute('name', name);
                inputEl.setAttribute('data-name', name);
                inputEl.setAttribute('min', startDate);
                inputEl.setAttribute('max', endDate);
                
                containerEl.append(labelEl);
                containerEl.append(inputEl);
                
                bindEvents();
                dateContainer.append(containerEl);
            },
            dropdown: function(name, list) {
                function getOptionText(value) {
                    let values = (locales.values || {})[name] || {};
                    let print = values[value] ? values[value] : value;
                    
                    switch (name) {
                        case 'appid':
                            return applist[value] || print;
                        case 'name_color':
                            return `<span class="circle" style="color: #${value}"/></span>` + print;
                        default:
                            return print;
                    }
                }
                
                function bindEvents() {
                    Array.from(contentEl.getElementsByTagName('a')).forEach((optionEl) => {
                        optionEl.addEventListener('click', events.dropdownChange);
                    });
                }
                
                const fieldName = getName(name);
                const dropdownEl = document.createElement('div');
                const buttonEl = document.createElement('div');
                const contentEl = document.createElement('div');
                const optionsHTML = ['<a class="none" href="#">(none)</a>'].concat(list.map((value) => {
                    return `<a data-value="${value}" href="#">${getOptionText(value)}</a>`;
                })).join('');
                
                dropdownEl.appendChild(buttonEl);
                dropdownEl.appendChild(contentEl);
                buttonEl.textContent = fieldName;
                contentEl.innerHTML = optionsHTML;
                
                buttonEl.classList.add('button');
                contentEl.classList.add('dropdown-content', 'hidden');
                dropdownEl.classList.add('item', 'dropdown');
                dropdownEl.setAttribute('data-name', name);
                dropdownEl.setAttribute('data-default', fieldName);
                
                bindEvents();
                fragment.append(dropdownEl);
            },
            textField: function(name) {
                function bindEvents() {
                    textEl.addEventListener('keyup', events.textFieldKeyUp);
                    textEl.addEventListener('input', events.textFieldInput);
                    textEl.addEventListener('change', events.textFieldChange);
                }
                
                const wrapperEl = document.createElement('div');
                const fieldName = getName(name);
                const textEl = document.createElement('input');
                
                wrapperEl.classList.add('item');
                textEl.setAttribute('type', 'text');
                textEl.setAttribute('placeholder', fieldName);
                textEl.setAttribute('data-name', name);
                textEl.setAttribute('data-default', fieldName);
                wrapperEl.append(textEl);
                
                bindEvents();
                fragment.append(wrapperEl);
            }
        };
        
        function checkInputState(inputEl) {
            if (inputEl.value) {
                inputEl.classList.add('active');
            } else {
                inputEl.classList.remove('active');
            }
        }
        
        // get name of key
        function getName(name) {
            return locales.names[name] || display.names[name] || name;
        }
        
        function addIndex(k, v) {
            switch (k) {
                case 'dates':
                    draw.dateField('start', 'after_date', v);
                    draw.dateField('end', 'before_date', v);
                    break;
                case 'market_name':
                    draw.textField(k);
                    break;
                default:
                    draw.dropdown(k, v);
                    break;
            }
        }
        
        if (records.length > 0) {
            if (index.dates.start && index.dates.start.getTime() !== index.dates.end.getTime()) {
                
                dateContainer.classList.add('dates');
                fragment.append(dateContainer);
            }
            
            Object.keys(index).forEach((k) => {
                addIndex(k, index[k]);
            });
        }
        
        return fragment;
    }
    
    /**
     * Updates filter queries.
     * @param {String} [only] - Only filter using this key.
     * @returns {undefined}
     */
    function updateQuery(only) {
        function getIndex(key) {
            // fastest order to sort records
            let fastest = ['is_credit', 'name_color', 'appid', 'year'];
            let index = fastest.indexOf(key);
            
            return index !== -1 ? index : 1000;
        }
        
        function makeDate(str) {
            const [year, month, day] = str.split('-').map((value) => {
                return parseInt(value);
            });
            
            return new Date(Date.UTC(year, month - 1, day, 12));
        }
        
        /**
         * Filters records by key and value pair.
         * @param {String} k - Key.
         * @param {*} v - Value.
         * @returns {Array} Filtered array.
         */
        function filterFrom(k, v) {
            let arr = [];
            let fn;
            
            // get function for filtering index
            switch (k) {
                case 'after_date':
                    v = makeDate(v).getTime();
                    fn = function(record) {
                        return record.date_acted.getTime() >= v;
                    };
                    break;
                case 'before_date':
                    v = makeDate(v).getTime();
                    fn = function(record) {
                        return record.date_acted.getTime() <= v;
                    };
                    break;
                case 'year':
                    v = parseInt(v);
                    fn = function(record) {
                        return record.date_acted.getUTCFullYear() == v;
                    };
                    break;
                case 'market_name':
                    v = v.toLowerCase();
                    fn = function(record) {
                        return record.market_name.toLowerCase().indexOf(v) !== -1;
                    };
                    break;
                default:
                    fn = function(record) {
                        return record[k] == v;
                    };
                    break;
            }
            
            for (let i = 0; i < filteredRecords.length; i++) {
                if (fn(filteredRecords[i])) {
                    arr.push(filteredRecords[i]);
                }
            }
            
            return arr;
        }
        
        // if 'only' is provided...
        // we only need to filter based on that key alone
        // otherwise we build a query from the current query
        const keys = only ? [only] : Object.keys(query).sort((a, b) => {
            return getIndex(a) - getIndex(b);
        });
        
        keys.forEach((k) => {
            // this is faster than filtering by all properties for each record
            filteredRecords = filterFrom(k, query[k]);
        });
        
        onChange(filteredRecords);
    }
    
    function addQuery(key, val) {
        let only;
        
        if (query[key] === val) {
            // nothing to be done
            return;
        } else if (query[key] !== undefined) {
            // reset when re-assigning filters
            filteredRecords = totalRecords;
        } else {
            // we are adding a key
            only = key;
        }
        
        query[key] = val;
        updateQuery(only);
    }
    
    function removeQuery(key) {
        delete query[key];
        
        filteredRecords = totalRecords;
        updateQuery();
    }
    
    function queryChange(key, val) {
        addQuery(key, val);
    }
    
    const locales = options.locales || {
        names: {
            year: 'Year',
            market_name: 'Name',
            is_credit: 'Sale Type'
        }
    };
    // the function called on filter change
    const onChange = options.onChange || function() {};
    // the total records
    const totalRecords = records;
    // filter indexes built from records
    const index = buildIndex(records);
    // current filter query
    let query = {};
    // currently filtered records
    let filteredRecords = totalRecords;
        
    return drawIndex(index);
}

export { buildFilters };