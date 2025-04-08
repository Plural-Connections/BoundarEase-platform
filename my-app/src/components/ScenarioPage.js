import React, { useState, useEffect } from "react";
import { ThemeProvider } from '@emotion/react'
import { theme } from './styles'

import useMediaQuery from '@mui/material/useMediaQuery';

import { API_ROOT_TESTING, isRunningLocally, cleanValue, secToMin, calcPercent, getNumSchoolsWithinTarget, getNumFamilies, STATUS } from '../utils';

// import material UI components
import { Typography } from "@mui/material";
import { Stack, Box } from "@mui/material";

// other components
import RatingQuestion from "./RatingQuestion";
import DiversityContent from "./DiversityContent";
import QualitativeFeedback from "./QualitativeFeedback";
import FeederContent from "./FeederContent";
import UtilizationContent from "./UtilizationContent";
import DistanceContent from "./DistanceContent";
import PerspectiveGettingPage from './PerspectiveGettingPage';
import ScenarioMap from "./ScenarioMap";

import loading from '../loading.gif'

const seedrandom = require('seedrandom')


const ScenarioPage = (props) => {
    // state variable to store colors used for current boundaries
    const [currColors, setCurrColors] = React.useState(null)

    // state variable to store colors used for new boundaries
    const [newColors, setNewColors] = React.useState(null)

    // state variable to store schools in current boundaries
    const [currSchools, setCurrSchools] = React.useState(null)

    // state variable to store schools in new boundaries
    const [newSchools, setNewSchools] = React.useState(null)

    // state variable to store boundaries in current boundaries
    // in form of feeder data by block
    const [currBoundaries, setCurrBoundaries] = React.useState(null)

    // state variable to store boundaries in new boundaries
    // in form of feeder data by block
    const [newBoundaries, setNewBoundaries] = React.useState(null)

    // state variable to store school locations
    const [locData, setLocData] = React.useState(null)

    // generate color mapping for schools relevant to the proposed boundaries
    const createColors = (schools) => {
        // object where key is school id and value is hexcode
        let colorMapping = {}

        for (const school in schools) {
            const rand = new seedrandom(school)
            // generate random hexcodes, edit rand() multiplier to change colors
            colorMapping[school] = '#' + Math.floor(rand() * 16777777).toString(16).padStart(6, '0')
        }

        return colorMapping
    }

    // for school markers / creating colors for map
    const getUniqueIDS = (boundariesArr, schoolLocations) => {
        let ids = {}
        // for each block in given set of boundaries
        for (const school of boundariesArr) {
            // if block's school id does not exist in ids
            if (!(school['high_school_nces'] in ids)) {
                // find the school location
                const data = schoolLocations.filter(obj => {
                    return obj['school_id'] === school['high_school_nces']
                })

                // store it in ids, where the key is the school id and the value is an object with the school's name, lat, and long
                ids[school['high_school_nces']] = {
                    'name': school['high_school_name'],
                    'lat': data[0]['lat'],
                    'long': data[0]['long'],
                }
            }
        }

        return ids
    }

    // get locations for all schools
    useEffect(() => {
        const schoolsLatLongs = async () => {
            const res = await fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_school_locations` : `/api/get_school_locations`)
            const json = await res.json()

            setLocData(json)
        }

        schoolsLatLongs()

    }, [props.sessionID, props.scenario])

    useEffect(() => {
        // get school ids for relevant schools in current boundaries
        const getCurrUniqueSchoolIDs = async (locData) => {
            const res = await fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_boundaries/-1` : `/api/get_boundaries/-1`)
            const json = await res.json()

            setCurrBoundaries(json)
            setCurrSchools(getUniqueIDS(json, locData))
        }

        // get school ids for relevant schools in new boundaries
        const getNewUniqueSchoolIDs = async (locData) => {
            const res = await fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_boundaries/${props.scenario}` : `/api/get_boundaries/${props.scenario}`)
            const json = await res.json()

            setNewBoundaries(json)
            setNewSchools(getUniqueIDS(json, locData))
        }

        // if school locations have loaded, get their ids
        if (locData !== null) {
            getCurrUniqueSchoolIDs(locData)
            getNewUniqueSchoolIDs(locData)
        }
    }, [props.sessionID, locData])

    // create color mappings for schools in current and new boundaries
    useEffect(() => {
        if (currSchools !== null) {
            setCurrColors(createColors(currSchools))
        }

        if (newSchools !== null) {
            setNewColors(createColors(newSchools))
        }
    }, [currSchools, newSchools])



    // state variables to keep track of user's current and new school
    const [school, setSchool] = useState('');
    const [newSchool, setNewSchool] = useState('');

    // get the user's feeder pattern info from the backend
    useEffect(() => {
        // get the info for the current boundaries
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_feeder_data_personalized?scenario_id=-1&session_id=${props.sessionID}` : `/api/get_feeder_data_personalized?scenario_id=-1&session_id=${props.sessionID}`)
            .then(res => res.json()).then(data => {
                // set the school
                setSchool(data.high_school_name);
            }).catch(err => console.log(err));

        // get the info for the new boundaries
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_feeder_data_personalized?scenario_id=${props.scenario}&session_id=${props.sessionID}` : `/api/get_feeder_data_personalized?scenario_id=${props.scenario}&session_id=${props.sessionID}`)
            .then(res => res.json()).then(data => {
                // set the school
                setNewSchool(data.high_school_name);
            }).catch(err => console.log(err));

    }, [props.sessionID, props.scenario])

    // for testing only
    // useEffect(() => {
    //     console.log(school);
    //     console.log(newSchool);
    // }, [school, newSchool])

    // state variables to store all the 4 pillar data to pass into the components
    // diversity data
    const [diversityData, setDiversityData] = useState(null);
    const [newDiversityData, setNewDiversityData] = useState(null);
    // get the SES diversity data
    // function to get the data for a particular school and scenario from the backend
    useEffect(() => {
        // get the data for the current boundaries
        // fetch the data from the backend
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_diversity_data_all/-1` : `/api/get_diversity_data_all/-1`)
            .then(res => res.json()).then(data => {
                // set the data
                setDiversityData(data);
            }).catch(err => console.log(err));

        // get the data for the new boundaries
        // fetch the data from the backend
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_diversity_data_all/${props.scenario}` : `/api/get_diversity_data_all/${props.scenario}`)
            .then(res => res.json()).then(data => {
                // set the data
                setNewDiversityData(data);
            }).catch(err => console.log(err));

    }, [props.scenario])

    // for testing only
    // useEffect(() => {
    //     console.log(diversityData);
    //     console.log(newDiversityData);
    // }, [diversityData, newDiversityData])

    // state variable to store the diversity stats
    const [diversityStats, setDiversityStats] = React.useState([]);
    // function to generate all of the diversity stats
    useEffect(() => {
        if (diversityData == null || newDiversityData == null || school === '' || newSchool === '') {
            return;
        }
        // return a list of objects with the stats
        let result = [];
        // keep track of the list of schools (not including user's schools)
        let schools = [];
        // dict with the data for the current boundaries
        let currentBoundaries = {};
        // iterate through diversityData and add to currentBoundaries
        for (let i = 0; i < diversityData.length; i++) {
            // get the school name
            let schoolName = diversityData[i].school_name;
            // add to schools if not user's school
            if (schoolName !== school && schoolName !== newSchool) {
                schools.push(schoolName);
            }
            // add the data to currentBoundaries
            currentBoundaries[schoolName] = `${cleanValue(diversityData[i].percent_low_ses)}% low SES, ${cleanValue(diversityData[i].percent_med_ses)}% mid SES, and ${cleanValue(diversityData[i].percent_high_ses)}% high SES`;
        }
        // dict with the data for the new boundaries 
        let newBoundaries = {};
        // iterate through newDiversityData and add to newBoundaries
        for (let i = 0; i < newDiversityData.length; i++) {
            // get the school name
            let schoolName = newDiversityData[i].school_name;
            // add the data to newBoundaries
            newBoundaries[schoolName] = `${cleanValue(newDiversityData[i].percent_low_ses)}% low SES, ${cleanValue(newDiversityData[i].percent_med_ses)}% mid SES, and ${cleanValue(newDiversityData[i].percent_high_ses)}% high SES`;
        }
        // sort schools alphabetically
        schools.sort();
        // iterate through schools and add to result
        for (let i = 0; i < schools.length; i++) {
            // get the school name
            let schoolName = schools[i];
            result.push({
                "id": `diversity${result.length + 1}`,
                "name": `${schoolName} will go from ${currentBoundaries[schoolName]} to ${newBoundaries[schoolName]}.`
            })
        }
        // add the user specific stats
        // see if user changed schools
        if (school !== newSchool) {
            // user changed schools
            result.push({
                "id": `diversity${result.length + 1}`,
                "name": `My zoned school will go from ${currentBoundaries[school]} (${school}) to ${newBoundaries[newSchool]} (${newSchool}).`
            })
        } else {
            result.push({
                "id": `diversity${result.length + 1}`,
                "name": `My zoned school (${school}) will go from ${currentBoundaries[school]} to ${newBoundaries[newSchool]}.`
            })
        }
        // set the diversity stats
        setDiversityStats(result);
    }, [diversityData, newDiversityData, school, newSchool])

    // for testing only
    // useEffect(() => {
    //     console.log(diversityStats);
    // }, [diversityStats])

    // state variable to store user distance data
    const [travelData, setTravelData] = React.useState(null);
    // state variable to store # of students by how their travel time changes
    const [studentEffects, setStudentEffects] = React.useState(null)
    // get the distance data
    useEffect(() => {
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_travel_data_personalized/${props.sessionID}/${props.scenario}` : `/api/get_travel_data_personalized/${props.sessionID}/${props.scenario}`)
            .then((response) => response.json())
            .then((data) => setTravelData(data))

        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_travel_data_all/${props.scenario}` : `/api/get_travel_data_personalized/${props.scenario}`)
            .then((response) => response.json())
            .then((data) => setStudentEffects(data))
    }, [props.sessionID, props.scenario])

    // for testing only
    // useEffect(() => {
    //     console.log(travelData);
    //     console.log(studentEffects);
    // }, [travelData, studentEffects])

    // state variable to store the distance stats
    const [distanceStats, setDistanceStats] = React.useState([]);
    // helper function to generate all of the distance stats
    useEffect(() => {
        if (studentEffects == null || travelData == null) {
            return;
        }
        // return a list of objects with the stats
        let result = [];
        // get the percent of students with a decrease in travel time
        let percentDecrease = calcPercent('decrease', studentEffects);
        // add the percent decrease to the list
        result.push({
            "id": "distance1",
            "name": `${percentDecrease}% of students would experience a decrease in travel time.`
        })
        // get the percent of students with an increase in travel time
        let percentIncrease = calcPercent('increase', studentEffects);
        // add the percent increase to the list
        result.push({
            "id": "distance2",
            "name": `${percentIncrease}% of students would experience an increase in travel time.`
        })
        // get the user's change in travel time
        if (travelData.time_change_description == 'no change') {
            result.push({
                "id": "distance3",
                "name": `I would experience no change in travel time, staying at ${secToMin(travelData.old_travel_time)} minutes.`
            })
        } else {
            result.push({
                "id": "distance3",
                "name": `I would experience ${secToMin(travelData.old_travel_time) > secToMin(travelData.new_travel_time) ? 'a decrease' : 'an increase'} in travel time, going from ${secToMin(travelData.old_travel_time)} minutes to ${secToMin(travelData.new_travel_time)} minutes.`
            })
        }
        setDistanceStats(result);
    }, [studentEffects, travelData])

    // for testing only
    // useEffect(() => {
    //     console.log(distanceStats);
    // }, [distanceStats])

    // state variables to store feeder pattern data
    // state variable to keep track of number of families with split feeder patterns in current boundaries
    const [numSplitFamilies, setNumSplitFamilies] = useState(0);
    // state variable to keep track of number of families with split feeder patterns in new boundaries
    const [newNumSplitFamilies, setNewNumSplitFamilies] = useState(0);
    // state variable to keep track of number of families with intact feeder patterns in current boundaries
    const [numIntactFamilies, setNumIntactFamilies] = useState(0);
    /// state variable to keep track of number of families with intact feeder patterns in new boundaries
    const [newNumIntactFamilies, setNewNumIntactFamilies] = useState(0);

    // state variable for the sankey data in original scenario
    const [sankeyData, setSankeyData] = useState(null);
    // state variable for the sankey data in new scenario
    const [newSankeyData, setNewSankeyData] = useState(null);
    // get the data from the backend
    useEffect(() => {
        // get the info for the current boundaries
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_sankey_feeder_data?scenario_id=-1&session_id=${props.sessionID}` : `/api/get_sankey_feeder_data?scenario_id=-1&session_id=${props.sessionID}`)
            .then(res => res.json()).then(data => {
                setSankeyData(data);
                // get the number of families with split and intact feeder patterns
                let [numSplit, numIntact] = getNumFamilies(data);
                setNumSplitFamilies(numSplit);
                setNumIntactFamilies(numIntact);
            }).catch(err => console.log(err));

        // get the info for the new boundaries
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_sankey_feeder_data?scenario_id=${props.scenario}&session_id=${props.sessionID}` : `/api/get_sankey_feeder_data?scenario_id=${props.scenario}&session_id=${props.sessionID}`)
            .then(res => res.json()).then(data => {
                setNewSankeyData(data);
                // get the number of families with split and intact feeder patterns
                let [numSplit, numIntact] = getNumFamilies(data);
                setNewNumSplitFamilies(numSplit);
                setNewNumIntactFamilies(numIntact);
            }).catch(err => console.log(err));
    }, [props.sessionID, props.scenario]);

    // temp for testing only
    // useEffect(() => {
    //     console.log(sankeyData);
    //     console.log(newSankeyData);
    // }, [sankeyData, newSankeyData]);

    // state variable for the user's feeder data
    const [userFeederData, setUserFeederData] = useState(null);
    const [userNewFeederData, setNewUserFeederData] = useState(null);
    // get the user's feeder pattern info from the backend
    useEffect(() => {
        // get the info for the current boundaries
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_feeder_data_personalized?scenario_id=-1&session_id=${props.sessionID}` : `/api/get_feeder_data_personalized?scenario_id=-1&session_id=${props.sessionID}`)
            .then(res => res.json()).then(data => {
                setUserFeederData(data);
            }).catch(err => console.log(err));

        // get the info for the new boundaries
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_feeder_data_personalized?scenario_id=${props.scenario}&session_id=${props.sessionID}` : `/api/get_feeder_data_personalized?scenario_id=${props.scenario}&session_id=${props.sessionID}`)
            .then(res => res.json()).then(data => {
                setNewUserFeederData(data);
            }).catch(err => console.log(err));
    }, [props.sessionID, props.scenario])

    // temp for testing only
    // useEffect(() => {
    //     console.log(userFeederData);
    //     console.log(userNewFeederData);
    // }, [userFeederData, userNewFeederData]);

    // state variable to store the feeder pattern stats
    const [feederStats, setFeederStats] = useState([]);

    useEffect(() => {
        if (userFeederData == null || userNewFeederData == null) {
            return;
        }
        // return a list of objects with the stats
        let result = [];
        // get the general stat on split feeder patterns
        result.push({
            "id": "feeder1",
            "name": `${newNumSplitFamilies} students would experience split feeder patterns, which is ${newNumSplitFamilies > numSplitFamilies ? "higher" : "lower"} than the ${numSplitFamilies} students who experience split feeder patterns with the current boundaries.`
        });
        // get the general stat on intact feeder patterns
        result.push({
            "id": "feeder2",
            "name": `${newNumIntactFamilies} students would experience intact feeder patterns with the new boundaries, which is ${newNumIntactFamilies > numIntactFamilies ? "higher" : "lower"} than the ${numIntactFamilies} students who currently experience intact feeder patterns.`
        });

        // get the personalized stats
        // get the user's feeder pattern
        if (userFeederData.elem_school_name !== userNewFeederData.elem_school_name ||
            userFeederData.middle_school_name !== userNewFeederData.middle_school_name ||
            userFeederData.high_school_name !== userNewFeederData.high_school_name) {

            result.push({
                "id": "feeder3",
                "name": `My feeder pattern would go from ${userFeederData.elem_school_name} —> ${userFeederData.middle_school_name} —> ${userFeederData.high_school_name} to ${userNewFeederData.elem_school_name} —> ${userNewFeederData.middle_school_name} —> ${userNewFeederData.high_school_name}.`
            });
        } else {
            result.push({
                "id": "feeder3",
                "name": `My feeder pattern would remain as ${userFeederData.elem_school_name} —> ${userFeederData.middle_school_name} —> ${userFeederData.high_school_name}.`
            });
        }

        // get the user's split / intact status
        // check if the current feeder pattern has a split
        const currentSplit = userFeederData.middle_split || userFeederData.elementary_split;
        const newSplit = userNewFeederData.middle_split || userNewFeederData.elementary_split;

        if (currentSplit && !newSplit) {
            result.push({
                "id": "feeder4",
                "name": `My current feeder pattern has a split, while my feeder pattern from the new boundaries is intact.`
            });
        }
        else if (currentSplit && newSplit) {
            result.push({
                "id": "feeder4",
                "name": `Both my current and new feeder patterns have splits.`
            });
        }
        else if (!currentSplit && !newSplit) {
            result.push({
                "id": "feeder4",
                "name": `Both my current and new feeder patterns are intact. `
            });
        } else {
            result.push({
                "id": "feeder4",
                "name": `My current feeder pattern is intact, while my feeder pattern from the new boundaries is split.`
            });
        }
        setFeederStats(result);
    }, [numSplitFamilies, numIntactFamilies, newNumSplitFamilies, newNumIntactFamilies, userFeederData, userNewFeederData])

    // for testing only
    // useEffect(() => {
    //     console.log(feederStats);
    // }, [feederStats])

    // state variables for utilization data
    // state variable to store utilization data
    const [utilizationData, setUtilizationData] = useState(null);
    const [newUtilizationData, setNewUtilizationData] = useState(null);

    useEffect(() => {
        // get the data for the current boundaries
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_utilization_data_all/-1` : `/api/get_utilization_data_all/-1`)
            .then((response) => response.json())
            .then((data) => setUtilizationData(data))

        // get the data for the new boundaries
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_utilization_data_all/${props.scenario}` : `/api/get_utilization_data_all/${props.scenario}`)
            .then((response) => response.json())
            .then((data) => setNewUtilizationData(data))

    }, [props.scenario])

    // temp for testing only
    // useEffect(() => {
    //     console.log(utilizationData);
    //     console.log(newUtilizationData);
    // }, [utilizationData, newUtilizationData]);

    // state variable to store the utilization stats
    const [utilizationStats, setUtilizationStats] = useState([]);
    // function to generate the utilization stats
    useEffect(() => {
        if (utilizationData == null || newUtilizationData == null || school === '' || newSchool === '') {
            return;
        }
        // return a list of objects with the stats
        let result = [];
        // get the general stat on utilization
        result.push({
            "id": "size1",
            "name": `Currently, ${getNumSchoolsWithinTarget(utilizationData)} schools are within target enrollment, and with these new boundaries, ${getNumSchoolsWithinTarget(newUtilizationData)} schools would be within target enrollment.`
        });
        const userUtilizationData = utilizationData.find((item) => item.school_name === school);
        const userNewUtilizationData = newUtilizationData.find((item) => item.school_name === newSchool);
        // get the user stats for the current boundaries
        if ((userUtilizationData.num_students / userUtilizationData.student_capacity) <= 1.3) {
            result.push({
                "id": "size2",
                "name": `My currently zoned school (${school}) is within target enrollment, since ${userUtilizationData.num_students} students are enrolled (${cleanValue((userUtilizationData.num_students / userUtilizationData.student_capacity))}% utilization).`
            });
        } else {
            result.push({
                "id": "size2",
                "name": `My currently zoned school (${school}) is not within target enrollment, since ${userUtilizationData.num_students} students are enrolled (${cleanValue((userUtilizationData.num_students / userUtilizationData.student_capacity))}% utilization).`
            });
        }
        // get the user stats for the new boundaries
        if ((userNewUtilizationData.num_students / userNewUtilizationData.student_capacity) <= 1.3) {
            result.push({
                "id": "size3",
                "name": `With these new boundaries, my zoned school (${newSchool}) would be within target enrollment with ${userNewUtilizationData.num_students} students enrolled (${cleanValue((userNewUtilizationData.num_students / userNewUtilizationData.student_capacity))}% utilization).`
            });
        } else {
            result.push({
                "id": "size3",
                "name": `With these new boundaries, my zoned school (${newSchool}) would not be within target enrollment with ${userNewUtilizationData.num_students} students enrolled (${cleanValue((userNewUtilizationData.num_students / userNewUtilizationData.student_capacity))}% utilization).`
            });
        }
        setUtilizationStats(result);
    }, [utilizationData, newUtilizationData, school, newSchool])

    // for testing only
    // useEffect(() => {
    //     console.log(utilizationStats);
    // }, [utilizationStats])

    // state variable with all the stats for the qualiative feedback feature
    const [stats, setStats] = useState({
        "diversity": [],
        "feeder": [],
        "distance": [],
        "size": []
    });
    // update stats whenever the stats for each feature is updated
    useEffect(() => {
        setStats({
            "diversity": diversityStats,
            "feeder": feederStats,
            "distance": distanceStats,
            "size": utilizationStats
        })
    }, [diversityStats, feederStats, distanceStats, utilizationStats])

    // temp for testing only
    // useEffect(() => {
    //     console.log(stats);
    // }, [stats])

    // state variable to keep tracking of rating
    const [rating, setRating] = useState(null);

    // state variable to keep track of qualitative feedback
    const [feedback, setFeedback] = useState('');

    // state variable for perspective-getting stories
    const [stories, setStories] = React.useState(null);

    const mobile = useMediaQuery(theme.breakpoints.down('md'));

    // get stories to display on perspective-getting page
    const getPerspectives = async () => {
        await fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_student_perspectives/${props.scenario}` : `/api/get_student_perspectives/${props.scenario}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        }).then((response) => response.json())
            .then(data => {
                setStories(data.stories);
                props.setStatus(STATUS.SUBMITTED_INIT_FEEDBACK)
            }
            );
    }

    // when user clicks Next button, post feedback
    const handleNext = (userFeedback) => {
        // post rating and qualitative feedback to backend
        let postData = {
            "session_id": props.sessionID,
            "scenario_id": props.scenario,
            "rating": rating.toString(),
            "feedback": userFeedback
        }
        fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/save_feedback` : `/api/save_feedback`, {
            method: 'POST',
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData)
        })
            .then((response) => response.json())
            .then((data) => {
                if (props.status !== STATUS.SUBMITTED_INIT_FEEDBACK) {
                    getPerspectives();
                } else {
                    props.setStatus(STATUS.SUBMITTED_FINAL_FEEDBACK);
                }
                setFeedback(userFeedback);
            })
    }

    // for testing only
    // useEffect(() => {
    //     console.log(props.status);
    // }, [props.status])

    // keep track of whether rating went from a number to null
    const [ratingToNull, setRatingToNull] = useState(false);

    useEffect(() => {
        if (props.status === STATUS.SUBMITTED_INIT_FEEDBACK && rating == null) {
            setRatingToNull(true);
        }
    }, [props.status, rating])

    // if data hasn't finished loading, display loading icon
    if (currColors == null || newColors == null) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh' }}>
                <img src={loading} width='30' height='30' alt='Loading...' />
            </Box>
        )

    }

    // else render content
    return (
        <ThemeProvider theme={theme}>
            {props.status === STATUS.GAVE_INFO ?
                <div>
                    <Stack
                        direction="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        spacing={1}
                        sx={{ width: { xs: '95%', sm: '90%', md: '90%', lg: '70%' }, paddingLeft: { xs: '5%', md: '15%' }, paddingTop: { xs: '5%', sm: '5%' } }}
                    >
                        <Typography variant='h2' sx={{ marginBottom: '20px' }}>
                            Here's one scenario that has been proposed
                        </Typography>
                    </Stack>
                    <div>
                        <ScenarioMap
                            scenario={props.scenario}
                            sessionID={props.sessionID}
                            address={props.address}
                            currBoundaries={currBoundaries}
                            newBoundaries={newBoundaries}
                            currSchools={currSchools}
                            newSchools={newSchools}
                            currColors={currColors}
                            newColors={newColors}
                        />
                    </div>
                    <Box sx={{
                        justifyContent: "center",
                        alignItems: "flex-start",
                        width: '100vw',
                        paddingLeft: { xs: '5%', md: '15%' },
                        paddingTop: { xs: '5%', md: '0%' },
                        paddingBottom: 2
                    }}
                    >
                        {userFeederData !== null && userNewFeederData !== null && userFeederData['high_school_nces'] == userNewFeederData['high_school_nces'] &&
                            <Typography sx={{ fontSize: '1.2rem' }}>
                                Your zoned high school would remain as <b>{userFeederData['high_school_name']}</b>.
                            </Typography>
                        }
                        {userFeederData !== null && userNewFeederData !== null && userFeederData['high_school_nces'] !== userNewFeederData['high_school_nces'] &&
                            <Typography sx={{ fontSize: '1.2rem' }}>
                                Your zoned high school would change from <b>{userFeederData['high_school_name']}</b> to <b>{userNewFeederData['high_school_name']}</b>.
                            </Typography>
                        }
                    </Box>
                    <Box sx={{
                        justifyContent: "center",
                        alignItems: "flex-start",
                        width: '100vw',
                        paddingLeft: { xs: '5%', md: '15%' },
                        paddingTop: '4%',
                        paddingBottom: { xs: 2, md: 0 }
                    }}
                    >
                        <Typography variant='h2'>
                            How each of the pillars are affected
                        </Typography>
                    </Box>

                    <Stack
                        direction="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        spacing={{ xs: 5, md: 10 }}
                        sx={{
                            width: '100vw', paddingLeft: { xs: '5%', md: '15%' }, paddingTop: { xs: '2%' }, paddingBottom: 5
                        }}
                    >
                        {diversityData !== null && newDiversityData !== null && school !== '' && newSchool !== '' &&
                            <DiversityContent sessionID={props.sessionID} scenario={props.scenario}
                                data={diversityData} newData={newDiversityData}
                                school={school} newSchool={newSchool}
                            />
                        }

                        {travelData !== null && studentEffects !== null &&
                            <DistanceContent sessionID={props.sessionID} scenario={props.scenario}
                                travelData={travelData} studentEffects={studentEffects}
                            />
                        }

                        {userFeederData !== null && newSankeyData !== null && userNewFeederData !== null && sankeyData !== null &&
                            <FeederContent sessionID={props.sessionID} scenario={props.scenario}
                                userData={userFeederData} newSankeyData={newSankeyData}
                                userNewData={userNewFeederData} sankeyData={sankeyData}
                                numSplitFamilies={numSplitFamilies} numIntactFamilies={numIntactFamilies}
                                newNumSplitFamilies={newNumSplitFamilies} newNumIntactFamilies={newNumIntactFamilies}
                            />
                        }

                        {utilizationData !== null && newUtilizationData !== null && school !== '' && newSchool !== '' &&
                            <UtilizationContent sessionID={props.sessionID} scenario={props.scenario}
                                data={utilizationData} newData={newUtilizationData}
                                school={school} newSchool={newSchool}
                            />
                        }


                        <RatingQuestion
                            sessionID={props.sessionID}
                            scenario={props.scenario}
                            rating={rating}
                            setRating={setRating}
                            postStory={false}
                        />

                        {rating !== null &&
                            <QualitativeFeedback
                                sessionID={props.sessionID}
                                scenario={props.scenario}
                                setFeedback={setFeedback}
                                feedback={feedback}
                                stats={stats}
                                handleNext={handleNext}
                                postStory={false}
                                rating={rating}
                                ratingToNull={ratingToNull}
                            />
                        }
                    </Stack>
                </div>
                :
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    spacing={5}
                    sx={{
                        width: '100vw', paddingLeft: { xs: '5%', md: '15%' }, paddingTop: { xs: '5%', sm: '5%' },
                        paddingBottom: 5
                    }}
                >
                    <PerspectiveGettingPage stories={stories} mobile={mobile} />

                    <RatingQuestion
                        sessionID={props.sessionID}
                        scenario={props.scenario}
                        rating={rating}
                        setRating={setRating}
                        postStory={true}
                    />

                    {rating !== null &&
                        <QualitativeFeedback sessionID={props.sessionID} scenario={props.scenario}
                            setFeedback={setFeedback} feedback={feedback}
                            stats={stats} handleNext={handleNext}
                            postStory={true} rating={rating} ratingToNull={ratingToNull}
                        />
                    }
                </Stack>
            }
        </ThemeProvider>
    )
}

export default ScenarioPage;