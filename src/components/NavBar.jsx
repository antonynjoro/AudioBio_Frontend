import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import logo from "../images/audiobio_logo_light.svg";

function NavBar() {
  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [navAnchorEl, setNavAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setAuth(event.target.checked);
  };

  const handleNavMenu = (event) => {
    setNavAnchorEl(event.currentTarget);
  };
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNavAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleRecordDiary = () => {
    navigate('/');
    setNavAnchorEl(null);
  };

  const handleReadDiary = () => {
    navigate('/read');
    setNavAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ boxShadow: 0, px:  0 }}>
      <Toolbar sx={{ backgroundColor: "#161725", px: 2 }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            aria-haspopup="true"
            onClick={handleNavMenu}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="nav-menu-appbar"
            anchorEl={navAnchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(navAnchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleRecordDiary} disabled={location.pathname === '/'}>Record Diary Entry</MenuItem>
            <MenuItem onClick={handleReadDiary} disabled={location.pathname === '/read'}>Read Diary Entry</MenuItem>
          </Menu>
        <Box sx={{ flexGrow: 1 }}>
          <img src={logo} alt="" className="image" />
        </Box>
        {auth && (
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {/* <MenuItem onClick={handleClose}>Profile</MenuItem> */}
              <MenuItem onClick={handleLogout}>Log Out</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
