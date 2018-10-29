import * as d3 from "d3";

export const init = () => {
    let layer = document.getElementById("leftside");
    let width = layer.clientWidth * 1;
    let height = layer.clientHeight;
    let layerHeight = height / 7;

    let color = [
        '#9D2398',
        '#891F85',
        '#761A72',
        '#62165F',
        '#4F124C',
        '#3B0D39',
        '#270926',
    ];

    let svg = d3.select("#layer")
        .append("svg")
            .attr("id", "svg-left")
            .attr("width", width)
            .attr("height", height)
            .style("border", "1px solid red");

    // 칸 만들기
    svg.append("g")
            .attr("class", "layer")
        .selectAll("rect")
        .data(color)
        .enter()
            .append("rect")
                .attr("x", 0)
                .attr("y", (d, i) => (height / 7) * i)
                .attr("width", width)
                .attr("height", layerHeight)
                .attr("fill", (d, i) => color[i]);
};