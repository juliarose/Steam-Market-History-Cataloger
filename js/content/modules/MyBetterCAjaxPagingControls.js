'use strict';

import {ListingFiltering} from '/js/content/modules/ListingFiltering.js';

/*
This is an improved version of "CAjaxPagingControls" from Steam's source.
It basically does most of the same thing, but was rewritten for me to manage more easily.

Oh, and there are several modifications to it... Such as:
    - Table of listings is wrapped in another container so that a scrollbar is added
    - Better page controls, ability to go to any page from any point
    - Current page can be set through constructor. This is useful for when the first page
      we fetch is not the first, which is what we use when we want to jump to a certain index
    - Filtering listings
 */

function MyBetterCAjaxPagingControls(rgSearchData, url) {
    // assign properties
    Object.assign(this, {
        m_strElementPrefix: rgSearchData.prefix || '',
        m_strClassPrefix: rgSearchData.class_prefix || '',
        m_rgStaticParams: null,
        m_bLoading: false,
        m_fnPreRequestHandler: null,
        m_fnResponseHandler: null,
        m_fnPageChangingHandler: null,
        m_fnPageChangedHandler: null,
        m_strActionURL: url,
        m_strQuery: rgSearchData.query,
        m_cTotalCount: rgSearchData.total_count,
        m_iCurrentPage: rgSearchData.page || 0,
        m_cPageSize: rgSearchData.pagesize,
        m_cMaxPages: Math.ceil(rgSearchData.total_count / rgSearchData.pagesize),
        m_strDefaultAction: rgSearchData.action || 'render',
        m_rgAvailableSizes: []
    });
    
    console.log(this.m_iCurrentPage);
    
    // most importantly, this will manage filters
    // we pass the wallet currency for parsing prices from listings
    this.filtering = new ListingFiltering(g_rgWalletInfo && g_rgWalletInfo.wallet_currency);
    this.GetElements();
    this.AddButtons();
    this.BindEvents();
    this.UpdatePagingDisplay();
}

MyBetterCAjaxPagingControls.prototype.BindEvents = function(listingEl, key) {
    this.elements.btnPrev.observe('click', () => {
        this.PrevPage();
    });
    this.elements.btnNext.observe('click', () => {
        this.NextPage();
    });
    this.elements.rows.observe('click', (e) => {
        if (e.target.matches('.market_listing_item_img')) {
            this.FilterToListing(e.target.parentNode, 'color');
        } else if (e.target.matches('.market_listing_gainorloss')) {
            this.FilterToListing(e.target.parentNode, 'sale_type');
        }
        
        // not used, but bonus filtering options
        /*
        else if (e.target.matches('.market_listing_game_name')) {
            this.FilterToListing(e.target.parentNode.parentNode, 'game');
        } else if (e.target.matches('.market_listing_item_name')) {
            this.FilterToListing(e.target.parentNode.parentNode, 'market_name');
        }
        */
    });
    
    this.elements.searchFieldBtn.observe('click', () => {
        let pagenum = parseInt(this.elements.searchField.value); // check if the value is a number
        
        if (pagenum) {
            g_oMyHistory.GoToPage(pagenum - 1, true);
        }
    });
    this.elements.filterBtn.observe('click', () => {
        this.elements.filterBtn.hide();
        this.filtering.clear();
        this.UpdateFilter();
    });
};

MyBetterCAjaxPagingControls.prototype.FilterToListing = function(listingEl, key) {
    let value = this.filtering.getListingValue(listingEl, key);
    
    if (value) {
        this.AddFilter(key, value, true);
    }
};

MyBetterCAjaxPagingControls.prototype.GetElements = function() {
    let prefix = this.m_strElementPrefix;
    
    this.elements = {
        table: $(prefix + 'Table'),
        rows: $(prefix + 'Rows'),
        pagingSizeCtn: $(prefix + '_paging_size_ctn'),
        noResults: $(prefix + '_no_results'),
        controls: $(prefix + '_controls'),
        ctn: $(prefix + '_ctn'),
        total: $(prefix + '_total'),
        start: $(prefix + '_start'),
        end: $(prefix + '_end'),
        btnPrev: $(prefix + '_btn_prev'),
        btnNext: $(prefix + '_btn_next'),
        links: $(prefix + '_links')
    };
};

// modify element results contents
MyBetterCAjaxPagingControls.prototype.ModifyMarketHistoryContents = function(response) {
    if (response.total_count) {
        localStorage.setItem('totalcount', response.total_count);
        localStorage.setItem('pagesize', response.pagesize);
    }
    
    let listingsList = this.elements.rows.getElementsByClassName('market_listing_row');
    
    this.elements.rowContents = document.createElement('div');
    this.elements.rowContents.setAttribute('id', this.m_strElementPrefix + 'RowsContents');
    
    Array.from(listingsList).forEach((listingEl) => {
        this.elements.rowContents.appendChild(listingEl);
    });
    
    this.elements.rows.insert(this.elements.rowContents);
    this.filtering.updateIndex(listingsList);
};

