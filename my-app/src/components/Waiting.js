import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import JoinableGame from './JoinableRequest';

export default function Waiting (props) {
    const socket = useContext(SocketContext);

    const [players, setPlayers] = useState([]);

    const handleJoinedPlayers = useCallback((request) => {
        let joinedPlayers = request.players;
        console.log("Joined players: ", joinedPlayers);
        setPlayers(joinedPlayers);
    }, []);

    const creatorStartGame = () => {
        socket.emit('start game');
    };

    const backToLobby = () => {
        socket.emit('remove current request');
        props.backToStart();
    };

    const handleRequestCancelled = () => {
        //TODO: Show cancelled message
        props.backToStart();
    };

    const handleGameStarted = (game) => {
        props.handleStartGame(game);
    };

    useEffect(() => {
        //get updated
        socket.emit("get current request");

        //subscribe to socket events
        socket.on("updated request", handleJoinedPlayers);
        socket.on("creator cancelled request", handleRequestCancelled);
        socket.on("game started", handleGameStarted);
    
        //unsubscribe to socket events 
        return () => {
            socket.off("updated request", handleJoinedPlayers);
            socket.off("creator cancelled request", handleRequestCancelled);
            socket.off("game started", handleGameStarted);
        };
    }, [socket]);

    var joinedPlayers = players.map((player) => {
        return (
            <div key={player.id} >{player.nickname}</div>
        );
    });

    //onClick='creatorStartGame();'
    //backToLobbyButtons(); removeCurrentRequest();

    return (
        <div id='create-game-display'>
            <div className='loading-circle'></div>
            <p className='txt-center'>Finding opponents...</p>
            <div className='joined-players'>
                {joinedPlayers}
            </div>
            <div className='button marg-20' onClick={() => creatorStartGame()}>Start</div>
            <div className='button marg-20' onClick={() => backToLobby()}>Cancel</div>
        </div>
    );
}