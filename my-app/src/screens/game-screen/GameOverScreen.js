import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CancelIcon from '@mui/icons-material/Cancel';
import Confetti from 'react-dom-confetti';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
}));

export default function GameOverScreen(props) {
    const { onClose, gameData, isOpen, onBackToHome } = props;

    let playerData = []; 

    if(gameData.players != undefined) { 
        gameData.players.sort((a, b) => {
            if(a.numCards < b.numCards) return -1;
            if(a.numCards > b.numCards) return 1;
            return 0;
        });

        gameData.players.forEach((player, index) => {
            playerData.push(
                <Stack 
                    key={index} 
                    direction="row" 
                    justifyContent="space-around" 
                    alignItems="center" 
                    spacing={4}
                >
                    {
                        index == 0 ? 
                            <EmojiEventsIcon />
                        :
                            index < 3 && gameData.players.length > 4 ?
                                <WorkspacePremiumIcon />
                            :
                                <CancelIcon />
                    }
                    <Chip label={player.name} />
                    <Box>
                        {player.numCards}
                    </Box>
                </Stack>
            );
        });
    }

    return (
        <BootstrapDialog
            onClose={onClose}
            aria-labelledby="customized-dialog-title"
            open={isOpen}
            sx={{
                zIndex: 20000,
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                {gameData.won ? "You Win!" : "Game Over"}
                {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                ) : null}
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} divider={<Divider orientation="horizontal" flexItem />}>
                    {playerData}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant="contained" autoFocus onClick={onBackToHome}>
                    Back to Home
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
}

GameOverScreen.propTypes = {
    isOpen: PropTypes.bool, 
    gameData: PropTypes.object, 
    onClose: PropTypes.func, 
    onBackToHome: PropTypes.func,
};