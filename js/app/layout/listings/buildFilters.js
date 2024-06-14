import { applist } from '../../data/applist.js';

/**
 * Creates an autocomplete field with the given values.
 * @param {HTMLElement} inputEl - The input element for the complete.
 * @param {string[]} values - Array of values to be used as search terms.
 * @param {Function} submitFn - The function to call when submitting the search.
 */
function addAutocompleteToField(inputEl, values, submitFn) {
    // adapted from https://www.w3schools.com/howto/howto_js_autocomplete.asp
    let currentFocus;
    
    // updates the active item
    function updateActiveItem(itemsList) {
        if (!itemsList) {
            return false;
        }
        
        // remove active on previous selected item
        removeActive(itemsList);
        
        if (currentFocus >= itemsList.length) {
            currentFocus = 0;
        }
        
        if (currentFocus < 0) {
            currentFocus = itemsList.length - 1;
        }
        
        // add class "autocomplete-active" to active item
        itemsList[currentFocus].classList.add('autocomplete-active');
    }
    
    // removes active class for all items in list
    function removeActive(itemsList) {
        for (let i = 0; i < itemsList.length; i++) {
            itemsList[i].classList.remove('autocomplete-active');
        }
    }
    
    // closes all autocomplete lists in the document,
    // except the one passed as an argument
    function closeAllLists(el) {
        let itemsContainerList = document.getElementsByClassName('autocomplete-items');
        
        Array.from(itemsContainerList)
            .filter((itemsContainerEl) => {
                return Boolean(
                    el !== itemsContainerEl &&
                    el !== inputEl
                );
            })
            .forEach((itemsContainerEl) => {
                itemsContainerEl.parentNode.removeChild(itemsContainerEl);
            });
    }
    
    function updateDropdown(e) {
        // take
        const inputEl = e.currentTarget;
        const { id } = inputEl;
        const inputValue = inputEl.value;
        // an uppercase version of the input value
        // cached for (marginally) improved performance
        const uppercaseInputValue = inputValue.toUpperCase();
        
        // close any already open lists of autocompleted values
        closeAllLists();
        
        // input is blank - nothing to search against
        if (!inputValue) {
            return false;
        }
        
        currentFocus = -1;
        
        // create an element that will contain the items
        const itemsContainerEl = document.createElement('div');
        
        itemsContainerEl.setAttribute('id', `${id}autocomplete-list`);
        itemsContainerEl.setAttribute('class', 'autocomplete-items');
        
        // loop through values
        values
            // filter values that match the search term
            .filter((value) => {
                return value.toUpperCase().includes(uppercaseInputValue);
            })
            // take first 10 results
            .slice(0, 10)
            // map each matching value to an element
            .map((value) => {
                const itemEl = document.createElement('div');
                const matchingIndex = value.toUpperCase().indexOf(uppercaseInputValue);
                const startStr = value.substr(0, matchingIndex);
                const matchingStr = value.substr(matchingIndex, inputValue.length);
                const endingStartIndex = matchingIndex + inputValue.length;
                const endStr = value.substr(endingStartIndex, value.length - endingStartIndex);
                
                // make the matching letters bold
                itemEl.innerHTML = `${startStr}<strong>${matchingStr}</strong>${endStr}`;
                
                // execute a function when the item is clicked
                itemEl.addEventListener('click', () => {
                    // change the input's value to the value for this element
                    inputEl.value = value;
                    
                    // close the list of autocompleted values
                    // (or any other open lists of autocompleted values
                    closeAllLists();
                    
                    // call the function to submit
                    submitFn(value);
                });
                
                return itemEl;
            })
            .forEach((itemEl) => {
                // add each element generated to the container element
                itemsContainerEl.appendChild(itemEl);
            });
        
        // the complete element is the parent of the input
        const autocompleteEl = inputEl.parentNode;
        
        // appends the element to the autocomplete element
        autocompleteEl.appendChild(itemsContainerEl);
    }
    
    inputEl.addEventListener('change', (e) => {
        const inputEl = e.currentTarget;
        const inputValue = inputEl.value;
        
        if (!inputValue) {
            // clear the value
            submitFn('');
        }
    });
    
    inputEl.addEventListener('focus', updateDropdown);
    
    // execute a function when input value changes
    inputEl.addEventListener('input', updateDropdown);
    
    // execute a function when key is pressed
    inputEl.addEventListener('click', (e) => {
        const inputEl = e.currentTarget;
        const { id } = inputEl;
        let itemsContainerEl = document.getElementById(`${id}autocomplete-list`);
        
        if (itemsContainerEl) {
            updateDropdown(e);
        }
    });
    
    // execute a function when key is pressed
    inputEl.addEventListener('keydown', (e) => {
        const inputEl = e.currentTarget;
        const { id } = inputEl;
        let itemsContainerEl = document.getElementById(`${id}autocomplete-list`);
        let itemsList;
        
        if (itemsContainerEl) {
            itemsList = itemsContainerEl.getElementsByTagName('div');
        }
        
        switch (e.keyCode) {
            // up
            case 40: {
                currentFocus++;
                
                // update the active selected element
                updateActiveItem(itemsList);
                break;
            }
            // down
            case 38: {
                currentFocus--;
                
                // update the active selected element
                updateActiveItem(itemsList);
                break;
            }
            // enter
            case 13: {
                // prevent the form from being submitted
                // e.preventDefault();
                
                if (currentFocus > -1 && itemsList) {
                    // force click event on the active item
                    itemsList[currentFocus].click();
                }
                
                break;
            }
        }
    });
    
    // execute a function when someone clicks in the document
    document.addEventListener('click', (e) => {
        closeAllLists(e.target);
    });
}

