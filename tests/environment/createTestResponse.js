import {formatMoney} from '../../js/app/money.js';
import {createTree} from '../../js/app/helpers/utils.js';

/*
appid: "440",
assetid: "7958056368",
background_color: "3C352E",
classid: "839225851",
contextid: "2",
date_acted: new Date(Date.UTC(9, 2, 12)),
date_acted_raw: "Oct 2",
date_listed: new Date(Date.UTC(9, 2, 12)),
date_listed_raw: "Oct 2",
icon_url: "fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEOYxMdYgj3tTVGmsDnGc2ACfIHnpRjtJVXi2BtxFIoZuXkYjRmcQKRUKQIX6ZiplzqXHc07ZMzBIO3pLhfZ0yx4-kt0Qv_",
index: 374999,
instanceid: "11043616",
is_credit: 0,
market_hash_name: "Unusual Bomber's Bucket Hat",
market_name: "Unusual Bomber's Bucket Hat",
name: "Unusual Bomber's Bucket Hat",
name_color: "8650AC",
price: 1579,
price_raw: "$15.79",
seller: "https://steamcommunity.com/profiles/76561198375077095",
transaction_id: "1938161662147970447-1938161662147970448"
*/
function buildAsset(listing) {
    const keys = [
        'currency',
        'appid',
        'contextid',
        'id',
        'classid',
        'instanceid',
        'amount',
        'status',
        'original_amount',
        'unowned_id',
        'unowned_contextid',
        'background_color',
        'icon_url',
        'icon_url_large',
        'descriptions',
        'tradable',
        'actions',
        'name',
        'name_color',
        'type',
        'market_name',
        'market_hash_name',
        'market_actions',
        'commodity',
        'market_tradable_restriction',
        'market_marketable_restriction',
        'marketable',
        'app_icon',
        'owner'
    ];
    
    return keys.reduce((result, key) => {
        if (listing[key] !== undefined) {
            result[key] = listing[key];
        }
        
        return result;
    }, {
        id: listing.assetid,
        icon_url_large: listing.icon_Url
    });
}

function createHover(listing, suffix) {
    const {
        appid,
        contextid,
        assetid,
        transaction_id
    } = listing;
    const id = transaction_id.replace('-', '_');
    
    return `CreateItemHoverFromContainer( g_rgAssets, 'history_row_${id}_${suffix}', ${appid}, '${contextid}', '${assetid}', 0 );`;
}

function createResponse(listings, account, options = {}) {
    const defaults = {
        success: true,
        pagesize: 10,
        total_count: 1000,
        start: 0
    };
    const hovers = listings.reduce((result, listing) => {
        const hovers = [
            'name',
            'image'
        ].map((name) => {
            return createHover(listing, name);
        });
        
        return [
            ...result,
            ...hovers
        ];
    }, []).join('\n');
    const assets = listings.reduce((result, listing) => {
        const {
            appid,
            contextid,
            assetid
        } = listing;
        
        createTree(result, [
            appid,
            contextid,
            assetid
        ], listing);
        
        return result;
    }, {});
    const listingsHTML = listings.map((listing) => {
        return createRow(listing, account);
    });
    const settings = Object.assign({}, defaults, options);
    const {
        pagesize,
        total_count,
        start,
    } = settings;
    const results_html = `
        <div id="tabContentsMyMarketHistoryTable" class="market_home_listing_table market_home_main_listing_table">
            <div id="tabContentsMyMarketHistoryRows">
                <div class="market_listing_table_header">
                    <div class="market_listing_left_cell market_listing_gainorloss"></div>
                    <div class="market_listing_right_cell market_listing_their_price">PRICE</div>
                    <div class="market_listing_right_cell market_listing_whoactedwith">WITH</div>
                    <div class="market_listing_right_cell market_listing_listed_date can_combine">ACTED ON</div>
                    <div class="market_listing_right_cell market_listing_listed_date can_combine">LISTED ON</div>
                    <div><span class="market_listing_header_namespacer"></span>NAME</div>
                </div>
                ${listingsHTML}
            </div>
        </div>
        <div id="tabContentsMyMarketHistory_ctn" class="market_paging" style="">
            <div class="market_paging_controls" id="tabContentsMyMarketHistory_controls">
                <span id="tabContentsMyMarketHistory_btn_prev" class="pagebtn">&lt;</span>
                <span id="tabContentsMyMarketHistory_links"></span>
                <span id="tabContentsMyMarketHistory_btn_next" class="pagebtn">&gt;</span>
            </div>
            <div class="market_paging_summary ellipsis">
                Showing <span id="tabContentsMyMarketHistory_start">${start + 1}</span>-<span id="tabContentsMyMarketHistory_end">${start + 1 + pagesize}</span> of <span id="tabContentsMyMarketHistory_total">${total_count}</span> results </div>
            <div style="clear: both;"></div>
        </div>
    `.replace(/\s{2,}/g, ' ');
    
    return Object.assign({}, settings, {
        assets,
        hovers,
        results_html
    });
}

