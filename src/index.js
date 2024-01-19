import React from 'react';
import ReactDOM from 'react-dom/client';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles/index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('vessel-schedule-root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
