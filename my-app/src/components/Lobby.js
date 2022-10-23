import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import JoinableGames from './JoinableRequests';
import Waiting from './Waiting';
import Game from './Game';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Lobby () {
    const socket = useContext(SocketContext);

    const [pageStatus, setPageStatus] = useState('start');
    const [nickname, setNickname] = useState('');
    const [errorMessage, setErrorMessage] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
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
        setErrorMessage(msg);
	};

    const handlePlayerInfoMessage = (msg) => {
        console.log("Player info: ", msg);
        setInfoMessage(msg);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setErrorMessage("");
    };

    const handleInfoClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setInfoMessage("");
    };

    const handleJoinedRequest = () => {
        setIsCreator(false);
        setWaitingScreen();
    }

    useEffect(() => {
        socket.on('player error', handlePlayerError);

        return () => {
            socket.off("player error", handlePlayerError);
        };
    }, [socket, errorMessage, isCreator]);

    const closeErrorIcon = (
        <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
        >
            <CloseIcon fontSize="small" />
        </IconButton>
    );

    const closeInfoIcon = (
        <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleInfoClose}
        >
            <CloseIcon fontSize="small" />
        </IconButton>
    );

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
            <Game handlePlayerInfoMessage={handlePlayerInfoMessage} backToHome={setStartScreen} />
        );
    }
    
    return (
        <div>
            {page}
            <Snackbar
                open={(errorMessage != "")}
                autoHideDuration={6000}
                onClose={handleClose}
                action={closeErrorIcon}
            >
                <Alert 
                    severity="error"
                    onClose={handleClose}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Snackbar
                open={(infoMessage != "")}
                autoHideDuration={2000}
                onClose={handleInfoClose}
                action={closeInfoIcon}
            >
                <Alert 
                    severity="info"
                    onClose={handleInfoClose}
                >
                    {infoMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}