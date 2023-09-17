import { useState } from "react";
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/joy/Stack';
import { useNavigate } from 'react-router-dom';

const FORM_ENDPOINT = "/forgotpassword";

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState(""); // State variable to store the user's email
     const navigate = useNavigate();
  const handleSubmit = () => {
    // Create a data object with the user's email
    const data = { email };

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setSubmitted(true);
        navigate('/verifyToken')
      })
      .catch((error) => {
        console.error("Error sending the request:", error);
      });
  };

  if (submitted) {
    return (
      <div>
        <div className="text-2xl">Thank you!</div>
        <div className="text-md">Please check your email for a reset password link, if not found check your spam.</div>
      </div>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Stack spacing={2}>
        <div className="mb-3 pt-0">
          <TextField
            sx={{
              width: 400,
            }}
            id="outlined-multiline-flexible"
            label="Your Email"
            multiline
            maxRows={4}
            value={email}
            style={{ marginTop: '20px' }}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3 pt-0">
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            style={{ marginBottom: '10px' }}
            onClick={handleSubmit}
          >
            Reset
          </Button>
        </div>
      </Stack>
    </Box>
  );
};

export default ForgotPassword;