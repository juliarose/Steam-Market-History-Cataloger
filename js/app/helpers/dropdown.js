// @ts-check

// require this module anywhere to enable dropdowns

window.addEventListener('click', hideDropdown);
document.body.addEventListener('click', dropdownDelegator);

/**
 * Hides dropdown when conditions are met.
 * @param {Event} e - Event object.
 */
function hideDropdown(e) {
    const target = e.target;
    // @ts-ignore
    const parent = target.parentNode;
    // @ts-ignore
    const isButton = target.matches('.dropdown .button');
    // get current dropdown found in parent
    const currentDropdown = parent.getElementsByClassName('dropdown-content')[0];
    const dropdowns = document.getElementsByClassName('dropdown-content');
    
    Array.from(dropdowns).forEach((dropdown) => {
        const isHidden = dropdown.classList.contains('hidden');
        const isCurrentDropdown = currentDropdown === dropdown;
        const canHide = (!isButton || !isCurrentDropdown) && !isHidden;
        
        if (canHide) {
            dropdown.classList.add('hidden');
        }
    });
}

/**
 * Shows dropdown of target.
 * @param {Event} e - Event object.
 */
function showDropdown(e) {
    const target = e.target;
    // @ts-ignore
    const parent = target.parentNode;
    const dropdowns = parent.getElementsByClassName('dropdown-content');
    
    Array.from(dropdowns).forEach((dropdown) => {
        if (dropdown.classList.contains('hidden')) {
            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
    });
}

/**
 * Checks if event target is a dropdown button.
 * @param {Event} e - Event object.
 */
function dropdownDelegator(e) {
    // is a dropdown button
    // @ts-ignore
    if (e.target.matches('.dropdown .button')) {
        // a dropdown button was clicked
        showDropdown(e);
    }
}