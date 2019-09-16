import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { dbInterface as db } from './db';

const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;


class TopBar extends React.Component {
    /**
     * 
     * props:
     *     activeSectionId [Number]
     *     onSectionClick [callback]
     * state:
     *     sections [Array[Object]]: {id [Number], sequence [Number], title [String]}
     */
    constructor(props) {
        super(props);
        this.state = {
            sections: db.readSections()
        }
    }

    refresh = () => {
        this.setState({
            sections: db.readSections()
        })
    }

    handleSectionAdd = () => {
        const sections = this.state.sections;
        db.addSection(sections.length + 1, '未命名');
        this.refresh();
    }

    handleSectionDelete = (id) => {
        db.deleteSection(id);
        this.refresh();
        // section删除后，同时更新sidebar。
        this.props.onSectionClick(undefined);
    }

    handleSectionClick = (id) => {
        console.log(`TopBar handleSectionClick(${id})`);
        if (id === this.props.activeSectionId) {
            return
        } else {
            console.log(`TopBar handleSectionClick call this.props.onSectionClick(${id})`);
            this.props.onSectionClick(id);
        }
    }

    handleContextMenu = (event) => {
        event.preventDefault();
        const menu = new Menu();
        menu.append(new MenuItem({ label: 'Add Section', click: this.handleSectionAdd}));
        menu.popup();
    }

    handleSectionDragStart = (id, event) => {
        event.dataTransfer.setData('fromId', id);
        event.dataTransfer.dropEffect = 'move';
    }

    handleSectionDrop = (toId, dropAfter, event) => {
        event.preventDefault();
        const fromId = parseInt(event.dataTransfer.getData('fromId'));
        // perform section move: write database and refresh: retrive data then setState(sections).
        let fromSection, toSection;
        for (const sec of this.state.sections) {
            if (sec.id === fromId) {
                fromSection = sec;
            }
            if(sec.id === toId) {
                toSection = sec;
            }
        }
        const [fromSeq, toSeq] = [fromSection.sequence, toSection.sequence];
        console.log({fromSection, toSection, dropAfter});
        if (fromSeq === toSeq) {
            return ;
        } else if (fromSeq < toSeq) {
            if (dropAfter) {
                db.updateSeqOfSection(fromSection.id, toSection.sequence);
                const middleSections = this.state.sections.slice(fromSeq + 1, toSeq + 1);
                for (const sec of middleSections) {
                    db.minusSeqOfSection(sec.id, 1);
                }
            } else {
                db.updateSeqOfSection(fromSection.id, toSection.sequence - 1);
                const middleSections = this.state.sections.slice(fromSeq + 1, toSeq);
                for (const sec of middleSections) {
                    db.minusSeqOfSection(sec.id, 1);
                }
            }
        } else {
            if (dropAfter) {
                db.updateSeqOfSection(fromSection.id, toSection.sequence + 1);
                const middleSections = this.state.sections.slice(toSeq + 1, fromSeq);
                for (const sec of middleSections) {
                    db.addSeqOfSection(sec.id, 1);
                }
            } else {
                db.updateSeqOfSection(fromSection.id, toSection.sequence);
                const middleSections = this.state.sections.slice(toSeq, fromSeq);
                for (const sec of middleSections) {
                    db.addSeqOfSection(sec.id, 1);
                }
            }
        }
        this.refresh();
    }

    render() {
        const secItems = this.state.sections.map((sec) => (
            <TopBarNode
              key={sec.id}
              title={sec.title}
              active={sec.id === this.props.activeSectionId ? true : false}
              onClick={() => {this.handleSectionClick(sec.id)}}
              onDragStart={(event) => {this.handleSectionDragStart(sec.id, event)}}
              onDrop={(dropAfter, event) => {this.handleSectionDrop(sec.id, dropAfter, event)}}
              onDelete={() => {this.handleSectionDelete(sec.id)}}
            />
        ));

        return (
          <div
            style={{
                gridColumn: '1/3',
                borderBottom: '1px solid black',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end'
            }}
            onContextMenu={this.handleContextMenu}>
              {secItems}
              <TopBarAddButton onClick={this.handleSectionAdd} />
          </div>);
    }
}


