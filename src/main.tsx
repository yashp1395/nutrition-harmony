
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

// Add error boundary for better debugging
try {
  createRoot(root).render(<App />)
} catch (error) {
  console.error('Failed to render application:', error)
  // Show error message in DOM
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Something went wrong</h2>
        <p>The application failed to load. Please try refreshing the page.</p>
        <pre style="text-align: left; background: #f5f5f5; padding: 10px; margin-top: 20px; overflow: auto;">${error}</pre>
      </div>
    `
  }
}
