import { readyState } from '../app/readyState.js';
import { formatLocaleNumber } from '../app/money.js';
import { ListingManager } from '../app/manager/listingsmanager.js';
import { escapeHTML, truncate } from '../app/helpers/utils.js';
import { tabs, sendMessage } from '../app/browser.js';

const page = {
    contents: document.getElementById('contents'),
    profile: document.getElementById('user'),
    loggedInButtons: document.querySelectorAll('.logged-in'),
    buttons: {
        loadListings: document.getElementById('load-listings-page-btn'),
        loadPurchases: document.getElementById('load-purchases-page-btn'),
        view: document.getElementById('view-page-btn'),
        viewTotals: document.getElementById('view-totals-page-btn'),
        preferences: document.getElementById('preferences-page-btn')
    }
};

async function onApp(app) {
    // add listeners
    (function() {
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
    }());
    
    // updates the listing count on the page
    (function() {
        // clear the listing count
        sendMessage({
            name: 'clearListingCount'
        });
    }());
    
    // changes localization text on page
    (function() {
        const buttonLocaleKeys = {
            loadListings: 'update_listings',
            loadPurchases: 'purchase_history',
            view: 'view_all',
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
    }());
    
    try {
        // adds details related to account (name, profile picture, listing count)
        (function() {
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
                    <div id="listing-count" class="count">--- listings</div>
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
        }());
        
        // get total number of listings in db
        const settings = await new ListingManager(app).getSettings();
        const { account } = app;
        const count = settings.recorded_count;
        
        document.getElementById('listing-count').textContent = `${formatLocaleNumber(count || 0, account.wallet.currency)} listings`;
    } catch {
        // error
    }
}

// ready
{
    readyState(onApp, (error) => {
        page.loggedInButtons.forEach((el) => {
            el.remove();
        });
        page.profile.innerHTML = `<p class="app-error">${escapeHTML(error)}</p>`;
    });
}
