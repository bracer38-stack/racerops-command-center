import React from 'react'
import ReactDOM from 'react-dom/client'
import { RacerOpsProvider } from './context/RacerOpsContext'
import { AppContent } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RacerOpsProvider>
      <AppContent />
    </RacerOpsProvider>
  </React.StrictMode>,
)
