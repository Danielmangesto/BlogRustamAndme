import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Heart from "react-animated-heart";
import Box from '@mui/material/Box';
function MediaCard(props) {
  const [id, setId] = useState(props.id);
  const [isOwner, setIsOwner] = useState(props.isOwner);
  const [postedBy, setPostedBy] = useState(props.posted_by);
  const [title, setTitle] = useState(props.title);
  const [text, setText] = useState(props.text);
  const [time, setTime] = useState(props.time);
  const [image, setImage] = useState(props.image);
  const [posted, setPosted] = useState(props.posted);
  const [commentsCount, setCommentsCount] = useState(props.commentsCount);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [numOfLikes, setNumOfLikes] = useState(props.likes);
  const [isLiked, setLike] = useState(props.isLiked);
  const[isAuthenticated] = useState(props.isAuthenticated);
  const navigate = useNavigate();

  const handleEditPost = () => {
    setEditDialogOpen(true);
    setEditedText(text);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleSaveEdit = () => {
      axios
        .put(`/edit_post/${id}`, {
          body: editedText.trim(),
        })
        .then((response) => {
          console.log(response.data);
          setText(editedText);
          setEditDialogOpen(false);
          // Get the updated comment body from the response
          navigate('/')
          toast.success('Post updated successfully');
        })
        .catch((error) => {
          toast.error('Failed to update post');
          console.error(error);
        });
  };

  const handleEditDialogChange = (e) => {
    setEditedText(e.target.value);
  };

  const handleDeletePost = () => {
    axios
        .delete(`/post/${id}`)
        .then((response) => {
          setEditDialogOpen(false);
          window.location.reload();
          toast.success('Post deleted successfully');
        })
        .catch((error) => {
          toast.error('Failed to delete post');
          console.error(error);
        });
  };

  const handleClickedLikeButton = () =>{
    setLike(!isLiked);
    if(!isLiked){
      setNumOfLikes(numOfLikes + 1);
    }else{
      setNumOfLikes(numOfLikes - 1);
    }
    axios
        .post(`/server_like`, {
          post_id: id,
          is_liked: !isLiked
        }, {
          withCredentials: true  // Include credentials with the request
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          toast.error('Failed to update post');
          console.error(error);
        });
  }
  return (
    <div>
      <Divider />
      <Card sx={{ maxWidth: 900 }}>
        <CardActionArea onClick={() => navigate(`/post/${id}`)}>
          <CardMedia component="img" height="400" image={image} alt="image description" />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {text}
            </Typography>
            <Typography variant="overline" display="block" gutterBottom>
              Published in {time} by {postedBy}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" color="primary">
            Share
          </Button>
          <Button size="small" color="primary">
            Comments({commentsCount})
          </Button>
		  <Box sx={{
            p: 0, // Sets padding
            m: 0, // Sets margin
            border: 1, // Adds a border
            borderRadius: 1, // Sets border radius
            textAlign: 'center', // Aligns text to center
            backgroundColor: '#e6396d', // Sets background color (uses theme colors)
          }}>
            <Typography color="white">
              {numOfLikes} Likes
            </Typography>
          </Box>
          {isAuthenticated && (
            <Heart isClick={isLiked} onClick={handleClickedLikeButton} />
          )}
          {isOwner && (
            <div>
              <Button onClick={handleEditPost} size="small" color="primary">
                Edit
              </Button>
              <Button onClick={handleDeletePost} size="small" color="primary">
                Delete
              </Button>
            </div>
          )}
        </CardActions>
      </Card>
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent sx={{width: '400px', height: '300px'}}>
          <TextField
            id="outlined-multiline-static"
            label="Edit your post"
            multiline
            rows={10}
            defaultValue=""
            sx={{width:'360px'}}
            value={editedText}
            onChange={handleEditDialogChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
      <Divider />
    </div>
  );
}

export default MediaCard;
