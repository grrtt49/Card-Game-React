import './App.css';
import {SocketContext, socket} from './context/socket';
import Lobby from './components/Lobby';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { SnackbarProvider } from 'notistack'
import PrimaryAppBar from './components/PrimaryAppBar';

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
  return (
    <ThemeProvider theme={zIndexTheme}>
      <SnackbarProvider autoHideDuration={5000}>
        <ThemeProvider theme={darkTheme}>
          <SocketContext.Provider value={socket}>
            <CssBaseline>
              {/* <PrimaryAppBar /> */}
              <h1>Card Game</h1>
              <div>
                <Lobby />
              </div>
            </CssBaseline>
          </SocketContext.Provider>
        </ThemeProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
