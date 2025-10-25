const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API給渲染進程
contextBridge.exposeInMainWorld('electronAPI', {
  // 裝備相關
  saveEquipment: (data) => ipcRenderer.invoke('save-equipment', data),
  getEquipment: () => ipcRenderer.invoke('get-equipment'),
  deleteEquipment: (name) => ipcRenderer.invoke('delete-equipment', name),
  renameEquipment: (oldName, newName) => ipcRenderer.invoke('rename-equipment', { oldName, newName }),
  
  // 寵物相關
  savePet: (data) => ipcRenderer.invoke('save-pet', data),
  getPet: () => ipcRenderer.invoke('get-pet'),
  deletePet: (name) => ipcRenderer.invoke('delete-pet', name),
  
  // 對話框
  showError: (message) => ipcRenderer.invoke('show-error', message),
  showSuccess: (message) => ipcRenderer.invoke('show-success', message)
});