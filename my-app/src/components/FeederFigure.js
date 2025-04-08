import React, { useEffect, useRef } from 'react';

// import Sankey code
import Sankey from './Sankey';

import { ThemeProvider } from '@emotion/react'
import { theme } from './styles'

const FeederFigure = (props) => {

    var svgRef = useRef(null);

    // temp for testing only
    // useEffect(() => {
    //     console.log(props.data.nodes);
    //     console.log(props.data.links);
    // }, [props]);

    useEffect(() => {
        Sankey(
          { 
            links: props.data.links, 
            svgRef 
          },
          {
            nodes: props.data.nodes,
            nodeId: (d) => d.node,
            nodeGroup: (d) => d.type,
            nodeGroups: ["elementary", "middle", "high", "user"],
            nodeLabel: (d) => `${d.name}`,
            nodeTitle: (d) => `${d.name}\n${d.value} students`,
            linkTitle: (d) => `${d.source.name} → ${d.target.name}\n${d.value} students`,
            linkColor: "#b3b3b3", 
            conditionalLink: true,
            marginTop: 100,
            marginLeft: 5,
            marginRight: 5,
            height: 800,
            colors: ["#8ECAE6", "#219EBC", "#023047", "#FB8500"],
          }
        );
      }, [props]);

    return (
        <ThemeProvider theme={theme}>
            <svg ref={svgRef} />
        </ThemeProvider>
    )
}

export default FeederFigure;