// source-target 정보를 가진 전체 데이터셋
let gData = {
};

// 그래프를 그리고 싶지 않은 목록들을 여기에 넣는다.
let exceptions = {
    "kubernetes": true,
    "network": true,
    "volume": true
};

// 전체 source-target 에서 특정 id를 기준으로 데이터추출을 하기 위해 필요한 데이터셋
// {자식: 연결된부모} 정보로 된 연결고리로만 이루어져 있다
let parentDisjoint = {};

// id 프로퍼티를 가졌는지 확인
export const hasId = id => gData.hasOwnProperty(id);

// 그려질 그래프를 위해 자료구조를 정의하는 도중에
// 제외하고 싶은 목록들 (exceptions 변수)에 특정 노드가 포함이 되어있는지 판단
export const hasExceptionType = ({ type }) => exceptions.hasOwnProperty(type);

// children 프로퍼티를 갖고 있고 children의 length > 0 이면 true, 아니면 false
export const hasChildren = id => gData[id].hasOwnProperty("children") && gData[id].children.length;

// 연결리스트 같은 parent-child 연결고리 생성
export const addChild = (parent, child) => parent.children.push(child);

// 노드 정보 추가
export const addNode = ({ level, id, name, type }) => {
    gData[id] = {
        level, id, name, type,
        children: []
    };
};

// disjoint-set 구성
// 이 데이터셋으로 좌측에 그릴 그래프를 만드는데 참고해 사용한다.
export const setParentDisjt = (parent, child) => {
    if (!hasId(parent) || !hasChildren(parent)) {
        return;
    }

    if (!parentDisjoint[child]) {
        parentDisjoint[child] = parent;
    }

    gData[child].children.map(nextChild => setParentDisjt(child, nextChild));
};

export const getNodeById = id => gData[id];

// level에 해당하는 노드들 탐색
// 현재까지는 disjoint-set 구성을 위해서 level 1만 탐색하는 용도로 사용 중이다.
export const getNodesByLevel = level => {
    let nodes = [];
    let ids = Object.keys(gData);

    for (let i = 0; i < ids.length; i++) {
        if (parseInt(gData[ids[i]].level) === level) {
            nodes.push(ids[i]);
        }
    }

    return nodes;
};

export const getParent = id => parentDisjoint[id];

// 해당 id가 포함된 그래프의 정보를 추출. 반환값엔 관련된 노드의 id만 담는다.
export const getGraphById = id => [].concat( getUpTreeById(id), gData[id], getDownTreeById(id) );

// disjoint 이용
// id의 부모, 조상 노드 탐색
export const getUpTreeById = (id, tree = []) => {
    let parent = getParent(id);

    if (id === parent) {
        return tree;
    }

    tree.push(gData[parent]);

    return getUpTreeById(parent, tree);
};

// bfs
// id의 자식, 자손 노드 탐색
export const getDownTreeById = id => {
    let tree = [];
    let queue = [];

    queue.push(id);
    let size = queue.length;

    while (size) {
        for (let i = 0; i < size; i++) {
            let parent = queue.shift();

            gData[parent].children.map(child => {
                tree.push(gData[child]);
                queue.push(child);
            });
        }

        size = queue.length;
    }

    return tree;
};

export const getGraph = () => gData;

export const getDisjoint = () => parentDisjoint;

console.log("tree")