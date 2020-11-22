// inyector.js// Get the ipcRenderer of electron
const {ipcRenderer} = require('electron');
// import {account} from '../../account';
const account = require('./../../account');

// Do something according to a request of your mainview
ipcRenderer.on('login', function(){
    ipcRenderer.sendToHost(changeInput());
    setTimeout(function(){ipcRenderer.sendToHost('hold')},30000);
});

ipcRenderer.on("add-order",function(event,data){
    // the document references to the document of the <webview>

    //Récuperer le formulaire:
    var formulaire = document.getElementById("content");
    formulaire = formulaire.getElementsByTagName('form')[0];

    //USERNAME
    var enter_mail_formulaire = formulaire.getElementsByTagName('input');
    enter_mail_formulaire.username.value = data.mail;

    //PackageID
    var select = formulaire.getElementsByTagName('select')[0];
       select.value = data.numProduct;
    
    //Abonnement 24h
    if (data.numProduct == '2'){
        enter_mail_formulaire.trial.setAttribute("checked","");
    }

    //Envoi du formulaire
    var form = document.getElementsByTagName('button')[1];
        form.click();

    //Verif
    setTimeout(verif, 5000)

    function verif() {
        var verif = document.getElementById('swal2-content').textContent;
        if(verif == "The username has already been taken."){
            ipcRenderer.sendToHost('addOredered', [{
                order : data.numOrder,
                numProduct : data.numProduct,
                shop : data.shop,
                mail : data.mail,
                handler : false
            }]);        
        } else {
            ipcRenderer.sendToHost('addOredered', [{
                order : data.numOrder,
                numProduct : data.numProduct,
                shop : data.shop,
                mail : data.mail,
                handler : true
            }]);
        };
    }

    //timeout
    setTimeout(function(){ipcRenderer.sendToHost('hold')},30000);
});

ipcRenderer.on("expired",function(event,data){

    setTimeout(RechercheIdentifiant, 2000);
    //On vérifie si la recherche retourne un résultat
    setTimeout(Controle, 5000);

    function RechercheIdentifiant(){
        //On recherche le mail de la commande dans la base
        var mail_a_chercher = data.mail;
        var barreRecherche = document.getElementById('users-table_filter');
        barreRecherche = barreRecherche.getElementsByTagName('input')[0];
        var event = new Event('keyup');
        barreRecherche.value = "";
        barreRecherche.dispatchEvent(event);
        barreRecherche.value = mail_a_chercher;
        barreRecherche.dispatchEvent(event);
    }

    function Controle(){
        var table = document.getElementsByTagName('table')[0];
    
        var arTableRows = table.getElementsByTagName('tr')[1];
    
        var tdTableRows = arTableRows.getElementsByTagName('td')[0].outerText;
    
        console.log(tdTableRows);
    
        if(tdTableRows == "No matching records found"){
            console.log("Il n'y a rien");
            ipcRenderer.sendToHost('no-matching');

        } else{
            console.log("Il y a quelque chose");
            ipcRenderer.sendToHost('matching');
            RecupInfoTable();
            };
    };//Fin de la fonction Controle

    function RecupInfoTable(){
        //On récupère toutes les infos remonté par la recherche
        
        var table = document.getElementsByTagName('table')[0];
    
        var arTableRows = table.getElementsByTagName('tr')[1];
    
        var id = arTableRows.getElementsByTagName('td')[0].textContent;
        
        var status = arTableRows.getElementsByTagName('td')[5].textContent;
        
        var login = arTableRows.getElementsByTagName('td')[2].textContent;
        
        var mdp = arTableRows.getElementsByTagName('td')[3].textContent;
        
        var boutique = arTableRows.getElementsByTagName('td')[6].textContent;
        
        var date = arTableRows.getElementsByTagName('td')[4].textContent;
        
        if (date !== "-"){
            var dateScan = date.split('-');
            var annee = dateScan[2].split(' ');
            var newDate = annee[0] + '/' + dateScan[1] + '/' + dateScan[0]
        };
        // var login_mail_ok = Verif_Mail(login, data.mail);
    
        if(status == "TRIAL ALMOST EXPIRED" || status == ""){
            console.log("Commande non expiré")
            status = "Enabled";
            ipcRenderer.sendToHost('no-expire');
            

        } else{
            console.log("Commande expiré")
            status = "EXPIRED";
            ipcRenderer.sendToHost('expired', [{id : id}]);
        }
    }

    //timeout
    setTimeout(function(){ipcRenderer.sendToHost('hold')},30000);



});

