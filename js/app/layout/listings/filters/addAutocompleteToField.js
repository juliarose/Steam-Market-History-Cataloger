
/**
 * Creates an autocomplete field with the given values.
 * @param {HTMLElement} inputEl - The input element for the complete.
 * @param {string[]} values - Array of values to be used as search terms.
 * @param {Function} submitFn - The function to call when submitting the search.
 */
export function addAutocompleteToField(inputEl, values, submitFn) {
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
