import * as tree from "./tree";

export const initGraph = message => {
    // 그래프 생성
    let nodes = message.node;
    let edges = message.edge;

    nodes.map(node => {
        if (!node.level || tree.hasExceptionType(node)) {
            return;
        }

        // 계층별 노드 추가
        if (!tree.hasId(node.id)) {
            tree.addNode(node);
        }
    });

    edges.map(edge => {
        //부모-자식 관계 추가
        let source = edge.from || edge._from;
        let target = edge.to || edge._to;
        let node = tree.getNodeById(source);

        if (node === undefined) {
            return;
        }

        if (tree.hasId(target)) {
            tree.addChild(node, target);
        }

    });

    // 부모-자식 매칭정보 구성. disjoint set 이용
    let lvNodes = tree.getNodesByLevel(1);
    lvNodes.map(root => tree.setParentDisjt(root, root));
};

export const getGraphById = id => tree.getGraphById(id);