'use strict';

/**
 * @enum ETransactionType
 */
const ETransactionType = Object.freeze({
    'MarketTransaction': 1,
    'InGamePurchase': 2,
    'Purchase': 3,
    'GiftPurchase': 4,
    'Refund': 5,
    1: 'MarketTransaction',
    2: 'InGamePurchase',
    3: 'Purchase',
    4: 'GiftPurchase',
    5: 'Refund'
});

export { ETransactionType };