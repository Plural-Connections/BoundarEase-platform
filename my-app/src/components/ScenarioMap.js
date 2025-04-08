import React, { useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, GeoJSON, withLeaflet } from 'react-leaflet';
import './ScenarioMap.css';
import useMediaQuery from '@mui/material/useMediaQuery';

import L from 'leaflet';

// import material UI components
import { Button, ButtonGroup, Box } from '@mui/material';

// import other components
import WrapperLegend from './WrapperLegend';
import CustomButton from './ScenarioMapHomeButton';

import mapData from '../map-data/array_of_GeoJSON.json';

// default for how zoomed in map is
const zoom = 11

// custom marker for user's home address
const getIcon = (_iconSize) => {
    return L.icon({
        iconUrl: require('../static/icons/home.png'),
        iconSize: new L.Point(_iconSize, _iconSize)
    })
}

const ScenarioMap = (props) => {
    const { scenario, address, sessionID, currBoundaries, newBoundaries, currSchools, newSchools, currColors, newColors } = props

    const smallScreen = useMediaQuery('(max-width:800px)')

    // state variable to keep track of which scenario to display
    const [selectedScenario, setSelectedScenario] = useState(scenario);

    const changeToCurrentScenario = () => {
        setSelectedScenario('-1');
    };

    const changeToProposedScenario = () => {
        setSelectedScenario(scenario);
    };

    // styling for blocks
    const style = (feature) => {
        if (selectedScenario == '-1') {
            return styleHelper(currBoundaries, currColors, feature)
        }

        else {
            return styleHelper(newBoundaries, newColors, feature)
        }

    }

    const styleHelper = (boundaries, colors, feature) => {
        const p = feature.properties

        // check to find block in boundary in map data
        const zoning = boundaries.filter(obj => {
            return obj['block_id'] == p['geo_id']
        })

        // if it was found
        if (zoning.length !== 0) {
            const color = colors[zoning[0]['high_school_nces']]

            // ensure there's a corresponding color for the school
            if (color == undefined || color == null) {
                return { weight: 0, fillOpacity: 0 }
            } else {
                return { weight: 0, color: color, fillOpacity: 0.5 }
            }
        } else {
            return { weight: 0, fillOpacity: 0 }
        }
    }

    // hover behavior for blocks
    // changes color
    
    const blockHover = (feature, layer) => {
        layer.on('mouseover', function (e) {
            // ensure that block is in boundary
            if ('color' in style(feature)) {
                layer.setStyle({
                    fillOpacity: 0.3,
                    color: '#5e5e5e'
                });
            }

        })
        layer.on('mouseout', function (e) {
            // ensure that block is in boundary
            if ('color' in style(feature)) {
                layer.setStyle({
                    fillOpacity: 0.5,
                    color: style(feature)['color']
                });
            }
        })
    }

    // renders marker for a school, includes a popup 
    const renderMarker = (data) => {
        const lat = data['lat']
        const long = data['long']
        const name = data['name']

        if (!(isNaN(lat)) && !(isNaN(long))) {
            const pos = [lat, long]
            return (
                <Marker
                    position={pos}
                >
                    <Popup>
                        {name}
                    </Popup>
                </Marker>
            )
        }
    }

    // renders markers for all schools
    const renderMarkers = () => {
        const data = selectedScenario == '-1' ? currSchools : newSchools

        let renderedMarkers = [];

        for (const school in data) {
            renderedMarkers.push(renderMarker(data[school]))
        }

        return renderedMarkers

    }

    return (
        <Box>
            <ButtonGroup
                disableElevation
                disableRipple
                fullWidth
                size='small'
                orientation='horizontal'
                sx={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}>
                <Button
                    variant={selectedScenario == '-1' ? 'contained' : 'outlined'}
                    sx={{ width: { xs: '45%', md: '35%' } }}
                    onClick={changeToCurrentScenario}>
                    Current Boundaries
                </Button>
                <Button
                    variant={selectedScenario == '-1' ? 'outlined' : 'contained'}
                    sx={{ width: { xs: '45%', md: '35%' } }}
                    onClick={changeToProposedScenario}>
                    Proposed Boundaries
                </Button>
            </ButtonGroup>

            <MapContainer center={address} zoom={zoom} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <GeoJSON data={mapData} style={style} onEachFeature={blockHover} />

                {/* button to recenter map on user's address */}
                <CustomButton center={address} zoom={zoom} sessionID={sessionID} />

                <Marker position={address} icon={getIcon(40)}>
                    <Popup>Your location</Popup>
                </Marker>
                {renderMarkers()}
            </MapContainer>
            <WrapperLegend schoolData={currSchools} colorMapping={currColors} smallScreen={smallScreen} />
        </Box>
    )
}


export default ScenarioMap;