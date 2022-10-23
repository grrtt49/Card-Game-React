import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

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
            <Chip key={player.id} label={player.nickname} />
        );
    });

    //TODO: disable start for non-creators with tooltip

    return (
        <Stack direction="column" spacing={3} alignItems="center">
            <CircularProgress />
            <p className='txt-center'>Finding opponents...</p>
            <Stack spacing={3}>
                {joinedPlayers}
            </Stack>
            <Button variant="contained" sx={{width: 150}} onClick={() => creatorStartGame()} disabled={!props.isCreator}>Start</Button>
            <Button variant="contained" sx={{width: 150}} onClick={() => backToLobby()}>Cancel</Button>
        </Stack>
    );
}