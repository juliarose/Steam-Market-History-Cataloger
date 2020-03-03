'use strict';

import { omitEmpty, getDocument } from '../helpers/utils.js';
import { parseMoney } from '../money.js';
import { AccountTransaction } from '../classes/accounttransaction.js';
import { ETransactionType } from '../enums/ETransactionType.js';

/**
 * Parses a response object from Steam.
 * @param {Object} response - Response object from Steam.
 * @param {Currency} currency - Currency object for parsing price strings.
 * @param {Localization} locales - Locale strings.
 * @returns {AccountTransaction[]} Array of parsed records.
 */
function parseTransactions(response, currency, locales) {
    /**
     * Gets list of items that were purchased in transaction.
     * @param {Object} itemsEl - Container element of items.
     * @returns {(Array|null)} Array of items parsed from element, if available.
     */
    function parseItems(itemsEl) {
        const payItemsList = itemsEl.getElementsByClassName('wth_payment');
        
        if (payItemsList.length === 0) {
            return null;
        }
        
        const app = itemsEl.children[0].textContent.trim();
        
        // map each item in the transaction
        return Array.from(payItemsList).map((itemEl) => {
            // collect count and item name for each item
            const text = itemEl.textContent.trim();
            const match = text.match(/^(\d+)? ?(.*)/);
            const count = match[1] ? parseInt(match[1]) : 1;
            const name = match[2];
            
            return {
                app,
                count,
                name
            };
        });
    }
    
    /**
     * Gets transaction ID.
     * @param {Object} transactionEl - Transaction element.
     * @returns {(string|null)} ID of transaction if available.
     */
    function getTransactionID(transactionEl) {
        const onClickAttribute = transactionEl.getAttribute('onclick') || '';
        const pattern = /transid=(\d+)/;
        const match = onClickAttribute.match(pattern);
        
        // return the 1st matched group in the pattern if there is a match
        return (
            match &&
            match[1]
        );
    }
    
    /**
     * Gets count and type.
     * @param {Object} countEl - Element containing string for count and type e.g. "22 Market Transactions".
     * @returns {Object} Object containing the type and count.
     */
    function getCountAndType(countEl) {
        const identifiers = classDisplay.identifiers.transaction_type;
        const match = countEl.textContent.trim().match(/^(\d+)? ?(.*)/);
        // type of transaction, e.g. "Purchases", in singularized form
        const rawType = (
            match &&
            match[2]
        );
        const rawTypeSingular = (
            rawType &&
            rawType.replace(/s$/, '')
        );
        const count = (
            (match && match[1]) ?
                parseInt(match[1]) :
                1
        );
        const type = (
            identifiers[rawType] ||
            identifiers[rawTypeSingular] ||
            0
        );
        
        return {
            count,
            type
        };
    }
    
    const classDisplay = AccountTransaction.makeDisplay(locales);
    const doc = getDocument(`<table>${response.html}</table>`);
    const transactionsList = doc.getElementsByClassName('wallet_table_row');
    const transactions = Array.from(transactionsList).map((transactionEl) => {
        // get match of transaction type and count (if available)
        const countEl = transactionEl.getElementsByClassName('wht_type')[0].children[0];
        const totalEl = transactionEl.getElementsByClassName('wht_total')[0];
        const itemsEl = transactionEl.getElementsByClassName('wht_items')[0];
        const dateEl = transactionEl.getElementsByClassName('wht_date')[0];
        const paymentEl = totalEl.getElementsByClassName('wth_payment')[0];
        const totalPriceEl = (
            totalEl.children[0] ||
            totalEl
        );
        const { count, type } = getCountAndType(countEl);
        const date = new Date(dateEl.textContent.trim());
        const priceText = totalPriceEl.textContent.trim();
        // has payment element or type is refund
        const isCredit = Boolean(
            paymentEl ||
            type === ETransactionType.Refund
        );
        
        return new AccountTransaction(omitEmpty({
            transaction_id: getTransactionID(transactionEl),
            transaction_type: type,
            count: count,
            date: date,
            price: parseMoney(priceText, currency),
            price_raw: priceText,
            is_credit: isCredit ? 1 : 0,
            items: parseItems(itemsEl)
        }));
    });
    
    return transactions;
}

export { parseTransactions };