const Database = window.require('better-sqlite3');
const db = new Database(':memory:', {verbose: console.log});

const nodes = [
    {
        'id': 1,
        'level': 0,
        'sequence': 1,
        'parentId': null,
        'title': 'book1',
        'content': 'testtttttt contetn'
    },
    {
        'id': 2,
        'level': 1,
        'sequence': 1,
        'parentId': 1,
        'title': 'parentNode1',
        'content': 'testtttttt contetn'
    },
    {
        'id': 3,
        'level': 2,
        'sequence': 1,
        'parentId': 2,
        'title': 'p1-subNode1',
        'content': 'testtttttt contetn'
    },
    {
        'id': 4,
        'level': 2,
        'sequence': 2,
        'parentId': 2,
        'title': 'p2-subNode2',
        'content': 'testtttttt contetn'
    },
    {
        'id': 5,
        'level': 1,
        'sequence': 2,
        'parentId': 1,
        'title': 'parentNode2',
        'content': 'testtttttt contetn'
    },
    {
        'id': 6,
        'level': 0,
        'sequence': 2,
        'parentId': null,
        'title': 'book2',
        'content': 'testtttttt contetn222222222222222222222'
    },
    {
        'id': 7,
        'level': 1,
        'sequence': 1,
        'parentId': 6,
        'title': 'node1',
        'content': 'testtttttt contetn'
    },
    {
        'id': 8,
        'level': 1,
        'sequence': 2,
        'parentId': 6,
        'title': 'node2',
        'content': 'testtttttt contetn'
    }
];


function initDB() {
    db.prepare(`CREATE TABLE node (
                    id INTEGER PRIMARY KEY,
                    level INTEGER,
                    sequence INTEGER,
                    parentId INTEGER,
                    title TEXT,
                    content TEXT,
                    FOREIGN KEY(parentId) REFERENCES node(id)
                    )`).run();

    const stmt = db.prepare(`INSERT INTO node (id, level, sequence, parentId, title, content)
                                    VALUES ($id, $level, $sequence, $parentId, $title, $content)`);
    for (const node of nodes) {
        stmt.run(node);
    }
}


function readData() {
    return db.prepare('select * from node order by id', []).all();
}


function readChildrenOf(nodeId) {
    // select * from table where parentId == nodeId order by sequence
    const operator = nodeId === null ? 'is' : '=';
    return db.prepare(`select * from node where parentId ${operator} ? order by sequence`).all([nodeId]);
}


function readParentNodeIdChainOf(nodeId) {
    // recursive select * from table where parentId == nodeId
    const parentId = db.prepare('select parentId from node where id = ?').get([nodeId]).parentId;
    if (parentId === null) {
        return [];
    }

    return [parentId].concat(readParentNodeIdChainOf(parentId));
}


function readContentOf(nodeId) {
    const node = db.prepare('select content from node where id = ?').get([nodeId]);
    return node === undefined ? '' : node.content;
}


function minusSeqOf(nodeId, num) {
    db.prepare('update node set sequence=sequence-? where id=?').run([num, nodeId]);
}


function addSeqOf(nodeId, num) {
    db.prepare('update node set sequence=sequence+? where id=?').run([num, nodeId]);
}


function updateSeqOf(nodeId, newSeq) {
    db.prepare('update node set sequence=? where id=?').run([newSeq, nodeId]);
}


function addNode(level, sequence, parentId, title, content) {
    const newNodeId = db.prepare(`insert into node (level, sequence, parentId, title, content)
                                      values (?, ?, ?, ?, ?)`).run([level, sequence, parentId, title, content]);
    return newNodeId;
}


function deleteNode(nodeId) {
    db.prepare('delete from node where nodeId=?').run([nodeId]);
}


export { initDB, readChildrenOf, readParentNodeIdChainOf, readContentOf,
         minusSeqOf, addSeqOf, updateSeqOf,
         addNode, deleteNode };
