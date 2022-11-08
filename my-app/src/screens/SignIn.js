import { Button, Stack, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/socket";
import { useSnackbar } from 'notistack';
import { Link, useNavigate } from "react-router-dom";

export default function SignIn (props) {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [nicknameError, setNicknameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const socket = useContext(SocketContext);

    const handleNickname = (event) => {
        setNickname(event.target.value);
    };

    const handlePassword = (event) => {
        setPassword(event.target.value);
    };

    const handleSignIn = (e) => {
        e.preventDefault();
        console.log("Emiting sign in: ", nickname, password);
        socket.emit('sign in', nickname, password);
    }; 

    const handleSignedIn = (user) => {
        if(user === false) {
            enqueueSnackbar("Nickname or password is incorrect", { preventDuplicate: true, variant: "error" });
        }
        else {
            enqueueSnackbar("Signed in! Welcome, " + user.nickname + "!", { preventDuplicate: true, variant: "success" });
            if(window != undefined) {
                window.localStorage.setItem("user", JSON.stringify(user));
            }
            else {
                console.log("window error");
            }
            navigate("/");
        }
    }

    useEffect(() => {
        socket.on('signed in', handleSignedIn);
    }, [socket]);

    return (
        <form
            onSubmit={(e) => handleSignIn(e)}
        >
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
                    autoComplete="current-password"
                />
                <Button 
                    variant="contained"  
                    sx={{width: 150}} 
                    disabled={nickname == "" || password == ""}
                    type="submit"
                >
                    Sign In
                </Button>
                <Stack alignItems="center">
                    <Typography
                        textAlign="center"
                    >
                        Don't have an account yet?
                    </Typography>
                    <Link
                        to="/sign-up"
                        style={{ textDecoration: "none"}}
                    >
                        <Button 
                            // variant="contained"  
                            color="secondary"
                            sx={{width: 150}} 
                        >
                            Sign Up
                        </Button>
                    </Link>
                </Stack>
            </Stack>
        </form>
    );
}