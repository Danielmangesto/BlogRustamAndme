import { useState } from "react";
import { useHistory } from "react-router-dom"; // Import useHistory from react-router-dom
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/joy/Stack';
import {useNavigate} from 'react-router-dom'

const FORM_ENDPOINT = "";

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
     navigate('/')
    }, 2000);
  };

  if (submitted) {
    return (
      <div>
        <div className="text-2xl">Thank you!</div>
        <div className="text-md">We'll be in touch soon.</div>
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
              width: 400
            }}
            id="outlined-multiline-flexible"
            label="Your name"
            multiline
            maxRows={4}
            margin="normal"
          />
        </div>
        <div className="mb-3 pt-0">
          <TextField
            sx={{
              width: 400
            }}
            id="outlined-multiline-flexible"
            label="Your eMail"
            multiline
            maxRows={4}
          />
        </div>
        <div className="mb-3 pt-0">
          <TextField
            sx={{
              width: 400
            }}
            id="outlined-multiline-static"
            label="Multiline"
            multiline
            rows={4}
          />
        </div>
        <div className="mb-3 pt-0">
          <Button variant="contained" onClick={handleSubmit} endIcon={<SendIcon />} style={{ marginBottom: '10px' }}>
            Send
          </Button>
        </div>
      </Stack>
    </Box>
  );
};

export default ContactForm;
