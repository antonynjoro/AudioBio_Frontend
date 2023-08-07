import React, { useEffect, useState, useRef } from "react";
import { Fab, Typography } from "@mui/material";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import AlertDialog from "./Dialog";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';





function RecordButton(props) {
    const [isMicOn, setIsMicOn] = useState(false);
    const mediaRecorder = useRef(null);
    const recordedChunks = useRef([]);
    const [startTime, setStartTime] = useState(null); // Define the startTime state
    const [isKeyDown, setIsKeyDown] = useState(false)
    const [recorderReady, setRecorderReady] = useState(false);
    const streamRef = useRef(null); // new ref to hold the stream
    const [alertOn, setAlertOn] = useState(false);
    const recordingDuration = useRef(0); // Duration in seconds
    const [isMicInitializing, setIsMicInitializing] = useState(false);


    // this will help adjust the size of the record button for smaller screens
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const styles = {
      recordButton: {
        minHeight: isSmallScreen ? "300px" : "500px", // adjust sizes as needed
        minWidth: isSmallScreen ? "300px" : "500px", // adjust sizes as needed
        backgroundColor: "#2c2d40",
        backgroundPosition: "50%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "auto",
        borderRadius: "500px",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px",
        display: "flex",
        "&:hover": {
          border: "1px solid rgba(215, 209, 199, .2)",
          backgroundColor: "#2c2d40",
        },
        "&:active": {
          backgroundColor: "#232435",
          borderWidth: "2px",
          borderColor: "#d7d1c7",
        },
        '&:disabled': {
          backgroundColor: 'grey',
        },
      },
      micIcon: {
        minHeight: isSmallScreen ? "150px" : "250px", 
        width: "auto",
        color: "#d7d1c7",
      },
    };
    


    /**
     * Initializes the MediaRecorder instance with the browser's audio stream.
     * 
     * The function requests access to the user's microphone and sets up the MediaRecorder 
     * instance with necessary event handlers for data availability and stopping the recorder. 
     * In case of a successful setup, the function updates the `recorderReady` state to true. 
     * If there is an error in accessing the microphone, the error is caught and passed to 
     * the error handling function from the props.
     * 
     * @return {void}
     */
    const initRecorder = () => {
      return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            mediaRecorder.current = recorder;
    
            recorder.ondataavailable = (event) => {
              recordedChunks.current.push(event.data);
            };
    
            recorder.onstop = () => {
              const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
              props.handleSendData(blob, recordingDuration.current);
              recordedChunks.current = [];
            };
            setRecorderReady(true)
            resolve();
          })
          .catch((error) => {
            console.error('Error accessing microphone:', error.message);
            props.handleError(`Error accessing microphone. Turn on the microphone in the settings to begin`);
            setAlertOn(true);
            reject();
          });
      });
    };
    

    useEffect(() => {
      console.log("Recorder Ready(indipendent useefect): ", recorderReady);
    }, [recorderReady]);
    
    

    /**
     * UseEffect hook for initializing the MediaRecorder on component mount.
     * 
     * This effect runs only once upon component mounting. It calls the `initRecorder` function 
     * to set up the MediaRecorder instance. It also defines a cleanup function that stops 
     * the MediaRecorder if it's recording when the component is unmounted.
     * 
     * @return {void}
     */
    useEffect(() => {
      
      console.log("Recorder Ready (int recorder UseEffect)",recorderReady)

      // Clean up function
      return () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
          mediaRecorder.current.stop();
        }
      };
    }, []);
    



    const startRecording = async () => {
      if (!recorderReady) {
        try {
          await initRecorder();
        } catch (error) {
          console.error('Error initializing recorder:', error);
          return;
        }
      }
      if (mediaRecorder.current) {
        mediaRecorder.current.start();
        setStartTime(Date.now()); // Set the startTime when recording starts
      } else {
        console.error('Media recorder not ready yet');
        console.log("Start Recording Recorder Ready: ", recorderReady);
      }
    };
  
    const stopRecording = () => {

      // Immediately update the progressTime state


      setIsMicOn(false);
      try {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
          mediaRecorder.current.stop();

          recordingDuration.current = ((Date.now() - startTime) / 1000); // Duration in seconds
          // Ignore recordings that are shorter than 1 second
          if (recordingDuration.current < 1) {
            console.log('Recording too short, ignoring.');
            return;
          }

          props.setProgressTime(prevProgressTime => prevProgressTime + recordingDuration.current);
        }
        // Stop the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        props.handleError('Error stopping recording:', error);
      }
      
      recordingDuration.current = ((Date.now() - startTime) / 1000); // Duration in seconds

      props.setProgressTime(prevProgressTime => prevProgressTime + recordingDuration.current);
      
    };
    

  
    
  
    // Update your event handlers to call these new functions
    const handleMouseDown = async() => {
      setIsMicOn(true);
      setIsMicInitializing(true);  // Add this line
      await startRecording();
      setIsMicInitializing(false);  // Add this line


    };
    const handleMouseUp = () => {
      setIsMicOn(false);
      stopRecording();
    };

    const handleKeyDown = async (event) => {
      if (event.code === 'Space' && isKeyDown===false) {
        setIsMicInitializing(true);
        startRecording();
        setIsMicInitializing(false);
        setIsMicOn(true);
        setIsKeyDown(true)
        
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === 'Space' && isKeyDown && !isMicInitializing) {
        stopRecording();
        setIsMicOn(false);
        setIsKeyDown(false)
      }
    };
  
    useEffect(() => {
     
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
  
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [isKeyDown, recorderReady]);
  
   
  
    return (
      <div className="record-button-container">
        <Fab
          sx={styles.recordButton}
          onMouseDown={handleMouseDown}
          onMouseUp={!isMicInitializing ? handleMouseUp : undefined}    // Disable when mic is initializing
          onTouchStart={handleMouseDown} // For touch screen devices
          onTouchEnd={!isMicInitializing ? handleMouseUp : undefined} // For touch screen devices
          onTouchCancel={!isMicInitializing ? handleMouseUp : undefined} // Handles the case when the user's finger leaves the button
          disabled={isMicInitializing}   // Disable button when mic is initializing
        >
          {isMicOn ? (
            <MicNoneOutlinedIcon sx={styles.micIcon} />
          ) : (
            <MicOffOutlinedIcon sx={styles.micIcon} />
          )}
        </Fab>
        <Typography className="recording-instruction">
          Hold down the microphone/spacebar to record today’s journal entry
        </Typography>
        {alertOn && <AlertDialog 
          titleText={"Ready to capture your first thoughts?"}
          contentText={"Please ensure your browser's microphone settings are switched on to begin!"}
          primaryAction={"Okay"}
        />}
      </div>
    );
  }
  
  export default RecordButton;