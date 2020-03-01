'use strict';

import { buildApp } from '../app/app.js';
import { Layout } from '../app/layout/layout.js';
import { AccountTransaction } from '../app/classes/accounttransaction.js';
import { createPurchaseHistoryManager } from '../app/manager/purchasehistorymanager.js';

const page = {
    results: document.getElementById('results'),
    contentLoader: document.getElementById('content-loader'),
    progress: document.getElementById('load-progress'),
    progressBar: document.getElementById('load-progress').firstElementChild,
    buttons: {
        getHistory: document.getElementById('get-history')
    }
};

async function onReady() {
    try {
        onApp(await buildApp());
    } catch (error) {
        Layout.error(error);
    }
}

function onApp(app) {
    function addListeners() {
        page.buttons.getHistory.addEventListener('click', (e) => {
            e.target.parentNode.remove();
            // start loading
            load();
        });
    }
    
    function renderTable(records) {
        const options = Object.assign({}, Layout.getLayoutOptions(app), {
            keep_page: true
        });
        const tableEl = Layout.buildTable(records || [], AccountTransaction, options);
        
        Layout.render(page.results, tableEl);
    }
    
    // begins loading data
    function load() {
        page.progressBar.style.width = '100%';
        page.results.innerHTML = '<div class="empty-table">Loading...</div>';
        
        function done(error) {
            page.progress.style.visibility = 'hidden';
            Layout.alert(error || 'All done!', page.results);
        }
        
        function loadTransactions(cursor, delay = 0) {
            // we've received a response and now want to get more
            function getMore({ records, cursor }) {
                onRecords(records);
                
                // if the response contained the cursor for the next page
                if (cursor) {
                    // call the load function again
                    loadTransactions(cursor, 3);
                } else {
                    // otherwise we have nothing more to load
                    done('All done!');
                }
            }
            
            purchaseHistoryManager.load(cursor, delay)
                .then(getMore)
                .catch(done);
        }
        
        Layout.alert(
            'Loading started! Your <a href="https://store.steampowered.com/account/history" target="_blank">purchase history</a> is not stored to the extension but ' +
            'can be loaded and viewed here. This page will load until no more results can be loaded.',
            page.results,
            'active'
        );
        loadTransactions();
    }
    
    function onRecords(records) {
        total = total.concat(records);
        renderTable(total);
    }
    
    // array that will hold all of our collected records from loading
    let total = [];
    const purchaseHistoryManager = createPurchaseHistoryManager(app);
    
    purchaseHistoryManager.setup()
        .then(() => {
            addListeners();
            Layout.ready();
        })
        .catch(Layout.error);
}

onReady();