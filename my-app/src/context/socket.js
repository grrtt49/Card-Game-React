import React from 'react';
import socketio from "socket.io-client";

export const socket = socketio.connect("http://localhost:3001"); // development: "http://localhost:3001"
export const SocketContext = React.createContext();