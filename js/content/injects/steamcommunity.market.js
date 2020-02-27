'use strict';

import { MyBetterCAjaxPagingControls } from '/js/content/modules/MyBetterCAjaxPagingControls.js';

(function() {
    /**
     * Get a URL parameter.
     * @param {String} name - Name of parameter.
     * @returns {(String|null)} The value of parameter, if found.
     */
    function getUrlParam(name) {
        return new URL(location.href).searchParams.get(name);
    }
    
    if (getUrlParam('installation')) {
        alert('Installation successful!');
    }
    
    // change pagesize to 100
    window.LoadMarketHistory = function() {
        if (g_bBusyLoadingMarketHistory) {
            return;
        }
        
        const count = 100;
        const start = goTo.start || 0;
        const page = goTo.page || 0;
        const goToTransaction = goTo.id;
        
        g_bBusyLoadingMarketHistory = true;
        new Ajax.Request('https://steamcommunity.com/market/myhistory', {
            method: 'get',
            parameters: {
                count,
                start
            },
            onSuccess: function(transport) {
                if (transport.responseJSON) {
                    const prefix = 'tabContentsMyMarketHistory';
                    const response = transport.responseJSON;
                    const elMyHistoryContents = $(prefix);
                    
                    elMyHistoryContents.innerHTML = response.results_html;
                    MergeWithAssetArray(response.assets);
                    eval(response.hovers);
                    
                    g_oMyHistory = new MyBetterCAjaxPagingControls({
                        query: '',
                        total_count: response.total_count,
                        pagesize: response.pagesize,
                        page: page || 0,
                        prefix: prefix,
                        class_prefix: 'market'
                    }, 'https://steamcommunity.com/market/myhistory/');
                    g_oMyHistory.SetResponseHandler(function(response) {
                        MergeWithAssetArray(response.assets);
                        eval(response.hovers);
                    });
                    g_oMyHistory.ModifyMarketHistoryContents(response);
                    
                    if (goToTransaction) {
                        g_oMyHistory.AddFilter('transaction_id', goToTransaction);
                    }
                    
                    const total_count = response.total_count;
                    const bigDifference = Boolean(
                        total_count &&
                        (response.total_count - total_count) > response.pagesize
                    );
                    const canGoTo = Boolean(
                        goToTransaction &&
                        bigDifference
                    );
                    
                    if (canGoTo) {
                        const start = total_count - goTo.index;
                        const page = Math.floor(start / response.pagesize);
                        
                        g_oMyHistory.GoToPage(page, true);
                    } else if (goToTransaction) {
                        g_oMyHistory.UpdateFilter();
                    }
                }
            },
            onComplete: function() {
                g_bBusyLoadingMarketHistory = false;
            }
        });
    };
    
    function openHistory() {
        const buttonEl = document.getElementById('tabMyMarketHistory');
        const event = new Event('click');
        
        buttonEl.dispatchEvent(event);
    }
    
    function getGoToParams() {
        const total_count = localStorage.getItem('totalcount') || 0;
        const pagesize = localStorage.getItem('pagesize') || 100;
        let params = {
            index: getUrlParam('index'),
            id: getUrlParam('transaction_id')
        };
        
        if (total_count && params.index) {
            params.start = total_count - params.index;
            params.page = Math.floor(params.start / pagesize);
        }
        
        return params;
    }
    
    let goTo = getGoToParams();
    
    if (goTo.index) {
        openHistory();
    }
}());
