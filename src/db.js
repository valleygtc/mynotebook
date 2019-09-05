const [ node1, node2, node3, node4, node5, node6, node7, node8 ] = [
    {
        'id': 1,
        'level': 0,
        'order': 1,
        'parentId': null,
        'title': 'book1',
        'content': 'testtttttt contetn'
    },
    {
        'id': 2,
        'level': 1,
        'order': 1,
        'parentId': 1,
        'title': 'parentNode1',
        'content': 'testtttttt contetn'
    },
    {
        'id': 3,
        'level': 2,
        'order': 1,
        'parentId': 2,
        'title': 'p1-subNode1',
        'content': 'testtttttt contetn'
    },
    {
        'id': 4,
        'level': 2,
        'order': 2,
        'parentId': 2,
        'title': 'p2-subNode2',
        'content': 'testtttttt contetn'
    },
    {
        'id': 5,
        'level': 1,
        'order': 2,
        'parentId': 1,
        'title': 'parentNode2',
        'content': 'testtttttt contetn'
    },
    {
        'id': 6,
        'level': 0,
        'order': 2,
        'parentId': null,
        'title': 'book2',
        'content': 'testtttttt contetn222222222222222222222'
    },
    {
        'id': 7,
        'level': 1,
        'order': 1,
        'parentId': 6,
        'title': 'node1',
        'content': 'testtttttt contetn'
    },
    {
        'id': 8,
        'level': 1,
        'order': 2,
        'parentId': 6,
        'title': 'node2',
        'content': 'testtttttt contetn'
    }
];


function readData() {
    // TODO
    return [node1, node2, node3, node4, node5, node6];
}


function readChildrenOf(parentId) {
    // TODO: db -> select * from table where parentId == parentId order by order
    if (parentId === null) {
        return [node1, node6];
    } else if (parentId === 1) {
        return [node2, node5];
    } else if (parentId === 2) {
        return [node3, node4];
    } else if (parentId === 6) {
        return [node7, node8];
    } else {
        return [];
    }
}


function readParentChainOf(nodeId) {
    // TODO recursive select * from table where parentId == nodeId
    if (nodeId === 1 || nodeId === 6) {
        return [];
    } else if (nodeId === 2 || nodeId === 5) {
        return [node1];
    } else if (nodeId === 7 || nodeId === 8) {
        return [node6];
    } else if (nodeId === 3 || nodeId === 4) {
        return [node2, node1];
    }
}


function readContentOf(nodeId) {
    // TODO
    return 'test content';
}

export { readChildrenOf, readParentChainOf, readContentOf };
