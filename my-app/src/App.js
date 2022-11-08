import './App.css';
import {SocketContext, socket} from './context/socket';
import Lobby from './screens/Lobby.js';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { SnackbarProvider } from 'notistack'
import PrimaryAppBar from './screens/PrimaryAppBar';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from './screens/SignUp';
import SignIn from './screens/SignIn';
import Layout from './Layout';
import { useLocalStorage } from './useLocalStorage';

let darkTheme = createTheme({
  palette: {
    mode: 'dark',
    type: 'dark',
    primary: {
      main: '#610C63',
    },
    secondary: {
      main: '#64b5f6',
    },
    background: {
      default: '#303030',
      paper: '#424242',
    },
    white: {
      main: '#ffffff',
    }
  },
});

let zIndexTheme = createTheme({
  zIndex: {
    snackbar: 30000
  }
});

darkTheme = responsiveFontSizes(darkTheme);

function App() {
  const [colorblindMode, setColorblindMode] = useState(false);
  const [user, setUser] = useLocalStorage("user", null);

  const setColorblindModeInDatabase = (mode) => {
    if(user && user.settings) {
      let settings = user.settings; 
      settings.colorblindMode = mode;
      socket.emit('set settings', settings);
    }
    setColorblindMode(mode);
  }

  useEffect(() => {
    if(user && user.settings) {
      setColorblindMode(user.settings.colorblindMode);
    }
  }, []);

  return (
    <ThemeProvider theme={zIndexTheme}>
      <SnackbarProvider autoHideDuration={5000}>
        <ThemeProvider theme={darkTheme}>
          <SocketContext.Provider value={socket}>
            <CssBaseline>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout colorblindMode={colorblindMode} setColorblindMode={setColorblindModeInDatabase} />}>
                    <Route index element={<Lobby user={user} colorblindMode={colorblindMode} />} />
                    <Route path="sign-up" element={<SignUp />} />
                    <Route path="sign-in" element={<SignIn />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </CssBaseline>
          </SocketContext.Provider>
        </ThemeProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
