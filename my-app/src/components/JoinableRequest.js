import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export default function JoinableRequest (props) {
    const socket = useContext(SocketContext);

    const joinGame = (id) => {
        socket.emit("join request", id);
        props.goToWaiting();
    } 

    return (
        <Box className='game-request-container'>
            {props.nickname}
            <p>{props.numPlayers} / 4 Players</p>
            <Button  sx={{width: "100%"}} variant="contained" onClick={() => joinGame(props.requestId)}>Join</Button>
        </Box>
    );
}