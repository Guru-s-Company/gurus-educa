import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

document.addEventListener('contextmenu', () => {
  document.documentElement.classList.add('context-menu')
  window.setTimeout(() => {
    document.documentElement.classList.remove('context-menu')
  }, 700)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