function createRow(listing) {
    const id = listing.transaction_id.replace('-', '_');
    const creditSymbol = listing.is_credit ? '-' : '+';
    const {
        name,
        icon_url,
        seller,
        background_color,
        border_color,
        price_raw,
        date_acted_raw,
        date_listed_raw
    } = listing;
    const icon = icon_url;
    const borderStyle = border_color ? `border-color: #${border_color};` : '';
    const sellerName = 'Meower';
    /*
    const priceStr = formatMoney(listing,price, currency);
    const dateActedStr = locales.toDateString(listing.date_acted);
    const dateListedStr = locales.toDateString(listing.date_listed);
    */
    const priceStr = price_raw;
    const dateActedStr = date_acted_raw;
    const dateListedStr = date_listed_raw;
    
    return `
        <div class="market_listing_row market_recent_listing_row" id="history_row_${id}">
            <div class="market_listing_left_cell market_listing_gainorloss">
                ${creditSymbol}
            </div>
            <img
                id="history_row_${id}_image"
                src="https://steamcommunity-a.akamaihd.net/economy/image/${icon}/62fx62f"
                srcset="https://steamcommunity-a.akamaihd.net/economy/image/${icon}/62fx62f 1x, https://steamcommunity-a.akamaihd.net/economy/image/${icon}/62fx62fdpx2x 2x"
                style="${borderStyle};background-color: #${background_color};"
                class="market_listing_item_img" alt=""
            />
            <div class="market_listing_right_cell market_listing_their_price">
                <span class="market_table_value">
                    <span class="market_listing_price">
                        ${priceStr}
                    </span>
                    <br/>
                </span>
            </div>
            <div class="market_listing_right_cell market_listing_whoactedwith">
                <span class="market_listing_owner_avatar">
                    <span class="playerAvatar online">
                        <a href="${seller}">
                            <img src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/18/1847e767407ff97e8dd72a0229d1fef83c085a7d.jpg" alt="" title="${sellerName}" />
                        </a>
                    </span>
                </span>
                <div class="market_listing_whoactedwith_name_block">
                    Buyer: <br/>
                    ${sellerName}
                </div>
            </div>
            <div class="market_listing_right_cell market_listing_listed_date can_combine">
                ${dateActedStr}
            </div>
            <div class="market_listing_right_cell market_listing_listed_date can_combine">
                ${dateListedStr}
            </div>
            <div class="market_listing_item_name_block">
                <span id="history_row_${id}_name" class="market_listing_item_name" style="color: #8650AC;">
                    ${name}
                </span>
                <br/>
                <span class="market_listing_game_name">
                    Team Fortress 2
                </span>
                <div class="market_listing_listed_date_combined">
                    Sold: ${dateListedStr}
                </div>
            </div>
            <div style="clear: both"></div>
        </div>
    `;
}

module.exports = createResponse;