import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import JoinableGames from './JoinableRequests';
import Waiting from './Waiting';
import Game from './Game';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MuiAlert from '@mui/material/Alert';
import { SnackbarProvider, useSnackbar } from 'notistack';

export default function Lobby (props) {
    const socket = useContext(SocketContext);
    const { enqueueSnackbar } = useSnackbar();

    const [pageStatus, setPageStatus] = useState('start');
    const [nickname, setNickname] = useState('');
    const [isCreator, setIsCreator] = useState(false);

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
        setIsCreator(true);
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

    const handlePlayerError = (msg) => {
        console.log("Player error: ", msg);
        enqueueSnackbar(msg, {variant: "error"});
	};

    const handlePlayerInfoMessage = (msg) => {
        console.log("Player info: ", msg);
        enqueueSnackbar(msg, {variant: "info", autoHideDuration: 1000});
    }

    const handleJoinedRequest = () => {
        setIsCreator(false);
        setWaitingScreen();
    }

    useEffect(() => {
        socket.on('player error', handlePlayerError);

        return () => {
            socket.off("player error", handlePlayerError);
        };
    }, [socket, isCreator]);

    let page = null;
    if(pageStatus == 'start') {
        page = (
            <Stack direction="column" spacing={3}>
                <Stack direction="row" justifyContent="center">
                    <TextField id="outlined-basic" color="white" label="Nickname (required)" variant="outlined" onChange={(event) => handleNickname(event)} value={nickname} />
                </Stack>
                <Stack spacing={2} direction="row" justifyContent="center">
                    <Button variant="contained"  sx={{width: 150}} onClick={() => handleCreateRequest()}>Create Game</Button>
                    <Button variant="contained"  sx={{width: 150}} onClick={() => handleJoinRequest()}>Join Game</Button>
                </Stack>
            </Stack>
        );
    }
    else if(pageStatus == 'join') {
        page = (
            <JoinableGames backToStart={setStartScreen} goToWaiting={handleJoinedRequest} />
        );
    }
    else if(pageStatus == 'waiting') {
        page = (
            <Waiting backToStart={setStartScreen} handleStartGame={handleStartGame} isCreator={isCreator}/>
        );
    }
    else {
        page = (
            <Game handlePlayerInfoMessage={handlePlayerInfoMessage} backToHome={setStartScreen} colorblindMode={props.colorblindMode} />
        );
    }
    
    return (
        <div>
            {page}
        </div>
    );
}