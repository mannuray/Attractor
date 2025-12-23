import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { messages as enMessages } from './locales/en/messages';
import { messages as hiMessages } from './locales/hi/messages';

i18n.load({
  'en': enMessages,
  'hi': hiMessages,
});

i18n.activate('hi');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