class TopBarNode extends React.Component {
    /**
     * props:
     *     title [String]
     *     active [Boolean]
     * 
     *     onClick [callback]
     *     onDragStart [callback]
     *     onDrop [callback]
     *     onDelete [callback]
     */
    constructor(props) {
        super(props);
        this.state = {
            isOver: false,
            trendToRight: true
        }
        this.boxRef = React.createRef(); // to get box width以用来判断鼠标当前位置是偏左还是偏右。
    }

    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState({
            isOver: true
        })
    }

    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState({
            isOver: false
        })
    }

    handleDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        const cursorOffsetX = event.nativeEvent.offsetX;
        const boxWidth = this.boxRef.current.clientWidth;
        if (cursorOffsetX > boxWidth / 2) {
            this.setState({
                trendToRight: true
            })
        } else {
            this.setState({
                trendToRight: false
            })
        }
    }

    handleDrop = (event) => {
        this.setState({
            isOver: false
        })
        this.props.onDrop(this.state.trendToRight, event);
    }

    handleContextMenu = (event) => {
        event.preventDefault();
        //activate this section
        this.props.onClick();

        const menu = new Menu();
        menu.append(new MenuItem({ label: 'delete', click: this.props.onDelete}));
        menu.popup();
        event.stopPropagation();
    }

    render() {
        const {title, active, onClick, onDragStart} = this.props;
        return (
        <div
          ref={this.boxRef}
          style={{
              border: '1px solid black',
              backgroundColor: active ? 'green' : 'white',
              cursor: 'pointer',
              userSelect: 'none',
              position: 'relative' // 为了子元素trangle的绝对定位。
          }}
          onClick={onClick}
          draggable={true}
          onDragStart={onDragStart}
          onDragOver={this.handleDragOver}
          onDrop={this.handleDrop}
          onDragEnter={this.handleDragEnter}
          onDragLeave={this.handleDragLeave}
          onContextMenu={this.handleContextMenu}>
          {(this.state.isOver && !this.state.trendToRight) && 
          <Trangle />}
          <div
            style={{
                margin: '5px 10px 0',
                pointerEvents: 'none' // 防止子元素触发ondragleave事件。
            }}>{title}</div>
          {(this.state.isOver && this.state.trendToRight) && 
          <Trangle />}
        </div>);
    }
}


function TopBarAddButton({onClick}) {
    return (
      <div
        style={{
            border: '1px solid black',
            cursor: 'pointer',
            userSelect: 'none',
        }}
        onClick={onClick}>
        +
      </div>);
}


function Trangle() {
    return (<div
        style={{
            width: 0,
            height: 0,
            border: 'solid 5px',
            borderColor: 'black transparent transparent transparent',
            position: 'absolute',
            top: '-6px',
            right: '-6px'
        }}></div>)
}


class SideBar extends React.Component {
    /**
     * 
     * props:
     *     sectionId [Number]
     *     activePageId [Number]
     *     onPageClick [callback]
     * 
     * state:
     *     pages [Array[Object]]
     * 
     */
    constructor(props) {
        super(props);
        this.state = {
            pages: db.readPagesOf(this.props.sectionId),
            foldPageIdList: []
        }
    }

    refresh = () => {
        this.setState({
            pages: db.readPagesOf(this.props.sectionId),
        })
    }

    handlePageAdd = () => {
        db.addPage(this.props.sectionId, 0, this.state.pages.length, '未命名', '');
        this.refresh();
    }

    handlePageDelete = (id) => {
        db.deletePage(id);
        this.refresh();
    }

    handleFoldClick = (id) => {
        // toggle fold
        const sequence = this.state.foldPageIdList.indexOf(id);
        let newList = [...this.state.foldPageIdList];
        if (sequence === -1) {
            newList.push(id);
        } else {
            newList.splice(sequence, 1);
        }
        this.setState({
            foldPageIdList: newList
        })
    }

    handleContextMenu = (event) => {
        // 如果没有active的topbar node，那么右键无任何效果。
        if (this.props.activePageId === undefined) {
            return;
        }

        event.preventDefault();
        const menu = new Menu();
        menu.append(new MenuItem({ label: 'add node', click: this.handlePageAdd}));
        menu.popup();
    }

