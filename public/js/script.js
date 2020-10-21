const { finished } = require("stream");
const { loadavg } = require("os");
const path = require("path");
const woocommerce = require(path.resolve('public/js/wooCommerceAPI.js'));

onload = () => {
    const webview = document.querySelector('webview')

    // When everything is ready, trigger the events without problems
    webview.addEventListener("dom-ready", function() {
    // Show devTools if you want
    //webview.openDevTools();
    
    // Aler the scripts src of the website from the <webview>
    woocommerce.whereAreWe();

    });
}