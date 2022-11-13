import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../../context/socket';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import { useSnackbar } from 'notistack';

export default function Waiting (props) {
    const socket = useContext(SocketContext);

    const [players, setPlayers] = useState([]);
    const [isCreator, setCreator] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const handleJoinedPlayers = useCallback((request) => {
        console.log("Players: ", request);
        let joinedPlayers = request.players;
        setPlayers(joinedPlayers);
        setCreator(request.isCreator);
        if(request.isError) {
            enqueueSnackbar("The request you were in was cancelled.", {variant: "error"});
            props.backToStart();
        }
    }, []);

    const creatorStartGame = () => {
        socket.emit('start game', props.user);
    };

    const backToLobby = () => {
        socket.emit('remove current request', props.user);
        props.backToStart();
    };

    const handleRequestCancelled = () => {
        props.backToStart();
    };

    const handleGameStarted = (game) => {
        props.handleStartGame(game);
    };

    const handleNewPlayer = () => {
        console.log("Need to get current request");
        socket.emit("get current request", props.user);
    };

    useEffect(() => {
        //subscribe to socket events
        socket.on("updated request", handleJoinedPlayers);
        socket.on("creator cancelled request", handleRequestCancelled);
        socket.on("game started", handleGameStarted);
        socket.on("need to get request", handleNewPlayer);
    
        //unsubscribe to socket events 
        return () => {
            socket.off("updated request", handleJoinedPlayers);
            socket.off("creator cancelled request", handleRequestCancelled);
            socket.off("game started", handleGameStarted);
            socket.off("need to get request", handleNewPlayer);
    };
    }, [socket]);

    var joinedPlayers = players.map((player) => {
        return (
            <Chip key={player.id} label={player.nickname} />
        );
    });

    return (
        <Stack direction="column" spacing={3} alignItems="center">
            <CircularProgress />
            <p className='txt-center'>Finding opponents...</p>
            <Stack spacing={3}>
                {joinedPlayers}
            </Stack>
            <Button variant="contained" sx={{width: 150}} onClick={() => creatorStartGame()} disabled={!isCreator}>Start</Button>
            <Button variant="contained" sx={{width: 150}} onClick={() => backToLobby()}>Cancel</Button>
        </Stack>
    );
}