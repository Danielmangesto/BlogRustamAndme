import { useState } from "react";
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/joy/Stack';
import { useNavigate } from 'react-router-dom';

const FORM_ENDPOINT = "/verify";

const ResetVerification = () => {
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const handleSubmit = () => {
    // Create a data object with the user's email
    const data = { token };

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
      .then((response) => response.json())
      .then((result) => {
        setSubmitted(true);
        navigate('/pwdReset')
      })
      .catch((error) => {
        console.error("Error sending the request:", error);
      });
  };


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
            label="Your reset token"
            multiline
            maxRows={4}
            value={token}
            style={{ marginTop: '20px' }}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <div className="mb-3 pt-0">
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            style={{ marginBottom: '10px' }}
            onClick={handleSubmit}
          >
            Send Token
          </Button>
        </div>
      </Stack>
    </Box>
  );
};

export default ResetVerification;