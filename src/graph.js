import * as d3 from "d3";
import * as _ from "lodash";
import * as tree from "./tree";

let width = window.innerWidth * 0.6;
let height = window.innerHeight;
let layerHeight = height / 7;
let marginBottom = layerHeight / 2;

// let radius = 23 * 0.;
let radius = width * 0.05 > 50 ? 50 : width * 0.05;

let hScale = d3.scaleLinear().domain([0, 7]).range([0, height]);

export const drawGraph = graph => {
    let filteredGraph = makeGrouping(makeNodesData(graph));
    removeGraph();
    addGraph();
    addLayers();
    drawEdges(filteredGraph);
    drawNodes(filteredGraph);
};

////////////// SETTER & MAKE //////////////

const makeGrouping = graph => {
    if (!needGrouping()) {
        return graph;
    } else {
        return graph;
    }
};

const makeNodesData = graph => {
    let nodesCountPerLayer = new Array(8).fill(0);
    let startPositionPerLayer = new Array(8).fill(width / 2);
    let paddingPerLayer = new Array(8).fill((width - radius * 2) / 2);
    let positionStepPerLayer = new Array(8).fill((width / 2));

    // 각 계층의 노드 카운트 계산
    nodesCountPerLayer = getNodesCount(graph, nodesCountPerLayer);

    // 노드 카운트 개수를 이용해 각 계층의 padding(남는 공간)
    paddingPerLayer = getPaddings(nodesCountPerLayer, paddingPerLayer);

    // 노드 카운트 개수와 padding 을 이용해 최초 노드의 시작지점을 계산
    startPositionPerLayer = getStartPositions(
        paddingPerLayer,
        nodesCountPerLayer,
        startPositionPerLayer
    );

    // 각 계층에서 한 노드를 그리고 다음 노드를 그릴 때 얼마만큼 옆으로 가서 그려야하는지에 대한 값 계산
    positionStepPerLayer = getPositionSteps(
        paddingPerLayer,
        nodesCountPerLayer,
        positionStepPerLayer
    );

    // 그래프 edge 정보 추가
    return makeGraphEdges(graph, startPositionPerLayer, positionStepPerLayer);
};

const makeGraphEdges = (graph, pos, stps) => {
    let newGraph = _.cloneDeep(graph);
    let positions = [].concat(pos);
    let steps = [].concat(stps);
    let nodes = Object.keys(graph);

    for (let i = 0; i < nodes.length; i++) {
        let id = nodes[i];
        let node = newGraph[id];
        let level = node.level;

        let position = positions[level];
        positions[level] += steps[level];

        node.position = position;
    }

    return newGraph;
};

////////////// GETTER //////////////

// 각 계층의 노드 카운트 계산
const getNodesCount = (graph, counts) => {
    let newCounts = [].concat(counts);
    graph.map( ({ level }) => newCounts[level] += 1 );

    return newCounts;
};

// FIXME - 위키에 padding의 복수형은 paddings 라고 나와 있음
// 노드 카운트 개수를 이용해 각 계층의 padding(남는 공간)
const getPaddings = (counts, paddings) => {
    let newPaddings = [].concat(paddings);
    counts.map((count, i) => {
        newPaddings[i] = count ? (width - (radius * 2) * count) / 2 : newPaddings[i];
    });
    
    return newPaddings;
};

// 노드 카운트 개수와 padding 을 이용해 최초 노드의 시작지점을 계산
const getStartPositions = (paddings, counts, positions) => {
    let newCounts = [].concat(counts);
    let newPositions = [].concat(positions);

    paddings.map((padding, i) => {
        let count = newCounts[i];
        let pageWidth = width / count;
        let startPosition = pageWidth / 2;
        newPositions[i] = count ? startPosition : newPositions[i];
    });

    return newPositions;
};