    renderPages = (pages, activePageId) => {
        /**
         * 
         * Params:
         *     pages [Array[Object]]: {
         *         id: [Number],
         *         section_id: [Number],
         *         level: [Number],
         *         sequence: [Number],
         *         title: [String]
         *     }
         */
        const items = [];
        for (let i = 0; i < pages.length; i++) {
            const p = pages[i];
            let hasSubPages;
            if (i === pages.length - 1) {
                hasSubPages = false;
            } else {
                const nextPage = pages[i + 1];
                hasSubPages = nextPage.level > p.level ? true : false;
            }
            const fold = this.state.foldPageIdList.includes(p.id);
            items.push(
                <SideBarNode
                  key={p.id}
                  title={p.title}
                  hasArrow={hasSubPages}
                  fold={fold}
                  active={p.id === activePageId ? true : false}
                  onClick={() => {this.props.onPageClick(p.id)}}
                  indent={p.level}
                  onExpand={() => {this.handleFoldClick(p.id)}}
                  onDelete={() => {this.handlePageDelete(p.id)}}
                />
            );
            if (fold && hasSubPages) {
                // skip to last subPage.判定条件：
                //   下一个page的level < 当前遍历的page，或到最后一个page了，就判定为the last subPage。
                while(true) {
                    i = i + 1;
                    if ((i === pages.length - 1) || (pages[i + 1].level <= p.level)) {
                        break;
                    }
                }
            }
        }
        return items;
    }

    render() {
        return (
          <div
            style={{
                borderLeft: '1px solid black',
                display: 'flex',
                flexDirection: 'column'
            }}
            onContextMenu={this.handleContextMenu}>
              {this.props.sectionId !== undefined &&
                 <SideBarAddButton onClick={this.handlePageAdd} />}
              {this.renderPages(this.state.pages, this.props.activePageId)}
          </div>);
    }
}


class SideBarNode extends React.Component {
    /**
     * props:
     *     title [String]
     *     hasArrow [Boolean]
     *     fold [Boolean]
     *     active [Boolean]
     *     indent [Number]
     * 
     *     onClick [callback func]
     *     onExpand [callback func]
     *     onDelete [callback func]
     */
    constructor(props) {
        super(props);
    }

    handleContextMenu = (event) => {
        event.preventDefault();

        //activate this node
        this.props.onClick();

        const menu = new Menu();
        menu.append(new MenuItem({ label: 'delete', click: this.props.onDelete}));
        menu.popup();
        event.stopPropagation();
    }

    render() {
        const {title, hasArrow, fold, active, indent, onClick, onExpand} = this.props;
        let arrow;
        if (hasArrow) {
            if (fold) {
                arrow = <span>{'>'}</span>
            } else {
                arrow = <span>{'v'}</span>
            }
        } else {
            arrow = null;
        }
        return (
             <div
            style={{
                border: '1px solid black',
                backgroundColor: active ? 'green' : 'white',
                cursor: 'pointer',
                userSelect: 'none'
            }}
            onClick={onClick}
            onContextMenu={this.handleContextMenu}>
              <div 
                style={{
                display: 'inline-block',
                margin: `${indent * 8}px`
                }}
                onClick={onExpand}>
              {arrow}</div>
              <div style={{
                display: 'inline-block'
                }}>
              {title}</div>
            </div>);
    }
}


function SideBarAddButton({onClick}) {
    return (
      <div
        style={{
            border: '1px solid black',
            cursor: 'pointer',
            userSelect: 'none',
        }}
        onClick={onClick}>
        +
      </div>);
}


class Page extends React.Component {
    /**
     * props:
     *     activePageId [Number]
     * state:
     *     content [String]
     */
    constructor(props) {
        super(props);
        this.state = {
            content: db.readContentOf(this.props.activePageId)
        }
    }

    render() {
        return (<div>{this.state.content}</div>);
    }
}


class App extends React.Component {
    constructor(props) {
        super(props);
        db.initDB();
        this.state = {
            activeSectionId: undefined,
            activePageId: undefined
        }
    }

    handleSectionClick = (id) => {
        this.setState({
            activeSectionId: id
        });
    }

    handlePageNodeClick = (id) => {
        console.log(`handlePageNodeClick(${id})`)
        this.setState({
            activePageId: id
        });
    }

    render() {
        // 注：Page外层包上一层div的作用：避免Page和SideBar的key值冲突。
        return (<div
            style={{
                height: '100%',
                width: '100%',
                display: 'grid',
                gridTemplateRows: '5% 95%',
                gridTemplateColumns: '80% 20%'
            }}>
              <TopBar
                activeSectionId={this.state.activeSectionId}
                onSectionClick={this.handleSectionClick} />
              <div>
                <Page
                  key={this.state.activePageId} //如果activePageId变了，则Page直接re-create。
                  activePageId={this.state.activePageId} />
              </div>
              <SideBar
                key={this.state.activeSectionId} //如果activeTopBarNodeId变了，则SideBar直接re-create。
                sectionId={this.state.activeSectionId}
                activePageId={this.state.activePageId}
                onPageClick={this.handlePageNodeClick}/>
        </div>);
    }
}

ReactDOM.render(<App />, document.getElementById('root'))
