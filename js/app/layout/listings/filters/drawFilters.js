import { applist } from '../../../data/applist.js';
import { addAutocompleteToField } from './addAutocompleteToField.js';

/**
 * @typedef {Object} RecordIndex
 * @property {string[]} market_name - List of market names.
 * @property {string[]} name_color - List of name colors.
 * @property {number[]} appid - List of appids.
 * @property {number[]} is_credit - List of credit values.
 * @property {Object} dates - Date range.
 * @property {Date} [dates.start] - Start date.
 * @property {Date} [dates.end] - End date.
 */

/**
* Builds index of options.
* @param {Object} table - Table to draw filters for.
* @returns {Promise<RecordIndex>} Index of records.
*/
async function buildIndex(table) {
    const index =  {
        market_name: [],
        name_color: [],
        appid: [],
        is_credit: [0, 1],
        dates: {}
    };
    const [
        first,
        last
    ] = await Promise.all([
        table.orderBy('index').first(),
        table.orderBy('index').last()
    ]);

    if (first) {
        index.dates.start = first.date_acted;
    }

    if (last) {
        index.dates.end = last.date_acted;
    }

    return index;
}

/**
 * @typedef {import('../../../classes/base.js').Displayable} Displayable
 * @typedef {import('../../../classes/localization.js').Localization} Localization
 */

/**
 * @typedef {function(string, (number|string|null)): void} QueryChange
 */

/**
 * @typedef {function(string): void} RemoveQuery
 */

/**
 * @typedef {Object} QueryFunctions
 * @property {RemoveQuery} removeQuery - Removes a query.
 * @property {QueryChange} queryChange - Changes a query.
 */

/**
 * Draws filter options.
 * 
 * Separates the rendering logic from the main function which mostly handles the query logic 
 * making things a little easier to reason about.
 * @param {Object} table - Table to draw filters for.
 * @param {Localization} locales - Localization string.
 * @param {Displayable} Displayable - Displayable.
 * @param {QueryFunctions} queryFns - Query functions.
 * @returns {Promise<DocumentFragment>} Rendered fragment.
 */
export async function drawFilters(
    table,
    locales,
    Displayable,
    queryFns
) {
    // filter indexes
    const index = await buildIndex(table);
    const { removeQuery, queryChange } = queryFns;
    const classDisplay = Displayable.makeDisplay(locales);
    const uiLocales = Object.assign({}, {
        names: {
            year: 'Year',
            market_name: 'Name',
            is_credit: 'Sale Type'
        }
    }, locales.ui);
    const fragment = document.createDocumentFragment();
    const dateContainer = document.createElement('div');
    const events = {
        dropdownChange(e) {
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
        textFieldChange(e) {
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
        textFieldInput(e) {
            const inputEl = e.target;
            
            checkInputState(inputEl);
            
            // this is important for the event to function properly
            return e;
        }
    };
    const draw = {
        dateSelectors() {
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
                    const event = new Event('change', {
                        bubbles: false,
                        cancelable: true,
                    });
                    
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
        dateField(name, dates) {
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
        dropdown(name, list) {
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
        textField(name, values) {
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
                // // adds a spinner
                // const spinnerEl = document.createElement('div');
                // const iconEl = document.createElement('i');
                // 
                // spinnerEl.classList.add('input-spinner');
                // iconEl.classList.add('fas', 'fa-spinner', 'fa-spin');
                // 
                // spinnerEl.appendChild(iconEl);
                // wrapperEl.appendChild(spinnerEl);
                
                textEl.setAttribute('disabled', '');
                table.orderBy(name).uniqueKeys().then((values) => {
                    textEl.removeAttribute('disabled');
                    // spinnerEl.remove();
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
                draw.dateField('after_date', v);
                draw.dateField('before_date', v);
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
        return [
            'market_name',
            'name_color',
            'appid'
        ].includes(name);
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
