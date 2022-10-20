import './App.css';
import {SocketContext, socket} from './context/socket';
import Lobby from './components/Lobby';
import Messenger from './components/Messenger';

function App() {

  return (
    <SocketContext.Provider value={socket}>
      <h1>Card Game</h1>
      <div>
        <Lobby />
        <Messenger />
      </div>
    </SocketContext.Provider>
  );
}

export default App;
