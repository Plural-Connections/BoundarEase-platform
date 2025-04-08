import React, { useEffect } from 'react';
import * as d3 from 'd3';

import { ThemeProvider } from '@emotion/react'
import { theme } from './styles'

const UtilizationFigure = (props) => {
    const { width, height, margin, rawData } = props;

    useEffect(() => {
        drawChart();
    }, [props]);


    // max acceptable utilization
    const data = [rawData.map(school => {
        return {
            school: school["school_name"],
            utilization: 1.3
        }
    })]

    // ideal utilization
    const targetArr = rawData.map(school => {
        return {
            school: school["school_name"],
            utilization: 1
        }
    })

    // actual utilization
    const actualArr = rawData.map(school => {
        return {
            school: school["school_name"],
            utilization: school["num_students"] / school["student_capacity"],
            target_capacity: 1, // keep for tooltip
            num_students: school["num_students"],
            student_capacity: school["student_capacity"]
        }
    })

    data.push(targetArr)
    data.push(actualArr)


    const drawChart = () => {
        // axesLabelFactor is spacing between label and circle)
        // axis circles is # of concentric circles
        const axisCircles = 1, radius = (width - (margin * 4)) / 2, maxValue = 1.5, axisLabelFactor = 1.2, dotRadius = 3;

        // axesDomain is labels
        const axesDomain = data[0].map(school => {
            return school["school"]
        })
        const axesLength = axesDomain.length



        const rScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, radius])

        const angleSlice = Math.PI * 2 / axesLength;

        const radarLine = d3.lineRadial()
            .curve(d3["curveLinearClosed"])
            .radius(d => rScale(d))
            .angle((d, i) => i * angleSlice);

        // max acceptable, ideal, actual
        const color = d3.scaleOrdinal()
            .range(["#8ECAE6", "#219EBC", "#FFB703"])

        // define the tooltip
        var tooltip = d3.select("#utilization-container").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute");


        // wipe off the old chart before plotting the new one
        d3.select('#utilization-container')
            .select('svg')
            .remove();

        const svg = d3
            .select('#utilization-container')
            .append('svg')
            .attr('width', width + margin * 2)
            .attr('height', height + (margin * 5))

        const containerWidth = width - (margin * 2);
        const containerHeight = height - (margin * 2);
        const container = svg.append('g')
            .attr("width", containerWidth)
            .attr("height", containerHeight)
            .attr('transform', `translate(${(width / 2) + margin}, ${(height / 2) + margin * 3})`)

        // legend
        svg.append('circle')
            .attr('cx', 6)
            .attr('cy', 8)
            .attr('r', 6)
            .style('fill', color(0))
        svg.append('circle')
            .attr('cx', 6)
            .attr('cy', 38)
            .attr('r', 6)
            .style('fill', color(1))
        svg.append('circle')
            .attr('cx', 6)
            .attr('cy', 68)
            .attr('r', 6)
            .style('fill', color(2))
        svg.append("text")
            .attr("x", 16)
            .attr("y", 8)
            .text("Acceptable utilization")
            .style("font-size", "14px")
            .attr("alignment-baseline", "middle")
        svg.append("text")
            .attr("x", 16)
            .attr("y", 38)
            .text("Ideal utilization")
            .style("font-size", "14px")
            .attr("alignment-baseline", "middle")
        svg.append("text")
            .attr("x", 16)
            .attr("y", 68)
            .text("Actual utilization")
            .style("font-size", "14px")
            .attr("alignment-baseline", "middle")


        var axisGrid = container.append("g")
            .attr("class", "axisWrapper");

        // concentric circles
        axisGrid.selectAll(".levels")
            .data(d3.range(1, (axisCircles + 1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", (d, i) => radius / axisCircles * d)
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", 0.1);

        const axis = axisGrid.selectAll(".axis")
            .data(axesDomain)
            .enter()
            .append("g")
            .attr("class", "axis");

        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "14px")
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("dy", "0.35em")
            .attr("x", (d, i) => rScale(1.8 * axisLabelFactor) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => rScale(1.5 * axisLabelFactor) * Math.sin(angleSlice * i - Math.PI / 2))
            .text(d => d)
            .call(wrap, 100);


        function wrap(text, width) {
            text.each(function () {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    x = text.attr("x"),
                    y = text.attr("y"),
                    dy = 0, 
                    tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
                    }
                }
            });
        }

        const plots = container.append('g')
            .selectAll('g')
            .data(data)
            .join('g')
            .attr("fill", (d, i) => color(2))
            .attr("fill-opacity", 0.5);

        plots.append('path')
            .attr("d", d => radarLine(d.map(v => v.utilization)))
            .attr("fill", (d, i) => color(i))
            .attr("fill-opacity", 0.5);

        plots.selectAll("circle")
            .data(data[2])
            .join("circle")
            .attr("stroke", (d, i) => color(2))
            .attr("stroke-width", 1.5)
            .attr("r", dotRadius)
            .attr("cx", (d, i) => rScale(d.utilization) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("cy", (d, i) => rScale(d.utilization) * Math.sin(angleSlice * i - Math.PI / 2))
            .style("fill-opacity", 0.6)
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                // style tooltip
                tooltip.style("background", "lightsteelblue")
                    .style("border", "0px")
                    .style("border-radius", "8px")
                    .style("padding", "8px")
                    .style("font-size", "14px")
                    .style("color", "black")
                    .style("opacity", 1)
                    .style("position", "absolute")
                    .style("text-align", "left")
                    .style("min-width", "160px")
                    .style("min-height", "80px")
                    .style("pointer-events", "none")
                tooltip.html(
                    `<b>Utilization</b><br />
                    Actual: ${d3.format(".0%")(d.utilization)}<br/>
                    Target: ${d3.format(".0%")(d.target_capacity)}<br /><br />
                    <b>Student Enrollment</b><br />
                    Actual: ${d.num_students}<br />
                    Target: ${d.student_capacity}`)
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px");
            })

            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        return svg.node();
    }


    return (
        <ThemeProvider theme={theme}>
            <div id="utilization-container" />
        </ThemeProvider>
    )
}

export default UtilizationFigure;