import React, { useEffect } from 'react';
import * as d3 from 'd3';

import { ThemeProvider } from '@emotion/react'
import { theme } from './styles'

const DiversityFigure = (props) => {
     // props include data, width, and height

    useEffect(() => {
        drawChart();
    }, [props]);

    const drawChart = () => {

        // wipe off the old chart before plotting the new one
        d3.select('#diversity-container')
            .select('svg')
            .remove();

        var margin = { top: props.topMargin, right: props.sideMargin, bottom: props.topMargin, left: props.sideMargin };
        // set the ranges
        var x = d3
            .scaleLinear()
            .domain([0, 1])
            .range([0, props.width]);
            
        var y = d3
            .scaleLinear()
            .range([props.height, 0])
            .domain([0, 100]);
        
        // define the tooltip
        var tooltip = d3.select("#diversity-container").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute");
        
        // append the svg object to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var svg = d3.select("#diversity-container").append("svg")
            .attr("width", props.width + margin.left + margin.right)
            .attr("height", props.height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // add vertical line marking the target %
        svg.append("line")
            .attr("x1", x(props.target))
            .attr("y1", 0)
            .attr("x2", x(props.target))
            .attr("y2", props.height)
            .style("stroke", "#219EBC")
            .style("opacity", "0.5")
            .style("stroke-width", "2")
            .style("stroke-dasharray", "5,5");

        svg.append("text")
            .attr("x", x(props.target))
            .attr("y", 0)
            .attr("dy", "-0.25em")
            .style("text-anchor", "middle")
            .text("Our Goal!")
            // change the text color
            .style("fill", "#219EBC");

        // set the symbol generator
        var symbol = d3.symbol();
        // set size of symbol
        symbol.size(200);

        // add the data points with tooltips
       var dots =  svg.selectAll(".dots")
            .data(props.data)
            .enter()
            .append("path");

        dots.style('cursor', 'pointer')

        dots.attr("d", symbol.type(function(d){
            if(d.user_school == true){
                return d3.symbolTriangle;
            } else {
                return d3.symbolCircle;
            }}))
            .attr("r", 10)
            .attr("fill", function(d){
                if(d.user_school == true){
                    return "#FB8500";
                } else {
                    return "#023047";
            }})
            .attr("transform", function(d) { return "translate(" + x(d.ses_value) + "," + y(d.value) + ")"; })
            .on("mouseover", function(event,d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                // style tooltip
                tooltip.style("background", "lightsteelblue")
                    .style("border", "0px")
                    .style("border-radius", "8px")
                    .style("padding", "2px 2px 2px 6px")
                    .style("font-size", "14px")
                    .style("color", "black")
                    .style("opacity", 1)
                    .style("position", "absolute")
                    .style("text-align", "left")
                    .style("width", "110px")
                    .style("height", "80px")
                    .style("pointer-events", "none")
                tooltip.html(`${d.num_students} students <br/> ${d3.format(".0%")(d.percent_low_ses)} low SES <br/> ${d3.format(".0%")(d.percent_med_ses)} mid SES <br/> ${d3.format(".0%")(d.percent_high_ses)} high SES`)
                    .style("left", (event.pageX - (110/2)) + "px")
                    .style("top", (event.pageY - 110) + "px");
                })

            .on("mouseout", function(d) {
                tooltip.transition()
                .duration(500)
                .style("opacity", 0);
                });

        // add a label below each point
        svg.selectAll(".label")
            .data(props.data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", function(d) { return x(d.ses_value); })
            .attr("y", function(d) { return y(d.value) + 20; })
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text(function(d) { return d.school_name; })
            .call(wrap, 100);

        function wrap(text, width) {
            text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.2, // ems
                    x = text.attr("x"),
                    y = text.attr("y"),
                    dy = 0.2,
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
            });
            }

        // add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + props.height + ")")
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d3.format(".0%"))
            )
            .style("font-size", "16px");

        // add the X Axis label
        svg.append("text")
            .attr("transform", "translate(" + (props.width / 2) + " ," + (props.height + margin.top - 5) + ")")
            .style("text-anchor", "middle")
            .text(props.xLabel);

        // add the legend
        // ref: https://d3-legend.susielu.com/#symbol-ordinal

        // add text in upper middle as subsitute for the legend
        svg.append("text")
            .attr("x", props.width/2)
            .attr("y", -30)
            // .attr("dy", "-0.75em")
            .style("text-anchor", "middle")
            .text("Your school is represented by a triangle.")
            .style("fill", "#FB8500")
            .style("font-size", "16px");
    }

    return (
        <ThemeProvider theme={theme}>
            <div id="diversity-container" />
        </ThemeProvider>
    )

}

export default DiversityFigure;