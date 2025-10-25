const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// 數據存儲路徑
const dataPath = path.join(app.getPath('userData'), 'data.json');

// 確保數據文件存在
function ensureDataFile() {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify({ savedEquipments: [], savedPets: [] }, null, 2));
    }
  } catch (e) {
    console.error('初始化數據文件失敗:', e);
  }
}

// 創建主窗口
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: '伊瑟計算器'
  });

  // 加載HTML文件
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

// 應用準備就緒時創建窗口
app.whenReady().then(() => {
  ensureDataFile();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 所有窗口關閉時退出應用
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// 讀取整個應用數據
function readAppData() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    return { savedEquipments: [], savedPets: [] };
  }
}

// 寫入整個應用數據
function writeAppData(appData) {
  fs.writeFileSync(dataPath, JSON.stringify(appData, null, 2));
}

// ===== IPC: 裝備 =====
ipcMain.handle('save-equipment', async (_event, data) => {
  try {
    const appData = readAppData();
    // 確保名稱存在
    if (!data.name) data.name = `${data.slot || 'equipment'}-${Date.now()}`;
    // 以名稱唯一，若同名則覆蓋
    appData.savedEquipments = (appData.savedEquipments || []).filter(e => e.name !== data.name);
    appData.savedEquipments.push(data);
    writeAppData(appData);
    return { success: true, name: data.name };
  } catch (error) {
    dialog.showErrorBox('保存失敗', `無法保存裝備: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-equipment', async () => {
  try {
    const appData = readAppData();
    return { success: true, equipments: appData.savedEquipments || [] };
  } catch (error) {
    dialog.showErrorBox('讀取失敗', `無法讀取裝備數據: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-equipment', async (_event, name) => {
  try {
    const appData = readAppData();
    appData.savedEquipments = (appData.savedEquipments || []).filter(e => e.name !== name);
    writeAppData(appData);
    return { success: true };
  } catch (error) {
    dialog.showErrorBox('刪除失敗', `無法刪除裝備: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// ===== IPC: 寵物 =====
ipcMain.handle('save-pet', async (_event, data) => {
  try {
    const appData = readAppData();
    if (!data.name) data.name = `pet-${Date.now()}`;
    appData.savedPets = (appData.savedPets || []).filter(p => p.name !== data.name);
    appData.savedPets.push(data);
    writeAppData(appData);
    return { success: true, name: data.name };
  } catch (error) {
    dialog.showErrorBox('保存失敗', `無法保存寵物: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-pet', async () => {
  try {
    const appData = readAppData();
    return { success: true, pets: appData.savedPets || [] };
  } catch (error) {
    dialog.showErrorBox('讀取失敗', `無法讀取寵物數據: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-pet', async (_event, name) => {
  try {
    const appData = readAppData();
    appData.savedPets = (appData.savedPets || []).filter(p => p.name !== name);
    writeAppData(appData);
    return { success: true };
  } catch (error) {
    dialog.showErrorBox('刪除失敗', `無法刪除寵物: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// ===== IPC: 裝備重命名 =====
ipcMain.handle('rename-equipment', async (_event, { oldName, newName }) => {
  try {
    const appData = readAppData();
    if (!oldName || !newName) throw new Error('名稱不可為空');
    if (oldName === newName) return { success: true, name: newName };
    const list = appData.savedEquipments || [];
    const exists = list.find(e => e.name === newName);
    if (exists) throw new Error('新名稱已存在');
    const item = list.find(e => e.name === oldName);
    if (!item) throw new Error('未找到要重命名的裝備');
    item.name = newName;
    writeAppData(appData);
    return { success: true, name: newName };
  } catch (error) {
    dialog.showErrorBox('重命名失敗', `無法重命名裝備: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// ===== IPC: 對話框 =====
ipcMain.handle('show-error', async (_event, message) => {
  dialog.showErrorBox('錯誤', String(message || '未知錯誤'));
  return { success: true };
});

ipcMain.handle('show-success', async (_event, message) => {
  await dialog.showMessageBox({ type: 'info', title: '成功', message: String(message || '操作成功') });
  return { success: true };
});