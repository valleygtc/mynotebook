function readChildrenOf(parentId) {
    // TODO: db -> select * from table where parentId == parentId order by order
    if (parentId === null) {
        return [
            {
                'id': 1,
                'level': 0,
                'order': 1,
                'parentId': null,
                'title': 'book1',
                'content': 'testtttttt contetn'
            },
            {
                'id': 6,
                'level': 0,
                'order': 2,
                'parentId': null,
                'title': 'book2',
                'content': 'testtttttt contetn222222222222222222222'
            }
        ];
    } else if (parentId === 1) {
        return [
            {
                'id': 2,
                'level': 1,
                'order': 1,
                'parentId': 1,
                'title': 'parentNode1',
                'content': 'testtttttt contetn'
            },
            {
                'id': 5,
                'level': 1,
                'order': 2,
                'parentId': 1,
                'title': 'parentNode2',
                'content': 'testtttttt contetn'
            }
        ];
    } else if (parentId === 2) {
        return [
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
            }
        ];
    } else if (parentId === 6) {
        return [
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
    } else {
        return [];
    }
}


function readContentOf(nodeId) {
    // TODO
    return 'test content';
}

export { readChildrenOf, readContentOf };
