import React, { useState } from "react";
import { ThemeProvider } from '@emotion/react'
import { theme } from './styles'

// import material UI components
import { Button } from "@mui/material";
import { Typography } from "@mui/material";
import { Stack } from "@mui/material";

import { arrayMoveImmutable } from "array-move";

// import other components
import RankingQuestion from "./RankingQuestion";
import AddressQuestion from "./AddressQuestion";

import { API_ROOT_TESTING, STATUS, isRunningLocally } from '../utils';

const StartPage = (props) => {

    // constant variable with the four pillars
    const pillars = [
        { "id": "feeder", "name": "Feeder Patterns", "desc": "The neighborhood schools students are zoned for" },
        { "id": "distance", "name": "Home to School Distance", "desc": "The distance from home to a school in minutes" },
        { "id": "diversity", "name": "SES Diversity", "desc": "Diversity in students’ socioeconomic status" },
        { "id": "size", "name": "Utilization", "desc": "The percentage of a school's capacity occupied by students/staff" }
    ]

    // mapping from ranking to scenario id
    const rankingToScenario = {
        "[\"diversity\",\"feeder\",\"size\",\"distance\"]": "1234",
        "[\"diversity\",\"feeder\",\"distance\",\"size\"]": "1243",
        "[\"diversity\",\"size\",\"feeder\",\"distance\"]": "1324",
        "[\"diversity\",\"size\",\"distance\",\"feeder\"]": "1342",
        "[\"diversity\",\"distance\",\"feeder\",\"size\"]": "1423",
        "[\"diversity\",\"distance\",\"size\",\"feeder\"]": "1432",
        "[\"feeder\",\"diversity\",\"size\",\"distance\"]": "2134",
        "[\"feeder\",\"diversity\",\"distance\",\"size\"]": "2143",
        "[\"feeder\",\"size\",\"diversity\",\"distance\"]": "2314",
        "[\"feeder\",\"size\",\"distance\",\"diversity\"]": "2341",
        "[\"feeder\",\"distance\",\"diversity\",\"size\"]": "2413",
        "[\"feeder\",\"distance\",\"size\",\"diversity\"]": "2431",
        "[\"size\",\"diversity\",\"feeder\",\"distance\"]": "3124",
        "[\"size\",\"diversity\",\"distance\",\"feeder\"]": "3142",
        "[\"size\",\"feeder\",\"diversity\",\"distance\"]": "3214",
        "[\"size\",\"feeder\",\"distance\",\"diversity\"]": "3241",
        "[\"size\",\"distance\",\"diversity\",\"feeder\"]": "3412",
        "[\"size\",\"distance\",\"feeder\",\"diversity\"]": "3421",
        "[\"distance\",\"diversity\",\"feeder\",\"size\"]": "4123",
        "[\"distance\",\"diversity\",\"size\",\"feeder\"]": "4132",
        "[\"distance\",\"feeder\",\"diversity\",\"size\"]": "4213",
        "[\"distance\",\"feeder\",\"size\",\"diversity\"]": "4231",
        "[\"distance\",\"size\",\"diversity\",\"feeder\"]": "4312",
        "[\"distance\",\"size\",\"feeder\",\"diversity\"]": "4321"
    }

    // state variable to keep track of ranking question results
    const [pillarRanking, setPillarRanking] = useState(pillars);

    // state variable for user's address
    // address is "description" from Google Maps API (a human readable address)
    const [address, setAddress] = React.useState(null);

    // state variable to track if user ranks all pillars equally
    const [rankEqual, setRankEqual] = React.useState(false)

    // function to update order of pillars
    const onDrop = ({ removedIndex, addedIndex }) => {
        setPillarRanking(items => arrayMoveImmutable(items, removedIndex, addedIndex));
    };

    // function for testing
    // useEffect(() => {
    //     console.log(items);
    //     console.log(rankingToScenario[JSON.stringify(items.map((elm) => elm["id"]))]);
    // }, [items])

    // state variable to track whether Next button should be disabled or enabled, based on if user entered required fields
    const [disableButton, setDisableButton] = React.useState(true)

    // function to post user ranking to backend
    const postRanking = () => {
        let rankingData = {
            session_id: props.sessionID,
            ranking: JSON.stringify(pillarRanking.map((elm) => elm["id"]))
        };

        return fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/save_ranking` : `/api/save_ranking`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(rankingData),
        }).then((response) => response.json())
    }

    // function to post address to backend
    const postAddress = () => {

        let addressData = {
            session_id: props.sessionID,
            address: address
        }

        return fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/encode_address/` : `/api/encode_address/`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(addressData),
        }).then((response) => response.json())
            .then(res => {
                // returns the updated session object with these new fields added so the frontend can do stuff with them as needed
                let pos = []
                pos.push(res['lat'])
                pos.push(res['long'])
                props.setLatLong(pos)
            })
    }

    // fucntion to make sure all the data is posted
    const postAllData = () => {
        return Promise.all([postRanking(), postAddress()])
    }


    // submit function that posts data to backend
    const handleSubmit = () => {
        // post cleanedItems to backend
        postAllData()
            .then(([ranking, address]) => {
                // both have been posted
                // set the scenario based on the ranking
                props.setScenario(rankingToScenario[JSON.stringify(pillarRanking.map((elm) => elm["id"]))]);
                props.setStatus(STATUS.GAVE_INFO);
            })
    }

    return (
        <ThemeProvider theme={theme}>
            <Stack
                useFlexGap
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={8}
                sx={{ width: '100vw', paddingLeft: { xs: '5%', md: '15%' }, paddingTop: { xs: '5%', sm: '5%' } }}
            >

                <RankingQuestion items={pillarRanking} onDrop={onDrop} setRankEqual={setRankEqual} />

                <AddressQuestion setAddress={setAddress} setDisableButton={setDisableButton} mapsAPIKey={props.mapsAPIKey} />

                <Button variant="contained" disabled={disableButton}
                    sx={{
                        textTransform: "none",
                        marginBottom: '40px'
                    }}
                    onClick={handleSubmit}
                >
                    <Typography>Next</Typography>
                </Button>

            </Stack>
        </ThemeProvider>
    )
}

export default StartPage;