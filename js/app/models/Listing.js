// @ts-check

import { createClass } from './helpers/createClass.js';
import { applist } from '../data/applist.js';
import * as Color from '../helpers/color.js';
import { escapeHTML, printDate } from '../helpers/utils.js';
import { tooltip, removeTooltip } from '../layout/tooltip.js';
import { getHover, getHoverAsset, addToHoverState } from '../layout/listings/hovers/hovers.js';

/**
 * @typedef {import('./helpers/createClass.js').DisplayOptions} DisplayOptions
 * @typedef {import('./helpers/createClass.js').DisplayableTypes} DisplayableTypes
 * @typedef {import('./Localization.js').Localization} Localization
 */

/**
 * Listing properties.
 * @typedef {Object} ListingProperties
 * @property {string} transaction_id - Transaction ID.
 * @property {number} index - Index of listing in history.
 * @property {number} is_credit - Whether the transaction resulted in credit or not. 1 for true, 0 for false.
 * @property {string} appid - Appid for item.
 * @property {string} contextid - Contextid for item.
 * @property {string} assetid - Assetid for item (unused).
 * @property {string} classid - Classid for item.
 * @property {string} instanceid - Instanceid for item.
 * @property {number} [amount] - Amount sold (defaults to 1).
 * @property {string} name - Name of item.
 * @property {string} market_name - Market name of item.
 * @property {string} market_hash_name - Market hash name for item.
 * @property {string} [name_color] - 6-digit hexademical color for name.
 * @property {string} [background_color] - 6-digit hexademical color for background.
 * @property {string} icon_url - Icon path on Steam's CDN.
 * @property {Date} date_acted - Date acted.
 * @property {Date} date_listed - Date listed.
 * @property {string} date_acted_raw - Raw string of date acted.
 * @property {string} date_listed_raw - Raw string of date list.
 * @property {number} price - Integer value of price.
 * @property {string} price_raw - Raw string of price.
 */

const types = {
    transaction_id: String,
    index: Number,
    is_credit: Number,
    appid: String,
    contextid: String,
    assetid: String,
    classid: String,
    instanceid: String,
    amount: Number,
    name: String,
    market_name: String,
    market_hash_name: String,
    name_color: String,
    background_color: String,
    icon_url: String,
    date_acted: Date,
    date_listed: Date,
    date_acted_raw: String,
    date_listed_raw: String,
    price: Number,
    price_raw: String
};

/**
 * Listing.
 */
export class Listing {
    /**
     * Identifier for listings.
     * @type {string}
     * @static
     */
    static identifier = 'listings';
    /**
     * Primary key for listings.
     * @type {string}
     * @static
     */
    static primary_key = 'transaction_id';
    /**
     * Types for listings.
     * @type {DisplayableTypes}
     * @static
     */
    static types = types;
    /**
     * Transaction ID.
     * @type {string}
     */
    transaction_id;
    /**
     * Index of listing in history.
     * @type {number}
     */
    index;
    /**
     * Whether the transaction resulted in credit or not.
     * @type {number}
     */
    is_credit;
    /**
     * Appid for item.
     * @type {string}
     */
    appid;
    /**
     * Contextid for item.
     * @type {string}
     */
    contextid;
    /**
     * Assetid for item (unused).
     * @type {string}
     */
    assetid;
    /**
     * Classid for item.
     * @type {string}
     */
    classid;
    /**
     * Instanceid for item.
     * @type {string}
     */
    instanceid;
    /**
     * Amount sold.
     * @type {number}
     */
    amount;
    /**
     * Name of item.
     * @type {string}
     */
    name;
    /**
     * Market name of item.
     * @type {string}
     */
    market_name;
    /**
     * Market hash name for item.
     * @type {string}
     */
    market_hash_name;
    /**
     * 6-digit hexademical color for name.
     * @type {(string | undefined)}
     */
    name_color;
    /**
     * 6-digit hexademical color for background.
     * @type {(string | undefined)}
     */
    background_color;
    /**
     * Icon path on Steam's CDN.
     * @type {string}
     */
    icon_url;
    /**
     * Date acted.
     * @type {Date}
     */
    date_acted;
    /**
     * Date listed.
     * @type {Date}
     */
    date_listed;
    /**
     * Raw string of date acted.
     * @type {string}
     */
    date_acted_raw;
    /**
     * Raw string of date list.
     * @type {string}
     */
    date_listed_raw;
    /**
     * Integer value of price.
     * @type {number}
     */
    price;
    /**
     * Raw string of price.
     * @type {string}
     */
    price_raw;
    
