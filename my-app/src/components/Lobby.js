import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import JoinableGames from './JoinableRequests';
import Waiting from './Waiting';
import Game from './Game';

export default function Lobby () {
    const socket = useContext(SocketContext);

    const [pageStatus, setPageStatus] = useState('start');
    const [nickname, setNickname] = useState('');

    const setWaitingScreen = useCallback(() => {
        setPageStatus('waiting');
    }, []);

    const setJoinScreen = useCallback(() => {
        setPageStatus('join');
    }, []);

    const setStartScreen = useCallback(() => {
        setPageStatus('start');
    }, []);

    const setGameScreen = useCallback(() => {
        setPageStatus('game');
    }, []);

    const handleStartGame = (game) => {
        console.log("Handling game: ", game);
        setGameScreen();
    };

    const handleNickname = (event) => {
        setNickname(event.target.value);

        console.log("nickname: ", event.target.value);
    };

    const handleCreateRequest = () => {
        socket.emit('set nickname', nickname, socketCreateRequest);
    };

    const socketCreateRequest = (success) => {
        if(!success) return; //failed
        socket.emit('create request', createCallback);
    };

    const createCallback = (request) => {
        if (request === false) return; //failed
        setWaitingScreen();
    }

    const handleJoinRequest = () => {
        socket.emit('set nickname', nickname, socketJoinRequest);
    };

    const socketJoinRequest = (success) => {
        console.log("Nickname worked? ", (success ? "true" : "false"));
        if(!success) return; //failed
        setJoinScreen();
    };

    if(pageStatus == 'start') {
        return (
            <div id='lobby-buttons'>
                <div id='nickname-container'>
                    <input id='nickname-input' type='text' placeholder='Nickname (required)' onChange={(event) => handleNickname(event)} />
                </div>
                <div className='button' onClick={() => handleCreateRequest()}>Create Game</div>
                <div className='button' onClick={() => handleJoinRequest()}>Join Game</div>
            </div>
        );
    }
    else if(pageStatus == 'join') {
        return (
            <JoinableGames backToStart={setStartScreen} goToWaiting={setWaitingScreen} />
        );
    }
    else if(pageStatus == 'waiting') {
        return (
            <Waiting backToStart={setStartScreen} handleStartGame={handleStartGame} />
        );
    }

    return (
        <Game />
    );
    

}