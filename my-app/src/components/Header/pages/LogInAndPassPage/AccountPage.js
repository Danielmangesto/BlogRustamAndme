import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios

export default function AccountPage() {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userData && userData.role === "admin") {
      // If the user is an admin, fetch waiting posts
      fetchWaitingPosts();
    }
  }, [userData]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/profile', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const data = response.data;
        setUserData(data);
      } else {
        console.error('Request failed:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchWaitingPosts = async () => {
    try {
      const response = await axios.get('/waiting_posts', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const data = response.data;
        setPosts(data); // Update the posts state with complete data

        // Extract and save post IDs separately
        const postIds = data.map((post) => post.id);
        // Now, you can work with postIds as needed
        console.log('Post IDs:', postIds);
      } else {
        console.error('Request failed:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClickNo = (postId) => {
    console.log(`Clicked No for Post ID ${postId}`);
  };

  const handleClickYes = async (postId) => {
    try {
      const response = await axios.post(`/post_approve`, {
        postId:postId,
      });

      if (response.status === 200) {
        const data = response.data;
        setUserData(data);
      } else {
        console.error('Request failed:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    console.log(`Clicked No for Post ID ${postId}`);
  };

  const handleLogout = () => {
    navigate('/Login'); // Redirect to the login page
  };

  const handleChangePassword = () => {
    navigate('/pwdReset')
  };

  return (
    <div>
      {userData ? (
        <Box>
          <Typography variant="h4">Username: {userData.username}</Typography>
          <Typography variant="h4">Role: {userData.role}</Typography>
          <Typography variant="h4">Country: {userData.country}</Typography>
          <Button component={Link} to="/Account" variant="contained" sx={{ mt: 2 }}>
            Account
          </Button>
          <Button onClick={handleLogout} variant="contained" sx={{ mt: 2 }}>
            Logout
          </Button>
          <Button onClick={handleChangePassword} variant="contained" sx={{ mt: 2 }}>
            ChangePassword
          </Button>
          {userData.role === "admin" && (
            <div>
              <Typography variant="h4">Waiting Posts:</Typography>
              {posts.map((post) => (
                <div key={post.id}>
                  <Typography>{post.title}</Typography>
                  <Button onClick={() => handleClickYes(post.id)}>Yes</Button>
                  <Button onClick={() => handleClickNo(post.id)}>No</Button>
                </div>
              ))}
            </div>
          )}
        </Box>
      ) : (
        <Typography variant="h4">Loading user data...</Typography>
      )}
    </div>
  );
}
