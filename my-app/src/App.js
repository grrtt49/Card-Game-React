import './App.css';
import {SocketContext, socket} from './context/socket';
import Lobby from './components/Lobby';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const darkTheme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#620093',
    },
    secondary: {
      main: '#E53F71',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <SocketContext.Provider value={socket}>
        <CssBaseline>
          <h1>Card Game</h1>
          <div>
            <Lobby />
          </div>
        </CssBaseline>
      </SocketContext.Provider>
    </ThemeProvider>
  );
}

export default App;
