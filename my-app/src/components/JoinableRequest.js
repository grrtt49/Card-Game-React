import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';

export default function JoinableRequest (props) {
    const socket = useContext(SocketContext);

    const joinGame = (id) => {
        socket.emit("join request", id);
        props.goToWaiting();
    } 

    return (
        <div className='game-request-container'>
            {props.nickname}
            <p>{props.numPlayers} / 4 Players</p>
            <div className='join-game-button' onClick={() => joinGame(props.requestId)}>Join</div>
        </div>
    );
}