MyBetterCAjaxPagingControls.prototype.AddFilter = function(key, value, update) {
    this.filtering.setFilter(key, value);
    
    if (this.filtering.hasOptions()) {
        this.elements.filterBtn.show();
    } else {
        this.elements.filterBtn.hide();
    }
    
    if (update) {
        this.UpdateFilter();
    }
};

MyBetterCAjaxPagingControls.prototype.UpdateFilter = function() {
    this.filtering.update(this.elements.rowContents);
};

MyBetterCAjaxPagingControls.prototype.OnResponseRenderResults = function(transport) {
    let response = transport.responseJSON;
    let success = Boolean(response && response.success);
    
    if (!success) {
        return;
    }
    
    if (typeof RecordAJAXPageView !== 'undefined') {
        RecordAJAXPageView(transport.request.url);
    }
    
    this.m_cTotalCount = response.total_count;
    this.m_cMaxPages = Math.ceil(response.total_count / this.m_cPageSize);
    this.m_iCurrentPage = Math.floor(response.start / this.m_cPageSize);
    
    if (this.m_iCurrentPage !== 0 && this.m_cTotalCount <= response.start) {
        // this page is no longer valid, flip back a page (deferred so that the AJAX handler exits and reset m_bLoading)
        this.GoToPage.bind(this, this.m_iCurrentPage - 1).defer();
        return;
    }
    
    this.elements.rows.update(response.results_html);
    this.ModifyMarketHistoryContents(response);
    this.UpdateFilter();
    
    if (this.m_fnResponseHandler != null) {
        this.m_fnResponseHandler(response);
    }
    
    ScrollToIfNotInView($(this.m_strElementPrefix + 'Table'), 40);
    this.UpdatePagingDisplay();
};

MyBetterCAjaxPagingControls.prototype.UpdatePagingDisplay = function() {
    this.UpdatePagingControlState();
    this.AddPageLinks();
    
    if (typeof this.m_fnPageChangedHandler === 'function') {
        this.m_fnPageChangedHandler(this.m_iCurrentPage);
    }
};

MyBetterCAjaxPagingControls.prototype.UpdatePagingControlState = function() {
    if (this.m_cTotalCount === 0) {
        this.elements.ctn.hide();
        
        if (this.elements.noResults) {
            this.elements.noResults.show();
        }
    } else {
        this.elements.ctn.show();
        
        if (this.elements.noResults) {
            this.elements.noResults.hide();
        }
        
        this.elements.total.update(v_numberformat(this.m_cTotalCount));
        this.elements.start.update(v_numberformat(this.m_iCurrentPage * this.m_cPageSize + 1));
        this.elements.end.update(Math.min((this.m_iCurrentPage + 1) * this.m_cPageSize, this.m_cTotalCount));
    }
    
    if (this.m_cMaxPages <= 1) {
        this.elements.controls.hide();
    } else {
        this.elements.controls.show();
    }
    
    if (this.m_iCurrentPage > 0) {
        this.elements.btnPrev.removeClassName('disabled');
    } else {
        this.elements.btnPrev.addClassName('disabled');
    }
    
    if (this.m_iCurrentPage < this.m_cMaxPages - 1) {
        this.elements.btnNext.removeClassName('disabled');
    } else {
        this.elements.btnNext.addClassName('disabled');
    }
};

// just a sub for adding page links
// this is more simplified
MyBetterCAjaxPagingControls.prototype.AddPageLinks = function() {
    // we always show first, last, + 3 page links closest to current page
    let range = 2 * 2;
    let currentPage = this.m_iCurrentPage;
    let maxPages = this.m_cMaxPages;
    let firstPage = 1;
    let lastPage = maxPages - 2;
    let low = Math.max(currentPage - (range / 2), firstPage);
    let high = Math.min(low + range, lastPage);
    let elementsToAdd = [];
    
    // difference between high and low is smaller than defined range
    // this usually means we've reached towards the end of the history
    if (high - low < range) {
        low = Math.max(high - range, firstPage);
    }
    
    elementsToAdd.push(this.GetPageLink(0));
    
    if (low !== firstPage) {
        elementsToAdd.push(' ... ');
    }
    
    for (let iPage = low; iPage <= high; iPage++) {
        elementsToAdd.push(this.GetPageLink(iPage));
    }
    
    if (high !== lastPage) {
        elementsToAdd.push(' ... ');
    }
    
    elementsToAdd.push(this.GetPageLink(this.m_cMaxPages - 1));
    
    // empty
    this.elements.links.update('');
    elementsToAdd.forEach((el) => {
        this.elements.links.insert(el);
    });
};

