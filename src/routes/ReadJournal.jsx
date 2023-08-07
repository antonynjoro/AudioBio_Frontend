import { Box, Button, Card, CardActions, CardContent, Snackbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import body from "../custom-styles/body";
import { Container, Stack } from "@mui/material";
import api from "../api";
import NavBar from "../components/NavBar";
import { CloseRounded, DeleteOutline } from "@mui/icons-material";
import IconButton from '@mui/material/IconButton';



function ReadJournal() {
    const [journal, setJournal] = useState([]);
    const [month, setMonth] = useState(null);
    const [year, setYear] = useState(null);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);



    const fetchJournal = async (month=null, year=null) => {
        const now = new Date();
        console.log("Now: ", now);

        if (month === null) {
            month = now.getMonth() + 1; // getMonth is zero-based, so add 1.
            setMonth(month);
            console.log("Month: ", month);
        }
        if (year === null) {
            year = now.getFullYear();
            setYear(year);
            console.log("Year: ", year);
        }


        try {
            const response = await api.get(
                `https://audiobio-backend-3352a70b5d0a.herokuapp.com/all_journals`
            );
            console.log("Journal Fetched: ", response.data);
            setJournal(response.data);
        } catch (error) {
            console.error('Journal Fetch error:', error);
        }


    };


    useEffect(() => {
         
        fetchJournal();
    }, [ ]);



    const deleteJournal = async (day, month, year) => {
        try {
            const response = await api.delete(
                `https://audiobio-backend-3352a70b5d0a.herokuapp.com/delete_journal/${day}/${month}/${year}`
            );
            console.log("Journal Deleted: ", response.data);
        } catch (error) {
            console.error('Journal Delete error:', error);
        }
        
        fetchJournal();
    }



    const handleDelete = (journalId) => {
        console.log("Delete button clicked. Journal ID: ", journalId);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]; // array of month names

        // format journalID from d_Mmm_YYY to extract day, month, year as integers
        const journalIdArray = journalId.split('_');
        const day = parseInt(journalIdArray[0]);
        const month = monthNames.indexOf(journalIdArray[1]) + 1;
        const year = parseInt(journalIdArray[2]);

        console.log("Day: ", day);
        console.log("Month: ", month);
        console.log("Year: ", year);

        deleteJournal(day, month, year);

        setDeleteAlertOpen(true);

    }





    return (
      <Box sx={body}>
        <NavBar />

        <Container component="main" maxWidth="sm">
          <Stack direction="column" spacing={2} justifyContent="stretch">
            <Typography component="h1" variant="h3" sx={{ fontWeight: "bold" }}>
              Read Journal
            </Typography>
            <Typography variant="p" >
              View your past journal entries
            </Typography>
            {journal.map((entry) => (
              <Card key={entry.id} spacing={1}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", mb: 3 }}
                    component="div"
                  >
                    {entry.date}
                  </Typography>
                  <Stack>
                    {entry.transcripts.map((paragraph, index) => (
                      <Typography
                        key={index}
                        variant="body1"
                        sx={{ marginBottom: "16px" }}
                        color="text.secondary"
                      >
                        {paragraph}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button 
                  startIcon={<DeleteOutline />}
                  onClick={()=> handleDelete(entry.id)}
                  >Delete</Button>  
                </CardActions>
              </Card>
            ))}
          </Stack>
        </Container>
        {
            <Snackbar
                open={deleteAlertOpen}
                autoHideDuration={6000}
                onClose={() => setDeleteAlertOpen(false)}
                message="Journal entry deleted"
                action={
                    <React.Fragment>
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={() => setDeleteAlertOpen(false)}
                        >
                            <CloseRounded fontSize="small" />
                        </IconButton>
                    </React.Fragment>
                }
            />
        }
      </Box>
    );
}

export default ReadJournal;