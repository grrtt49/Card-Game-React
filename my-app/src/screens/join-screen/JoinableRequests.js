import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../../context/socket';
import JoinableGame from './JoinableRequest';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Stack } from '@mui/material';

export default function JoinableRequests (props) {
    const socket = useContext(SocketContext);

    const [requests, setRequests] = useState([]);

    const handleAvailableRequests = useCallback((games) => {
        console.log("Available games: ", games);
        setRequests(games);
    }, []);

    const handleNewRequest = () => {
        socket.emit("get available requests", handleAvailableRequests);
    }

    useEffect(() => {
        //send request
        socket.emit("get available requests", handleAvailableRequests);

        //subscribe to events
        socket.on('new available request', handleNewRequest);
        socket.on('remove available request', handleNewRequest);
    
        //unsubscribe to socket events 
        return () => {
            socket.off('new available request', handleNewRequest);
            socket.off('remove available request', handleNewRequest);
        };
    }, [socket]);

    var requestHTML = requests.map((request) => {
        return (
            < JoinableGame user={props.user} nickname={request.creator.nickname} numPlayers={request.players.length} key={request.id} requestId={request.id} goToWaiting={props.goToWaiting} maxPlayers={10} />
        );
    });

    return (
        <Stack spacing={3}>
            <Stack direction="row" justifyContent="center">
                {requestHTML}
                {requestHTML.length == 0 ? 
                    <Stack direction="column" alignItems="center" spacing={3}>
                        <CircularProgress thickness={4} size={70} />
                        <Box>No current games. Please create one or wait for one to appear here.</Box> 
                    </Stack>
                : ""}
            </Stack>
            <Stack alignItems="center">
                <Button variant="contained" sx={{width: 150}} onClick={props.backToStart}>Back</Button>
            </Stack>
        </Stack>
    );
}