import React, {useState, useContext, useCallback, useEffect, useRef} from 'react';
import {SocketContext, socket} from '../context/socket';
import { FaPaperPlane } from 'react-icons/fa';
import Message from './Message';
import { Scrollbars } from 'react-custom-scrollbars-2';

export default function Messenger(props) {

    const socket = useContext(SocketContext);

    const scrollbarRef = useRef();

    const [messageInputText, setMessageInputText] = useState('');
	const [messages, setMessages] = useState([]);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

    const changeShouldScrollToBottom = useCallback((val) => {
        setShouldScrollToBottom(val);
    }, []);

    const handleNewMessage = (message) => {
        console.log("Got new message: ", message);
        setMessages(current => [...current, message]);
        setShouldScrollToBottom(true);
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

        console.log("Checking... ", shouldScrollToBottom);
        if(shouldScrollToBottom) {
            scrollbarRef.current.scrollToBottom();
            setShouldScrollToBottom(false);
        }

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
			<Scrollbars style={{ width: "100%", height: 300 }} ref={scrollbarRef}>
                {messageItems}
            </Scrollbars>
			<form id='chat-form' onSubmit={handleSendMessage}>
				<input id='chat-text' type='text' autoComplete="off" value={messageInputText} onChange={handleChangeMessageInput}/>
				<div className='send-button'>
                    <FaPaperPlane />
                </div>
			</form>
		</div>
    );

}