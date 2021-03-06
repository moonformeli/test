import * as d3 from "d3";

export const init = () => {
    let layer = document.getElementById("leftside");
    let width = layer.clientWidth * 1;
    let height = layer.clientHeight;
    let layerHeight = height / 7;

    let color = [
        '#242424',
        '#2f2f2f',
        '#3a3a3a',
        '#454545',
        '#505050',
        '#5b5b5b',
        '#666666',
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