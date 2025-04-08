import React, { useEffect, useState } from 'react';
import UtilizationFigure from './UtilizationFigure';
import { ThemeProvider } from '@emotion/react'
import { theme, widthStyles } from './styles'

import { getNumSchoolsWithinTarget, calcMaxEnrollment } from '../utils';

// import material UI components
import { Typography } from "@mui/material";
import { Stack } from "@mui/material";
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';

// other components
import CustomModal from './CustomModal';

const UtilizationContent = (props) => {
  const { scenario, data, newData, school, newSchool } = props

  // variable to keep track of the screen size
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  // variable to keep track of figure width, max is 700
  const [figureWidth, setFigureWidth] = useState(600);
  const [margin, setMargin] = useState(50);

  // function to update the screen width
  const updateScreenSize = () => {
    setScreenWidth(window.innerWidth);
    setScreenHeight(window.innerHeight);
  }

  // add event listener to update the screen width
  useEffect(() => {
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize)
  }, [])

  // set the figure width
  useEffect(() => {
    if (screenWidth < 900) {
      setFigureWidth(screenWidth);
      setMargin(40);
    }
  }, [screenWidth])

  // state variable to keep track of the user's data
  const [userData, setUserData] = useState(null);
  const [userNewData, setUserNewData] = useState(null);

  // get the user's data from the data and newData variables
  useEffect(() => {
    if (data !== null && data !== undefined && school !== '') {
      // get the user's data from the data variable
      setUserData(data.find((item) => item.school_name === school));
    }
    if (newData !== null && newData !== undefined && newSchool !== '') {
      // get the user's data from the newData variable
      setUserNewData(newData.find((item) => item.school_name === newSchool));
    }
  }, [data, newData, school, newSchool])

  // for testing only
  // useEffect(() => {
  //   console.log(userData);
  //   console.log(userNewData);
  // }, [userData, userNewData])

  // state variable to keep track of which scenario to display
  const [selectedScenario, setSelectedScenario] = useState(scenario);

  const handleScenarioChange = (event) => {
    setSelectedScenario(event.target.value);
  };

  // start variable for whether or not to show "more info" modal 
  const [infoOpen, setInfoOpen] = React.useState(false)
  const handleInfoOpen = () => setInfoOpen(true)
  const handleInfoClose = () => setInfoOpen(false)

  const generateText = (s) => {
    // if text is about current boundaries
    if(s == '-1') {
      // if enrollment is <= 100% utilization
      if (userData.num_students <= userData.student_capacity) {
        return (
          <Typography sx={widthStyles} variant='body1'>
              Your currently zoned school ({school}) is presently <b>at an acceptable student enrollment</b> of {userData.num_students}, which is less than / matches the ideal enrollment of {userData.student_capacity}. 
            </Typography>
        )
      } 
      
      // if enrollment is > 100% utilization but <= 130%
      else if (userData.num_students > userData.student_capacity && userData.num_students <= calcMaxEnrollment(userData.student_capacity)) {
        return (
          <Typography sx={widthStyles} variant='body1'>
              Your currently zoned school ({school}) is presently <b>at an acceptable student enrollment</b> of {userData.num_students}, which is higher than the ideal enrollment of {userData.student_capacity} but lower than / matches the maximum acceptable enrollment of {calcMaxEnrollment(userData.student_capacity)}. 
            </Typography>
        )
      }

      // if enrollment is > 130%
      else {
        return (
          <Typography sx={widthStyles} variant='body1'>
              Your currently zoned school ({school}) is presently <b>not at an acceptable student enrollment</b> of {userData.num_students}, which is higher than  the maximum acceptable enrollment of {calcMaxEnrollment(userData.student_capacity)}. 
            </Typography>
        )
      }
    }

    // if text is about proposed boundaries
    else {
      // if enrollment is <= 100% utilization
      if (userNewData.num_students <= userNewData.student_capacity) {
        return (
          <Typography sx={widthStyles} variant='body1'>
              With these proposed new boundaries, your zoned school ({school}) would be <b>at an acceptable student enrollment</b> of {userNewData.num_students}, which is less than / matches the ideal enrollment of {userNewData.student_capacity}. 
            </Typography>
        )
      } 
      
      // if enrollment is > 100% utilization but <= 130%
      else if (userNewData.num_students > userNewData.student_capacity && userNewData.num_students <= calcMaxEnrollment(userNewData.student_capacity)) {
        return (
          <Typography sx={widthStyles} variant='body1'>
              With these proposed new boundaries, your zoned school ({school}) would be <b>at an acceptable student enrollment</b> of {userNewData.num_students}, which is higher than the ideal enrollment of {userNewData.student_capacity} but lower than / matches the maximum acceptable enrollment of {calcMaxEnrollment(userNewData.student_capacity)}. 
            </Typography>
        )
      }

      // if enrollment is > 130%
      else {
        return (
          <Typography sx={widthStyles} variant='body1'>
              With these proposed new boundaries, your zoned school ({school}) would <b>not at an acceptable student enrollment</b> of {userNewData.num_students}, which is higher than  the maximum acceptable enrollment of {calcMaxEnrollment(userNewData.student_capacity)}. 
            </Typography>
        )
      }
    }
  }

  return (
    <ThemeProvider theme={theme}>
      {infoOpen &&
      <CustomModal open={infoOpen} handleClose={handleInfoClose} content={
        <Typography variant="body1">
              <b>Utilization</b>: assumes 25 students per classroom is 100% utilization (including “float”/portables).
              <br /><br />

              <b>Staff Building Utilization</b>: % of brick-and-mortar classrooms that are being utilized, calculated by the number of physical classrooms and the number of classroom teachers, assuming all teachers have their own classroom.

              Middle and high schools that are overutilized must manage through “float” and/or portables, as applicable. 130% utilization means every classroom is in use during all periods.
            </Typography>
      } />
      }
      {data !== null && newData !== null && userData !== null && userNewData !== null &&
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
          sx={{
            width: { xs: '95%', sm: '90%', md: '90%', lg: '80%' }
          }}
        >
          <Typography variant="h2">
            Utilization
          </Typography>
          <Typography sx={widthStyles} variant="caption">
          This describes how much of the school’s building is occupied, relative to its capacity. 
          </Typography>
          {generateText('-1')}
          {generateText(scenario)}
          <Typography sx={widthStyles} variant='body1'>
            Currently, <b>{getNumSchoolsWithinTarget(data)} school(s)</b> are at an acceptable student enrollment level.
            Under these proposed new boundaries, <b>{getNumSchoolsWithinTarget(newData)} school(s)</b> would be at an acceptable student enrollment level.
          </Typography>
          {/* Create the drop down menus */}
          <FormControl sx={{ m: 1, width: { xs: '95%', sm: '90%', md: '640px', lg: '640px' } }}>
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
          {selectedScenario === "-1" ?
            <UtilizationFigure rawData={data} width={figureWidth} height={screenHeight * 0.6} margin={margin} />
            :
            <UtilizationFigure rawData={newData} width={figureWidth} height={screenHeight * 0.6} margin={margin} />
          }

        </Stack>

      }
    </ThemeProvider>
  )
}

export default UtilizationContent;