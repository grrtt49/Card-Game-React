import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Settings from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { DialogActions, FormControlLabel, Stack, Switch } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { PieChart } from 'react-minimal-pie-chart';
import {SocketContext} from '../context/socket';

export default function PrimaryAppBar(props) {
  const [isSettingsOpen, setSettingsOpen] = React.useState(false);
  const [isAccountOpen, setAccountOpen] = React.useState(false);

  const socket = React.useContext(SocketContext);
  const navigate = useNavigate();

  const handleAccountOpen = () => {
    setAccountOpen(true);
  };

  const handleCloseAccount = () => {
    setAccountOpen(false);
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  const handleSignIn = () => {
    navigate("/sign-in");
    handleCloseAccount();
  };

  const handleSignUp = () => {
    navigate("/sign-up");
    handleCloseAccount();
  };

  const handleSignOut = () => {
    window.localStorage.setItem("user", null);
    navigate("/sign-in");
    handleCloseAccount();
  };

  const handleQuit = () => {
    socket.emit('quit game', props.user);
    props.setPageStatus('start');
    handleCloseSettings();
  };

  const loggedOutInfo = (
    <Stack
      alignItems="center"
      spacing={2}
    >
      <Typography>
        You are currently logged out.
      </Typography>
      <Button variant="contained" onClick={handleSignIn}>Log in</Button>
      <Button variant="contained" onClick={handleSignUp}>Sign up</Button>
    </Stack>
  );

  const userStats = (
    <Box>
      <PieChart
        data={[
          { title: 'Wins', value: props.user ? props.user.wins : 0, color: '#65ea5f' },
          { title: 'Losses', value: props.user ? props.user.losses : 0, color: '#ea5f5f' },
        ]}
        label={({ dataEntry }) => dataEntry.title}
        labelStyle={{
          fontSize: 12,
          fontWeight: "bold",
          color: "#ffffff",
        }}
        style={{ height: '150px' }}
        animate={true}
      />
      <Box>
        <Typography>
          Wins: {props.user ? props.user.wins : 0}
        </Typography>
        <Typography>
          Losses: {props.user ? props.user.losses : 0}
        </Typography>
      </Box>
    </Box>
  );

  const loggedInInfo = (
    <Stack
      alignItems="center"
      spacing={2}
    >
      <Typography>
        Welcome {props.user ? props.user.nickname : ""}!
      </Typography>
      
      {props.user && (props.user.wins || props.user.losses) ? userStats : "As you play games, your stats will appear here!"}
      
      <Button variant="contained" onClick={handleSignOut}>Log out</Button>
    </Stack>
  );

  let settingsActions = "";
  console.log("PAge status: ", props.pageStatus);
  if(props.pageStatus == "game") {
    settingsActions = (
        <DialogActions>
          <Button color="error" variant="contained" onClick={handleQuit}>Quit Game</Button>
        </DialogActions>
    );
  }

  const menuId = 'primary-search-settings-menu';
  const accountId = 'primary-search-account-menu';

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Onu
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'flex'} }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="settings"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleSettingsOpen}
              color="inherit"
            >
              <Settings />
            </IconButton>
            <Box sx={{ marginLeft: 2 }} />
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={accountId}
              aria-haspopup="true"
              onClick={handleAccountOpen}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Dialog open={isSettingsOpen} onClose={handleCloseSettings}>
        <DialogTitle>
          Settings
          <IconButton
            aria-label="close"
            onClick={handleCloseSettings}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>    
        </DialogTitle>
        <DialogContent>
          <FormControlLabel control={<Switch onChange={() => props.setColorblindMode(!props.colorblindMode)} checked={props.colorblindMode} />} label="Colorblind Mode" />
        </DialogContent>
        {settingsActions}
      </Dialog>
      <Dialog open={isAccountOpen} onClose={handleCloseAccount}>
        <DialogTitle>
          Account
          <IconButton
            aria-label="close"
            onClick={handleCloseAccount}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>  
        </DialogTitle>
        <DialogContent>
          {props.user ? loggedInInfo : loggedOutInfo}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
