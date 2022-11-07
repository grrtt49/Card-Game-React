import { Button, Stack, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/socket";
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';


export default function SignUp (props) {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nicknameError, setNicknameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const { enqueueSnackbar } = useSnackbar();
    const socket = useContext(SocketContext);

    const handleNickname = (event) => {
        setNickname(event.target.value);
        setNicknameError("");
    };

    const handlePassword = (event) => {
        let val = event.target.value;
        setPassword(val);
        if(val != confirmPassword && confirmPassword != "") {
            setConfirmPasswordError("Passwords must match");
        }
        else {
            setConfirmPasswordError("");
        }
        
        if(val != "" && val.length < 8) {
            setPasswordError("Must be at least 8 characters");
        }
        else {
            setPasswordError("");
        }
    };

    const handleConfirmPassword = (event) => {
        let val = event.target.value;
        setConfirmPassword(val);
        if(val != password) {
            setConfirmPasswordError("Passwords must match");
        }
        else {
            setConfirmPasswordError("");
        }
    };

    const handleSignUp = () => {
        console.log("Emiting sign up: ", nickname, password);
        socket.emit('sign up', nickname, password);
    }; 

    const handleSignedUp = (success) => {
        console.log("Signed up: ", success);
        
    }

    const handlePlayerError = (msg) => {
        enqueueSnackbar(msg, { autoHideDuration: 3000, variant: "error" });
        if(msg == "Nickname is already taken") {
            setNicknameError("This nickname is taken");
        }
    };

    useEffect(() => {
        socket.on('signed up', handleSignedUp);
        socket.on('player error', handlePlayerError);
        
        return () => {
            socket.off('signed up', handleSignedUp);
            socket.off('player error', handlePlayerError);
        };
    }, [socket]);

    return (
        <form>
            <Stack alignItems="center" spacing={3}>
                <TextField 
                    color="white" 
                    label="Nickname" 
                    variant="outlined" 
                    onChange={(event) => handleNickname(event)} 
                    value={nickname} 
                    error={nicknameError != ""} 
                    helperText={nicknameError} 
                    autoComplete="username"
                />
                <TextField 
                    color="white" 
                    label="Password" 
                    variant="outlined" 
                    type="password" 
                    onChange={(event) => handlePassword(event)} 
                    value={password} 
                    error={passwordError != ""} 
                    helperText={passwordError} 
                    autoComplete="new-password"
                />
                <TextField 
                    color="white" 
                    label="Confirm Password" 
                    variant="outlined" 
                    type="password"
                    onChange={(event) => handleConfirmPassword(event)} 
                    value={confirmPassword} 
                    error={confirmPasswordError != ""} 
                    helperText={confirmPasswordError} 
                />
                <Button 
                    variant="contained"  
                    sx={{width: 150}} 
                    onClick={() => handleSignUp()}
                    disabled={nickname == "" || password != confirmPassword || password.length < 8}
                >
                    Sign Up
                </Button>
                <div>
                    <Typography
                        textAlign="center"
                    >
                        Already signed up?
                    </Typography>
                    <Link
                        to="/sign-in"
                        style={{ textDecoration: "none" }}
                    >
                        <Button 
                            // variant="contained"  
                            color="secondary"
                            sx={{width: 150}} 
                        >
                            Sign In
                        </Button>
                    </Link>
                </div>
            </Stack>
        </form>
    );
}