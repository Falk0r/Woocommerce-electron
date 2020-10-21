const { app, BrowserWindow, ipcMain } = require('electron')


function createWindow () {
    // Cree la fenetre du navigateur.
    const win = new BrowserWindow({
        width: 1200,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        }
    });

    // et charger le fichier index.html de l'application.
    win.loadFile('index.html');

    // Ouvre les DevTools.

    // win.on('')    
}


// Cette méthode sera appelée quant Electron aura fini
// de s'initialiser et prêt à créer des fenêtres de navigation.
// Certaines APIs peuvent être utilisées uniquement quand cet événement est émit.
app.whenReady().then(createWindow)


// Dans ce fichier, vous pouvez inclure le reste de votre code spécifique au processus principal. Vous pouvez également le mettre dans des fichiers séparés et les inclure ici.