ipcRenderer.on('send-order',function (event,data) {
    
    setTimeout(RechercheIdentifiant, 2000);

    function RechercheIdentifiant(){
        //On recherche le mail de la commande dans la base
        var mail_a_chercher = data.mail;
        var barreRecherche = document.getElementById('users-table_filter');
        barreRecherche = barreRecherche.getElementsByTagName('input')[0];
        var event = new Event('keyup');
        barreRecherche.value = "";
        barreRecherche.dispatchEvent(event);
        barreRecherche.value = mail_a_chercher;
        barreRecherche.dispatchEvent(event);
    }

    setTimeout(Controle, 5000);

    function Controle(){
        var table = document.getElementsByTagName('table')[0];
    
        var arTableRows = table.getElementsByTagName('tr')[1];
    
        var tdTableRows = arTableRows.getElementsByTagName('td')[0].outerText;
    
        console.log(tdTableRows);
    
        if(tdTableRows == "No matching records found"){
            console.log("Il n'y a rien");
            ipcRenderer.sendToHost('no-matching');

        } else{
            console.log("Il y a quelque chose");
            ipcRenderer.sendToHost('matching');
            RecupInfoTable();
            };
    };//Fin de la fonction Controle

    function RecupInfoTable(){
        //On récupère toutes les infos remonté par la recherche
        
        var table = document.getElementsByTagName('table')[0];
    
        var arTableRows = table.getElementsByTagName('tr')[1];
    
        var id = arTableRows.getElementsByTagName('td')[0].textContent;
        
        var status = arTableRows.getElementsByTagName('td')[5].textContent;
        
        var login = arTableRows.getElementsByTagName('td')[2].textContent;
        
        var mdp = arTableRows.getElementsByTagName('td')[3].textContent;
        
        var boutique = arTableRows.getElementsByTagName('td')[6].textContent;
        
        var date = arTableRows.getElementsByTagName('td')[4].textContent;
        
        if (date !== "-"){
            var dateScan = date.split('-');
            var annee = dateScan[2].split(' ');
            var newDate = annee[0] + '/' + dateScan[1] + '/' + dateScan[0]
        };
        // var login_mail_ok = Verif_Mail(login, data.mail);
        let url = "";
        if (login == data.mail) {
            
            if (data.numProduct == "2"){
                
                url = account.sendTest + login + "&abo=" + newDate + "&login=" + login + "&mdp=" + mdp;
                
            } else{

                url = account.sendAbo + login + "&abo=" + newDate + "&login=" + login + "&mdp=" + mdp;
                
            }
            
        }else{
            //mettre la commande en attente
        };
        ipcRenderer.sendToHost('mail-sended', [{
            url : url
        }]); 
    }

    //timeout
    setTimeout(function(){ipcRenderer.sendToHost('hold')},30000);
});

ipcRenderer.on('extend',function (event,data) {

    if (document.querySelector('.gritter-title')) {
        ipcRenderer.sendToHost('no-expire');
    }
    
    AddValuePackage_id(data.numProduct);
    envoyerLeFormulaire();

    function AddValuePackage_id(num){
        var form = document.getElementsByTagName('form')[1]
        var select = form.getElementsByTagName('select')[0];
        select.value = num;
    };

    function envoyerLeFormulaire(){
        var form = document.getElementsByTagName('form');
        setTimeout(function Sub(){
            form[1].submit()
        }, 1000)
    };
    //timeout
    setTimeout(function(){ipcRenderer.sendToHost('hold')},30000);
})


/**
 * Simple function to return the source path of all the scripts in the document
 * of the <webview>
 *
 *@returns {String}
 **/

function changeInput() {

    //Insertion des identifiants
    let input = document.querySelectorAll('input');
    input[1].value = account.login;
    input[2].value = account.mdp;
    //Validation du formulaire
    const form = document.getElementsByTagName('form')[0];
    
    let button = form.querySelector('button');
    setTimeout(function Sub(){button.click()}, 5000)

}