import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import {ThemeProvider} from '@mui/material';
import TextField from '@mui/material/TextField';
import {createTheme} from '@mui/material/styles';
import {Box, Button} from '@chakra-ui/react';
import axios from 'axios';
import LogInComp from './LogInComp';
import PasswordInput from './PasswordInput';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import {useEffect} from 'react';
import {countries} from "./countries_codes";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const theme = createTheme({
    palette: {
        primary: {
            main: '#3f51b5',
        },
        custom: {
            primaryGrayDark: '#YourColorValueHere',
        },
    },
});

export default function RegistrationDialog(props) {
    const [open, setOpen] = React.useState(false);
    const [openAlert1, setOpenAlert1] = React.useState(false);
    const [loginRegist, setLoginRegist] = React.useState('');
    const [passRegist1, setPassRegist1] = React.useState(null);
    const [passRegist2, setPassRegist2] = React.useState(null);
    const [nameRegist, setNameRegist] = React.useState('');
    const [isEmailValid, setEmailValid] = React.useState(true);
    const [selectedCountryCode, setSelectedCountryCode] = React.useState('ISR');

    const [errorMessages, setErrorMessages] = React.useState({
        errorMessageLogin: '',
        errorMessagePassMatch: '',
        errorMessageMailExist: '',
        errorMessageName: '',
        errorMessageRegist: '',
    });

    const setErrorMessage = (errorType, errorMessage) => {
        setErrorMessages((prevState) => ({
            ...prevState,
            [errorType]: errorMessage,
        }));
    };

    useEffect(() => {
    }, [errorMessages.errorMessageMailExist]);

    useEffect(() => {
        if (errorMessages.errorMessagePassMatch === '') {
        }
    }, [errorMessages.errorMessagePassMatch]);

    const handleChangeName = (event) => {
        if (event.target.value !== undefined) {
            setNameRegist(event.target.value);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (isSuccess) => {
        setLoginRegist('');
        setPassRegist1(null);
        setPassRegist2(null);
        setNameRegist('');
        setErrorMessages({
            errorMessageLogin: '',
            errorMessagePassMatch: '',
            errorMessageMailExist: '',
            errorMessageName: '',
            errorMessageRegist: '',
        });
        setOpen(false);
        props.onClose(nameRegist, isSuccess);
    };

    const doRegistration = (e) => {
        const url = "/signUp";
        const data = {
            username: loginRegist,
            password: passRegist2,
            country_code: selectedCountryCode, // Include the selected country code
        };
        axios.post(url, data)
            .then((res) => {
                console.log("Registered successfully ")
            })
            .catch((err) => {
                console.error(err);
                setErrorMessage('errorMessageRegist', 'There was some problem');
            });
    };

    const checkIfExist = async (loginUser) => {
        const url = `/server_user/${loginUser}`;
        try {
            const response = await axios.get(url);
            console.log("Received specific user:", response.data);
            if (loginUser === response.data.login) {
                setErrorMessage('errorMessageMailExist', 'This mail already exists');
                return true;
            } else {
                console.log("valid")
            }
        } catch (error) {
            console.error("Error fetching specific user:", error);
            setErrorMessage('errorMessageMailExist', '');
            return false;
        }
    };

    const checkIfTheSamePass = (firtsPass, secondPass) => {
        if (firtsPass === null || secondPass === null || firtsPass === '' || secondPass === '') {
            setErrorMessage('errorMessagePassMatch', "Invalid Passwords");
            return {sameVal: false, valueEmpt: true};
        }
        if (firtsPass === secondPass) {
            return {sameVal: true, valueEmpt: false};
        }
        setErrorMessage('errorMessagePassMatch', "Invalid Passwords");
        return {sameVal: false, valueEmpt: false};
    };

    const handleRegistration = async () => {
        if (nameRegist !== '') {
            setErrorMessage('errorMessageName', '');
        } else {
            setErrorMessage('errorMessageName', 'You did not pass your Name.');
            return;
        }

        if (loginRegist !== '') {
            // Check if the entered value is a valid email
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            if (!emailRegex.test(loginRegist)) {
                setErrorMessage('errorMessageLogin', 'Please enter a valid email address.');
                setEmailValid(false);
                return;
            } else {
                setEmailValid(true);
                setErrorMessage('errorMessageLogin', '');
            }
        } else {
            setErrorMessage('errorMessageLogin', 'You did not pass your Login.');
            return;
        }

        setErrorMessage('errorMessagePassMatch', '');
        console.log(errorMessages.errorMessagePassMatch);

        let result = checkIfTheSamePass(passRegist1, passRegist2);
        if (result.sameVal) {
            console.log("Updated errorMessageMailExist:", errorMessages.errorMessageMailExist);
            if (
                errorMessages.errorMessageRegist === '' &&
                errorMessages.errorMessageLogin === '' &&
                !result.valueEmpt &&
                errorMessages.errorMessageName === '' &&
                !(await checkIfExist(loginRegist))
            ) {
                await doRegistration();
                handleClose(true);
            }
        } else {
            handleClickAlert1();
        }
    };

    const handleClickAlert1 = () => {
        setOpenAlert1(true);
    };

    const handleCloseAlert1 = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert1(false);
    };

    const handleCountryChange = (event) => {
        setSelectedCountryCode(event.target.value);
    };


    return (
        <ThemeProvider theme={theme}>
            <div>
                <div>
                <Box>
                <Button sx={{backgroundColor:"#404040",color:"white"}} variant="outlined" onClick={handleClickOpen}>
                    Didn't registered, yet?
                </Button>
                </Box>
                    </div>
                <Dialog
                    fullScreen
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Transition}
                >
                    <AppBar sx={{position: 'relative'}}>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleClose}
                                aria-label="close"
                            >
                                <CloseIcon/>
                            </IconButton>
                            <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                                Registration
                            </Typography>
                            <Button
                                autoFocus
                                color="inherit"
                                onClick={handleRegistration}
                            >
                                Save
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <List>
                        <ListItem>
                            <TextField id="name" label="Your Name" variant="outlined" onChange={handleChangeName}/>
                        </ListItem>
                        <Divider/>
                        <ListItem>
                            <LogInComp login={loginRegist} onChange={setLoginRegist}/>
                        </ListItem>
                        <Divider/>
                        <ListItem>
                            <PasswordInput password={passRegist1} setPass={setPassRegist1}/>
                        </ListItem>
                        <Divider/>
                        <ListItem>
                            <PasswordInput password={passRegist2} setPass={setPassRegist2}/>
                        </ListItem>
                        <Divider/>
                        <ListItem>
                            <TextField
                                select
                                required
                                fullWidth
                                id="countryCode"
                                label="Country"
                                name="countryCode"
                                value={selectedCountryCode}
                                onChange={handleCountryChange}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                {countries.map((country) => (
                                    <option key={country.name} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </TextField>

                        </ListItem>
                        <Divider/>
                        <ListItem>
                            <Box color="red">{errorMessages.errorMessageName}</Box>
                        </ListItem>
                        <ListItem>
                            <Box color="red">{errorMessages.errorMessageLogin}</Box>
                            {!isEmailValid && <Box color="red">Please enter a valid email address.</Box>}
                        </ListItem>
                        <ListItem>
                            <Box color="red">{errorMessages.errorMessagePassMatch}</Box>
                        </ListItem>
                        <ListItem>
                            <Box color="red">{errorMessages.errorMessageMailExist}</Box>
                        </ListItem>
                    </List>
                    <Snackbar open={openAlert1} autoHideDuration={6000} onClose={handleCloseAlert1}>
                        <Alert severity="warning">
                            <AlertTitle>Warning</AlertTitle>
                            Invalid Password or it didn't match— <strong>check it out!</strong>
                        </Alert>
                    </Snackbar>
                </Dialog>
            </div>
        </ThemeProvider>

    );
}
