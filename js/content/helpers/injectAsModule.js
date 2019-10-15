// this injects a script as a module
// https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension/53033388#53033388
function injectAsModule(location) {
    import(chrome.extension.getURL(location));
}