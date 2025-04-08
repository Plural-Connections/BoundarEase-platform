import React, { useState, useEffect } from "react";
import { ThemeProvider } from '@emotion/react'
import { theme, widthStyles } from './styles'

import { cleanValue } from '../utils';

// import material UI components
import { Typography } from "@mui/material";
import { Stack } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';

// import icons
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// import other components
import DiversityFigure from "./DiversityFigure";
import CustomModal from "./CustomModal";

// for testing only: import the fake data
// import diversityData from '../test-data/diversity.json'; 

const DiversityContent = (props) => {

    // variable to keep track of the screen width
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    // variable to keep track of figure width, max is 700
    const [figureWidth, setFigureWidth] = useState(650);

    // function to update the screen width
    const updateScreenWidth = () => {
        setScreenWidth(window.innerWidth);
    }

    // add event listener to update the screen width
    useEffect(() => {
        window.addEventListener("resize", updateScreenWidth);
        return () => window.removeEventListener("resize", updateScreenWidth);
    }, [])

    // set the figure width
    useEffect(() => {
        if (screenWidth < 700) {
            setFigureWidth(screenWidth - 70);
        }
    }, [screenWidth])

    // constant, mapping between SES level and target
    const SESLevelMap = {
        "low": 15,
        "mid": 26,
        "high": 59
    }

    // state variable to keep track of the user's data
    const [userData, setUserData] = useState(null);
    const [userNewData, setUserNewData] = useState(null);

    // get the user's data from the data and newData variables
    useEffect(() => {
        if (props.data !== null && props.data !== undefined) {
            // get the user's data from the data variable
            setUserData(props.data.find((item) => item.school_name === props.school));
        }
        if (props.newData !== null && props.newData !== undefined) {
            // get the user's data from the newData variable
            setUserNewData(props.newData.find((item) => item.school_name === props.newSchool));
        }
    }, [props])

    // for testing only
    // useEffect(() => {
    //     console.log(userData);
    //     console.log(userNewData);
    // }, [userData, userNewData])

    // generate the data for the visualization
    // state variable to keep track of which scenario to display
    const [selectedScenario, setSelectedScenario] = useState(props.scenario);

    const handleScenarioChange = (event) => {
        setSelectedScenario(event.target.value);
    }
 
    // state variable to toggle between SES levels
    const [selectedSESLevel, setSelectedSESLevel] = useState("low");

    const handleSESLevelChange = (event) => {
        setSelectedSESLevel(event.target.value);
    }

    // state variable to keep track of the data for graph
    // changes whenever the user selects a different scenario or SES level
    const [figureData, setFigureData] = useState([]);
    const yValues = [25, 50, 75, 97];

    // helper fucntion that prepares figure data
    const getFigureData = (dataSet, userSchool) => {
        var values = [];
        dataSet.forEach((item) => {
            // check if school is user's school
            if (item.school_name === userSchool) {
                item["user_school"] = true;
            }
            // calculate the delta between the current and target distribution
            if (selectedSESLevel === "low") {
                item["ses_delta"] = Math.abs(item["percent_low_ses"] - 0.15141800246609124);
                item["ses_value"] = item["percent_low_ses"];
            } else if (selectedSESLevel === "mid") {
                item["ses_delta"] = Math.abs(item["percent_med_ses"] - 0.2647058823529412);
                item["ses_value"] = item["percent_med_ses"];
            } else {
                item["ses_delta"] = Math.abs(item["percent_high_ses"] - 0.5882352941176471);
                item["ses_value"] = item["percent_high_ses"];
            }

            // add a fake y-value
            item["value"] = yValues[values.length];
            values.push(item);
        })

        return values;
    }

    useEffect(() => {
        var values = [];
        if (selectedScenario === "-1" && props.data !== null) {
            values = getFigureData(props.data, props.school);
            // set the figureData
            setFigureData(values);
        }
        else if (props.newData !== null) {
            // iterate through newData and calculate the
            // ses_delta and ses_value numbers and add them to figureData
            values = getFigureData(props.newData, props.newSchool);
            // set the figureData
            setFigureData(values);
        }
    }, [selectedScenario, selectedSESLevel, props])

    // determines absolute distance from target diversity distribution
    const getDiversityDistFromTarget = (inputData) => {
        let distance = 0;
        distance += Math.abs(inputData["percent_low_ses"] - 0.15141800246609124);
        distance += Math.abs(inputData["percent_med_ses"] - 0.2647058823529412);
        distance += Math.abs(inputData["percent_high_ses"] - 0.5882352941176471);

        return distance
    }

    // state variable for whether or not to show "more info" modal
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
                            <a href="https://tcf.org/content/facts/the-benefits-of-socioeconomically-and-racially-integrated-schools-and-classrooms/" target="_blank">
                                The Benefits of Socioeconomically and Racially Integrated Schools and Classrooms</a>
                            <br /><br />
                            <a href="https://www.researchgate.net/publication/330894867_The_Case_for_Balance_Socioeconomic_Diversity_in_Schooling" target="_blank">The Case for Balance: Socioeconomic Diversity in Schooling</a>
                        </Typography>
                </div>
            } />
            }
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={1}
                sx={{ width: { xs: '95%', sm: '90%', md: '90%', lg: '70%' } }}
            >
                <Typography variant="h2">
                    SES Diversity
                </Typography>
                <Typography sx={widthStyles} variant="caption">
                    This describes the diversity in students’ socioeconomic status.
                </Typography>
                <Typography sx={widthStyles} variant="caption">
                    Research indicates SES diversity in schools can lead to better academic and civil life outcomes for all students.
                    <InfoOutlinedIcon sx={{
                        fontSize: 'medium',
                        "&:hover": {
                            cursor: "pointer"
                        }
                    }}
                        onClick={handleOpen}
                    />
                </Typography>
                {(userData !== null && userNewData !== null && userData !== undefined && userNewData !== undefined) &&
                    <Typography sx={widthStyles} variant='body1'>
                        Your household would be zoned into a high school with <b>{getDiversityDistFromTarget(userData) > getDiversityDistFromTarget(userNewData) ? 'more' : 'less'}</b> socioeconomic diversity compared to the current zoning.
                    </Typography>
                }
                {/* MUI table */}
                {(userData !== null && userNewData !== null && userData !== undefined && userNewData !== undefined) &&
                    <TableContainer component={Paper}
                        sx={{ width: '97%' }}
                    >
                        <Table>
                            <TableHead sx={{
                                 "& .MuiTableCell-head": {
                                    backgroundColor: theme.palette.grey[300]
                                }
                            }}>
                                <TableRow>
                                    <TableCell>SES Level</TableCell>
                                    <TableCell align="right">Current Distribution at {props.school}</TableCell>
                                    <TableCell align="right">New Distribution at {props.newSchool}</TableCell>
                                    <TableCell align="right">Target Distribution</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow
                                    key={0}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        Low SES
                                    </TableCell>
                                    <TableCell align="right">{cleanValue(userData["percent_low_ses"])}%</TableCell>
                                    <TableCell align="right">{cleanValue(userNewData["percent_low_ses"])}%</TableCell>
                                    <TableCell align="right">{SESLevelMap["low"]}%</TableCell>
                                </TableRow>

                                <TableRow
                                    key={1}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        Mid SES
                                    </TableCell>
                                    <TableCell align="right">{cleanValue(userData["percent_med_ses"])}%</TableCell>
                                    <TableCell align="right">{cleanValue(userNewData["percent_med_ses"])}%</TableCell>
                                    <TableCell align="right">{SESLevelMap["mid"]}%</TableCell>
                                </TableRow>

                                <TableRow
                                    key={2}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        High SES
                                    </TableCell>
                                    <TableCell align="right">{cleanValue(userData["percent_high_ses"])}%</TableCell>
                                    <TableCell align="right">{cleanValue(userNewData["percent_high_ses"])}%</TableCell>
                                    <TableCell align="right">{SESLevelMap["high"]}%</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </TableContainer>
                }
                {/* Interactive viz goes here */}
                <Stack
                    direction="column"
                >
                    {/* Create the drop down menus */}
                    <FormControl sx={{ m: 1, width: figureWidth }}>
                        <Select
                            value={selectedScenario}
                            onChange={handleScenarioChange}
                            displayEmpty
                            sx={{ fontSize: '14px' }}
                        >
                            <MenuItem sx={{ fontSize: '14px' }} value={"-1"}>Current Boundaries</MenuItem>
                            <MenuItem sx={{ fontSize: '14px' }} value={props.scenario}>Proposed New Boundaries</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ m: 1, width: figureWidth }}>
                        <Select
                            value={selectedSESLevel}
                            onChange={handleSESLevelChange}
                            displayEmpty
                            sx={{ fontSize: '14px' }}
                        >
                            <MenuItem sx={{ fontSize: '14px' }} value={"low"}>Low SES</MenuItem>
                            <MenuItem sx={{ fontSize: '14px' }} value={"mid"}>Mid SES</MenuItem>
                            <MenuItem sx={{ fontSize: '14px' }} value={"high"}>High SES</MenuItem>
                        </Select>
                    </FormControl>
                    {/* Create the actual figure */}
                    {figureData.length > 0 &&
                        <DiversityFigure data={figureData} width={figureWidth} height={(3 * (figureWidth)) / 4}
                            xLabel={`Percentage of ${selectedSESLevel} SES students per school`}
                            target={SESLevelMap[selectedSESLevel] / 100}
                            topMargin={50} sideMargin={25}
                        />
                    }
                </Stack>
            </Stack>
        </ThemeProvider>
    )
}

export default DiversityContent;