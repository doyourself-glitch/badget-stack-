import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // 空にしたindex.css
import App from './App.tsx' // あなたのApp.tsx（中でApp.cssが呼ばれる）

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)