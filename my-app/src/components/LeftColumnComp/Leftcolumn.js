import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import MediaCard from './MediaCard';
import {AuthContext} from "../../AuthContext";

function Leftcolumn() {
  const [posts, setPosts] = useState([]);
  const [resp, setResp] = useState(null);
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  const BlogsList = () => {
    if (posts != null) {
      const listItems = posts.map((item) => (
          <div key={item.id}>
            <MediaCard
                key={item.id}
                id={item.id}
                isOwner={item.isOwner}
                posted_by={item.posted_by}
                title={item.title}
                text={item.body}
                time={item.publish_at}
                commentsCount={item.comments_count}
                image={
                    item.image_path ||
                    'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
                }
                likes={item.likes}
                isAuthenticated={isAuthenticated}
                isLiked={item.isLiked}
            />
          </div>
      ));
      return <div>{listItems}</div>;
    }
    ;
  }

const getAllPosts = () => {
  const url = '/Posts/';
  axios
    .get(url, { withCredentials: true })
    .then((res) => {
      if (res.status === 401) {
        setPosts(null);
        setResp('Unauthorized: Please reconnect to see posts.');
      } else {
        setPosts(res.data);
        setResp(null);
      }
    })
    .catch((err) => {
      setPosts(null);
      setResp('Error: something went wrong, to get all posts.');
    });
};
   useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get('/profile', {
          withCredentials: true, // Add this option to include cookies in the request
        });

        // Assuming the response contains a boolean field named 'isAuthenticated'
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    checkAuthentication();
    getAllPosts();
  }, [setIsAuthenticated]);

  return (
    <div className="column">  
      <BlogsList  />
    </div>
  );
}

export default Leftcolumn;