import React, { useEffect, useState, useRef, useCallback } from "react";
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
    const streamRef = useRef(null); // new ref to hold the stream
    const [alertOn, setAlertOn] = useState(false);
    const recordingDuration = useRef(0); // Duration in seconds
    const [isMicInitializing, setIsMicInitializing] = useState(false);
    const [touchStartPos, setTouchStartPos] = useState(null);
    const [touchEndPos, setTouchEndPos] = useState(null);
    const [wakeLock, setWakeLock] = useState(null);

    


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
     * In case of a successful setup, the function returns a Promise that resolves with no value.
     * If there is an error in accessing the microphone, the error is caught and passed to 
     * the error handling function from the props, and the Promise rejects.
     * 
     * @return {Promise<void>}
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
    


    /**
     * UseEffect hook for cleaning up MediaRecorder on component unmount.
     * 
     * This effect runs only once upon component mounting. It defines a cleanup function that stops 
     * the MediaRecorder if it's recording when the component is unmounted. This is done to prevent 
     * memory leaks and unexpected behaviors.
     * 
     * @return {void}
     */
    useEffect(() => {
      

      // Clean up function
      return () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
          mediaRecorder.current.stop();
        }
        releaseWakeLock();
      };
    }, []);
    


    /**
     * Starts recording audio from the user's microphone.
     * 
     * The function first stops the tracks of any existing stream. It then initializes the MediaRecorder 
     * and starts recording. If there is an error during this process, it is logged to the console.
     * The start time of the recording is also tracked when the recording begins.
     * 
     * @return {Promise<void>}
     */
    const startRecording = async () => {
      // Stop the old stream's tracks if it exists

      await requestWakeLock();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Get a new stream and initialize the recorder with it
      try {
        await initRecorder();
      } catch (error) {
        console.error('Error initializing recorder:', error);
        return;
      }

      if (mediaRecorder.current) {
        try {
          mediaRecorder.current.start();
          setStartTime(Date.now()); // Set the startTime when recording starts
        } catch (error) {
          console.error('Error starting recording:', error);
        }
      } else {
        console.error('Media recorder not ready yet');
      }
    };

    /**
     * Stops the ongoing recording.
     * 
     * If the MediaRecorder is recording, the recording is stopped. The stream's tracks are also stopped. 
     * The duration of the recording is then calculated. If the recording is shorter than 1 second, it is ignored. 
     * Otherwise, the recording's duration is added to the total recording progress.
     * 
     * @return {Promise<void>}
     */
    const stopRecording = async () => {
      releaseWakeLock();
      setIsMicOn(false);
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        try {
          mediaRecorder.current.stop();
    
          // Stop the stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
    
          recordingDuration.current = ((Date.now() - startTime) / 1000); // Duration in seconds
    
          // Ignore recordings that are shorter than 1 second
          if (recordingDuration.current < 1) {
            console.log('Recording too short, ignoring.');
            return;
          }
    
          props.setProgressTime(prevProgressTime => prevProgressTime + recordingDuration.current);
    
        } catch (error) {
          console.error('Error stopping recording:', error);
          props.handleError('Error stopping recording:', error);
        }
      }
    };
    
    

  
    
  
    const handleMouseDown = async () => {
      // Don't start recording if the mic is initializing or if it's already on
      if (isMicInitializing || isMicOn) return;
    
      setIsMicInitializing(true);
    
      // Add a delay before starting the recording

        await startRecording();
        setIsMicInitializing(false);
        setIsMicOn(true);

    };


    const handleMouseUp = () => {
      setIsMicOn(false);
      stopRecording();
    };

    const handleKeyDown = useCallback( async (event) => {
      if (event.code === 'Space' && !isKeyDown && !isMicInitializing) {
        setIsMicInitializing(true);
        await startRecording();
        setIsMicInitializing(false);
        setIsMicOn(true);
        setIsKeyDown(true)
        
      }
    }, [isKeyDown, isMicInitializing]);

    const handleKeyUp = useCallback(async (event) => {
      if (event.code === 'Space' && isKeyDown && !isMicInitializing) {
        setIsMicInitializing(true);
        await stopRecording();
        setIsMicInitializing(false);
        setIsMicOn(false);
        setIsKeyDown(false)
      }
    }, [isKeyDown, isMicInitializing]);
  
    useEffect(() => {
     
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
  
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [handleKeyDown, handleKeyUp]);
  
    const handleTouchStart = (event) => {
      setTouchStartPos({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
    };
    
    const handleTouchMove = (event) => {
      setTouchEndPos({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
    };
    
   
    const handleTouchEnd = () => {
       // Consider it a swipe if the net movement exceeds a threshold (e.g. 50 pixels)
      if (touchStartPos && touchEndPos && Math.hypot(touchStartPos.x - touchEndPos.x, touchStartPos.y - touchEndPos.y) > 50) {
        // Ignore the touch event, it's a swipe
        return;
      }
      if (isMicOn && !isMicInitializing) { // Check if the mic is on and not initializing
        setIsMicInitializing(true);
        stopRecording().then(() => setIsMicInitializing(false));
        setIsMicOn(false);
      }
    };

    useEffect(() => {
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      document.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
      return () => {
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
      };
    }, [handleTouchEnd]);

    const requestWakeLock = async () => {
      if ("wakeLock" in navigator) {
        try {
          const lock = await navigator.wakeLock.request("screen");
          setWakeLock(lock);
        } catch (err) {
          console.error(
            `Could not obtain wake lock: ${err.name}, ${err.message}`
          );
        }
      }
    };

    const releaseWakeLock = () => {
      if (wakeLock) {
        wakeLock.release().then(() => {
          setWakeLock(null);
        });
      }
    };
    

  
    return (
      <div className="record-button-container">
        <Fab
          sx={styles.recordButton}
          onMouseDown={handleMouseDown}
          onMouseUp={!isMicInitializing ? handleMouseUp : undefined}    // Disable when mic is initializing
          onTouchStart={handleMouseDown} // For touch screen devices
          onTouchEnd={handleMouseUp} // Handle finger lift on touch devices
          onTouchCancel={handleMouseUp} // Handle touch interruption
          disabled={isMicInitializing}   // Disable button when mic is initializing
        >
          {isMicOn ? (
            <MicNoneOutlinedIcon sx={styles.micIcon} />
          ) : (
            <MicOffOutlinedIcon sx={styles.micIcon} />
          )}
        </Fab>
        <Typography className="recording-instruction">
          Hold down the microphone{!isSmallScreen && "/spacebar"} to record today’s journal entry
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