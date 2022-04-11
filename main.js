const { app, BrowserWindow, ipcMain } = require("electron");
const path = require('path')
const ipc = ipcMain;
const fs = require('fs');
const { shell } = require('electron')

// Création d'une fenêtre
function createWindow() {
  const win = new BrowserWindow({
    width: 1280, // largeur
    height: 720, // hauteur
    minWidth: 1024,
    minHeight: 640,
    closable: true,
    darkTheme: true,
    frame: false,
    icon: path.join(__dirname, "./ico.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // true,
      devTools: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
  //win.webContents.openDevTools();

  // Gestion des demandes IPC
  // Top menu
  ipc.on("reduceApp", () => {
    console.log("reduceApp");
    win.minimize();
  });
  ipc.on("sizeApp", () => {
    console.log("sizeApp");
    if (win.isMaximized()) {
      win.restore();
    } else {
      win.maximize();
    }
  });
  ipc.on("closeApp", () => {
    console.log("closeApp");
    win.close();
  });

  ipc.on("reload", () => {
    win.reload();
  });

  ipc.on("exportPdf", () => {
    console.log("*** EXPORT PDF");
    // Chemin d'export
    var filepath = path.join(__dirname, './export.pdf');
    // Options du PDF
    var options = {
      marginsType: 1,
      pageSize: 'A4',
      printBackground: true,
      printSelectionOnly: false,
      landscape: false
    }
    // Réaliser l'export + Manipuler le fichier
    win.webContents.printToPDF(options).then(data => {
      fs.writeFile(filepath, data, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('PDF Generated Successfully');
          // win.loadURL(filepath);
          shell.showItemInFolder(filepath);
          shell.openPath(filepath);
        }
      });
    }).catch(error => {
      console.log(error)
    });
  });

  // Manipulation de la BDD
  ipc.on("addLigneToDb", (e, data) => {
    var Datastore = require('nedb'),
      db = new Datastore({filename: "data.db", autoload: true});

    db.insert(data, function(err, newrec) {
      if( err != null ) {
        console.log("*** err = ", err);
      }
      console.log("*** created = ", newrec);
      win.reload();
    })
  });
  // Fin fonctions BDD

}

// Quand electron est prêt !
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Gestion de la fermeture de toutes les fenêtres
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
