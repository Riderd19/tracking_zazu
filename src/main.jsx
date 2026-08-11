import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { StyleProvider } from '@ant-design/cssinjs'
import './index.css'
import App from './App.jsx'
import { zazuTrackingTheme } from './theme.js'
import { GoogleMapsProvider } from './contexts/GoogleMapsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StyleProvider layer>
      <ConfigProvider theme={zazuTrackingTheme}>
        <GoogleMapsProvider>
          <App />
        </GoogleMapsProvider>
      </ConfigProvider>
    </StyleProvider>
  </StrictMode>,
)