/**
 * Builds filters for listings.
 * @param {Object} table - Table to draw filters for.
 * @param {Array} records - Records to draw filters from.
 * @param {Object} Class - Listing class object.
 * @param {Object} options - Options.
 * @param {Localization} options.locales - Locale strings.
 * @param {number} options.locales - Query limit.
 * @param {Function} [options.onChange] - Function to call on filter change.
 * @returns {HTMLElement} DOM element.
 * @namespace Layout.listings.buildFilters
 */
export async function buildFilters(table, records, Class, options) {
    /**
     * Builds index of options.
     * @returns {Object} Index of records.
     */
    async function buildIndex() {
        const index =  {
            market_name: [],
            name_color: [],
            appid: []
        };
        const [
            first,
            last
        ] = await Promise.all([
            table.orderBy('index').first(),
            table.orderBy('index').last()
        ]);
        
        index.is_credit = [0, 1];
        index.dates = {};
        
        if (first) {
            index.dates.start = first.date_acted;
        }
        
        if (last) {
            index.dates.end = last.date_acted;
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
            }
        };
        const draw = {
            dateSelectors: function() {
                function renderSelector(name, days, dateFieldEl) {
                    function formatDate(date) {
                        return [
                            date.getUTCFullYear(),
                            (date.getUTCMonth() + 1).toString().padStart(2, '0'),
                            date.getUTCDate().toString().padStart(2, '0')
                        ].join('-');
                    }
                    
                    const el = document.createElement('div');
                    const ONE_DAY = 24 * 60 * 60 * 1000;
                    
                    el.textContent = getName(name);
                    el.classList.add('item', 'button');
                    el.addEventListener('click', () => {
                        const date = new Date();
                        const offsetDate = new Date(date.getTime() - days * ONE_DAY);
                        const dateStr = formatDate(offsetDate);
                        const event = document.createEvent('HTMLEvents');
                        
                        event.initEvent('change', false, true);
                        
                        dateFieldEl.value = dateStr;
                        dateFieldEl.dispatchEvent(event);
                    });
                    
                    return el;
                }
                
                const afterDateFieldEl = fragment.getElementById('after_date');
                const lastWeekButtonEl = renderSelector('last_week', 7, afterDateFieldEl);
                const lastMonthButtonEl = renderSelector('last_month', 30, afterDateFieldEl);
                
                dateContainer.append(lastWeekButtonEl);
                dateContainer.append(lastMonthButtonEl);
            },
            dateField: function(id, name, dates) {
                if (!dates.start) {
                    return;
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
                inputEl.setAttribute('id', name);
                inputEl.setAttribute('name', name);
                inputEl.setAttribute('data-name', name);
                inputEl.setAttribute('min', startDate);
                inputEl.setAttribute('max', endDate);
                
                containerEl.append(labelEl);
                containerEl.append(inputEl);
                
                // bind the events
                inputEl.addEventListener('change', events.textFieldChange);
                
                dateContainer.append(containerEl);
            },
            dropdown: function(name, list) {
                function getOptionText(value) {
                    let values = (uiLocales.values || {})[name] || {};
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
                
                function addOptions(list) {
                    const optionsHTML = ['<a class="none" href="#">(none)</a>'].concat(list.map((value) => {
                        return `<a data-value="${value}" href="#">${getOptionText(value)}</a>`;
                    })).join('');
                    
                    contentEl.innerHTML = optionsHTML;
                
                    // bind the events
                    Array.from(contentEl.getElementsByTagName('a')).forEach((optionEl) => {
                        optionEl.addEventListener('click', events.dropdownChange);
                    });
                }
                
                const fieldName = getName(name);
                const dropdownEl = document.createElement('div');
                const buttonEl = document.createElement('div');
                const contentEl = document.createElement('div');
                
                if (isLazyLoadedField(name)) {
                    table.orderBy(name).uniqueKeys().then(addOptions);
                } else {
                    addOptions(list);
                }
                
                dropdownEl.appendChild(buttonEl);
                dropdownEl.appendChild(contentEl);
                buttonEl.textContent = fieldName;
                
                buttonEl.classList.add('button');
                contentEl.classList.add('dropdown-content', 'hidden');
                dropdownEl.classList.add('item', 'dropdown');
                dropdownEl.setAttribute('data-name', name);
                dropdownEl.setAttribute('data-default', fieldName);
                
                fragment.append(dropdownEl);
            },
            textField: function(name, values) {
                function autocomplete(values) {
                    addAutocompleteToField(textEl, values, (value) => {
                        const inputEl = textEl;
                        
                        checkInputState(inputEl);
                        
                        if (value === '') {
                            removeQuery(name);
                        } else {
                            queryChange(name, value);
                        }
                    });
                }
                
                const wrapperEl = document.createElement('div');
                const fieldName = getName(name);
                const textEl = document.createElement('input');
                
                wrapperEl.classList.add('item', 'autocomplete');
                textEl.setAttribute('type', 'text');
                textEl.setAttribute('placeholder', fieldName);
                textEl.setAttribute('data-name', name);
                textEl.setAttribute('data-default', fieldName);
                textEl.setAttribute('id', `input-${name}`);
                wrapperEl.append(textEl);
                
                if (isLazyLoadedField(name)) {
                    // adds a spinner
                    //const spinnerEl = document.createElement('div');
                    //const iconEl = document.createElement('i');
                    //
                    //spinnerEl.classList.add('input-spinner');
                    //iconEl.classList.add('fas', 'fa-spinner', 'fa-spin');
                    //
                    //spinnerEl.appendChild(iconEl);
                    //wrapperEl.appendChild(spinnerEl);
                    
                    textEl.setAttribute('disabled', '');
                    table.orderBy(name).uniqueKeys().then((values) => {
                        textEl.removeAttribute('disabled');
                        autocomplete(values);
                    });
                } else {
                    autocomplete(values);
                }
                
                // bind the events
                textEl.addEventListener('input', events.textFieldInput);
                
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
            return (
                uiLocales.names[name] ||
                classDisplay.names[name] ||
                name
            );
        }
        
        function addIndex(k, v) {
            switch (k) {
                case 'dates':
                    draw.dateField('start', 'after_date', v);
                    draw.dateField('end', 'before_date', v);
                    break;
                case 'market_name':
                    draw.textField(k, v);
                    break;
                default:
                    draw.dropdown(k, v);
                    break;
            }
        }
        
        // indicates that a field must have its values lazy-loaded
        function isLazyLoadedField(name) {
            return valueFields.includes(name);
        }
        
        const hasDates = Boolean(
            index.dates.start &&
            index.dates.start.getTime() !== index.dates.end.getTime()
        );
        
        if (hasDates) {
            dateContainer.classList.add('dates');
            
            fragment.append(dateContainer);
        }
        
        Object.keys(index).forEach((k) => {
            addIndex(k, index[k]);
        });
        
        if (hasDates) {
            draw.dateSelectors();
        }
        
        return fragment;
    }
    
    /**
     * Updates filter queries.
     * @returns {Promise<void>} Resolves when done.
     */
    async function updateQuery() {
        // obtain a collection without a .where clause
        function noQuery() {
            const collection = table.orderBy('index');
            
            onChange(filteredRecords, collection);
        }
        
        // obtain a collection using a query
        async function doQuery() {
            // gets details for compound query
            function getCompoundQueryDetails(k) {
                // comparison functions
                const compareFns = {
                    above: (a, b) => {
                        return Boolean(
                            a &&
                            b &&
                            a > b
                        );
                    },
                    below: (a, b) => {
                        return Boolean(
                            a &&
                            b &&
                            a < b
                        );
                    },
                    aboveOrEqual: (a, b) => {
                        return Boolean(
                            a &&
                            b &&
                            a >= b
                        );
                    },
                    belowOrEqual: (a, b) => {
                        return Boolean(
                            a &&
                            b &&
                            a <= b
                        );
                    },
                    equals: (a, b) => {
                        return a === b;
                    }
                };
                const compoundQuery = compoundQueries[k];
                const value = query[k];
                const { field, key, converter } = compoundQuery;
                const convertedValue = (
                    converter ?
                        converter(value) :
                        value
                );
                const compare = compareFns[key];
                
                return {
                    field,
                    key,
                    compare,
                    convertedValue
                };
            }
            
            // we clone the query
            const baseQuery = {
                ...query
            };
            
            // then remove all special keys to form the base query
            // of all keys that are exact values
            // everything except dates where math must be done
            Object.keys(compoundQueries)
                .forEach((k) => {
                    delete baseQuery[k];
                });
            
            let collection;
            
            // begin the query
            if (Object.keys(baseQuery).length > 0) {
                collection = table.where(baseQuery);
            }
            
            // add compounds
            let compoundQueryKeys = Object.keys(query)
                // filter to only keys where a compound exists
                .filter((k) => {
                    return compoundQueries[k] !== undefined;
                });
            
            // collection is not defined
            if (compoundQueryKeys.length > 0 && collection === undefined) {
                // take the first key and remove it from the array
                const k = compoundQueryKeys.shift();
                const {
                    field,
                    key,
                    convertedValue
                } = getCompoundQueryDetails(k);
                
                collection = table.where(field)[key](convertedValue);
            }
            
            // create a comparison function for each compound query key
            const comparisons = compoundQueryKeys
                .map((k) => {
                    const {
                        field,
                        compare,
                        convertedValue
                    } = getCompoundQueryDetails(k);
                    
                    return (record) => {
                        return compare(record[field], convertedValue);
                    };
                });
            
            if (comparisons.length > 0) {
                // and check that each comparison matches
                collection = collection.and((record) => {
                    return comparisons.every((compare) => {
                        return compare(record);
                    });
                });
            }
            
            // fetch the records
            filteredRecords = await collection.clone().limit(limit).sortBy('index');
            filteredRecords = filteredRecords.reverse();
            
            onChange(filteredRecords, collection);
        }
        
        if (Object.keys(query).length === 0) {
            // no query is necessary to complete this
            return noQuery();
        }
        
        return doQuery();
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
        
        if (key === 'is_credit') {
            val = parseInt(val);
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
    
    function toDate(str) {
        return new Date(str);
    }
    
    const { limit, locales } = options;
    const classDisplay = Class.makeDisplay(locales);
    const uiLocales = Object.assign({}, {
        names: {
            year: 'Year',
            market_name: 'Name',
            is_credit: 'Sale Type'
        }
    }, locales.ui);
    // the function called on filter change
    const onChange = options.onChange || function() {};
    // the total records
    const totalRecords = records.slice(0);
    // filter indexes built from records
    const index = await buildIndex(records);
    // fields that must be loaded
    const valueFields = [
        'market_name',
        'name_color',
        'appid'
    ];
    // queries that are compounded
    const compoundQueries = {
        after_date: {
            field: 'date_acted',
            converter: toDate,
            key: 'aboveOrEqual',
        },
        before_date: {
            field: 'date_acted',
            converter: toDate,
            key: 'belowOrEqual'
        }
    };
    // current filter query
    let query = {};
    // currently filtered records
    let filteredRecords = totalRecords;
        
    return drawIndex(index);
}
