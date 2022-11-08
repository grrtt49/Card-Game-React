import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import JoinableGames from './join-screen/JoinableRequests';
import Waiting from './create-screen/Waiting';
import Game from './game-screen/Game';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useSnackbar } from 'notistack';
import { useLocalStorage } from '../useLocalStorage';

export default function Lobby (props) {
    const socket = useContext(SocketContext);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [pageStatus, setPageStatus] = useState('start');
    const [isCreator, setIsCreator] = useState(false);
    const [user, setUser] = useLocalStorage("user", null);

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

    const createCallback = (request) => {
        if (request === false) return; //failed
        setIsCreator(true);
        setWaitingScreen();
    }

    const handleCreateRequest = () => {
        socket.emit('create request', user);
    };

    const handleJoinRequest = () => {
        setJoinScreen();
    };

    const handlePlayerError = (msg) => {
        console.log("Player error: ", msg);
        enqueueSnackbar(msg, {variant: "error"});
	};

    const handleSocketErrors = (err) => {
        console.log("Socket error: ", err);
        enqueueSnackbar("No connection", {persist: true, variant: "error", preventDuplicate: true});
    };

    const handleCloseErrors = () => {
        closeSnackbar();
        enqueueSnackbar("Connected!", {variant: "success", autoHideDuration: 2000});
    };

    const handlePlayerInfoMessage = (msg) => {
        console.log("Player info: ", msg);
        enqueueSnackbar(msg, {variant: "info", autoHideDuration: 1000});
    };

    const handleJoinedRequest = () => {
        setIsCreator(false);
        setWaitingScreen();
    };

    const handleUsers = (users) => {
        console.log(users);
    };

    useEffect(() => {
        socket.on('created request', createCallback);
        socket.on('player error', handlePlayerError);
        socket.on('connect_error', err => handleSocketErrors(err));
        socket.on('connect_failed', err => handleSocketErrors(err));
        socket.on('disconnect', err => handleSocketErrors(err));
        socket.on('connect', handleCloseErrors);
        socket.on('users', handleUsers);

        return () => {
            socket.off('created request', createCallback);
            socket.off("player error", handlePlayerError);
            socket.off('connect_error', err => handleSocketErrors(err));
            socket.off('connect_failed', err => handleSocketErrors(err));
            socket.off('disconnect', err => handleSocketErrors(err));
            socket.off('connect', handleCloseErrors);
            socket.off('users', handleUsers);
        };
    }, [socket, isCreator]);

    let page = null;
    if(pageStatus == 'start') {
        page = (
            <Stack direction="column" spacing={3}>
                <Stack spacing={2} direction="row" justifyContent="center">
                    <Button variant="contained"  sx={{width: 150}} onClick={() => handleCreateRequest()}>Create Game</Button>
                    <Button variant="contained"  sx={{width: 150}} onClick={() => handleJoinRequest()}>Join Game</Button>
                </Stack>
            </Stack>
        );
    }
    else if(pageStatus == 'join') {
        page = (
            <JoinableGames user={user} backToStart={setStartScreen} goToWaiting={handleJoinedRequest} />
        );
    }
    else if(pageStatus == 'waiting') {
        page = (
            <Waiting user={user} backToStart={setStartScreen} handleStartGame={handleStartGame} isCreator={isCreator}/>
        );
    }
    else {
        page = (
            <Game user={user} handlePlayerInfoMessage={handlePlayerInfoMessage} backToHome={setStartScreen} colorblindMode={props.colorblindMode} />
        );
    }
    
    return (
        <div>
            {page}
        </div>
    );
}