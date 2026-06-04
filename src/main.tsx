import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { App } from './App'

const appRoot = document.querySelector<HTMLDivElement>('#app')

if (!appRoot) {
  throw new Error('App root element not found')
}

createRoot(appRoot).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
