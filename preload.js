const { ipcRenderer, contextBridge } = require('electron');

// 暴露安全的API給渲染進程
contextBridge.exposeInMainWorld('electronAPI', {
  // 裝備相關
  saveEquipment: (data) => ipcRenderer.send('save-equipment', data),
  onSaveEquipmentReply: (callback) => ipcRenderer.on('save-equipment-reply', (_, result) => callback(result)),
  getEquipments: () => ipcRenderer.send('get-equipments'),
  onGetEquipmentsReply: (callback) => ipcRenderer.on('get-equipments-reply', (_, result) => callback(result)),
  deleteEquipment: (name) => ipcRenderer.send('delete-equipment', name),
  onDeleteEquipmentReply: (callback) => ipcRenderer.on('delete-equipment-reply', (_, result) => callback(result)),
  
  // 寵物相關
  savePet: (data) => ipcRenderer.send('save-pet', data),
  onSavePetReply: (callback) => ipcRenderer.on('save-pet-reply', (_, result) => callback(result)),
  getPets: () => ipcRenderer.send('get-pets'),
  onGetPetsReply: (callback) => ipcRenderer.on('get-pets-reply', (_, result) => callback(result)),
  deletePet: (name) => ipcRenderer.send('delete-pet', name),
  onDeletePetReply: (callback) => ipcRenderer.on('delete-pet-reply', (_, result) => callback(result)),
  
  // 對話框
  showError: (message) => ipcRenderer.send('show-error', message),
  showSuccess: (message) => ipcRenderer.send('show-success', message)
});