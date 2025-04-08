import './App.css';
import React, { useEffect } from 'react';

import { API_ROOT_TESTING, isRunningLocally, STATUS } from './utils';


// import components
import StartPage from './components/StartPage';
import ScenarioPage from './components/ScenarioPage';
import EndPage from './components/EndPage';

function App() {

  // state variable for session, important to communciate with the backend
  const [sessionID, setSessionID] = React.useState(null);

  // state variable for user's scenario
  const [scenario, setScenario] = React.useState("");

  // state variable for the status of the app, either START, GAVE INFO, SUBMITTED INIT FEEDBACK, or SUBMITTED FINAL FEEDBACK
  const [status, setStatus] = React.useState(STATUS.START);

  // state variable to store user's address in latitude and longitude
  const [latLong, setLatLong] = React.useState(null);

  // state variable to store Google Maps API key
  const [mapsAPIKey, setMapsAPIKey] = React.useState(null)

  // for testing
  // useEffect(() => {
  //   console.log(scenario);
  // }, [scenario])

  // for testing
  // useEffect(() => {
  //   console.log(sessionID);
  // }, [sessionID])

  // create a new session
  useEffect(() => {
    fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/init_session` : `/api/init_session`)
      .then(res => res.json()).then(data => {
        // get back the session id
        setSessionID(data.session_id);
      }).catch(err => console.log(err));
  }, [])

  // get Google Maps API key
  useEffect(() => {
    fetch(isRunningLocally() ? API_ROOT_TESTING + `/api/get_google_api_key` : `/api/get_google_api_key`)
      .then(res => res.json()).then(data => {
        setMapsAPIKey(data['key']);
      }).catch(err => console.log(err));
  }, [])

  if (status == STATUS.START) {
    return <StartPage sessionID={sessionID} setScenario={setScenario} setStatus={setStatus} setLatLong={setLatLong} mapsAPIKey={mapsAPIKey} />
  } 
  else if (status === STATUS.SUBMITTED_FINAL_FEEDBACK) {
    return <EndPage />
  }
  // user gave info and is seeing info about scenario, or they submitted their initial feedback and can see perspective-getting page
  else {
    return <ScenarioPage sessionID={sessionID} scenario={scenario} status={status}
                setStatus={setStatus} address={latLong}
            />
  }
}

export default App;
