import React from "react";

import { ThemeProvider } from "@emotion/react";
import { theme, widthStyles } from './styles'

// import material UI components
import { Stack } from "@mui/material";
import { Typography } from "@mui/material";

import  { secToMin, calcPercent } from '../utils';

const DistanceContent = (props) => {
    const { travelData, studentEffects } = props
    
    if (travelData === null || studentEffects === null) {
        return null
    } else {
        return (
            <ThemeProvider theme={theme}>
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    spacing={2}
                    sx={{ width: { xs: '95%', sm: '90%', md: '90%', lg: '70%' } }}
                >
                    <Typography variant="h2">
                        Home-to-School Distance
                    </Typography>
                    <Typography sx={widthStyles} variant="caption">
                        This defines the distance from your home to your zoned school in minutes.
                    </Typography>
                    <Typography sx={widthStyles} variant='body1'>
                        Currently, you are <b>{secToMin(travelData.old_travel_time)} minutes</b> away from your zoned school ({travelData.old_school_name}).
                    </Typography>
                    {travelData.time_change_description == 'no change' ?
                        <Typography sx={widthStyles} variant='body1'>
                            With these proposed new boundaries, you would stay at {travelData.new_school_name}, which <b>doesn't impact</b> your distance to school.
                        </Typography> :
                        <Typography sx={widthStyles} variant='body1'>
                            With these proposed new boundaries, you would be rezoned to {travelData.new_school_name}, <b>{travelData.time_change_description}</b> your distance to school to {secToMin(travelData.new_travel_time)} minutes
                        </Typography>
                    }
                    <Typography sx={widthStyles} variant='body1'>
                        Overall, <b>{studentEffects.num_students_decrease}</b> students ({calcPercent('decrease', studentEffects)}%) would experience a decrease in travel time, and <b>{studentEffects.num_students_increase}</b> students ({calcPercent('increase', studentEffects)}%) would experience an increase in travel times.
                    </Typography>
                    <Typography sx={widthStyles} variant='body1'>
                        The <b>average increase</b> in travel time would be {secToMin(studentEffects.average_time_increase)} minutes, while the biggest increase in travel time would be {secToMin(studentEffects.highest_time_increase)} minutes.
                    </Typography>
                </Stack>
            </ThemeProvider>
        )
    }
}

export default DistanceContent;