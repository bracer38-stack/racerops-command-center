import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { RacerOpsProvider } from './context/RacerOpsContext'
import CloudCommandHub from './live/CloudCommandHub'
import './index.css'

const LegacyApp = lazy(() => import('./App').then(module => ({ default: module.AppContent })));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {window.location.pathname === '/legacy' ? <Suspense fallback={<p>Opening legacy dashboard…</p>}><RacerOpsProvider><LegacyApp /></RacerOpsProvider></Suspense> : <CloudCommandHub />}
  </React.StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => console.warn('PWA installation is unavailable in this browser.')); });
}
