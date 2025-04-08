import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";
import legend from 'd3-svg-legend';

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sankey-diagram
export default function Sankey(
    { links, svgRef },
    {
      nodes,
      // an iterable of link objects (typically [{source, target}, …]
      format = ",", // a function or format specifier for values in titles
      align = "justify", // convenience shorthand for nodeAlign
      nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
      nodeGroup, // given d in nodes, returns an (ordinal) value for color
      nodeGroups, // an array of ordinal values representing the node groups
      nodeLabel, // given d in (computed) nodes, text to label the associated rect
      nodeTitle = (d) => `${d.id}\n${format(d.value)}`, // given d in (computed) nodes, hover text
      nodeAlign = align, // Sankey node alignment strategy: left, right, justify, center
      nodeWidth = 15, // width of node rects
      nodePadding = 10, // vertical separation between adjacent nodes
      nodeLabelPadding = 6, // horizontal separation between node and label
      nodeStroke = "currentColor", // stroke around node rects
      nodeStrokeWidth, // width of stroke around node rects, in pixels
      nodeStrokeOpacity, // opacity of stroke around node rects
      nodeStrokeLinejoin, // line join for stroke around node rects
      linkSource = ({ source }) => source, // given d in links, returns a node identifier string
      linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
      linkValue = ({ value }) => value, // given d in links, returns the quantitative value
      linkPath = d3Sankey.sankeyLinkHorizontal(), // given d in (computed) links, returns the SVG path
      linkTitle = (d) => `${d.source.id} → ${d.target.id}\n${format(d.value)}`, // given d in (computed) links
      linkColor = "source-target", // source, target, source-target, or static color
      conditionalLink = false,
      linkStrokeOpacity = 0.5, // link stroke opacity
      linkMixBlendMode = "multiply", // link blending mode
      colors = d3.schemeTableau10, // array of colors
      width = 640, // outer width, in pixels
      height = 400, // outer height, in pixels
      marginTop = 5, // top margin, in pixels
      marginRight = 1, // right margin, in pixels
      marginBottom = 5, // bottom margin, in pixels
      marginLeft = 1 // left margin, in pixels
    } = {}
  ) {
    // Convert nodeAlign from a name to a function (since d3-sankey is not part of core d3).
    if (typeof nodeAlign !== "function") {
      nodeAlign =
        {
          left: d3Sankey.sankeyLeft,
          right: d3Sankey.sankeyRight,
          center: d3Sankey.sankeyCenter
        }[nodeAlign] ? [nodeAlign] : d3Sankey.sankeyJustify;
    }    
    // Compute values.
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    const LV = d3.map(links, linkValue);
    if (nodes === undefined)
      nodes = Array.from(d3.union(LS, LT), (id) => ({ id }));
    const N = d3.map(nodes, nodeId).map(intern);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (val, i) => ({ id: N[i], name: val.name }));
    // nodes = d3.map(nodes, (_, i) => ({ id: N[i] }));
    links = d3.map(links, (val, i) => ({
      source: LS[i],
      target: LT[i],
      value: LV[i],
      is_split: val.is_split,
    }));

    // console.log(links);
  
    // Ignore a group-based linkColor option if no groups are specified.
    if (!G && ["source", "target", "source-target"].includes(linkColor))
      linkColor = "currentColor";
  
    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = G;
    // Construct the scales.
    const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);
  
    // Compute the Sankey layout.
    d3Sankey
      .sankey()
      .nodeId(({ index: i }) => N[i])
      .nodeAlign(nodeAlign)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .extent([
        [marginLeft, marginTop],
        [width - marginRight, height - marginBottom]
      ])({ nodes, links });

    // Compute titles and labels using layout nodes, so as to access aggregate values.
    if (typeof format !== "function") format = d3.format(format);
    const Tl =
      nodeLabel === undefined
        ? N
        : nodeLabel == null
        ? null
        : d3.map(nodes, nodeLabel);
    const Tt = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const Lt = linkTitle == null ? null : d3.map(links, linkTitle);
  
    // A unique identifier for clip paths (to avoid conflicts).
    const uid = `O-${Math.random().toString(16).slice(2)}`;
  
    const svg = d3.select(svgRef.current);
  
    svg.selectAll("*").remove();
  
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    const node = svg
      .append("g")
      .attr("stroke", nodeStroke)
      .attr("stroke-width", nodeStrokeWidth)
      .attr("stroke-opacity", nodeStrokeOpacity)
      .attr("stroke-linejoin", nodeStrokeLinejoin)
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      // on hover lower opacity
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.9);
      })
      .on("mouseout", function (d) {
        d3.select(this).attr("opacity", 1);
      });

      
    node.style('cursor', 'pointer')
  
    if (G) node.attr("fill", ({ index: i }) => color(G[i]));
    if (Tt) {
      node.append("title")
          .text(({ index: i }) => Tt[i]);
    }
  
    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", linkStrokeOpacity)
      .selectAll("g")
      .data(links)
      .join("g")
      .style("mix-blend-mode", linkMixBlendMode);
  
    if (linkColor === "source-target")
      link
        .append("linearGradient")
        .attr("id", (d) => `${uid}-link-${d.index}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", (d) => d.source.x1)
        .attr("x2", (d) => d.target.x0)
        .call((gradient) =>
          gradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", ({ source: { index: i } }) => color(G[i]))
        )
        .call((gradient) =>
          gradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", ({ target: { index: i } }) => color(G[i]))
        );

    // if conditionalLink is true then vary the link color based on the is_split attribute
    if (conditionalLink) {
      link
        .append("path")
        .attr("d", linkPath)
        .attr(
          "stroke",
          ({ is_split }) => (is_split ? "#FFB703" : linkColor)
        )
        .attr("stroke-width", ({ width }) => Math.max(1, width))
        // change stroke opacity on hover
        .on("mouseover", function () {
          d3.select(this).attr("stroke-opacity", 0.35);
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke-opacity", linkStrokeOpacity);
        })
        .call(
          Lt
            ? (path) => path.append("title")
                              .text(({ index: i }) => Lt[i])
            : () => {}
        );
    } else {
      link
        .append("path")
        .attr("d", linkPath)
        .attr(
          "stroke",
          linkColor === "source-target"
            ? ({ index: i }) => `url(#${uid}-link-${i})`
            : linkColor === "source"
            ? ({ source: { index: i } }) => color(G[i])
            : linkColor === "target"
            ? ({ target: { index: i } }) => color(G[i])
            : linkColor
        )
        .attr("stroke-width", ({ width }) => Math.max(1, width))
        // change stroke opacity on hover
        .on("mouseover", function () {
          d3.select(this).attr("stroke-opacity", 0.35);
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke-opacity", linkStrokeOpacity);
        })
        .call(
          Lt
            ? (path) => path.append("title")
                              .text(({ index: i }) => Lt[i])
            : () => {}
        );
    }

    link.style('cursor', 'pointer')
  
    if (Tl)
      svg
        .append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 14)
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", (d) =>
          d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding
        )
        .attr("y", (d) => (d.y1 + d.y0) / 2)
        .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
        .text(({ index: i }) => Tl[i])
        .call(wrap, 300);

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

    // add the legend
    var ordinal = d3.scaleOrdinal()
      .domain(["a", "b", "c", "d", "e", "f"])
      .range([ "#8ECAE6", "#219EBC", "#023047", "#FB8500", "#D9D9D9", "#FADB92"]);

    svg.append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", "translate(10,0)");

    var legendOrdinal = legend.legendColor()
      //d3 symbol creates a path-string, for example
      //"M0,-8.059274488676564L9.306048591020996,
      //8.059274488676564 -9.306048591020996,8.059274488676564Z"
      .scale(ordinal)
      .shape("path", d3.symbol().type(d3.symbolSquare).size(300)())
      .orient('horizontal')
      .labels(["Elementary Schools", "Middle Schools", "High Schools", "Your Schools", 
                "Feeder Patterns", "Split Patterns"])
      .labelWrap(80)
      .labelAlign("start")
      .shapePadding(96);

    svg.select(".legendOrdinal")
      .call(legendOrdinal);


    // add text in upper middle of chart 
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", marginTop / 1.25)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("Middle Schools");

    // add text in upper left of chart
    svg.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop / 1.25)
        .attr("text-anchor", "left")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("Elementary Schools");

    // add text in upper right of chart
    svg.append("text")
        .attr("x", width - 100)
        .attr("y", marginTop / 1.25)
        .attr("text-anchor", "right")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("High Schools");
  
    function intern(value) {
      return value !== null && typeof value === "object"
        ? value.valueOf()
        : value;
    }
    Object.assign(svg.node(), { scales: { color } });
  }