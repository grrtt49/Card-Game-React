import logo from './logo.svg';
import './App.css';
import {SocketContext, socket} from './context/socket';
import Lobby from './components/Lobby';

function App() {

  return (
    <SocketContext.Provider value={socket}>
      <h1>Card Game</h1>
      <Lobby />
    </SocketContext.Provider>
  );
}

export default App;
