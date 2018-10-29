import vis from "vis";
import * as d3 from "d3";
import $ from "jquery";
import { init } from "./left";
import { initGraph, getGraphById } from "./store";
import { drawGraph } from "./graph";

init();

var path = require("path");

var nodes = null;
var edges = null;
var network = null;
var layer_map = null;

// var DIR = '../static/img/';
var DIR = './img/';
// var DIR = path.join(__dirname, "../../static/img/");
var EDGE_LENGTH_MAIN = 150;
var EDGE_LENGTH_SUB = 50;
var rawdata;
var nodeDataSet;
var edgeDataSet;

var maxScale = 4;
var clusterIndex = 0;
var clusters = [];
var lastClusterZoomLevel = 0;
var clusterFactor = 0.9;
var upperNodes;
var lowerNodes;
var universe_network;
var layer_network;
var _nodeId;

// Called when the Visualization API is loaded.

var imageArray = ["prometheus", "postgresql", "postgres", "jaeger", "zipkin", "grafana"]
var visNodeType = ["center", "node", "pod", "service", "volume", "instance", "host", "network", "openstack", "kubernetes"]

// var nodes = null;
// var edges = null;
// var network = null;

// var DIR = '/static/img/';
// var EDGE_LENGTH_MAIN = 150;
// var EDGE_LENGTH_SUB = 50;

// Called when the Visualization API is loaded.

function openLayer() {
    document.getElementById("leftside").style.width = "400px";
    document.getElementById("universe_all").style.marginLeft = "400px";

    $("#layer svg").remove();
    debugger;
    init();
}

function closeLayer() {
    document.getElementById("leftside").style.width = "0";
    document.getElementById("universe_all").style.marginLeft= "0";
}

function boxString(str, len) {
    var _str = "";
    for (var i = 0; i < str.length; i = i + len) {
        _str = _str + str.substr(i, len) + "\n"
    }
    return _str;
}

function makeDownTree(nodeId) {
    var filterNode = [];

    var edgeNums = [];
    edgeDataSet.forEach(function (_edge, i) {
        if (_edge.from === nodeId) {
            edgeNums.push(_edge.to);
        }
    });

    edgeNums.forEach(function (_num, i) {
        var _node = nodeDataSet.get(_num);
        if ( _node == undefined ) {
            return;
        }
        filterNode.push(_node);
        if (_node.level < 7) {
            var _fNodes = makeDownTree(_node.id);
            filterNode = filterNode.concat(_fNodes);
        }
    });

    return filterNode;
}

function makeUpTree(nodeId) {
    var filterNode = [];

    var edgeNums = [];
    edgeDataSet.forEach(function (_edge, i) {
        if (_edge.to === nodeId) {
            edgeNums.push(_edge.from);
        }
    });

    edgeNums.forEach(function (_num, i) {
        var _node = nodeDataSet.get(_num);
        if ( _node == undefined ) {
            return;
        }
        filterNode.push(_node);
        if (_node.level > 1) {
            var _fNodes = makeUpTree(_node.id);
            filterNode = filterNode.concat(_fNodes);
        }
    });

    return filterNode;
}

