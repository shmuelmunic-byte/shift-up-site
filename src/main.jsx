import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Analytics from './components/Analytics.jsx'
import './index.css'

// Secondary routes are code-split so the primary Hebrew homepage ("/")
// ships the smallest possible bundle and loads in well under a second.
const EnglishPage = lazy(() => import('./pages/EnglishPage.jsx'))
const LoginPage   = lazy(() => import('./pages/LoginPage.jsx'))
const IgPage      = lazy(() => import('./pages/IgPage.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Analytics />
      <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bedrock)' }} aria-hidden="true" />}>
        <Routes>
          <Route path="/"      element={<App />} />
          <Route path="/en"    element={<EnglishPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ig"    element={<IgPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
)
