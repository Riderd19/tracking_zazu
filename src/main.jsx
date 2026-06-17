import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App.jsx'
import { zazuTrackingTheme } from './theme.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={zazuTrackingTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
