import React, { useEffect, useState, useRef } from "react";
import { Fab } from "@mui/material";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import AlertDialog from "./Dialog";




const styles = {
  recordButton: {
    minHeight: "500px",
    minWidth: "500px",
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
    minHeight: "250px",
    width: "auto",
    color: "#d7d1c7",
  },
};

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
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          streamRef.current = stream; // store the stream
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
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error.message);
          props.handleError(`Error accessing microphone. Turn on the microphone in the settings to begin`);
          setAlertOn(true)
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
      initRecorder();
      
      console.log("Recorder Ready (int recorder UseEffect)",recorderReady)

      // Clean up function
      return () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
          mediaRecorder.current.stop();
        }
      };
    }, []);
    

    /**
     * UseEffect hook for handling visibility changes of the document.
     * 
     * This effect runs only once upon component mounting. It sets up an event listener 
     * on the document for visibility changes. If the document becomes hidden, it stops 
     * the MediaRecorder and the audio stream. If the document becomes visible again, 
     * it re-initializes the MediaRecorder.
     * 
     * It also defines a cleanup function to remove the event listener when the component 
     * is unmounted.
     * 
     * @return {void}
     */
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // If the document is not visible, stop recording and stop the stream
          if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
          }
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
        } else {
          // If the document becomes visible, initialize the recorder again
          initRecorder();
          console.log("Media reenabled due to clicking in")
        }
      };
    
      // Listen for visibility change events
      document.addEventListener("visibilitychange", handleVisibilityChange);
    
      // Make sure to remove event listeners when the component unmounts
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }, []);
    
    

    const startRecording = () => {
      if (recorderReady && mediaRecorder.current) {
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
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        props.handleError('Error stopping recording:', error);
      }
      
      recordingDuration.current = ((Date.now() - startTime) / 1000); // Duration in seconds

      props.setProgressTime(prevProgressTime => prevProgressTime + recordingDuration.current);
      
    };
    

  
    
  
    // Update your event handlers to call these new functions
    const handleMouseDown = () => {
      setIsMicOn(true);
      startRecording();
    };
    const handleMouseUp = () => {
      setIsMicOn(false);
      stopRecording();
    };

    const handleKeyDown = (event) => {
      if (event.code === 'Space' && isKeyDown===false) {
        startRecording();
        setIsMicOn(true);
        setIsKeyDown(true)
        
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === 'Space' && isKeyDown) {
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
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown} // For touch screen devices
          onTouchEnd={handleMouseUp} // For touch screen devices
          disabled={!recorderReady} // The button is disabled when the recorder is not ready
        >
          {isMicOn ? (
            <MicNoneOutlinedIcon sx={styles.micIcon} />
          ) : (
            <MicOffOutlinedIcon sx={styles.micIcon} />
          )}
        </Fab>
        <p className="recording-instruction">
          Hold down the microphone/spacebar to record today’s journal entry
        </p>
        {alertOn && <AlertDialog 
          titleText={"Ready to capture your first thoughts?"}
          contentText={"Please ensure your browser's microphone settings are switched on to begin!"}
          primaryAction={"Okay"}
        />}
      </div>
    );
  }
  
  export default RecordButton;