const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const dataPath = path.join(app.getPath('userData'), 'data.json');

// 確保數據文件存在
function ensureDataFile() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({
      savedEquipments: [],
      savedPets: []
    }));
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  
  // 開發時打開開發者工具
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  ensureDataFile();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// 處理保存裝備
ipcMain.on('save-equipment', (event, equipmentData) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath));
    data.savedEquipments.push(equipmentData);
    fs.writeFileSync(dataPath, JSON.stringify(data));
    event.reply('save-equipment-reply', { success: true });
  } catch (error) {
    event.reply('save-equipment-reply', { success: false, error: error.message });
  }
});

// 獲取所有裝備
ipcMain.on('get-equipments', (event) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath));
    event.reply('get-equipments-reply', { success: true, equipments: data.savedEquipments });
  } catch (error) {
    event.reply('get-equipments-reply', { success: false, error: error.message });
  }
});

// 處理保存寵物
ipcMain.on('save-pet', (event, petData) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath));
    data.savedPets.push(petData);
    fs.writeFileSync(dataPath, JSON.stringify(data));
    event.reply('save-pet-reply', { success: true });
  } catch (error) {
    event.reply('save-pet-reply', { success: false, error: error.message });
  }
});

// 獲取所有寵物
ipcMain.on('get-pets', (event) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath));
    event.reply('get-pets-reply', { success: true, pets: data.savedPets });
  } catch (error) {
    event.reply('get-pets-reply', { success: false, error: error.message });
  }
});

// 處理刪除裝備
ipcMain.on('delete-equipment', (event, equipmentName) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath));
    data.savedEquipments = data.savedEquipments.filter(eq => eq.name !== equipmentName);
    fs.writeFileSync(dataPath, JSON.stringify(data));
    event.reply('delete-equipment-reply', { success: true });
  } catch (error) {
    event.reply('delete-equipment-reply', { success: false, error: error.message });
  }
});

// 處理刪除寵物
ipcMain.on('delete-pet', (event, petName) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath));
    data.savedPets = data.savedPets.filter(pet => pet.name !== petName);
    fs.writeFileSync(dataPath, JSON.stringify(data));
    event.reply('delete-pet-reply', { success: true });
  } catch (error) {
    event.reply('delete-pet-reply', { success: false, error: error.message });
  }
});

// 顯示錯誤對話框
ipcMain.on('show-error', (event, message) => {
  dialog.showErrorBox('錯誤', message);
});

// 顯示成功對話框
ipcMain.on('show-success', (event, message) => {
  dialog.showMessageBox({
    type: 'info',
    title: '成功',
    message: message
  });
});