MyBetterCAjaxPagingControls.prototype.GetPageLink = function(iPage) {
    let prefix = this.m_strClassPrefix || this.m_strElementPrefix;
    let el = new Element('span', {
        'class': prefix + '_paging_pagelink'
    });
    
    el.update((iPage + 1) + ' ');
    
    if (iPage === this.m_iCurrentPage) {
        el.addClassName('active');
    } else {
        el.observe('click', this.GoToPage.bind(this, iPage));
    }
    
    return el;
};

MyBetterCAjaxPagingControls.prototype.AddButtons = function() {
    let prevBtnEl = this.elements.btnPrev;
    let parentEl = prevBtnEl.parentNode;
    
    this.elements.searchField = new Element('input', {
        'type': 'number',
        'placeholder': 'Go to...',
        'id': this.m_strElementPrefix + '_goto_field',
        'class': 'optionbtn gotofield'
    });
    this.elements.searchFieldBtn = new Element('div', {
        'id': this.m_strElementPrefix + '_goto_button',
        'class': 'pagebtn optionbtn gotobutton'
    });
    this.elements.filterBtn = new Element('div', {
        'class': 'pagebtn optionbtn removefilterbutton'
    });
    this.elements.searchFieldBtn.update('Go');
    this.elements.filterBtn.update('Clear filter');
    this.elements.filterBtn.hide();
    
    // add the elements to the page
    [
        // this element will appear first
        this.elements.filterBtn,
        this.elements.searchField,
        this.elements.searchFieldBtn
    ].forEach((el) => {
        parentEl.insertBefore(el, prevBtnEl);
    });
};

MyBetterCAjaxPagingControls.prototype.GetActionURL = function(action) {
    let url = action ? this.m_strActionURL + action + '/' : this.m_strActionURL;
    
    return url;
};

MyBetterCAjaxPagingControls.prototype.SetPreRequestHandler = function(fnHandler) {
    this.m_fnPreRequestHandler = fnHandler;
};

MyBetterCAjaxPagingControls.prototype.SetResponseHandler = function(fnHandler) {
    this.m_fnResponseHandler = fnHandler;
};

MyBetterCAjaxPagingControls.prototype.SetPageChangingHandler = function(fnHandler) {
    this.m_fnPageChangingHandler = fnHandler;
};

MyBetterCAjaxPagingControls.prototype.SetPageChangedHandler = function(fnHandler) {
    this.m_fnPageChangedHandler = fnHandler;
};

MyBetterCAjaxPagingControls.prototype.SetStaticParameters = function(rgParams) {
    this.m_rgStaticParams = rgParams;
};

MyBetterCAjaxPagingControls.prototype.OnAJAXComplete = function() {
    this.m_bLoading = false;
};

MyBetterCAjaxPagingControls.prototype.OnChangeSize = function(event) {
    if (event.target && event.target.dataset.size != this.m_cPageSize) {
        this.m_cPageSize = event.target.dataset.size;
        this.GoToPage(0, true);
    }
};

MyBetterCAjaxPagingControls.prototype.NextPage = function() {
    if (this.m_iCurrentPage < this.m_cMaxPages - 1) {
        this.GoToPage(this.m_iCurrentPage + 1);
    }
};

MyBetterCAjaxPagingControls.prototype.PrevPage = function() {
    if (this.m_iCurrentPage > 0) {
        this.GoToPage(this.m_iCurrentPage - 1);
    }
};

MyBetterCAjaxPagingControls.prototype.GoToPage = function(iPage, bForce) {
    let badPage = !bForce && Boolean(
        this.m_bLoading ||
        iPage >= this.m_cMaxPages ||
        iPage < 0 ||
        iPage === this.m_iCurrentPage
    );
    let params = {
        query: this.m_strQuery,
        start: this.m_cPageSize * iPage,
        count: this.m_cPageSize
    };
    
    // we are unable to go to that page
    if (badPage) {
        return false;
    }
    
    if (this.m_rgStaticParams !== null) {
        for (let sParamName in this.m_rgStaticParams) {
            let hasData = (
                typeof sParamName === 'string' &&
                typeof this.m_rgStaticParams[sParamName] === 'string'
            );
            
            if (hasData) {
                params[sParamName] = this.m_rgStaticParams[sParamName];
            }
        }
    }
    
    if (typeof this.m_fnPageChangingHandler === 'function') {
        this.m_fnPageChangingHandler(iPage);
    }
    
    if (typeof this.m_fnPreRequestHandler === 'function') {
        this.m_fnPreRequestHandler(params);
    }
    
    this.m_bLoading = true;
    new Ajax.Request(this.GetActionURL(this.m_strDefaultAction), {
        method: 'get',
        parameters: params,
        onSuccess: this.OnResponseRenderResults.bind(this),
        onComplete: this.OnAJAXComplete.bind(this)
    });
    
    return true;
};

export {MyBetterCAjaxPagingControls};