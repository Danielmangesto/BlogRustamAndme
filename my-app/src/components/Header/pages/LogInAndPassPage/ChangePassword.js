import { useState } from "react";
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/joy/Stack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FORM_ENDPOINT = "/pwdreset";

const ChangePassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
  // Check if passwords match
  if (password !== confirmPassword) {
    alert("Passwords do not match. Please try again.");
    return;
  }

  const data = { password };

  // Use Axios to make the request
  axios.post(FORM_ENDPOINT, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  })
    .then((response) => {
      setSubmitted(true);
      navigate('/');
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
            label="New Password"
            type="password"
            value={password}
            style={{ marginTop: '20px' }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-3 pt-0">
          <TextField
            sx={{
              width: 400,
            }}
            id="outlined-multiline-flexible"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            style={{ marginTop: '20px' }}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="mb-3 pt-0">
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            style={{ marginBottom: '10px' }}
            onClick={handleSubmit}
          >
            Reset Password
          </Button>
        </div>
      </Stack>
    </Box>
  );
};

export default ChangePassword;
