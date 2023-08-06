import React, { useState, useEffect } from "react";
import logo from "../images/Logo.svg";
import NavBar from "../components/NavBar";
import RecordButton from "../components/RecordButton.jsx";
import Streak from "../components/Streak.jsx";
import { Alert, Stack, Grid, Box } from "@mui/material";
import ProgressIndicator from "../components/ProgressIndicator.jsx";
import AlertDialog from "../components/Dialog";
import api from "../api";
import { Margin } from "@mui/icons-material";
import body from "../custom-styles/body";

const MAX_RECORDING_DURATION = 600;

const customStyles = {
  body: {
    height: "100vh",
    backgroundColor: "#161725",
    color: "#d7d1c7",
    paddingBottom: "50px",
  },
};

function App() {
  const [errorState, setErrorState] = useState(false);
  const [alertText, setAlertText] = useState("What is happening?");
  const [progress, setProgress] = useState(0);
  const [progressTime, setProgressTime] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);



  const handleError = (errorText) => {
    setErrorState(true);

    setAlertText(errorText);
  };


    

    



  const handleSendData = (audioBlob, length_in_seconds) => {



    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    formData.append("length_in_seconds", length_in_seconds);

    // specifies the content type of the request body
    const axiosConfig = { headers: { "Content-Type": "multipart/form-data" } };

    // Replace 'your-backend-endpoint' with your actual backend API endpoint
    api
      .post("http://127.0.0.1:8000/upload/", formData, axiosConfig)
      .then((response) => {
        // Handle the response from the backend
        console.log("Recording sent successfully!");

        
        setUploadComplete(prev => !prev); // toggle uploadComplete state
      })
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error(
            "Error sending recording to backend:",
            error.response.data
          );
          handleError(error.response.data.message);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
          handleError("Your recording did not get saved. Please try again.");
        } else {
          console.error("Unknown error: ", error);
          handleError(error.message);
        }
      });
  };

  useEffect(() => {
    const fetchProgressTime = async () => {
      try {
        const response = await api.get(
          "http://127.0.0.1:8000/progress_time_today/",
          {   
              headers: { 
                  'Authorization': 'Bearer ' + localStorage.getItem('token'),
              },
          }
        );
        console.log("Progress Time fetched from the server: ", response.data.progress_time);
        setProgressTime(response.data.progress_time);
      } catch (error) {
        console.error('Error fetching progress time:', error);
      }
    };
    
    fetchProgressTime();
  }, [uploadComplete]);


  return (
    <Stack gap={3} sx={body}>
      <NavBar />
      <Grid>
        <Streak MAX_RECORDING_DURATION={MAX_RECORDING_DURATION} uploadComplete = {uploadComplete} />
      </Grid>
      {errorState && (
        <Alert
          severity="error"
          sx={{ position: "absolute", left: "20px", bottom: "20px" }}
        >
          {alertText}
        </Alert>
      )}
      <Box
        flexGrow={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <RecordButton
            handleError={handleError}
            handleSendData={handleSendData}
            setProgressTime={setProgressTime}
        />
      </Box>
      <ProgressIndicator
        progressTime={progressTime}
        MAX_RECORDING_DURATION={MAX_RECORDING_DURATION}
      />
    </Stack>
  );
}

export default App;
