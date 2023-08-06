import React, { useEffect, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const styles = {
  checkCircleIcon:{
    width: "12px",
    height: "12px",
    position: "absolute",
    top: "-24px",
    color: "#59FB69"
  },
}

function ProgressIndicator(props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {

    console.log("ProgressIndicator: progressTime prop updated:", props.progressTime);

    const progress = Math.min(
      (props.progressTime / props.MAX_RECORDING_DURATION) * 100,
      100
      );
      console.log("recording Duration so far:", props.progressTime);

      setProgress(progress);  

  }, [props.progressTime]);



  return (
    <div className="w-layout-hflex day-progress-indicator">
      <div className="progress-outline">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
        <div className="daily-goal-indicator">
          {progress >= 20 && (
            <CheckCircleIcon sx={styles.checkCircleIcon} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressIndicator;
