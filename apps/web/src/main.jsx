import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'
import AuthProvider from './app/providers/AuthProvider.jsx'
import { ThemeProvider } from './app/providers/ThemeProvider.jsx'

document.addEventListener('contextmenu', () => {
  document.documentElement.classList.add('context-menu')
  window.setTimeout(() => {
    document.documentElement.classList.remove('context-menu')
  }, 700)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
