import * as d3 from "d3";
import { drawGraph } from "./graph";

let width = window.innerWidth * 0.6;
let height = window.innerHeight;
let layerHeight = height / 7;

console.log("width: " + width);

let minRadius = width * 0.01;
let maxRadius = width * 0.05;
let layerValues = [1, 1, 1, 1, 1, 1];

let radius = 23 * 0.6;
let maxNodesCount = Math.floor(width / (radius * 2));

let data = [
    {
        group: 10,
        htype: "controller",
        id: "controller3",
        image: "/static/img/host.png",
        itype: "node",
        label: "controller3",
        level: 3,
        name: "controller3",
        shape: "image",
        type: "host",
        value: 50
    },
    {
        group: 10,
        htype: "controller",
        id: "controller2",
        image: "/static/img/host.png",
        itype: "node",
        label: "controller2",
        level: 2,
        name: "controller2",
        shape: "image",
        type: "host",
        value: 40
    },
    {
        group: 10,
        htype: "controller",
        id: "controller1",
        image: "/static/img/host.png",
        itype: "node",
        label: "controller1",
        level: 1,
        name: "controller1",
        shape: "image",
        type: "host",
        value: 30
    },
];

let color = [
    '#9D2398',
    '#891F85',
    '#761A72',
    '#62165F',
    '#4F124C',
    '#3B0D39',
    '#270926',
];

let hScale = d3.scaleLinear().domain([0, 7]).range([0, height]);

export const init = () => {
    let svg = d3.select("#left")
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


export const draw = graph => {
    drawGraph(graph);
};

const getNodeSize = (
    sum => {
        let scale = d3.scaleLinear().domain([0, sum]).range([minRadius, maxRadius]).clamp(true);
        return level => scale(level);
    }
)(layerValues.reduce((acc, cal) => acc + cal));