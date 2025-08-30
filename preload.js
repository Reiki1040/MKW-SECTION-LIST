// preload.js（必要なAPIがなければ空でもOK）
const { contextBridge } = require('electron')

// もし公開したいAPIがあればここで expose。
// Quill は触らない。
contextBridge.exposeInMainWorld('api', {
  // ...
})
