import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import theme from './theme/theme';
import { ThemeProvider, useTheme } from '@emotion/react';
// import { DataProvider } from './server/data';

function RootWithThemeVars() {
  const theme = useTheme();

  // สร้าง CSS variables จาก theme.palette.primary
  const rootStyle = {
    '--mui-primary-main': theme.palette.primary.main,
    '--mui-primary-light': theme.palette.primary.light,
    '--mui-primary-dark': theme.palette.primary.dark,
    '--mui-primary-contrastText': theme.palette.primary.contrastText,
  };

  return (
    <div style={rootStyle}>
      <App />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <RootWithThemeVars />
    </ThemeProvider>
  </React.StrictMode>
);

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/firebase-messaging-sw.js`)
//     .then(registration => {
//       console.log('Service Worker registered with scope:', registration.scope);
//     })
//     .catch(error => {
//       console.error('Service Worker registration failed:', error);
//     });
// }

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
