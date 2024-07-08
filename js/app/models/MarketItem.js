// @ts-check

// Unused - this is just a slimmed down version of listings without transaction information

import { applist } from '../data/applist.js';
import * as Color from '../helpers/color.js';
import { escapeHTML } from '../helpers/utils.js';
import { tooltip, removeTooltip } from '../layout/tooltip.js';
import { getHover, getHoverAsset, addToHoverState } from '../layout/listings/hovers/hovers.js';

/**
 * @typedef {import('./helpers/createClass.js').DisplayOptions} DisplayOptions
 * @typedef {import('./helpers/createClass.js').DisplayableTypes} DisplayableTypes
 * @typedef {import('./Localization.js').Localization} Localization
 */

/**
 * Market item properties.
 * @typedef {Object} MarketItemProperties
 * @property {string} appid - Appid for item.
 * @property {string} contextid - Contextid for item.
 * @property {string} classid - Classid for item.
 * @property {string} instanceid - Instanceid for item.
 * @property {string} market_name - Market name of item.
 * @property {string} market_hash_name - Market hash name for item.
 * @property {string} name_color - 6-digit hexademical color for name.
 * @property {string} background_color - 6-digit hexademical color for background.
 * @property {string} icon_url - Icon path on Steam's CDN.
 */

const types = {
    appid: String,
    contextid: String,
    classid: String,
    instanceid: String,
    market_name: String,
    market_hash_name: String,
    name_color: String,
    background_color: String,
    icon_url: String
};

/**
 * MarketItem.
 */
export class MarketItem {
    /**
     * Identifier for market items.
     * @type {string}
     * @static
     */
    static identifier = 'market_items';
    /**
     * Primary key for listings.
     * @type {string}
     * @static
     */
    static primary_key = 'market_hash_name';
    /**
     * Types for listings.
     * @type {DisplayableTypes}
     * @static
     */
    static types = types;
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
     * @type {string}
     */
    name_color;
    /**
     * 6-digit hexademical color for background.
     * @type {string}
     */
    background_color;
    /**
     * Icon path on Steam's CDN.
     * @type {string}
     */
    icon_url;
    
    /**
     * Creates a market item.
     * @param {MarketItemProperties} properties - Properties. 
     */
    constructor(properties) {
        this.appid = properties.appid;
        this.contextid = properties.contextid;
        this.classid = properties.classid;
        this.instanceid = properties.instanceid;
        this.market_name = properties.market_name;
        this.market_hash_name = properties.market_hash_name;
        this.name_color = properties.name_color;
        this.background_color = properties.background_color;
        this.icon_url = properties.icon_url;
    }
    
    /**
     * Configures display properties.
     * @static
     * @param {Localization} locales - Localization strings.
     * @returns {DisplayOptions} Display options.
     */
    static makeDisplay(locales) {
        return {
            // Uses the same localization strings as listings
            names: locales.db.listings.names,
            identifiers: {},
            stream: {
                order: 'market_hash_name',
                direction: 1
            },
            currency_fields: [],
            boolean_fields: [],
            number_fields: [
                'appid',
                'contextid'
            ],
            csv: {
                columns: [
                    'appid',
                    'market_name'
                ]
            },
            table: {
                column_names: locales.db.listings.column_names,
                columns: [
                    'icon_url',
                    'market_name'
                ],
                sorts: {
                    market_name: 'market_name'
                },
                row_class() {
                    return [
                        'market_item'
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
                    market_name(value, record) {
                        const query = [
                            `appid=${record.appid}`,
                            `market_name=${encodeURIComponent(record.market_name)}`,
                            `market_hash_name=${encodeURIComponent(record.market_hash_name)}`
                        ].join('&');
                        const url = `/views/view/market_item.html?${query}`;
                        
                        if (typeof value !== 'string') {
                            value = value?.toString();
                        }
                        
                        const link = `<a href="${url}" target="_blank" rel="noreferrer">${escapeHTML(value || '')}</a>`;
                        
                        return (
                            `<p class="market-name">${link}</p>` +
                            `<p class="game-name">${escapeHTML(applist[record.appid] || '')}</p>`
                        );
                    },
                    icon_url(value, record) {
                        const src = `https://steamcommunity-a.akamaihd.net/economy/image/${value}/34x34f`;
                        const color = record.name_color || 'FFFFFF';
                        const darkenedColor = Color.rgba(Color.darken(color, 0.2), 0.2);
                        const styles = (
                            `border-color: #${color};' ` +
                            `background-color: ${darkenedColor};"`
                        );
                        const img = `<img class="item-icon" src="${src}"/>`;
                        
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
     * Converts market item to JSON format.
     * @returns {Object} JSON representation of the market item.
     */
    toJSON() {
        return {
            appid: this.appid,
            contextid: this.contextid,
            classid: this.classid,
            instanceid: this.instanceid,
            market_name: this.market_name,
            market_hash_name: this.market_hash_name,
            name_color: this.name_color,
            background_color: this.background_color,
            icon: this.icon_url,
        };
    }
}
