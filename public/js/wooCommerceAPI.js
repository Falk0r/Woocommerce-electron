const { Module } = require("module");
const webview = document.querySelector('webview');
const { ipcRenderer } = require('electron');
const axios = require('axios');
const remote = require('electron').remote;
const account = require('./../../account');
// import {account} from '../../account';
const webOrder = {
    numOrder : '',
    numProduct : '',
    mail : '',
    shop : '',
    try : 0
};
const mailValid = ['gmail', 'hotmail', 'msn', 'laposte', 'yahoo', 'outlook', 'sfr', 'live', 'numericable', 'free', 'orange', 'me', 'neuf', 'wanadoo', 'icloud'];

const waiting = setInterval(getOrder, 12000)

// Setup:
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // Supports ESM

const WooCommerce = new WooCommerceRestApi({
  url: account.wooUrl, // Your store URL
  consumerKey: account.wooConsumerKey, // Your consumer key
  consumerSecret: account.wooConsumerSecret, // Your consumer secret
  version: 'wc/v3' // WooCommerce WP REST API version
});



//Identification de l'URL et appelle des différentes fonctions
function whereAreWe() {
    const browser = remote.getCurrentWindow();
    console.log({browser});

    let place = webview.getURL();
    console.log({place});

    if (place == account.url) {
        webview.send("login");
    }
    if (place == account.urlDashboard) {
        webview.loadURL(account.urlWaiting);
    }
    if (place == account.urlCreate) {
        addOrder();
    }
    if (place == account.urlWaiting) {
        waiting;
    }
    if (place == account.urlNoPass) {
        expired();
    }
    if (place == account.urlLines) {
        sendOrder();
    }
    if (/extend/.test(place)) {        
        extend();
    }
    return place;
}

//Appel API vers la boutique en ligne pour remonter les commandes en cours.
async function getOrder() {
    let time = new Date();
    console.log("seek order at day " + time.getDate() + "/" + time.getMonth() + " à " + time.getHours() + "h" + time.getMinutes());
    WooCommerce.get("orders")
      .then((response) => {
        
        const order = response.data;

        for (let index = 0; index < order.length; index++) {
            const element = order[index];
            if (element.status == 'processing') {
                clearInterval(waiting);
                getProduct(element);
                if (webOrder.try == 0) {
                    webview.loadURL(account.urlCreate)
                }
                break;
            }
        }
      })
      .catch((error) => {
        reload();
      });
}

//Recolte des informations de la commande.
function getProduct(element) {
    webOrder.mail = element.billing.email;
    webOrder.numOrder = element.id;
    if (element.billing.first_name == 'Smarters') {
        webOrder.shop = 'Smarters';
    } else {
        webOrder.shop = 'king';
    }
    let produit = element.line_items[0].variation_id //Element à définir par webHook
      switch (produit) {
        case 74: webOrder.numProduct = "10"
          break;
        case 75: webOrder.numProduct = "9"
          break;
        case 76: webOrder.numProduct = "8"
          break;
        case 73: 
            webOrder.numProduct = "2";
            spam();
          break;
        default:  webOrder.numProduct = produit;
      };    
}

//Ajout de la commande
function addOrder() {
    
    webview.send("add-order", {
        mail : webOrder.mail,
        numProduct : webOrder.numProduct,
        shop : webOrder.shop,
        numOrder: webOrder.numOrder
    });
}

//Verif si expired
function expired() {
    webview.send('expired', {mail : webOrder.mail});
}

function sendOrder() {
    webview.send('send-order', {mail : webOrder.mail, shop : webOrder.shop, numProduct : webOrder.numProduct});
}

// Process the data from the webview
webview.addEventListener('ipc-message',function(event){
    
    if (event.channel == 'addOredered') {
        let result = event.args[0][0].handler;
        //On vérifie si l'abonnement n'as pas été ajouté
        if (!result) {
            webOrder.try = 1;
            webview.loadURL(account.urlNoPass);
        }
    };
    if (event.channel == 'no-expire') {
        //On met la commande en attente
        toHold();
    }
    if (event.channel == 'expired') {
        let id = event.args[0][0].id;
        webview.loadURL(account.urlExtend + id);
    }
    if (event.channel == 'mail-sended') {
        let url = event.args[0][0].url;
        axios.get(url)
            .then(function (response) {
                // handle success                
                completed();
            })
            .catch(function (error) {
                // handle error                
                toHold();
            })
    }
    if (event.channel == 'hold') {
        toHold();
    }
});

function extend() {
    if (webOrder.numProduct != "2") {
        webview.send('extend', {numProduct : webOrder.numProduct});
    } else {        
        toHold();
    }
}

function reload() {
    const window = remote.getCurrentWindow();
    window.reload();
}

function completed() {
    let url = account.urlUpdate + webOrder.numOrder + "&status=completed";
    axios.get(url)
        .then(function (response) {
            // handle success
            console.log("commande completed");
            reload();
        })
        .catch(function (error) {
            // handle error
            toHold();
        })
}

function toHold() {
    let url = account.urlUpdate + webOrder.numOrder + "&status=hold";
    axios.get(url)
    .then(function (response) {
        // handle success
        console.log("commande " + webOrder.numOrder + " on-hold");
        reload();
    })
    .catch(function (error) {
        // handle error
        reload();
    })
}

function spam() {
    //Vérification de l'adresse mail si Spam:
    var mailVerif = webOrder.mail.split('@')[1].split('.')[0];
    var spam = true;
    mailValid.forEach(elt => {      
        if (mailVerif == elt){
            spam = false;
        }
    });
    if (spam) {
        toHold();
    }
}

exports.getOrder = getOrder;
exports.whereAreWe = whereAreWe;