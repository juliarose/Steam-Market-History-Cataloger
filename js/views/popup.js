'use strict';

import { buildApp } from '../app/app.js';
import { formatLocaleNumber } from '../app/money.js';
import { createListingManager } from '../app/manager/listingsmanager.js';
import { escapeHTML, truncate } from '../app/helpers/utils.js';
import { tabs, browserLocalStorage, sendMessage } from '../app/browser.js';

const page = {
    contents: document.getElementById('contents'),
    profile: document.getElementById('user'),
    loggedInButtons: document.querySelectorAll('.logged-in'),
    buttons: {
        steamMarket: document.getElementById('steam-market-btn'),
        // startLoading: document.getElementById('start-loading-btn'),
        loadListings: document.getElementById('load-listings-page-btn'),
        loadPurchases: document.getElementById('load-purchases-page-btn'),
        view: document.getElementById('view-page-btn'),
        viewRecent: document.getElementById('view-recent-page-btn'),
        viewTotals: document.getElementById('view-totals-page-btn'),
        preferences: document.getElementById('preferences-page-btn')
    }
};

async function onReady() {
    try {
        onApp(await buildApp());
    } catch (error) {
        page.loggedInButtons.forEach((el) => {
            el.remove();
        });
        page.profile.innerHTML = `<p class="app-error">${escapeHTML(error)}</p>`;
    }
}

function onApp(app) {
    function addListeners() {
        page.buttons.loadListings.addEventListener('click', () => {
            tabs.create({
                url: '/views/load_listings.html'
            });
        }, false);
        
        page.buttons.loadPurchases.addEventListener('click', () => {
            tabs.create({
                url: '/views/load_purchase_history.html'
            });
        }, false);
        
        page.buttons.view.addEventListener('click', () => {
            tabs.create({
                url: '/views/view/index.html'
            });
        });
        
        page.buttons.viewRecent.addEventListener('click', () => {
            tabs.create({
                url: '/views/view/index.html?last=30'
            });
        });
        
        page.buttons.viewTotals.addEventListener('click', () => {
            tabs.create({
                url: '/views/view/totals.html'
            });
        });
        
        page.buttons.preferences.addEventListener('click', () => {
            tabs.create({
                'url': '/views/preferences.html'
            });
        });
        
        page.buttons.steamMarket.addEventListener('click', () => {
            tabs.create({
                'url': 'https://steamcommunity.com/market'
            });
        });
        
        /*
        page.buttons.startLoading.addEventListener('click', () => {
            page.buttons.startLoading.remove();
            sendStartLoadingMessage();
        });
        */
    }
    
    // adds details related to account (name, profile picture, listing count)
    function addAccountContents(count) {
        if (!app.account.steamid) {
            return;
        }
        
        const { account } = app;
        const profileUrl = `https://steamcommunity.com/profiles/${account.steamid}`;
        const html = `
            <div class="avatar">
                <a href="${profileUrl}">
                    <div class="img-wrapper">
                        <img width="42" height="42" src="${account.avatar.replace('.jpg', '_full.jpg')}"/>
                    </div>
                </a>
            </div>
            <div class="text">
                <div class="name">${truncate(escapeHTML(account.username), 24, '...')}</div>
                <div class="count">${formatLocaleNumber(count || 0, account.wallet.currency)} listings</div>
            </div>
        `;
        
        page.profile.classList.remove('hidden');
        page.profile.innerHTML = html;
        
        const profileLinkEl = page.profile.querySelector('a');
        
        profileLinkEl.addEventListener('click', () => {
            tabs.create({
                'url': profileUrl
            });
        });
    }
    
    function clearListingCount() {
        sendMessage({
            name: 'clearListingCount'
        });
    }
    
    function sendStartLoadingMessage() {
        sendMessage({
            name: 'startLoading'
        });
    }
    
    // updates the listing count on the page
    function updateListingCount() {
        const count = browserLocalStorage.getItem('listingCount') || 0;
        
        clearListingCount();
        
        if (count > 0) {
            listingCount = count;
        }
    }
    
    // updates state based on whether loading is in progress
    function updateLoadingState(isLoading) {
        if (!isLoading && app.account.steamid) {
            // page.buttons.startLoading.classList.remove('hidden');
        }
    }
    
    // changes localization text on page
    function addLocales() {
        const buttonLocaleKeys = {
            steamMarket: 'steam_market',
            // removed for the time being
            // startLoading: 'start_loading',
            loadListings: 'update_listings',
            loadPurchases: 'purchase_history',
            view: 'view_all',
            viewRecent: 'view_recent',
            viewTotals: 'view_totals',
            preferences: 'preferences',
            updateListings: 'update_listings'
        };
        const localeValues = app.account.locales.ui.titles;
        const buttons = page.buttons;
        
        for (let k in buttons) {
            const spanEl = buttons[k].querySelector('span');
            const value = localeValues[buttonLocaleKeys[k]];
            
            if (spanEl && value) {
                spanEl.textContent = value;
            }
        }
    }
        
    let listingCount = 0;
    
    addListeners();
    updateListingCount();
    addLocales();
    
    // get total number of listings in db
    createListingManager(app).getSettings()
        .then((settings) => {
            updateLoadingState(settings.is_loading);
            addAccountContents(settings.recorded_count);
        });
}

onReady();