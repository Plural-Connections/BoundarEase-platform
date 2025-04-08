import React from "react";
import { ThemeProvider } from '@emotion/react'
import { theme } from './styles'

// import material UI components
import { Stack } from "@mui/material";
import { Typography } from "@mui/material";
import Rating from '@mui/material/Rating';

const RatingQuestion = (props) => {
    
    // function to update rating
    const handleRating = (event, newValue) => {
        props.setRating(newValue);
    };

    // function for testing
    // useEffect(() => {
    //     console.log(rating);
    // }, [rating])

    return (
        <ThemeProvider theme={theme}>
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={2}
                sx={{width: {xs: '95%', sm: '90%', md: '80%'}}}
            >
                {/* Question text */}
                {props.postStory ?
                    <Typography variant="h2">
                        Would you like to change anything about your response?
                    </Typography>
                :
                    <Typography variant="h2">
                        How would you rate this scenario?
                    </Typography>
                }

                <Rating
                    value={props.rating}
                    onChange={handleRating}
                    size="large"
                />

            </Stack>
        </ThemeProvider>
    )
}

export default RatingQuestion;