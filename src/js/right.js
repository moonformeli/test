import * as d3 from "d3";
import * as tree from "./tree";
import { draw } from "./left";

export const initSelectBox = () => {
    let selData = [];
    let gData = tree.getGraph();

    for (let key in gData) {
        selData.push(gData[key]);
    }

    d3.select("#right")
        .append("select")
            .attr("width", 200)
            .attr("height", 50)
            .on("change", onChange)
        .selectAll("option")
        .data(selData)
        .enter()
            .append("option")
                .attr("value", d => d.id)
                .text(d => d.name);
};

export const onChange = () => {
    let id = d3.select("select")
        .property("value");

    let graph = tree.getGraphById(id);

    draw(graph);
    console.log("원본");
    console.dir(graph);
};