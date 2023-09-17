import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const pages1 = ['About Us', 'Contact Us', 'New Post'];
const pages2 = ['About Us', 'Contact us'];
const settings = ['Profile','Account', 'Dashboard', 'Logout'];
const settings2 = ['Login'] 

function ResponsiveAppBar() {
  axios.defaults.withCredentials = true
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate  = useNavigate();
  const pagesClick = [() => navigate('/about'),
                      () => navigate('/contact'),
                      () => navigate('/newPost')]
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [ UserImage, setUserImage ] = React.useState("/static/images/avatar/2.jpg")
    const currentPath = window.location.pathname;

  const handleLogout = () => {
    const url = '/Logout';
    axios
    .post(url,)
      .then((res) => {
        // Reset the authentication status on the client-side
        console.log(res);
        navigate('/Login');
      })
      .catch((err) => {
        console.error(err);
        // Handle the error case if the logout request fails
      });
  };

  const handlers2 = [() => navigate('/Login')]
  const handleProfile = () => {
    navigate('/profile')
  }

  const handleAccount = () => {
      navigate('/Account')
  }

  const handlers1 = [() => handleProfile(),
                     () =>handleAccount(),
                     () => {},
                     () => handleLogout()
                    ];   
                    
                               
  
  
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu1 = (index) => {
    setAnchorElUser(null);
    handlers1[index]();
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleSettingClick = (index) => {
    handleCloseUserMenu1(index);
    handlers2[index]();
  };
  const handleSettingClickPages = (index) => {
    handleCloseNavMenu();
    pagesClick[index]();
  };


  React.useEffect(() => {

    const checkAuthentication = async () => {
      try {
        const response = await axios.get('/profile', {
          withCredentials: true,
        });

        setIsAuthenticated(response.data.isAuthenticated);
        setUserImage(response.data.image)
          if ((currentPath !== "/pwdReset") && (currentPath !== "/verifyToken")) {
              navigate('/')
          }
      } catch (error) {
        console.error('Error checking authentication:', error);
        if ((currentPath !== "/reset") && (currentPath !=="/verifyToken")) {
            navigate('/Login')
        }
      }
    };
    checkAuthentication(); // Call the authentication check function when the component mounts
  }, [setIsAuthenticated,setUserImage]);
  
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Home
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {isAuthenticated
                ? pages1.map((page ,index) => (
                <MenuItem key={page} onClick={() => handleSettingClickPages(index)}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              )): pages2.map((page ,index) => (
                <MenuItem key={page} onClick={() => handleSettingClickPages(index)}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))
              }
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            BLOG
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          
            {isAuthenticated 
            ? pages1.map((page, index) => (
              <Button
                key={page}
                onClick={() => handleSettingClickPages(index)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))
            : pages2.map((page, index) => (
              <Button
                key={page}
                onClick={() => handleSettingClickPages(index)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src={isAuthenticated ? UserImage : "/static/images/avatar/2.jpg"} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
            {isAuthenticated 
              ? settings.map((setting, index) => (
                <MenuItem key={setting} onClick={() => handleCloseUserMenu1(index)}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              )) 
              : settings2.map((setting, index) => (
                  <MenuItem key={setting} onClick={() => handleSettingClick(index)}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))
            }
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
