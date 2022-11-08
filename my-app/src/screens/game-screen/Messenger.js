import React, {useState, useContext, useEffect, useRef} from 'react';
import {SocketContext} from '../../context/socket';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Message from './Message';
import { Scrollbars } from 'react-custom-scrollbars-2';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import LoadingButton from '@mui/lab/LoadingButton';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';

const MessengerRoot = styled('div')(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
      width: "100%",
    },
    [theme.breakpoints.up('md')]: {
      width: "40%",
      right: "5%",
    },
    [theme.breakpoints.up('lg')]: {
      width: "30%",
      right: "5%",
    },
}));

export default function Messenger(props) {

    const socket = useContext(SocketContext);

    const scrollbarRef = useRef();

    const [showChat, setShowChat] = useState(false);
    const [messageInputText, setMessageInputText] = useState('');
	const [messages, setMessages] = useState([]);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
    const [loadingSend, setLoadingSend] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const handleNewMessage = (message) => {
        console.log("Got new message: ", message);
        if(message.fromSelf) {
            setMessageInputText("");
            setLoadingSend(false);
        }
        else {
            console.log("Not from myself! Show chat: ", showChat);
            if(!showChat) {
                console.log("This is unread now");
                incrementUnreadNotifications();
            }
        }
        setMessages(current => [...current, message]);
        setShouldScrollToBottom(true);
    };

    const handleSendMessage = (event) => {
        event.preventDefault();
        setLoadingSend(true);
        socket.emit("send message", props.user, messageInputText);
    };

    const handleChangeMessageInput = (event) => {
        setMessageInputText(event.target.value);
    };

    const toggleShowChat = () => {
        setShowChat(prev => !prev);
        setUnreadNotifications(0);
    };

    const incrementUnreadNotifications = () => {
        setUnreadNotifications(prev => prev + 1);
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

        if(shouldScrollToBottom) {
            scrollbarRef.current.scrollToBottom();
            setShouldScrollToBottom(false);
            console.log("Scolling to bottom");
        }

		return () => {
			socket.off("new message", handleNewMessage);
		};
	}, [socket, shouldScrollToBottom, unreadNotifications, showChat]);

    let messageItems = [];
    messages.forEach((message, index) => {
		messageItems.push(getMessageFromObj(message, index));
	});

    let showHideButton = (showChat ? <FaChevronDown /> : <FaChevronUp />);

    return (
        <MessengerRoot 
            sx={{
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: "rgba(40, 40, 40, 0.93)",
                zIndex: 10000,
                position: "fixed",
                bottom: 0,
                backdropFilter: "blur(5px)",
            }}
        >
            <Stack direction="row" justifyContent="space-between" >
                <Badge badgeContent={unreadNotifications} color="primary" overlap="circular">
                    <IconButton onClick={toggleShowChat}>
                        <NotificationsIcon color="action" />
                    </IconButton>
                </Badge>
                
                <IconButton onClick={toggleShowChat}>
                    {showHideButton}
                </IconButton>
            </Stack>

            <Collapse in={showChat}>
                <Stack>
                    <Scrollbars style={{ width: "100%", height: "300px" }} ref={scrollbarRef}>
                        {messageItems}
                    </Scrollbars>
                    <form id='chat-form' onSubmit={handleSendMessage}>
                        <Stack sx={{width: "100%"}} direction="row" spacing={1}>
                            <Box sx={{flexGrow: 1}}>
                                <TextField sx={{width: "100%"}} value={messageInputText} onChange={handleChangeMessageInput}/>
                            </Box>
                            <LoadingButton 
                                variant="contained" 
                                endIcon={<SendIcon />}
                                loading={loadingSend}
                                loadingPosition="end"
                                onClick={handleSendMessage}
                            >
                                Send
                            </LoadingButton>
                        </Stack>
                    </form>
                </Stack>
            </Collapse>
		</MessengerRoot>
    );

}