// 각 계층에서 한 노드를 그리고 다음 노드를 그릴 때 얼마만큼 옆으로 가서 그려야하는지에 대한 값 계산
const getPositionSteps = (paddings, counts, steps) => {
    let newSteps = [].concat(steps);
    let newCounts = [].concat(counts);

    paddings.map((padding, i) => {
        let count = newCounts[i];
        let pageWidth = width / count / 2;
        let step = pageWidth * 2;
        newSteps[i] = count ? step : newSteps[i];
    });

    return newSteps;
};

const getSameLevelNodes = (graph, level) => graph.filter(node => node.level === level);

////////////// DRAW //////////////

const drawNodes = graph => {
    for (let level = 1; level <= 7; level++) {
        addNodes(level, graph.filter(node => node.level === level));
    }
};

const drawEdges = graph => {
    for (let level = 1; level <= 6; level++) {
        addEdges(level, getSameLevelNodes(graph, level), getSameLevelNodes(graph, level + 1));
    }
};

// 그래프 그룹 삭제
const removeGraph = () => {
    d3.select("#svg-left").select(".graph")
        .remove();
};

// 그래프 그룹 추가
const addGraph = () => {
    // 노드 그리기
    d3.select("#svg-left").selectAll(".graph")
        .data([1])
        .enter()
        .append("g")
            .attr("class", "graph");
};

// 7 계층 그룹 추가
const addLayers = () => {
    // path group
    d3.select("#svg-left")
        .select(".graph")
        .selectAll("paths")
        .data([1])
        .enter()
        .append("g")
        .attr("class", "paths")
        .selectAll(".layer-")
        .data(new Array(7).fill(0))
        .enter()
        .append("g")
        .attr("class", (d, i) => "layer edge-" + (i + 1));

    // node group
    d3.select("#svg-left")
        .select(".graph")
        .selectAll("nodes")
            .data([1])
            .enter()
            .append("g")
                .attr("class", "nodes")
                .selectAll(".layer-")
                    .data(new Array(7).fill(0))
                    .enter()
                    .append("g")
                        .attr("class", (d, i) => "layer layer-" + (i + 1));
};

// 각 계층에 맞는 노드 추가
const addNodes = (level, graph) => {
    d3.select(".layer-" + level)
        .selectAll("circle")
        .data(graph)
        .enter()
        .append("circle")
            .attr("cx", ({ position }) => position)
            .attr("cy", ({ level }) => hScale(level) - marginBottom)
            .attr("r", radius)
            .attr("fill", "white")
            .attr("stroke", "green")
            .attr("stroke-width", 1.5);
};

// 노드들을 잇는 라인 추가
const addEdges = (level, parentGraph, childGraph) => {
    let parentLevel = level;
    let childLevel = level + 1;
    let childrenPositions = {};

    let edge = d3.select(".edge-" + parentLevel);

    childGraph.map(child => {
        childrenPositions[child.id] = child.position;
    });

    parentGraph.map(parent => {
        let children = parent.children;

        children.map(child => {
            console.dir(child);
            if (!hasNode(childGraph, child)) {
                return;
            }

            let x1 = parent.position;
            let y1 = hScale(parentLevel) - marginBottom;
            let x2 = childrenPositions[child];
            let y2 = hScale(childLevel) - marginBottom;
            let points = [{x: x1, y: y1}, {x: x2, y: y2}];

            console.log(points);
            let line = d3.line()
                .x(d => d.x)
                .y(d => d.y)
                .curve(d3.curveMonotoneX);

            edge.selectAll(".edge--")
                .data(points)
                .enter()
                .append("path")
                .attr("d", line(points))
                .attr("stroke", "orange")
                .attr("stroke-width", 2)
                .attr("fill", "orange");

        });
    });
};

////////////// CHECK //////////////

// 그룹핑 해야하는지 여부 반환
const needGrouping = () => {
    let needGroup = false;
    return needGroup;
};

const hasNode = (graph, id) => {
    console.dir(graph);
    console.dir(id);
    for (let i = 0; i < graph.length; i++) {
        if (graph[i].id === id) {
            console.log("있음");
            return true;
        }
    }

    console.log("없음");
    return false;
};