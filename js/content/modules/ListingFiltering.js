'use strict';

import {getCurrency} from '/js/app/currency.js';
import {parseMoney} from '/js/app/money.js';

function ListingFiltering(currency_id) {
    this.store = {
        game: {},
        listings: {},
        total: []
    };
    this.current = [];
    this.options = {};
    
    // currency will usually not be available when logged out,
    // in that case the currency is not really necessary
    if (currency_id) {
        this.currency = getCurrency(currency_id);
    }
}

ListingFiltering.prototype.updateIndex = function(listingsList) {
    this.current = Array.from(listingsList).map((listingEl) => {
        return getListingData(listingEl, this.currency);
    });
    this.current.filter((data) => {
        return !this.store.total[data.transaction_id];
    }).forEach((data) => {
        const {
            game,
            item_type,
            sale_type,
            price,
            transaction_id
        } = data;
        const store = this.store;
        
        if (game && item_type && sale_type) {
            if (!store.listings[game]) {
                store.listings[game] = {};
            }
            
            if (!store.listings[game][item_type]) {
                store.listings[game][item_type] = {};
            }
            
            if (!store.listings[game][item_type][sale_type]) {
                store.listings[game][item_type][sale_type] = {
                    price: price,
                    quantity: 1
                };
            } else {
                store.listings[game][item_type][sale_type].price += price;
                store.listings[game][item_type][sale_type].quantity += 1;
            }
            
            if (!store.game) {
                store.game[game] = 1;
            } else {
                store.game[game] += 1;
            }
        }
        
        // add to total
        store.total[transaction_id] = data; 
    });
};

ListingFiltering.prototype.update = function(contentsEl) {
    const fragment = document.createDocumentFragment();
    const options = this.options;
    
    this.current.forEach((listing) => {
        const keys = Object.keys(options);
        const isFiltered = keys.all((k) => {
            return listing[k] === options[k];
        });
        
        if (isFiltered) {
            fragment.appendChild(listing.el);
        }
    });
    
    contentsEl.innerHTML = '';
    contentsEl.appendChild(fragment);
};

ListingFiltering.prototype.clear = function() {
    this.options = {};
};

ListingFiltering.prototype.hasOptions = function() {
    return Object.keys(this.options).length > 0;
};

ListingFiltering.prototype.setFilter = function(key, val) {
    if (this.options[key] === val) {
        delete this.options[key];
    } else {
        this.options[key] = val;
    }
};

ListingFiltering.prototype.getListingValue = function(listingEl, key) {
    let listing = this.store.total[getTransactionId(listingEl)];
    let value = listing && listing[key];
    
    return value;
};

/*
 * Get 
 * @param {Object} listingEl - Listing element
 * @returns {String} Transaction ID of listing
 */
function getTransactionId(listingEl) {
    return listingEl.id.replace('history_row_', '').replace('_', '-');
}

function getListingData(listingEl, currency) {
    const getPrice = (text) => {
        return parseMoney(text, currency);
    };
    const getSaleType = (text) => {
        return {
            '-': 1,
            '+': 2
        }[text];
    };
    // get the associated elements for this listing
    const itemImgEl = listingEl.getElementsByClassName('market_listing_item_img')[0];
    const gainOrLossEl = listingEl.getElementsByClassName('market_listing_gainorloss')[0];
    const priceEl = listingEl.getElementsByClassName('market_listing_price')[0];
    const gameNameEl = listingEl.getElementsByClassName('market_listing_game_name')[0];
    const itemNameEl = listingEl.getElementsByClassName('market_listing_item_name')[0];
    // item color
    const color = rgb2hex(itemImgEl.style.borderColor || '0');
    
    return {
        el: listingEl,
        transaction_id: getTransactionId(listingEl),
        game: gameNameEl.textContent.trim(),
        market_name: itemNameEl.textContent.trim(),
        sale_type: getSaleType(gainOrLossEl.textContent.trim()),
        price: getPrice(priceEl.textContent),
        color: color,
        item_type: color
    };
}

/**
 * Convert "rgba(0, 0, 0)" string to hex.
 * @param {Number} str - Rgba string.
 * @returns {(String|null)} Hexadecimal number.
 */
function rgb2hex(str) {
    // rgba(0, 0, 0)
    const match = str.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*/i);
    
    if (match) {
        /**
         * Convert a decimal number to a hexadecimal number in a 2-digit format.
         * @param {Number} decimal - Decimal number.
         * @returns {String} Hexadecimal number.
         */
        const toHex = (decimal) => {
            return ('0' + decimal.toString(16).toUpperCase()).slice(-2);
        };
        const colors = match.slice(1);
        const hex = colors.map(a => parseInt(a)).map(toHex).join('');
        
        return hex;
    } else {
        return null;
    }
}

export {ListingFiltering};