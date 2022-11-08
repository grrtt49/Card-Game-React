import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../../context/socket';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

export default function JoinableRequest (props) {
    const socket = useContext(SocketContext);

    const joinGame = (id) => {
        socket.emit("join request", id, props.user);
        props.goToWaiting();
    } 

    return (
        <Paper 
            sx={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "7px",
                margin: "10px",
            }} 
        >
            {props.nickname}
            <p>{props.numPlayers} / {props.maxPlayers} Players</p>
            <Button  sx={{width: "100%"}} variant="contained" onClick={() => joinGame(props.requestID)}>Join</Button>
        </Paper>
    );
}