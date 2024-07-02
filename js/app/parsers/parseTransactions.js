// @ts-check

import { omitEmpty, getDocument } from '../helpers/utils.js';
import { parseMoney } from '../money.js';
import { AccountTransaction } from '../classes/AccountTransaction.js';
import { GameItem } from '../classes/GameItem.js';
import { ETransactionType } from '../enums/ETransactionType.js';

/**
 * @typedef {import('../classes/Localization.js').Localization} Localization
 * @typedef {import('../currency.js').Currency} Currency
 * @typedef {import('../account.js').Account} Account
 */

/**
 * Type and count.
 * @typedef {Object} CountAndType
 * @property {number} count - Count of transactions.
 * @property {number} type - Type of transaction.
 */

/**
 * Parses a response object from Steam.
 * @param {Object} response - Response object from Steam.
 * @param {Currency} currency - Currency object for parsing price strings.
 * @param {Localization} locales - Locale strings.
 * @returns {AccountTransaction[]} Array of parsed records.
 */
export function parseTransactions(response, currency, locales) {
    /**
     * Gets list of items that were purchased in transaction.
     * @param {Element} itemsEl - Container element of items.
     * @returns {(Array | null)} Array of items parsed from element, if available.
     */
    function parseItems(itemsEl) {
        const payItemsList = itemsEl.getElementsByClassName('wth_payment');
        
        if (payItemsList.length === 0) {
            return null;
        }
        
        const itemsElChildren = itemsEl.getElementsByTagName('div');
        const appEl = itemsElChildren[0];
        const appText = appEl.textContent;
        
        if (!appText) {
            throw new Error('No app text found in element');
        }
        
        const app = appText.trim();
        
        // map each item in the transaction
        return Array.from(payItemsList).map((itemEl) => {
            // collect count and item name for each item
            const text = itemEl.textContent;
            
            if (!text) {
                throw new Error('No item text found in element');
            }
            
            const match = text.trim().match(/^(\d+ )?(.*)/);
            
            if (!match) {
                throw new Error(`Could not parse item: ${text}`);
            }
            
            const count = match[1] ? parseInt(match[1]) : 1;
            const name = match[2];
            
            return new GameItem({
                app,
                count,
                name
            });
        });
    }
    
    /**
     * Gets transaction ID.
     * @param {Element} transactionEl - Transaction element.
     * @returns {(string | null)} ID of transaction if available.
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
     * @param {Element} countEl - Element containing string for count and type e.g. "22 Market Transactions".
     * @returns {CountAndType} Object containing the type and count.
     */
    function getCountAndType(countEl) {
        const identifiers = (classDisplay.identifiers || {}).transaction_type;
        
        if (!identifiers) {
            throw new Error('No transaction type identifiers found');
        }
        
        const countText = countEl.textContent;
        
        if (!countText) {
            throw new Error('No count text found in element');
        }
        
        const match = countText.trim().match(/^(\d+)? ?(.*)/);
        // type of transaction, e.g. "Purchases", in singularized form
        const rawType = (
            match &&
            match[2]
        );
        
        if (rawType == null) {
            throw new Error('Could not parse type from count element');
        }
        
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
            // @ts-ignore
            // This should always be a number and never a string.
            type
        };
    }
    
    const classDisplay = AccountTransaction.makeDisplay(locales);
    const doc = getDocument(`<table>${response.html}</table>`);
    const transactionsList = doc.getElementsByClassName('wallet_table_row');
    const transactions = Array.from(transactionsList).map((transactionEl) => {
        // get match of transaction type and count (if available)
        const countParentEl = transactionEl.getElementsByClassName('wht_type')[0];
        const countEl = countParentEl.getElementsByTagName('div')[0];
        const totalEl = transactionEl.getElementsByClassName('wht_total')[0];
        const totalElChildren = totalEl.getElementsByTagName('div');
        const itemsEl = transactionEl.getElementsByClassName('wht_items')[0];
        const dateEl = transactionEl.getElementsByClassName('wht_date')[0];
        const paymentEl = totalEl.getElementsByClassName('wth_payment')[0];
        const totalPriceEl = (
            totalElChildren[0] ||
            totalEl
        );
        const { count, type } = getCountAndType(countEl);
        const dateText = dateEl.textContent;
        
        if (!dateText) {
            throw new Error('No date text found in element');
        }
        
        const date = new Date(dateText.trim());
        const priceText = totalPriceEl.textContent;
        
        if (!priceText) {
            throw new Error('No price text found in element');
        }
        
        const price_raw = priceText.trim();
        // has payment element or type is refund
        const isCredit = Boolean(
            paymentEl ||
            type === ETransactionType.Refund
        );
        
        return new AccountTransaction(omitEmpty({
            count,
            date,
            price_raw,
            transaction_id: getTransactionID(transactionEl),
            transaction_type: type,
            price: parseMoney(price_raw, currency),
            is_credit: isCredit ? 1 : 0,
            items: parseItems(itemsEl)
        }));
    });
    
    return transactions;
}
