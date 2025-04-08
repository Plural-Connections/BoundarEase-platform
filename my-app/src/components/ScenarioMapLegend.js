import * as d3 from "d3";
import legend from 'd3-svg-legend';
// https://d3-legend.susielu.com/

const ScenarioMapLegend = (props, svgRef) => {
    const { schoolData, colorMapping, smallScreen } = props;

    // get school names
    const getData = (arr, key) => {
        if (key == 'name') {
            let data = []

            for (const school in arr) {
                data.push(arr[school][key])
            }

            return data
        } else {
            return Object.values(arr)
        }

    }

    const svg = d3.select(svgRef.current);

    var ordinal = d3.scaleOrdinal()
        .domain(getData(schoolData, 'name'))
        .range(getData(colorMapping, 'colors'));

    // determines attributes based on device size
    let height = 0;
    if(smallScreen) {
        height =  getData(schoolData, 'name').length * 58
    } else {
        height = 50
    }

    let width = 0;
    if(smallScreen) {
        width = 400
    } else {
        width = 850
    }

    svg
        .attr("height", height)
        .attr("width", width)

    svg.append("text")
       .attr("x", 0)
       .attr("y", 20)
       .attr("font-weight", 500)
       .text("Schools") 

    svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", () => {
            if(smallScreen) {
                return "translate(0,50)"
            } else {
                return "translate(10,40)"
            }
            });

    var legendOrdinal = legend.legendColor()
        .scale(ordinal)
        .shape("path", d3.symbol().type(d3.symbolSquare).size(500)())
        .orient(smallScreen ? 'vertical' : 'horizontal')
        .labelAlign("start")
        .labelWrap(160)
        .shapePadding(smallScreen ? 20 : 160);
        // .title("Schools");

    svg.select(".legendOrdinal")
        .call(legendOrdinal);

}


export default ScenarioMapLegend;
