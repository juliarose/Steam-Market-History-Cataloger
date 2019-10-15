function injectScript(location) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(location);
    script.type = 'module';
    script.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
}