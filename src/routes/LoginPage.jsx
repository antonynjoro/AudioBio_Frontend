// LoginPage.jsx

import React, { useState } from "react";
import { Button, TextField, Container, Typography, Stack, Link } from "@mui/material";
import api from '../api';
import { useNavigate } from 'react-router-dom';
import qs from 'qs';
import logo from "../images/audiobio_logo_light.svg";



const customStyles =  { 
    body: {
      height: "100vh",  
      backgroundColor: "#161725",
      color: "#d7d1c7"
    },
  }

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('https://audiobio-backend-3352a70b5d0a.herokuapp.com/login/', 
        qs.stringify({
          username: email,
          password: password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );
  
      console.log(response)
  
      const token = response.data.access_token;
      localStorage.setItem('token', token); // Save token in local storage
  
      // After login, redirect to the home page, or wherever you like
      navigate('/');
  
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Stack direction="column" spacing={2} justifyContent="center" alignItems="center" sx={customStyles.body}>
      
    <Container component="main" maxWidth="xs" >
      <Stack direction="column" spacing={2} justifyContent="left" alignItems="center" >
      <img src={logo} alt="logo" height="150px" width="200px"/>
      <Typography component="h1" variant="h3">
        Sign In
      </Typography>
      <Typography component="p" >
        Sign in to continue to your audio journal!
      </Typography>
      <form noValidate onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Sign In
        </Button>
      </form>
      <Typography component="p" variant="body2">
          Don't have an account? <Link href="/register">Register</Link>
      </Typography>
      </Stack>
    </Container>
    </Stack>
  );
}

export default LoginPage;
