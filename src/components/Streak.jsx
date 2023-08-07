import React, { useEffect, useState } from 'react';
import { Stack, IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import api from '../api';


import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const Streak = ({MAX_RECORDING_DURATION, uploadComplete}) => {
    const streaks = ['complete', 'complete', '', 'complete', 'complete', 'complete', 'complete', 
    'complete', 'complete', 'complete', 'complete', 'complete', 'complete', 'partial', 'complete', 
    'complete', 'partial', 'today', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const [streakStatus, setStreakStatus] = useState([]);
    const [readableMonth, setReadableMonth] = useState('');


    useEffect(() => {
        const fetchStreaks = async () => {
            try {
                const now = new Date();
                console.log("Now: ", now);
                const month = now.getMonth() + 1; // getMonth is zero-based, so add 1.
                const year = now.getFullYear();

                setReadableMonth(now.toLocaleString('default', { month: 'long' }));

    
                const response = await api.get(
                    `https://audiobio-backend-3352a70b5d0a.herokuapp.com/get_streak/${month}/${year}`,

                );
                console.log("Streak Fetched: ", response.data);
    
                const convertProgressTimeToStatus = (progressTime, dateFromData) => {
                    const now = new Date();
                    const day = now.getDate().toString().padStart(2, '0'); // convert day to 2 digits
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
                    const month = monthNames[now.getMonth()];
                    const year = now.getFullYear();
                    const todayString = `${day}_${month}_${year}`; // convert current date to 'DD_MMM_YYYY' format

                    console.log("dateFromData: ", dateFromData);
                    console.log("todayString: ", todayString);
                
                    if (progressTime >= (MAX_RECORDING_DURATION/5)) {
                        console.log("Returning complete: ", progressTime)
                        return 'complete';
                    } else if (progressTime > 0) {
                        console.log("Returning partial: ", progressTime)
                        return 'partial';
                    } else if (dateFromData === todayString) { // compare dates
                        console.log("Returning today: ", progressTime)
                        return 'today';
                    } else {
                        console.log("Returning empty: ", progressTime)
                        return '';
                    }
                };
    
                const streakStatusList = response.data.map((streak) => convertProgressTimeToStatus(streak.progress_time, streak.date));
                console.log("Streak Status List: ", streakStatusList);
                setStreakStatus(streakStatusList);
    
            } catch (error) {
                console.error('Error fetching progress time:', error);
            }
        };
        fetchStreaks();
    }, [uploadComplete, MAX_RECORDING_DURATION]);
    

    // TODO: Display the streak indicators based on the calendar date showing the current month
    // TODO: Display the state of the streaks based on the data from the backend

    return (
        <Stack spacing={1} sx={{px:2}}>
            <Grid container spacing={1}>
                <Grid xs="auto">
                    <IconButton aria-label="delete" size="small">
                        <ChevronLeft fontSize="inherit" sx={{color: "#D7D1C7"}}/>
                    </IconButton>
                </Grid>
                <Grid xs>
                    <Typography align='center' >{readableMonth}</Typography>
                </Grid>
                <Grid xs="auto">
                    <IconButton aria-label="delete" size="small">
                        <ChevronRight fontSize="inherit" sx={{color: "#D7D1C7"}}/>
                    </IconButton>
                </Grid>
            </Grid>

            <Stack direction={'row'} justifyContent={"center"} className="w-layout-hflex streak-container">
                {streakStatus.map((streak, index) => (
                    <div key={index} className={`streak ${streak}`}></div>
                ))}
            </Stack>
        </Stack>
    );
};

export default Streak;
