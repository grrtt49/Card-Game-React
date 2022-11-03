import Box from '@mui/material/Box';

export default function Message(props) {

    return (
        <Box className={'chat-message from-' + (props.isOther ? "other" : "self")}>
            <Box className='message-label'>
                {props.from}
            </Box>
            <Box 
                sx={{
                    backgroundColor: (props.isOther ? '#616161' : 'primary.main'),
                    color: 'primary.contrastText',
                }} 
                className='message'
            >
                {props.text}
            </Box>
        </Box>
    );
}