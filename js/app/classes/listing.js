'use strict';

import { createClass } from './helpers/createClass.js';
import { applist } from '../data/applist.js';
import { Color } from '../helpers/color.js';
import { escapeHTML, printDate } from '../helpers/utils.js';
import { tooltip, removeTooltip } from '../layout/tooltip.js';
import { getHover, getHoverAsset, addToHoverState } from '../layout/listings/hovers/hovers.js';

const types = {
    transaction_id: String,
    index: Number,
    is_credit: Boolean,
    appid: String,
    contextid: String,
    assetid: String,
    classid: String,
    instanceid: String,
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
    price_raw: String,
    seller: String
};

/**
 * Listing.
 * @property {String} transaction_id - Transaction ID.
 * @property {Number} index - Index of listing in history.
 * @property {Boolean} is_credit - Whether the transaction resulted in credit or not.
 * @property {String} appid - Appid for item.
 * @property {String} contextid - Contextid for item.
 * @property {String} classid - Classid for item.
 * @property {String} instanceid - Instanceid for item.
 * @property {String} assetid - Assetid for item (unused).
 * @property {String} name - Name of item.
 * @property {String} market_name - Market name of item.
 * @property {String} market_hash_name - Market hash name for item.
 * @property {String} name_color - 6-digit hexademical color for name.
 * @property {String} background_color - 6-digit hexademical color for background.
 * @property {String} icon_url - Icon path on Steam's CDN.
 * @property {Date} date_acted - Date acted.
 * @property {Date} date_listed - Date listed.
 * @property {String} date_acted_raw - Raw string of date acted.
 * @property {String} date_listed_raw - Raw string of date list.
 * @property {Number} price - Integer value of price.
 * @property {String} price_raw - Raw string of price.
 * @property {String} seller - Seller profile URL (vanity URLs are not converted).
 * @namespace Listing
 * @class
 */
const Listing = createClass({
    types,
    identifier: 'listings',
    primary_key: 'transaction_id'
});

/**
 * Configures display properties.
 * @memberOf Listing
 * @param {Localization} locales - Localization strings.
 * @returns {undefined}
 */
Listing.makeDisplay = function(locales) {
    return {
        names: locales.db.listings.names,
        identifiers: locales.db.listings.identifiers,
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
                'market_name',
                'price',
                'date_listed',
                'date_acted'
            ]
        },
        json: {
            columns: [
                'appid',
                'contextid',
                'assetid',
                'transaction_id',
                'index',
                'price',
                'is_credit',
                'classid',
                'instanceid',
                'name',
                'market_name',
                'market_hash_name',
                'name_color',
                'background_color',
                'icon_url',
                'date_acted',
                'date_listed'
            ]
        },
        table: {
            column_names: locales.db.listings.column_names,
            columns: [
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
            row_class: function(record) {
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
                date_acted: function(value, record) {
                    const query = `index=${record.index}&transaction_id=${record.transaction_id}`;
                    const url = `https://steamcommunity.com/market?${query}`;
                    
                    return `<a href="${url}" target="_blank" rel="noreferrer">${printDate(value)}</a>`;
                },
                market_name: function(value, record) {
                    const query = [
                        `appid=${record.appid}`,
                        `market_name=${encodeURIComponent(record.market_name)}`,
                        `market_hash_name=${encodeURIComponent(record.market_hash_name)}`
                    ].join('&');
                    const url = `/views/view/item.html?${query}`;
                    const link = `<a href="${url}" target="_blank" rel="noreferrer">${escapeHTML(value)}</a>`;
                    
                    return (
                        `<p class="market-name">${link}</p>` +
                        `<p class="game-name">${escapeHTML(applist[record.appid] || '')}</p>`
                    );
                },
                is_credit: function(value) {
                    return value ? '-' : '+';
                },
                icon_url: function(value, record) {
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
                mouseover: function(e, record) {
                    // we hovered over the image
                    const isImage = e.target.matches('img');
                                                     
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
                    const language = locales.language;
                    
                    getHoverAsset(appid, classid, instanceid, language).then((asset) => {
                        tooltip(e.target, getHover(asset), {
                            borderColor: asset.name_color
                        });
                    }).catch(() => {
                        
                    });
                },
                mouseout: function(e) {
                    // we hovered over the image
                    const isImage = e.target.matches('img');
                                                     
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
};

// this represents the class when exporting to JSON
Listing.prototype.toJSON = function() {
    return {
        transaction_id: this.transaction_id,
        appid: this.appid,
        contextid: this.contextid,
        classid: this.classid,
        instanceid: this.instanceid,
        index: this.index,
        price: this.price,
        is_credit: this.is_credit,
        name: this.name,
        market_name: this.market_name,
        market_hash_name: this.market_hash_name,
        name_color: this.name_color,
        background_color: this.background_color,
        icon: this.icon_url,
        date_acted: this.date_acted,
        date_listed: this.date_listed
    };
};

export { Listing };