// LoginPage.jsx

import React, { useState } from "react";
import { Button, TextField, Container, Typography, Stack } from "@mui/material";
import api from "../api";
import { useNavigate } from 'react-router-dom';

const customStyles =  { 
    body: {
      height: "100vh",  
      backgroundColor: "#161725",
      color: "#d7d1c7"
    },
  }

function RegistrationPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('https://audiobio-backend-3352a70b5d0a.herokuapp.com/signup/', {
        email: email,
        password: password,
        name: name,
      });

      const token = response.data.access_token;
      localStorage.setItem('token', token); // Save token in local storage

      // After login, redirect to the home page
      navigate('/');

    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Stack direction="column" spacing={2} justifyContent="center" alignItems="center" sx={customStyles.body}>
      
    <Container component="main" maxWidth="xs" >
      <Stack direction="column" spacing={2} justifyContent="left" alignItems="center" >
      <Typography component="h1" variant="h5">
        Register
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
          name="name"
          label="name"
          type="name"
          id="name"
          autoComplete="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
      </Stack>
    </Container>
    </Stack>
  );
}

export default RegistrationPage;
