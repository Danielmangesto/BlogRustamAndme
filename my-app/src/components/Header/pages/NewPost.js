import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/joy/Stack';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

const MySnackbarContent = React.forwardRef(function MySnackbarContent(props, ref) {
    return (
        <div ref={ref} {...props}>
            {props.children}
        </div>
    );
});

function NewPost() {
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState('');
    const [body, setBody] = React.useState('');
    const [image, setImage] = React.useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const sleep = (milliseconds) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    const handleClick = async () => {
        try {
            await addPost();
        } catch (error) {
            console.error(error);
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

const addPost = () => {
    return new Promise((resolve, reject) => {
        const url = `/Posts/`;

        const formData = new FormData();
        formData.append('title', title);
        formData.append('created_at', moment().format());
        formData.append('body', body);
        formData.append('published', true);
        formData.append('likes', 0);

        if (image instanceof File) {
            formData.append('image', image);
        }

        axios.post(url, formData, { withCredentials: true })
            .then(async (res) => {
                setTitle('');
                setBody('');
                setImage('');
                setOpen(true);
                await sleep(2000);
                navigate('/');
                resolve();
            })
            .catch((err) => {
                console.error(err);
                setOpen(true);
                reject(err);
            });
    });
};

const handleInputChange = (e) => {
    if (e.target.name === 'image') {
        const selectedImage = e.target.files[0];
        setImage(selectedImage); // Set the selected image file to the image state
    } else {
        setImage(e.target.value);
    }
};

    const handleImageUpload = () => {
        fileInputRef.current.click();
    };

    return (
        <div>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Stack spacing={2}>
                    <h1>New Post</h1>
                    <TextField
                        sx={{
                            width: 400,
                        }}
                        id="outlined-multiline-flexible"
                        label="Title:"
                        multiline
                        maxRows={4}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        sx={{
                            width: 800,
                        }}
                        id="outlined-multiline-static"
                        label="Multiline"
                        multiline
                        rows={8}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                    <Button
                        sx={{ bgcolor: '#6cb7c5', color: 'black' }}
                        variant="outlined"
                        onClick={handleClick}
                    >
                        Post
                    </Button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Button onClick={handleImageUpload} variant="contained">
                            Upload Image
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleInputChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                            <MySnackbarContent>
                                <div>Posted!</div>
                            </MySnackbarContent>
                        </Alert>
                    </Snackbar>
                </Stack>
            </Box>
        </div>
    );
}

export default NewPost;
