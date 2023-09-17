import React, { useState, useEffect, useRef } from 'react';
import PasswordInput from './PasswordInput';
import {ChakraProvider, Stack, Center, Box, Button} from "@chakra-ui/react";
import { extendTheme } from '@chakra-ui/react'
import LogInComp from "./LogInComp";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import RegistrationDialog from './RegistrationDialog';
import { useContext } from 'react';
import { AuthContext } from '../../../../AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoogleLoginv2 from "./GoogleLoginv2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';


function LogInPage() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPass] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openAlert, setOpenAlert] = useState(false);
  const [nameToWelcome, setNameToWelcome] = useState("");
  const [isSuccess, setSuccess] = useState(false);
  const { setIsAuthenticated } = useContext(AuthContext);
  const isInitialRender = useRef(true);
  const [isLoginFocused, setIsTextFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [UserImage, setUserImage] = useState("");

  const showToastMessage = (isSuccess) => {
    if(isSuccess){
      toast.success('Success Notification!', {
        position: toast.POSITION.BOTTOM_LEFT
      });
    }else{
      toast.error('Something went wrong...', {
        position: toast.POSITION.BOTTOM_LEFT
      });
    }

  };


  const handleOpenAlert = () => {
    setOpenAlert(true);
  };
  const handleCloseDialog = (nameRegist, isSuccessToMelcome) => {
    setNameToWelcome(nameRegist);
    handleOpenAlert();
    showToastMessage(isSuccessToMelcome);
  };

  const doLogin = (e) => {
    const url = "http://127.0.0.1:5000/Login"
    const data = {
      user: login,
      pass: password
    }
    axios.post(url, data,{ withCredentials: true})
      .then((res) => {
        setOpenAlert(true);
        setIsAuthenticated(true);
        navigate('/');
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Invalid login or password");
      });
  }
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    } else {
      // Call showToastMessage here
      showToastMessage(isSuccess);
    }
  }, [isSuccess]);

const handleTextFocus = () => {
    setIsTextFocused(true);
  };
  const handleTextBlur = () => {
    setIsTextFocused(false);
  };
  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
  };
  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
  };

      const handleForgotButton = () => {
          navigate('/reset')
    }

  return (
    <div id='loginColor'>
    <ChakraProvider>
      <Center h='600px' color='black' style={{ display: 'flex', justifyContent: 'center' }}>
      <Center style={{ display: 'flex', justifyContent: 'center'}}>

      <div className="pandaPanda">
      <div className={`handlPanda ${isLoginFocused ? 'loginFocused' : ''} ${isPasswordFocused ? 'passwordFocusedHandl' : ''}`}></div>
      <div className={`handrPanda ${isLoginFocused ? 'loginFocused' : ''} ${isPasswordFocused ? 'passwordFocusedHandr' : ''}`}></div>
			<div className="earlPanda"></div>
			<div className="earrPanda"></div>
			<div className="facePanda" >
				<div className="blshlPanda"></div>
				<div className="blshrPanda"></div>
				<div className="eyelPanda">
        <div className={`eyeball1Panda ${isLoginFocused ? 'loginFocusedEyeball1Panda' : ''} ${isPasswordFocused ? 'passwordFocused' : ''}`}></div>
				</div>
				<div className="eyerPanda">
        <div className={`eyeball2Panda ${isLoginFocused ? 'loginFocusedEyeball2Panda' : ''} ${isPasswordFocused ? 'passwordFocused' : ''}`}></div>
				</div>
				<div className="nosePanda">
					<div className="linePanda"></div>
				</div>
				<div className="mouthPanda">
					<div className="mPanda">
						<div className="m1"></div>
					</div>
					<div className="mmPanda">
						<div className="m1Panda"></div>
					</div>
				</div>
			</div>
      <Box bg='white'h='250px' w='100%' p={4} color='black'>
      <Box h='35px'></Box>
      <Stack spacing={3} left="100px">
      <LogInComp login={login}
        onChange={setLogin}
        onFocus={handleTextFocus}
        onBlur={handleTextBlur}
        isFocused={isLoginFocused}
        />
      <PasswordInput password={password}
        setPass={setPass}
        isFocused={isPasswordFocused}
        onFocus={handlePasswordFocus}
        onBlur={handlePasswordBlur}
        />
      <Center>
            <Box as='button' borderRadius='md' bg='tomato' color='white' onClick={doLogin} px={2} h={6} w={20}>
              Sign in
            </Box>
            <Center>
              <Box color="red">{errorMessage}
              <GoogleLoginv2 setUserImage={setUserImage}/></Box>
            </Center>
          </Center>
          <Center>
                      <Box>
                      <Button variant="outlined" onClick={handleForgotButton}>
                    Forgot password?
          </Button>
        </Box>
          </Center>

          <Center>
            <RegistrationDialog onClose={handleCloseDialog} setSuccess={setSuccess}/>
            <ToastContainer />
          </Center>
          </Stack>
        </Box>
		</div>

   </Center>
    <div className={`pawlPanda ${isLoginFocused ? 'loginFocused' : ''} ${isPasswordFocused ? 'passwordFocusedPawl' : ''}`}>
		    <div className="p1Panda">
				<div className="p2Panda"></div>
				<div className="p3Panda"></div>
				<div className="p4Panda"></div>
			</div>
		</div>
	<div className={`pawrPanda ${isLoginFocused ? 'loginFocused' : ''} ${isPasswordFocused ? 'passwordFocusedPawr' : ''}`}>
		<div className="p1Panda">
			<div className="p2Panda"></div>
			<div className="p3Panda"></div>
			<div className="p4Panda"></div>
		</div>
    <div className="backgPanda">
	</div>
	</div>
      </Center>
    </ChakraProvider>

    </div>
  );
}

export default LogInPage;
