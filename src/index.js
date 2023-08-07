import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import { createRoot } from 'react-dom/client';


const darkTheme = createTheme( {
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#e040fb',
    },
    background: {
      default: '#161725',
      paper: '#161725',
    },
    text: {
      primary: '#d7d1c7',
    },
    link: {
      main: '#e040fb',
    },
    error: {
      main: '#ef476f',
    },
  },
  typography: {
    fontFamily: '"PT Sans", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Crimson Text", "Helvetica", "Arial", sans-serif',
    },
    h2: {
      fontFamily: '"Crimson Text", "Helvetica", "Arial", sans-serif',
    },
    h3: {
      fontFamily: '"Crimson Text", "Helvetica", "Arial", sans-serif',
    },
    h4: {
      fontFamily: '"Crimson Text", "Helvetica", "Arial", sans-serif',
    },
    h5: {
      fontFamily: '"Crimson Text", "Helvetica", "Arial", sans-serif',
    },
    h6: {
      fontFamily: '"Crimson Text", "Helvetica", "Arial", sans-serif',
    },
  },

})

const customStyles =  { 
  body: {
    height: "100vh",  
    backgroundColor: "#161725",
    color: "#d7d1c7"
  },
}


const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode >
    <ThemeProvider theme={darkTheme} >
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
