import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter as Router} from 'react-router-dom';
import App from './App.jsx'
import './index.css'
import ErrorProvider from "./context/errorProvider/ErrorProvider.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Router>
            <ErrorProvider>
                <App/>
            </ErrorProvider>
        </Router>
    </StrictMode>,
)
