import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Log Vite HMR errors to console (replaces the inline script previously in index.html,
// which caused "No matching HTML proxy module found" after server restarts).
if (import.meta.hot) {
  import.meta.hot.on('vite:error', (error: { err?: { message?: string; frame?: string } }) => {
    if (error?.err) {
      console.error([error.err.message, error.err.frame].filter(Boolean).join('\n'))
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