    /**
     * Creates a listing.
     * @param {ListingProperties} properties - Properties. 
     */
    constructor(properties) {
        createClass();
        // Object.assign is significantly slower than direct assignment.
        // https://gist.github.com/juliarose/833e8ca41908d2614532dd4a0d7ed346
        // This is especially true for objects with many properties.
        // This matters if thousands or hundreds of thousands of objects are being created.
        this.transaction_id = properties.transaction_id;
        this.index = properties.index;
        this.is_credit = properties.is_credit;
        this.appid = properties.appid;
        this.contextid = properties.contextid;
        this.assetid = properties.assetid;
        this.classid = properties.classid;
        this.instanceid = properties.instanceid;
        this.amount = properties.amount || 1; // Defaults to 1 if not provided
        this.name = properties.name;
        this.market_name = properties.market_name;
        this.market_hash_name = properties.market_hash_name;
        this.name_color = properties.name_color;
        this.background_color = properties.background_color;
        this.icon_url = properties.icon_url;
        this.date_acted = properties.date_acted;
        this.date_listed = properties.date_listed;
        this.date_acted_raw = properties.date_acted_raw;
        this.date_listed_raw = properties.date_listed_raw;
        this.price = properties.price;
        this.price_raw = properties.price_raw;
    }
    
    /**
     * Configures display properties.
     * @static
     * @param {Localization} locales - Localization strings.
     * @returns {DisplayOptions} Display options.
     */
    static makeDisplay(locales) {
        return {
            names: locales.db.listings.names,
            identifiers: {},
            stream: {
                order: 'index',
                direction: 1
            },
            currency_fields: [
                'price'
            ],
            boolean_fields: [],
            number_fields: [
                'price',
                'quantity',
                'appid',
                'contextid',
                'index'
            ],
            csv: {
                columns: [
                    'index',
                    'is_credit',
                    'transaction_id',
                    'appid',
                    'market_name',
                    'price',
                    'date_listed',
                    'date_acted',
                    'amount'
                ]
            },
            table: {
                column_names: locales.db.listings.column_names,
                columns: [
                    'amount',
                    'is_credit',
                    'icon_url',
                    'market_name',
                    'price',
                    'date_listed',
                    'date_acted'
                ],
                sorts: {
                    is_credit: 'is_credit',
                    price: 'price',
                    market_name: 'market_name',
                    date_listed: 'date_listed',
                    // sort by index rather than date to get listings in correct order
                    date_acted: 'index'
                },
                row_class(record) {
                    if (record.is_credit) {
                        return [
                            'listing',
                            'loss'
                        ];
                    }
                    
                    return [
                        'listing',
                        'gain'
                    ];
                },
                column_class: {
                    is_credit: [
                        'center',
                        'cond',
                        'sale-type'
                    ],
                    icon_url: [
                        'center',
                        'cond',
                        'image'
                    ],
                    date_acted: [
                        'center',
                        'date'
                    ],
                    date_listed: [
                        'center',
                        'date'
                    ],
                    price: [
                        'price'
                    ]
                },
                cell_value: {
                    date_acted(value, record) {
                        const query = `index=${record.index}&transaction_id=${record.transaction_id}`;
                        const url = `https://steamcommunity.com/market?${query}`;
                        
                        if (value instanceof Date) {
                            return `<a href="${url}" target="_blank" rel="noreferrer">${printDate(value)}</a>`;
                        }
                        
                        return '';
                    },
                    market_name(value, record) {
                        const query = [
                            `appid=${record.appid}`,
                            `market_name=${encodeURIComponent(record.market_name)}`,
                            `market_hash_name=${encodeURIComponent(record.market_hash_name)}`
                        ].join('&');
                        const url = `/views/view/item.html?${query}`;
                        const amount = record.amount || 1;
                        
                        if (typeof value !== 'string') {
                            value = value?.toString();
                        }
                        
                        // Add the amount to the name (if greater than 1)
                        const name = (amount > 1 ? `${amount} ` : '') + escapeHTML(value || '');
                        const color = record.name_color || 'FFFFFF';
                        const styles = `color: #${color};`;
                        const link = `<a href="${url}" target="_blank" rel="noreferrer" style="${styles}">${name}</a>`;
                        
                        return (
                            `<p class="market-name">${link}</p>` +
                            `<p class="game-name">${escapeHTML(applist[record.appid] || '')}</p>`
                        );
                    },
                    is_credit(value) {
                        return value ? '-' : '+';
                    },
                    icon_url(value, record) {
                        const src = `https://community.akamai.steamstatic.com/economy/image/${value}/34x34f`;
                        const srcSet = `https://community.akamai.steamstatic.com/economy/image/${value}/34x34f 1x, ` +
                            `https://community.akamai.steamstatic.com/economy/image/${value}/34x34fdpx2x 2x`;
                        const color = record.name_color || 'FFFFFF';
                        const darkenedColor = Color.rgba(color, 0.2) || color;
                        const styles = (
                            `border-color: #${color};' ` +
                            `background-color: ${Color.rgba(darkenedColor, 0.2)};"`
                        );
                        const img = `<img class="item-icon" src="${src}" srcset="${srcSet}" />`;
                        
                        return `<div class="item-icon-wrapper" style="${styles}">${img}</div>`;
                    }
                },
                events: {
                    mouseover(e, record) {
                        const { target } = e;
                        
                        if (!target) {
                            return;
                        }
                        
                        // @ts-ignore
                        const isImage = target.matches('img');
                        
                        if (!isImage) {
                            return;
                        }
                        
                        // show a hover for this item
                        // get details from record
                        const {
                            appid,
                            classid,
                            instanceid
                        } = record;
                        // get the language from the provided locales
                        const { language } = locales;
                        
                        getHoverAsset(appid, classid, instanceid, language)
                            .then((asset) => {
                                // @ts-ignore
                                tooltip(target, getHover(asset), {
                                    borderColor: asset.name_color
                                });
                            })
                            .catch(() => {
                                
                            });
                    },
                    mouseout(e) {
                        const { target } = e;
                        
                        if (!target) {
                            return;
                        }
                        
                        // we hovered over the image
                        // @ts-ignore
                        const isImage = target.matches('img');
                        
                        if (!isImage) {
                            return;
                        }
                        
                        addToHoverState();
                        // then remove the tooltip
                        removeTooltip();
                    }
                }
            }
        };
    }
    
    /**
     * Converts listing to JSON format.
     * @returns {Object} JSON representation of the listing.
     */
    toJSON() {
        return {
            transaction_id: this.transaction_id,
            appid: this.appid,
            contextid: this.contextid,
            classid: this.classid,
            instanceid: this.instanceid,
            amount: this.amount || 1,
            index: this.index,
            price: this.price,
            is_credit: this.is_credit === 1,
            name: this.name,
            market_name: this.market_name,
            market_hash_name: this.market_hash_name,
            name_color: this.name_color,
            background_color: this.background_color,
            icon: this.icon_url,
            date_acted: this.date_acted,
            date_listed: this.date_listed
        };
    }
}
