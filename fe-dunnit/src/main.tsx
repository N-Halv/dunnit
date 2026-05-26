import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


const config = await fetch('http://localhost:5235/config').then((r) => r.json())
console.log('testValue:', config.testValue)


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
