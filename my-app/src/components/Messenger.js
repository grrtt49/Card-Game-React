import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext, socket} from '../context/socket';
import { FaPaperPlane } from 'react-icons/fa';
import Message from './Message';


export default function Messenger(props) {

    const socket = useContext(SocketContext);

    const [messageInputText, setMessageInputText] = useState('');
	const [messages, setMessages] = useState([]);

    const handleNewMessage = (message) => {
        console.log("Got new message: ", message);
        setMessages(current => [...current, message]);
    };

    const handleSendMessage = (event) => {
        console.log("Sending message: ", messageInputText);
        event.preventDefault();
        setMessageInputText("");
        socket.emit("send message", messageInputText);
    };

    const handleChangeMessageInput = (event) => {
        setMessageInputText(event.target.value);
    };

    const getMessageFromObj = (message, index) => {
        return (
            <Message 
                isOther={!message.fromSelf} 
                text={message.text}
                from={message.from} 
                key={index} />
        );
    };

    useEffect(() => {
		socket.on('new message', handleNewMessage);

		return () => {
			socket.off("new message", handleNewMessage);
		};
	}, [socket]);

    let messageItems = [];
    messages.forEach((message, index) => {
		messageItems.push(getMessageFromObj(message, index));
	});

    return (
        <div id='chat-container'>
			<div id='chat-log'>
                {messageItems}
            </div>
			<form id='chat-form' onSubmit={handleSendMessage}>
				<input id='chat-text' type='text' autoComplete="off" value={messageInputText} onChange={handleChangeMessageInput}/>
				<div className='send-button'>
                    <FaPaperPlane />
                </div>
			</form>
		</div>
    );

}