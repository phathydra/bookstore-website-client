import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './routes/index'
import './index.css';


createRoot(document.getElementById('root')).render(
    <App/>
)
