import React, { useLayoutEffect ,useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles.module.scss'
import {
  useSpringRef,
  animated,
  useTransition,
  useSpring,
} from '@react-spring/web'

function LatestBlogs() {


    const [threeLatestPosts, setPosts] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0)
    const springApi = useSpringRef()
    const [loading, setLoading] = useState(true);


  const transitions = useTransition(activeIndex, {
    from: {
      clipPath: 'polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%)',
    },
    enter: {
      clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)',
    },
    leave: {
      clipPath: 'polygon(100% 0%, 100% 100%, 100% 100%, 100% 0%)',
    },
    onRest: (_springs, _ctrl, item) => {
      if (activeIndex === item) {
        setActiveIndex(activeIndex === threeLatestPosts.length - 1 ? 0 : activeIndex + 1)
      }
    },
    exitBeforeEnter: true,
    config: {
      duration: 4000,
    },
    delay: 1000,
    ref: springApi,
  })

  const springs = useSpring({
    from: {
      strokeDashoffset: 120,
    },
    to: {
      strokeDashoffset: 0,
    },
    config: {
      duration: 11000,
    },
    loop: true,
    ref: springApi,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/server_three_latest', { withCredentials: true });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching latest posts:', error);
      } finally {
        setLoading(false); // Set loading to false after the data has been fetched (whether successful or not)
      }
    };
    fetchData();
  }, []);

 useLayoutEffect(() => {
   springApi.start()
 }, [activeIndex])
  return (
    <div>
      <h2>Latest</h2>
      <div className={styles.container}>
        <div className={styles.container__inner}>
        {transitions((springs, item) => (
            <animated.div className={styles.img__container} style={springs} key={item}>
                {loading ? (
                    <h2>loading...</h2>
                ) : (
                  <div>
                        <img src={threeLatestPosts[item]?.image || ''} style={{
                width: '100%', // Makes the image fill its container
                height: '150%', // Makes the image fill its container
                objectFit: 'cover' // Ensures the image covers the container
            }}  alt="Image" />
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: '#fff',
                            background: 'rgba(0, 0, 0, 0.5)',
                            padding: '10px'
                        }}>
                            {threeLatestPosts[item]["title"]}
                        </div>
                    </div>
                )}
            </animated.div>
        ))}
        </div>
      </div>
    </div>
  );

  }
  
  export default LatestBlogs;
  