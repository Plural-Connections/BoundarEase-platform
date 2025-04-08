import React, { useState, useEffect } from "react";
import { ThemeProvider } from '@emotion/react'
import { theme, widthStyles } from './styles'

import { cleanValue } from '../utils';

// import material UI components
import { Typography } from "@mui/material";
import { Stack } from "@mui/material";
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';

// import icons
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EastIcon from '@mui/icons-material/East';

// import other components
import FeederFigure from './FeederFigure';
import CustomModal from "./CustomModal";

// for testing only: import the fake data
// import feederData from '../test-data/feeder.json'; 
// import sankeyData from '../test-data/sankey.json';

const FeederContent = (props) => {

    // generate the data for the visualization
    // state variable to keep track of which scenario to display
    const [selectedScenario, setSelectedScenario] = useState(props.scenario);

    const handleScenarioChange = (event) => {
        setSelectedScenario(event.target.value);
    };

    // state figure to keep track of the data for the graph
    const [figureData, setFigureData] = useState(null);
    // based on the selectedScenario state variable, set the figureData state variable
    useEffect(() => {
        if (selectedScenario === "-1") {
            setFigureData(props.sankeyData);
        } else {
            setFigureData(props.newSankeyData);
        }
    }, [selectedScenario, props.sankeyData, props.newSankeyData]);

    // temp function for testing
    // useEffect(() => {
    //     console.log(figureData);
    // }, [figureData]);

    // variables for info button
    const [sourcesModalOpen, setSourcesModalOpen] = React.useState(false)
    const handleOpen = () => setSourcesModalOpen(true)
    const handleClose = () => setSourcesModalOpen(false)

    return (
        <ThemeProvider theme={theme}>
            {sourcesModalOpen &&
                <CustomModal open={sourcesModalOpen} handleClose={handleClose} content={
                    <div>
                        <Typography variant="body1">
                            <b>Read more about it below</b>
                        </Typography>
                        <Typography sx={{ mt: 2 }}>
                            <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2906826/" target="_blank">
                                Following Different Pathways: Social Integration, Achievement, and the Transition to High School</a>
                        </Typography>
                    </div>
                } />
            }
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={2}
                sx={{ width: { xs: '95%', sm: '90%', md: '90%', lg: '80%' } }}
            >
                <Typography variant="h2">
                    Feeder Patterns
                </Typography>
                <Typography sx={widthStyles} variant="caption">
                    They describe the neighborhood schools students are zoned for.
                </Typography>
                <Typography sx={widthStyles} variant="caption">
                    A split feeder pattern occurs when students from one
                    school are zoned to multiple schools after completing the highest grade level (e.g. one middle school
                    feeds into two high schools). Research suggests that splits can lower student performance.
                    <InfoOutlinedIcon sx={{
                        fontSize: 'medium',
                        "&:hover": {
                            cursor: "pointer"
                        }
                    }}
                        onClick={handleOpen}
                    />
                </Typography>
                {(props.userData !== null && props.userNewData !== null) &&
                    <>
                        <Stack
                            direction="column"
                            spacing={1}
                            sx={widthStyles}
                        >
                            <Typography variant="body1">
                                Your current feeder pattern is
                            </Typography>
                            <Typography style={{ fontWeight: 'bold' }} variant="body1">
                                {props.userData.elem_school_name} <EastIcon fontSize="small" sx={{ padding: 1, mb: -1.5 }} /> {props.userData.middle_school_name}
                                <EastIcon fontSize="small" sx={{ padding: 1, mb: -1.5 }} /> {props.userData.high_school_name}
                            </Typography>
                        </Stack>
                        <Stack
                            direction="column"
                            spacing={1}
                            sx={widthStyles}
                        >
                            {/* Check if feeder pattern changed */}
                            {props.userData.elem_school_name !== props.userNewData.elem_school_name || props.userData.middle_school_name !== props.userNewData.middle_school_name || props.userData.high_school_name !== props.userNewData.high_school_name ?
                                <Typography variant="body1">
                                    With these proposed new boundaries, your feeder pattern would change to
                                </Typography>
                                :
                                <Typography variant="body1">
                                    With these proposed new boundaries, your feeder pattern would remain as
                                </Typography>
                            }
                            <Typography style={{ fontWeight: 'bold' }} variant="body1">
                                {props.userNewData.elem_school_name} <EastIcon fontSize="small" sx={{ padding: 1, mb: -1.5 }} /> {props.userNewData.middle_school_name}
                                <EastIcon fontSize="small" sx={{ padding: 1, mb: -1.5 }} /> {props.userNewData.high_school_name}
                            </Typography>
                        </Stack>
                        <Typography sx={widthStyles} variant="body1">
                            Overall, <b>{props.newNumSplitFamilies}</b> ({cleanValue(props.newNumSplitFamilies / (props.newNumSplitFamilies + props.newNumIntactFamilies))}%) students would experience split feeder patterns, which is <b>{props.newNumSplitFamilies > props.numSplitFamilies ? "higher " : "lower "}</b>
                            than the <b>{props.numSplitFamilies}</b> ({cleanValue(props.numSplitFamilies / (props.numSplitFamilies + props.numIntactFamilies))}%) students who experience split feeder patterns with the current boundaries.
                        </Typography>
                        <Typography sx={widthStyles} variant="body1">
                            <b>{props.newNumIntactFamilies}</b> ({cleanValue(props.newNumIntactFamilies / (props.newNumSplitFamilies + props.newNumIntactFamilies))}%) students would experience intact feeder patterns with the new boundaries, which is <b>{props.newNumIntactFamilies > props.numIntactFamilies ? "higher " : "lower "}</b>
                            than the <b>{props.numIntactFamilies}</b> ({cleanValue(props.numIntactFamilies / (props.numSplitFamilies + props.numIntactFamilies))}%) students who currently experience intact feeder patterns.<br /><br />
                        </Typography>
                    </>
                }
                {/* Create the drop down menus */}
                <FormControl sx={{ width: { xs: '95%', sm: '90%', md: '640px', lg: '640px' } }
                }>
                    <Select
                        value={selectedScenario}
                        onChange={handleScenarioChange}
                        displayEmpty
                        sx={{ fontSize: '14px', marginBottom: '20px' }}
                    >
                        <MenuItem sx={{ fontSize: '14px' }} value={"-1"}>Current Boundaries</MenuItem>
                        <MenuItem sx={{ fontSize: '14px' }} value={props.scenario}>Proposed New Boundaries</MenuItem>
                    </Select>
                </FormControl>
                {/* Add figure here */}
                {figureData !== null &&
                    <FeederFigure
                        data={figureData}
                    />
                }
            </Stack>
        </ThemeProvider>
    )
}

export default FeederContent;