import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import JoinableGame from './JoinableRequest';
import Button from '@mui/material/Button';
import { Stack } from '@mui/material';

export default function JoinableRequests (props) {
    const socket = useContext(SocketContext);

    const [requests, setRequests] = useState([]);

    const handleAvailableRequests = useCallback((games) => {
        console.log("Available games: ", games);
        setRequests(games);
    }, []);

    useEffect(() => {
        //send request
        socket.emit("get available requests", handleAvailableRequests);
    
        //unsubscribe to socket events 
        return () => {
            
        };
    }, [socket]);

    var requestHTML = requests.map((request) => {
        return (
            < JoinableGame nickname={request.creator.nickname} numPlayers={request.num_players} key={request.id} requestId={request.id} goToWaiting={props.goToWaiting} />
        );
    });

    return (
        <div id='join-game-display'>
            <div id='available-games-container'>
                {requestHTML}
            </div>
            <Stack alignItems="center">
                <Button variant="contained" sx={{width: 150}} onClick={props.backToStart}>Back</Button>
            </Stack>
        </div>
    );
}