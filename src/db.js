const Database = window.require('better-sqlite3');
const db = new Database(':memory:', {verbose: console.log});


const sections = [
    {
        'id': 1,
        'sequence': 0,
        'title': 'section1',
    },{
        'id': 2,
        'sequence': 1,
        'title': 'section2',
    }
]

const pages = [
    {
        'id': 1,
        'section_id': 1,
        'level': 0,
        'sequence': 0,
        'title': 'node1',
        'content': 'testtttttt contetn'
    },
    {
        'id': 2,
        'section_id': 1,
        'level': 1,
        'sequence': 0,
        'title': 'node2',
        'content': 'testtttttt contetn'
    },
    {
        'id': 3,
        'section_id': 1,
        'level': 1,
        'sequence': 1,
        'title': 'node3',
        'content': 'testtttttt contetn'
    },
    {
        'id': 4,
        'section_id': 1,
        'level': 0,
        'sequence': 1,
        'title': 'node4',
        'content': 'testtttttt contetn'
    },
    {
        'id': 5,
        'section_id': 2,
        'level': 0,
        'sequence': 0,
        'title': 'node5',
        'content': 'testtttttt contetn'
    },
    {
        'id': 6,
        'section_id': 2,
        'level': 0,
        'sequence': 1,
        'title': 'node6',
        'content': 'testtttttt contetn'
    }
];


function initDB() {
    console.log('initDB()');
    // sequence: 从0开始。
    db.prepare(`create table section (
                    id INTEGER PRIMARY KEY,
                    sequence INTEGER,
                    title TEXT
                )`).run();
    const stmt = db.prepare(`insert into section (id, sequence, title)
                                 values ($id, $sequence, $title)`);
    for (const sec of sections) {
        stmt.run(sec);
    }
    // level: 从0开始，越小越大。
    // sequence: 从0开始。
    db.prepare(`create table page (
                    id INTEGER PRIMARY KEY,
                    section_id INTEGER,
                    level INTEGER,
                    sequence INTEGER,
                    title TEXT,
                    content TEXT,
                    FOREIGN KEY(section_id) REFERENCES section(id) ON DELETE CASCADE
                )`).run();

    const stmt2 = db.prepare(`insert into page (id, section_id, level, sequence, title, content)
                                  values ($id, $section_id, $level, $sequence, $title, $content)`);
    for (const p of pages) {
        stmt2.run(p);
    }
}


function readData(table) {
    return db.prepare('select * from ? order by id').all([table]);
}


function readSections() {
    return db.prepare('select * from section order by sequence').all();
}


function readPagesOf(sectionId) {
    return db.prepare(`select * from page where section_id = ? order by sequence`).all([sectionId]);
}

function addSection(sequence, title) {
    const id = db.prepare(`insert into section (sequence, title)
                                      values (?, ?)`).run([sequence, title]);
    return id;
}


function deleteSection(id) {
    db.prepare('delete from section where id=?').run([id]);
}


function addSeqOfSection(id, num) {
    db.prepare('update section set sequence=sequence+? where id=?').run([num, id]);
}


function minusSeqOfSection(id, num) {
    db.prepare('update section set sequence=sequence-? where id=?').run([num, id]);
}


function updateSeqOfSection(id, sequence) {
    db.prepare('update section set sequence=? where id=?').run([sequence, id]);
}


function addPage(sectionId, level, sequence, title, content) {
    const id = db.prepare(`insert into page (section_id, level, sequence, title, content)
                                      values (?, ?, ?, ?, ?)`).run([sectionId, level, sequence, title, content]);
    return id;
}


function deletePage(id) {
    db.prepare('delete from page where id=?').run([id]);
}


function readContentOf(pageId) {
    const page = db.prepare('select content from page where id = ?').get([pageId]);
    return page === undefined ? '' : page.content;
}


const dbInterface = {
    initDB: initDB,
    readSections: readSections,
    readPagesOf: readPagesOf,
    addSection: addSection,
    deleteSection: deleteSection,
    addSeqOfSection: addSeqOfSection,
    minusSeqOfSection: minusSeqOfSection,
    updateSeqOfSection: updateSeqOfSection,

    addPage: addPage,
    deletePage: deletePage,
    readContentOf: readContentOf
}


export { dbInterface };
