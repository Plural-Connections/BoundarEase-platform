import React, { useState, useEffect, useRef, useMemo } from "react";
import { ThemeProvider } from '@emotion/react'
import { theme, widthStyles } from './styles'
import { styled } from '@mui/material/styles';
import './QualitativeFeedback.css'

import useMediaQuery from '@mui/material/useMediaQuery';

// import material UI components
import Box from '@mui/material/Box';
import { Stack, Tooltip, tooltipClasses } from "@mui/material";
import { Typography } from "@mui/material";
import { Button } from "@mui/material";
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

// import icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// import other components
import CustomModal from "./CustomModal";

import { HighlightWithinTextarea } from 'react-highlight-within-textarea'

// create a component for each stat
const Stat = styled(Paper)(({ theme }) => ({
    backgroundColor: '#F8F8F8',
    padding: theme.spacing(1),
    textAlign: 'center',
    '&:hover': {
        cursor: 'pointer',
        backgroundColor: '#e6e6e6',
    },
}));

const StyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#525252',
        boxShadow: theme.shadows[2],
        fontSize: '1rem',
        fontWeight: 400
    },
}));


const QualitativeFeedback = (props) => {
    const mobile = useMediaQuery(theme.breakpoints.down('md'));

    // state variable: copy of rating of the story
    const [rating, setRating] = useState(-1);

    // ref to determine where to scroll to
    const topRef = useRef(null);

    // constant with all the text to highlight
    const [highlight, setHighlight] = useState([]);
    // set highlight based on props.stats
    useEffect(() => {
        // create a list of all the stats
        const stats = [];
        for (const pillar in props.stats) {
            for (const stat of props.stats[pillar]) {
                stats.push({
                    highlight: stat.name,
                    className: "blue"
                });
            }
        }
        // set highlight to the list of stats
        setHighlight(stats);
    }, [props.stats])

    // state variable to keep track of user's feedback
    const [feedback, setFeedback] = useState('');
    // function to set feedback when parent feedback changes
    useEffect(() => {
        if (props.feedback !== '' && props.feedback !== feedback) {
            setFeedback(props.feedback);
        }
    }, [props.feedback])

    // function to handle click next
    const handleNext = () => {
        props.handleNext(feedback);
    };

    // state variable to keep track of which pillar is selected
    const [selectedPillar, setSelectedPillar] = useState('');

    // for testing only
    // useEffect(() => {
    //     console.log(selectedPillar);
    // }, [selectedPillar])

    // function to handle clicking on a pillar
    const handleClick = (pillar) => {
        // set the selected pillar
        // if the pillar is already selected, unselect it
        if (selectedPillar === pillar) {
            setSelectedPillar('');
        }
        // otherwise, select it
        else {
            setSelectedPillar(pillar);
        }
    };

    // function to handle clicking on a stat
    const handleStatClick = (stat) => {
        // concatenate stat to feedback
        // if feedback is empty, don't add a space
        if (feedback === '') {
            setFeedback(stat);
        }
        // if feedback ends with a space, don't add another space
        else if (feedback.endsWith(' ')) {
            if (feedback.length - 2 >= 0) {
                // if second to last letter is punctuation, don't lower case the first letter in stat
                const char = feedback.charAt(feedback.length - 2);
                if (char.endsWith('.') || char.endsWith('?') || char.endsWith('!')) {
                    setFeedback(feedback + stat);
                } else {
                    setFeedback(feedback + stat.charAt(0).toLowerCase() + stat.slice(1));
                }
            } else {
                setFeedback(feedback + stat.charAt(0).toLowerCase() + stat.slice(1));
            }
        }
        // if feedback doesn't end with punctuation, lower case the first letter in stat
        else if (!feedback.endsWith('.') && !feedback.endsWith('?') && !feedback.endsWith('!')) {
            setFeedback(feedback + " " + stat.charAt(0).toLowerCase() + stat.slice(1));
        }
        else {
            setFeedback(feedback + " " + stat);
        }
    }

    // state variable to determine what to name the next button when props.postStory is true
    const [submitButtonText, setSubmitButtonText] = useState('');

    useEffect(() => {
        if (props.postStory) {
            if (props.ratingToNull) {
                setSubmitButtonText('Submit');
            }
            else {
                setSubmitButtonText('No, I’m ready to submit!');
            }
        }
    }, [props.postStory, props.ratingToNull])

    // function in which if postStory is true and user changes the rating, change the button text
    useEffect(() => {
        if (props.postStory) {
            // set rating to the parent rating var
            if (rating === -1) {
                setRating(props.rating);
            }
            // rating changed so we want to submit button text to change
            else if (rating !== props.rating) {
                setSubmitButtonText('Submit');
                setRating(props.rating);
            }
        }
        // the first time rating is set we want to scroll to the top of this component
        else {
            if (rating === -1) {
                topRef.current.scrollIntoView({ behavior: 'smooth' });
                // console.log('done')
                // props.setShowLoadingAfterRating(false)
            }
            setRating(props.rating);
            // props.setShowLoadingAfterRating(false)        
        }
    }, [props.postStory, props.rating])

    // start variable for whether or not to show "more info" modal 
    const [infoOpen, setInfoOpen] = React.useState(false)
    const handleInfoOpen = () => setInfoOpen(true)
    const handleInfoClose = () => setInfoOpen(false)

    return (
        <ThemeProvider theme={theme}>                   
            {infoOpen &&
            <CustomModal open={infoOpen} handleClose={handleInfoClose} content={
                <Typography variant="body1">
                            <b>We ask for this to get a more comprehensive understanding of your opinion about this scenario, which we aim to consider when creating future scenarios.</b>
                        </Typography>
            } />
            }
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={2}
                sx={{
                    width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
                }}
            >
                {/* Question text */}
                {!props.postStory &&
                    <Typography variant="h2"
                        sx={{ paddingBottom: 2 }}
                        ref={topRef}
                    >
                        Can you explain why you gave that rating?
                        {mobile ?
                            <InfoOutlinedIcon sx={{
                                fontSize: 'large',
                                paddingLeft: '5px',
                                "&:hover": {
                                    cursor: "pointer"
                                }
                            }}
                                onClick={handleInfoOpen}
                            /> :
                            <StyledTooltip sx={{ fontSize: '1.6rem' }} title='We ask for this to get a more comprehensive understanding of your opinion about this scenario, which we aim to consider when creating future scenarios.'>
                                <InfoOutlinedIcon sx={{
                                    fontSize: 'medium',
                                    paddingLeft: '5px',
                                    "&:hover": {
                                        cursor: "pointer"
                                    }
                                }}
                                />
                            </StyledTooltip>
                        }
                    </Typography>
                }
                <Typography sx={widthStyles} variant="caption">
                    If helpful, add data from any of the 4 Pillars by selecting it below
                </Typography>
                {/* Add 4 pillars as chips */}
                <Grid container spacing={1}
                >
                    <Grid item xs={6} sm={5} md={3}>
                        <Chip label="SES Diversity" onClick={() => handleClick("diversity")}
                            sx={{
                                bgcolor: selectedPillar === 'diversity' ? '#8ECAE6' : '#D9D9D9',
                                fontSize: '16px', width: { xs: '100%', sm: '95%', md: '90%' }, ml: { xs: -1, md: 0 },
                                '&:hover': {
                                    bgcolor: selectedPillar === 'diversity' ? '#a3d4eb' : '#e6e6e6',
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={7} md={3}>
                        <Chip label="Feeder Patterns" onClick={() => handleClick("feeder")}
                            sx={{
                                bgcolor: selectedPillar === 'feeder' ? '#8ECAE6' : '#D9D9D9',
                                fontSize: '16px', width: { xs: '100%', sm: '95%', md: '90%' },
                                '&:hover': {
                                    bgcolor: selectedPillar === 'feeder' ? '#a3d4eb' : '#e6e6e6',
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={8} sm={7} md={4}>
                        <Chip label="Home-to-School Distance" onClick={() => handleClick("distance")}
                            sx={{
                                bgcolor: selectedPillar === 'distance' ? '#8ECAE6' : '#D9D9D9',
                                fontSize: '16px', width: { xs: '100%', sm: '95%', md: '90%' }, ml: { xs: -1, md: 0 },
                                '&:hover': {
                                    bgcolor: selectedPillar === 'distance' ? '#a3d4eb' : '#e6e6e6',
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={4} sm={5} md={2}>
                        <Chip label="Utilization" onClick={() => handleClick("size")}
                            sx={{
                                bgcolor: selectedPillar === 'size' ? '#8ECAE6' : '#D9D9D9',
                                fontSize: '16px', width: { xs: '100%', sm: '95%', md: '90%' },
                                '&:hover': {
                                    bgcolor: selectedPillar === 'size' ? '#a3d4eb' : '#e6e6e6',
                                }
                            }}
                        />
                    </Grid>
                </Grid>
                {/* Display the stats when a pillar is selected */}
                {selectedPillar && selectedPillar in props.stats && props.stats[selectedPillar].length > 0 &&
                    <Stack
                        direction="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        spacing={1}
                        sx={{ width: '100%' }}
                    >

                        <Typography sx={widthStyles} variant="caption">
                            Click on a stat to add it to your feedback
                        </Typography>

                        {props.stats[selectedPillar].map((stat) => (
                            <Stat key={stat.id} elevation={3}
                                sx={{ fontSize: '16px', width: '97%' }}
                                onClick={() => handleStatClick(stat.name)}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography variant="body1" sx={{ fontSize: '16px' }} align="left">
                                        {stat.name}
                                    </Typography>
                                    <AddCircleOutlineIcon />
                                </Stack>
                            </Stat>
                        ))}
                    </Stack>
                }
                {/* Add the textbox */}
                {/* <TextField 
                    fullWidth 
                    label="" 
                    multiline
                    minRows={5}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    inputProps={{style: {fontSize: 16}}}
                /> */}
                <Box
                    sx={{
                        width: '97%',
                        minHeight: '100px',
                        border: '1px solid #D9D9D9',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        padding: '10px',
                        '&:hover': {
                            border: '1px solid black',
                        }
                    }}
                >
                    {/* Component props are here: https://draftjs.org/docs/api-reference-editor/ */}
                    <HighlightWithinTextarea
                        spellCheck="true"
                        placeholder=""
                        highlight={highlight}
                        value={feedback}
                        onChange={(value) => {
                            if (value !== feedback && submitButtonText !== 'Submit') {
                                setSubmitButtonText('Submit');
                            }
                            setFeedback(value);
                        }}
                    />
                </Box>
                {/* Moved the next button here because textbox is too laggy if it updates the 
                parent feedback variable each time */}
                <Button 
                variant="contained"
                disabled={feedback == '' ? true : false}
                    sx={{
                        textTransform: "none"
                    }}
                    onClick={handleNext}
                >
                    {props.postStory ?
                        <Typography>{submitButtonText}</Typography>
                        :
                        <Typography>Next</Typography>
                    }
                </Button>
            </Stack>
        </ThemeProvider>
    )
}

export default QualitativeFeedback;