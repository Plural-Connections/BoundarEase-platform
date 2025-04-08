import React, { useEffect } from 'react';

import { ThemeProvider } from '@emotion/react'
import { theme } from './styles'

// import material UI components
import { Box } from '@mui/material';

// import other components
import ScenarioMapLegend from './ScenarioMapLegend';

const WrapperLegend = (props) => {
    const svgRef = React.useRef(null)

    useEffect(() => {
        ScenarioMapLegend({ ...props }, svgRef)
    }, [props]);

    return (
        <ThemeProvider theme={theme}> 
            <Box sx={{ marginLeft: props.smallScreen ? '5%' : '15%', marginTop: '30px'}}> 
                <svg ref={svgRef} />
            </Box>
        </ThemeProvider> 
    )
}

export default WrapperLegend;