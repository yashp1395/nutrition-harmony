
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

// Enhanced error boundary for better debugging
const renderApp = () => {
  try {
    console.log('Initializing application...')
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
    })
    
    createRoot(root).render(<App />)
    console.log('Application rendered successfully')
  } catch (error) {
    console.error('Failed to render application:', error)
    
    // Show detailed error message in DOM
    if (root) {
      root.innerHTML = `
        <div style="padding: 20px; margin: 20px; text-align: center; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h2 style="color: #e11d48;">Application Failed to Load</h2>
          <p style="margin-bottom: 20px;">The application encountered a critical error and could not start.</p>
          <div style="text-align: left; background: #f5f5f5; padding: 15px; border-radius: 6px; margin-top: 20px; overflow: auto; border: 1px solid #ddd;">
            <p style="font-weight: bold; margin-bottom: 10px;">Error details:</p>
            <pre style="white-space: pre-wrap; overflow-wrap: break-word;">${error instanceof Error ? error.stack || error.message : String(error)}</pre>
          </div>
          <button 
            style="margin-top: 20px; padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;"
            onclick="window.location.reload()"
          >
            Reload Application
          </button>
        </div>
      `
    }
  }
}

// Initialize the app with a small delay to ensure browser is ready
setTimeout(renderApp, 10)