function uniqBy(a, key) {
    var seen = {};
    return a.filter(function(item) {
        if (item == null) {
            return false;
        }
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}

function layer_draw(nodeId) {

    // var selectNode = nodeData.filter(function (_node) {
    //   return _node.id === nodeNum;
    // });

    drawGraph(getGraphById(nodeId));

    var choiceNode = nodeDataSet.get(nodeId);
    // console.log(choiceNode)
    var selectNode = [choiceNode];
    var downNode = makeDownTree(nodeId);
    var upNode = makeUpTree(nodeId);

    selectNode = selectNode.concat(downNode);
    selectNode = selectNode.concat(upNode);

    selectNode = uniqBy(selectNode, JSON.stringify);

    var selectEdge = [];

    selectEdge = edgeDataSet;

    // create a network
    var container = document.getElementById('layer');
    var data = {
        nodes: selectNode,
        edges: selectEdge
    };
    var options = {
        nodes: {
            font: {
                color: '#efefef'
            }
        },
        autoResize: false,
        width: '400px',
        edges: {
            smooth: {
                type: 'cubicBezier',
                roundness: 0.4
            }
        },
        layout: {
            hierarchical: {
                sortMethod: 'directed',
                direction: 'DU',
                levelSeparation: 150,
                nodeSpacing: 130,
                treeSpacing: 100,
                parentCentralization: false,
                blockShifting: true
            }
        },
        interaction: { dragNodes: false },
        physics: {
            enabled: false
        }
        /*
                configure: {
                  filter: function (option, path) {
                      if (path.indexOf('hierarchical') !== -1) {
                          return true;
                      }
                      return false;
                  },
                  showButton:false
                }
        */
    };
    // console.log(data)

    function selectNode(params){
        _nodeId = params["nodes"][0];
        // universe_network.unselectAll();
        // console.log(_nodeId);
        // universe_network.selectNodes([_nodeId]);
        universe_network.focus(_nodeId, { animation: { duration: 1000 } });
        // if (universe_network.isCluster(_nodeId) == true) {
        //   _choiceNode = nodeDataSet.get(_nodeId);
        // } else {
        // }
    }

    // layer_network = new vis.Network(container, data, options);
    // layer_network.on("click", function (params) {
    //     if (params["nodes"][0] != undefined) {
    //         universe_network.focus(params["nodes"][0], { animation: { duration: 1000 } });
    //         layer_network.selectNodes(_nodeIds);
    //     }
    //     // universe_network.selectNodes([params["nodes"][0]]);
    //     // edgeHighlight(params["nodes"][0]);
    // });

    var _nodeIds = []
    selectNode.forEach(function (_node, i) {
        if(_node.level < 7){
            _nodeIds.push(_node.id);
        }
    });
    // console.log(_nodeIds)
    universe_network.selectNodes(_nodeIds);
    // layer_network.selectNodes(_nodeIds);
}

function edgeHighlight(nodeId) {
    var connectedEdges = universe_network.getConnectedEdges(nodeId);
    edgeDataSet.forEach(function (_edge, i) {
        var _id = _edge.id;
        var _color = _edge.color.color;
        edgeDataSet.update({
            id: _id,
            color: {
                color: _color,
                highlight: _color,
                opacity: 0.1
            }
        });
    });
    connectedEdges.forEach(function (_id, i) {
        var _color = edgeDataSet.get(_id).color.color;
        if (_id == null) {
        } else {

            edgeDataSet.update({
                id: _id,
                color: {
                    color: _color,
                    highlight: _color,
                    opacity: 1
                }
            });
        }
    });
}

function getIcon(str, typeStr) {

    var prefix = str.split("-")[0];
    if (imageArray.includes(prefix)) {
        // return DIR + prefix + '.png';
        return '' + require(DIR + prefix + '.png');
    } else {
        return '' + require(DIR + typeStr + '.png');
    }
}

function value2VisData(obj) {
    if (obj.itype == "node") {
        var n = obj;
        n.image = getIcon(n.name, n.type)
        n.shape = 'image'
        n.label = boxString(n.name, 18);
        n.value = 0.1;
        switch (obj.type) {
        //     case "availability-zone":
        //         n.value = 40
        //         break;
        //     case "region":
        //         n.value = 60
        //         break;
        //     case "volume":
        //         n.value = 5
        //         break;
        //     case "instance":
        //         n.value = 40
        //         break;
        //     case "host":
        //         n.value = 40
        //         break;
        //     case "network":
        //         n.value = 40
        //         break;
        }

        return n;
    } else if (obj.itype == "edge") {
        var e = obj
        e.width = 3
        e.color = {}
        // e.color.color = "#101010"
        if (e._from != undefined) {
            e.from = e._from
        }
        if (e._to != undefined) {
            e.to = e._to
        }
        // switch (e.type) {
        //     case "center-node":
        //         e.length = 150
        //         // e.color.color = "#DB4E4E"
        //         e.color.highlight = "#DB4E4E"
        //         break;
        //     case "node-pod":
        //         e.length = 100
        //         // e.color.color = "#33ABF9"
        //         e.color.highlight = "#33ABF9"
        //         break;
        //     case "pod-service":
        //         // e.length = 100
        //         // e.color.color = "#C7EA46"
        //         e.color.highlight = "#C7EA46"
        //         break;
        //     case "host-instance":
        //         e.length = 150
        //         // e.color.color = "#507DA0"
        //         e.color.highlight = "#507DA0"
        //         break;
        //     case "host-volume":
        //         e.length = 150
        //         // e.color.color = "#DAB637"
        //         e.color.highlight = "#DAB637"
        //         break;
        //     case "instance-volume":
        //         e.length = 150
        //         // e.color.color = "#DAB637"
        //         e.color.highlight = "#DAB637"
        //         break;
        //     case "az-host":
        //         // e.length = 200
        //         // e.color.color = "#606B23"
        //         e.color.highlight = "#606B23"
        //         break;
        //     case "region-az":
        //     case "region-node":
        //         // e.length = 200
        //         // e.color.color = "#712527"
        //         e.color.highlight = "#712527"
        //         break;
        //     case "node-node":
        //         e.length = 50
        //         // e.color.color = "#712527"
        //         e.color.highlight = "#712527"
        //         break;
        //     default:
        //         // console.log(e)
        //         // e.color.color = "#C7EA46"
        //         e.color.highlight = "#C7EA46"
        //         break;
        // }
        return e;
    }

    console.log(obj)
    console.log(obj.type)
    console.log("error case")
}

function chooseEdges (values, id, selected, hovering){
    var nodeIds = id.split('---');
    if(upperNodes[nodeIds[1]] || lowerNodes[nodeIds[0]] || lowerNodes[nodeIds[1]]){
        values.color = '#ba5';
        values.width = 5;
        values.opacity = 1;
    }
}

function universe_draw(obj) {    
    // Create a data table with nodes.
    nodes = [];

    // Create a data table with links.
    edges = [];

    for (var i = 0; i <= obj.node.length - 1; i++) {
        var o = obj.node[i];
        // console.log(o)
        if (o.type == "kubernetes" || o.type == "network" || o.type == "volume") {
        // if (o.type == "kubernetes") {
            continue;
        }
        if (o.htype != undefined && o.htype == "block") {
            continue;
        }
        nodes.push(value2VisData(o));
    }

    for (var i = 0; i <= obj.edge.length - 1; i++) {
        var e = obj.edge[i];
        // console.log(e)
        edges.push(value2VisData(e));
    }

    nodeDataSet = new vis.DataSet(nodes);
    edgeDataSet = new vis.DataSet(edges);
    var sortedNodeDateset = nodes;

    // console.log(edgeDataSet)

    // create a network

    // copy --------------------------------------
    var sortedNodeDateset = nodeDataSet.get({
        filter: function (item) {
            return item.level == 1
        }
    });
    var choiceNode = sortedNodeDateset[0];
    // var upNode = makeUpTree(choiceNode.id);
    var downNode = makeDownTree(choiceNode.id);
    // sortedNodeDateset = sortedNodeDateset.concat(upNode);
    sortedNodeDateset = sortedNodeDateset.concat(downNode);
    sortedNodeDateset = uniqBy(sortedNodeDateset, JSON.stringify);
    sortedNodeDateset = new vis.DataSet(sortedNodeDateset);
    // copy --------------------------------------    
    

    var container = document.getElementById('universe');
    var data = {
        // nodes: nodeDataSet,
        nodes: sortedNodeDateset,
        edges: edgeDataSet
    };
    var options = {
        edges: {
            // dashes: true,
            color: {
                opacity: 0.3,
                color: '#777',
                highlight: '#ba5',
            },                
            // smooth: {
            //   type: 'cubicBezier',
            //   roundness: 0.2
            // }

            chosen: {
                edge: chooseEdges,                
            },
        },
        nodes: {
            font: {
                color: '#efefef'
            },
            scaling: {
                label: {
                    min: 30,
                    max: 50
                },
                min: 30,
                max: 70
            }
        },
        // physics:{
        //     enabled: true,
        //         barnesHut: {
        //         gravitationalConstant: -3000,
        //         centralGravity: 0.15,
        //         springLength: 95,
        //         springConstant: 0.04,
        //         damping: 0.09,
        //         avoidOverlap: 1
        //     }
        // },
        layout: {
            // randomSeed: 1,
            hierarchical: {
                sortMethod: 'directed',
                // sortMethod: 'hubsize',
                direction: 'UD',
                levelSeparation: 400,
                nodeSpacing: 300,
                treeSpacing: 300,
                parentCentralization: true,
                blockShifting: false,
              }
        },
        // autoResize: false,
        interaction: {dragNodes :false, zoomView: false},
        physics:{ enabled: false},
        // physics:{
        //     enabled: true,
        //     // barnesHut: {
        //     //     gravitationalConstant: -3000,
        //     //     centralGravity: 1.15,
        //     //     springLength: 1,
        //     //     springConstant: 0.04,
        //     //     damping: 0.09,
        //     //     avoidOverlap: 0
        //     // }
        //     hierarchicalRepulsion:{
        //         nodeDistance: 300, // 120
        //         centralGravity: 0, // 0.0
        //         spanLength: 10, // 100
        //         springConstant: 10000, // 0.01
        //         damping: 10, // 0.09
        //     }
        // },
    }
    /*
            edges: {
              smooth: {
                type: 'cubicBezier',
                            roundness: 0.4
                        }
                    },
            layout: {
              hierarchical: {
                sortMethod: 'directed',
                direction: 'UD',
                levelSeparation:150,
                nodeSpacing:130,
                treeSpacing:100,
                parentCentralization:false,
                blockShifting:true
              }
            },
            interaction: {dragNodes :false},
            physics: {
                enabled: false
            }
            configure: {
              filter: function (option, path) {
                  if (path.indexOf('hierarchical') !== -1) {
                      return true;
                  }
                  return false;
              },
              showButton:false
            }
        };
    */
    universe_network = new vis.Network(container, data, options);

    universe_network.on('initRedraw', function () {
        // var radius = 1000;
        // var ids = data.nodes.getIds();    
        // var d = 2 * Math.PI / ids.length // Angular pitch
        // ids.forEach(function(id, i) {
        //   var x = radius * Math.cos(d * i)
        //   var y = radius * Math.sin(d * i)
        //   universe_network.moveNode(id, x, y)
        // })
        // var items = data.nodes.get({
        //     filter: function (item) {
        //         return item.level == 2
        //     }
        // });
        // var radius = 100;
        // var count = len = items.length;
        // var d = 2*Math.PI/count;
        // for (var i = 0; i < count; i++) {
        //     universe_network.moveNode(items[i].id, radius*Math.cos(d*i), radius*Math.sin(d*i));
        // }

    })


    universe_network.on("selectNode", function (params) {
        // params.event = "[original event]";
        // console.log(JSON.stringify(params, null, 4))
        // console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
        // console.log('click event, getNodeAt returns: ' + params["nodes"][0]);
        // selectNode(params);

        // edgeHighlight(params["nodes"][0]);
        // var connectedEdges = universe_network.getConnectedEdges(params["nodes"][0]);
        // edges.forEach(function (_edge, i) {
        //   var _id = _edge.id;
        //   var _color = edgeDataSet.get(_id).color.color;
        //   edgeDataSet.update({id:_id, color:{color:_color, highlight:_color, opacity:0.1}});
        // });
        // connectedEdges.forEach(function (_id, i) {
        //   console.log(edgeDataSet.get(_id));
        //   var _color = edgeDataSet.get(_id).color.color;
        //   edgeDataSet.update({id:_id, color:{color:_color, highlight:_color, opacity:1}});
        // });        
    });


    universe_network.on("click", function (params) {
        if (params["nodes"][0] == undefined) {
            // universe_network.selectNodes(nodeDataSet.getIds())


            // universe_network.selectNodes();
            // edgeDataSet.forEach(function (_edge, i) {
            //   var _id = _edge.id;
            //   var _color = _edge.color.color;
            //   edgeDataSet.update({ id: _id, color: { color: _color, highlight: _color, opacity: 1 } });
            // });            
            // closeLayer();
            universe_network.setOptions({layout: {hierarchical:{ 
                levelSeparation: 400,
                nodeSpacing: 300,
            }}});
            // universe_network.redraw();
        } else {
            // 이미 선택 되어 있으면 selectNode 가 호출이 되지 않아 여기서 호출 선택한다.
            // upperEdages = getUpperEdges(params.nodes[0]);
            // getDownEdges(params.nodes[0]);
            var selectedNodeID = params.nodes[0];
            var nodes = makeUpTree(selectedNodeID);            
            upperNodes = {};
            lowerNodes = {};
            nodes.forEach(function(item, idx){
                upperNodes[item.id] = 1;
            });
            upperNodes[selectedNodeID] = 1;
            nodes = makeDownTree(selectedNodeID);
            nodes.forEach(function(item, idx){
                lowerNodes[item.id] = 1;
            });
            // openLayer();
            selectNode(params);
            universe_network.setOptions({layout: {hierarchical:{
                levelSeparation: 500,
                nodeSpacing: 330,
            }}});
            // universe_network.redraw();
        }
    });

    universe_network.on("doubleClick", function (params) {
        // console.log("doubleClick");
        console.log(params)
        console.log('doubleClick event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));

        if (params.nodes.length > 1) {
            _nodeId = this.getNodeAt(params.pointer.DOM);
            if (_nodeId != undefined) {
                if (universe_network.isCluster(_nodeId) == true) {
                    console.log(clusters);
                    universe_network.openCluster(_nodeId)
                    nodeDataSet.remove(_nodeId);
                    var newClusters = [];
                    for (var i = 0; i < clusters.length; i++) {
                        if (clusters[i].id == _nodeId) {} else {
                            newClusters.push(clusters[i])
                        }
                    }
                    clusters = newClusters;
                }
            }
        }
    });

    // universe_network.selectNodes(nodeDataSet.getIds());
}
// var socket = io.connect('http://' + document.domain + ':' + location.port + "/universe");
var socket = require("socket.io-client")('http://' + "116.120.83.82" + ':' + "9101" + "/universe");

socket.on('universe_init_event', function (message) {
    rawdata = JSON.parse(message);

    // console.log(message);

    initGraph(rawdata);
    universe_draw(rawdata);
    // universe_draw(rawdata.openstack)
});

socket.on('universe_update_event', function (message) {
    rawdata = JSON.parse(message);

    if (rawdata['add'] != undefined) {
        var obj = rawdata['add'];
        obj.forEach(function (_obj, i) {
            if (visNodeType.includes(_obj.type)) {
                nodeDataSet.add(value2VisData(_obj.value));
            } else if (_obj.type === "edge") {
                edgeDataSet.add(value2VisData(_obj.value));
            }
            // var _id = _edge.id;
            // var _color = edgeDataSet.get(_id).color.color;
            // edgeDataSet.update({ id: _id, color: { color: _color, highlight: _color, opacity: 1 } });
        });
    }

    if (rawdata['remove'] != undefined) {
        var obj = rawdata['remove'];
        obj.forEach(function (_obj, i) {
            if (visNodeType.includes(_obj.type)) {
                nodeDataSet.remove(_obj.id);
            } else if (_obj.type === "edge") {
                edgeDataSet.remove(_obj.id);
            }
            // var _id = _edge.id;
            // var _color = edgeDataSet.get(_id).color.color;
            // edgeDataSet.update({ id: _id, color: { color: _color, highlight: _color, opacity: 1 } });
        });
    }

    // universe_draw(rawdata);
});

function getId(id) {
    return id + " ";
}

function clusterByColor() {
    var _nodes = [];
    nodeDataSet.forEach(function (_node, i) {
        if (_node.cnid != undefined) {
            _nodes.push(_node)
        }
    });
    // console.log(_nodes)
    // var colors = ['orange','lime','DarkViolet'];
    var clusterOptionsByData;
    for (var i = 0; i < _nodes.length; i++) {
        var _node = _nodes[i];
        clusterOptionsByData = {
            joinCondition: function (childOptions) {
                return childOptions.cid == _node.cid;
            },
            // processProperties: function (clusterOptions, childNodes, childEdges) {
            //     var totalMass = 0;
            //     for (var i = 0; i < childNodes.length; i++) {
            //         totalMass += childNodes[i].mass;
            //     }
            //     clusterOptions.mass = totalMass;
            //     return clusterOptions;
            // },
            // clusterNodeProperties: {id: 'cluster:' + color, borderWidth: 3, shape: 'database', color:color, label:'color:' + color}

            clusterNodeProperties: createClusterNode(_node)
            // clusterNodeProperties: { id: _node.cnid, label: _node.cid, image: getIcon('instance-1', 'instance'), shape: 'image', value: 30 }
        };
        universe_network.cluster(clusterOptionsByData);
    }
}

function selectNode(params) {
    var _nodeId = params["nodes"][0];
    universe_network.unselectAll();
    // console.log(_nodeId);
    universe_network.selectNodes([_nodeId]);
    // universe_network.focus(_nodeId, {
    //     animation: {
    //         duration: 1000
    //     }
    // });

    if (universe_network.isCluster(_nodeId) == true) {
        _choiceNode = nodeDataSet.get(_nodeId);
        layer_draw(_choiceNode.tid);
    } else {
        layer_draw(_nodeId);
    }
}

function createClusterNode(_node) {
    // clusterNodeProperties: { id: _node.cnid, label: _node.cid, 
    //  image: getIcon('instance-1', 'instance'), shape: 'image', value: 30 }
    clusterIndex = clusterIndex + 1
    var obj = {};
    obj.id = "cluster-" + clusterIndex;
    obj.tid = _node.id;
    obj.name = _node.name;
    obj.label = _node.name;
    // console.log(_node.name);
    // console.log(_node.id);
    obj.image = getIcon(_node.name, _node.type);
    obj.shape = 'image';
    obj.value = _node.value;
    obj.parent = _node.parent;
    obj.type = _node.type;
    // nodeDataSet.add(obj)
    return obj;
}

function ServiceView() {
    console.log("service view")
}

function StabilizeCheckboxButton() {

}

function Plus() {
    scale = lastClusterZoomLevel - 1
    if (scale >= 0) {
        openClusters(scale);
        lastClusterZoomLevel = scale;
    }
}

function Minus() {
    scale = lastClusterZoomLevel + 1
    if (scale < maxScale) {
        makeClusters(scale);
        lastClusterZoomLevel = scale;
    }
}



// make the clusters
function makeClusters(scale) {
    console.log("make cluster scale:" + scale)

    var clusterOptionsByData;

    switch (scale) {
        case 1:
            parent = "pod"
            child = "service"
            break;
        case 2:
            parent = "node"
            child = "pod"
            break;
        case 3:
            parent = "instance"
            child = "node"
            break;
        default:
            return;
    }

    nodeDataSet.forEach(function (_node, i) {
        // console.log(_node.type)
        if (_node.type != parent) {
            return;
        }
        // console.log(_node.pod);
        clusterOptionsByData = {
            joinCondition: function (childOptions) {

                if (childOptions.id == _node.id) {
                    return true;
                }
                if (childOptions.type != child) {
                    return false;
                }
                // console.log(childOptions.type)
                if (childOptions.parent == undefined) {
                    return false;
                }
                if (childOptions.parent.includes(_node.id)) {
                    // console.log("START")
                    // console.log(_node)
                    // console.log(childOptions)
                    // console.log("END")
                    return true;
                } else {
                    return false;
                }
                // return childOptions.id == _node.cid;
            },
            processProperties: function (clusterOptions, childNodes) {
                clusterIndex = clusterIndex + 1;
                // var childrenCount = 0;
                // for (var i = 0; i < childNodes.length; i++) {
                //   childrenCount += childNodes[i].childrenCount || 1;
                // }
                // clusterOptions.childrenCount = childrenCount;
                // clusterOptions.label = "# " + childrenCount + "";
                // clusterOptions.font = { size: childrenCount * 5 + 30 }
                // clusterOptions.id = 'cluster:' + clusterIndex;
                clusters.push({
                    id: clusterOptions.id,
                    scale: scale
                });
                nodeDataSet.add(clusterOptions);
                // console.log(clusterOptions)
                return clusterOptions;
            },
            clusterNodeProperties: createClusterNode(_node)
        };
        universe_network.cluster(clusterOptionsByData);
    });
    universe_network.clusterOutliers(clusterOptionsByData);
    if (document.getElementById('stabilizeCheckbox').checked === true) {
        // since we use the scale as a unique identifier, we do NOT want to fit after the stabilization
        universe_network.setOptions({
            physics: {
                stabilization: {
                    fit: false
                }
            }
        });
        universe_network.stabilize();
    }
}

// open them back up!
function openClusters(scale) {
    console.log("open cluster scale:" + scale)
    var newClusters = [];
    var declustered = false;
    for (var i = 0; i < clusters.length; i++) {
        if (clusters[i].scale > scale) {
            universe_network.openCluster(clusters[i].id);
            nodeDataSet.remove(clusters[i].id);
            lastClusterZoomLevel = scale;
            declustered = true;
        } else {
            newClusters.push(clusters[i])
        }
    }
    clusters = newClusters;
    if (declustered === true && document.getElementById('stabilizeCheckbox').checked === true) {
        // since we use the scale as a unique identifier, we do NOT want to fit after the stabilization
        universe_network.setOptions({
            physics: {
                stabilization: {
                    fit: false
                }
            }
        });
        universe_network.stabilize();
    }
}

function HideVolume() {
    nodeDataSet.forEach(function (_node, i) {
        if (_node.type == "volume") {
            nodeDataSet.remove(_node.id);
        }
    });
}

function ViewVolume() {

    nodeDataSet.forEach(function (_node, i) {
        if (_node.type == "volume") {
            nodeDataSet.remove(_node.id);
        }
    });
}