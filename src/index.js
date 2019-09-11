import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { initDB, readChildrenOf, readParentNodeIdChainOf, readContentOf, 
    minusSeqOf, addSeqOf, updateSeqOf,
    addNode, deleteNode } from './db';

const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;


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


function TopBar({handleTopBarNodeAdd, children}) {
    const menu = new Menu();
    menu.append(new MenuItem({ label: 'add node', click: handleTopBarNodeAdd}));

    return (<div
        style={{
            gridColumn: '1/3',
            borderBottom: '1px solid black',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end'
        }}
        onContextMenu={(e) => {
            e.preventDefault();
            menu.popup();
        }}>
            {children}
    </div>);
}


function SideBar({children}) {
    return (<div
        style={{
            borderLeft: '1px solid black',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {children}
    </div>);
}


class TopBarNode extends React.Component {
    /**
     * props:
     *     title [String]
     *     active [Boolean]
     * 
     *     onClick [callback func]
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

    render() {
        const {title, active, onClick, onDragStart, onDelete} = this.props;
        const menu = new Menu();
        menu.append(new MenuItem({ label: 'delete', click: onDelete}));

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
          onContextMenu={(e) => {
            e.preventDefault();
            menu.popup();
            e.stopPropagation();
          }}>
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


function SideBarNode({title, hasArrow, expand, active, onClick, indent, onExpand}) {
    /**
     * props:
     *     title [String]
     *     hasArrow [Boolean]
     *     expand [Boolean]
     *     active [Boolean]
     * 
     *     onClick [callback func]
     */
    let arrow;
    if (hasArrow) {
        if (expand) {
            arrow = <span>{'v'}</span>
        } else {
            arrow = <span>{'>'}</span>
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
          onClick={onClick}>
          <div 
            style={{
              display: 'inline-block',
              margin: `${indent * 8}px`
              }}
            onClick={onExpand}>{arrow}</div>
          <div style={{
            display: 'inline-block'
            }}>{title}</div>
        </div>);
}


class Page extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: readContentOf(this.props.nodeId)
        }
    }

    render() {
        return (<div>{this.state.content}</div>);
    }
}


class App extends React.Component {
    constructor(props) {
        super(props);
        initDB();
        this.state = this.getInitState();
    }

    getInitState = () => {
        return {
            topBarNodes: readChildrenOf(null),
            sideBarNodesStructure: [],
            activeNodeIdChain: [], // level(层级) low -> high
            expandNodeIdList: []
        }
    }

    handleTopBarNodeAdd = () => {
        const topBarNodes = this.state.topBarNodes;
        addNode(0, topBarNodes.length + 1, null, '未命名', '');
        this.setState(this.getInitState);
    }

    handleTopBarNodeDelete = (nodeId) => {
        deleteNode(nodeId);
        this.setState(this.getInitState);
    }

    handleTopBarNodeClick = (nodeId) => {
        if (nodeId === this.state.activeNodeIdChain[0]) {
            return
        }
        this.setState({
            activeNodeIdChain: [nodeId],
            sideBarNodesStructure: this.readNodeStructure(nodeId)
        });
    }

    handleNodeDragStart = (nodeId, event) => {
        event.dataTransfer.setData('fromNodeId', nodeId);
        event.dataTransfer.dropEffect = 'move';
    }

    handleNodeDrop = (toNodeId, insertAfter, event) => {
        event.preventDefault();
        const fromNodeId = parseInt(event.dataTransfer.getData('fromNodeId'));
        // perform node move: write database and retrive data then setState topBarNodes
        let fromNodeIndex, toNodeIndex;
        let fromNode, toNode;
        for (const [index, node] of this.state.topBarNodes.entries()) {
            if (node.id === fromNodeId) {
                fromNodeIndex = index;
                fromNode = node;
            }
            if(node.id === toNodeId) {
                toNodeIndex = index;
                toNode = node;
            }
        }
        console.log({fromNodeIndex, toNodeIndex, insertAfter});
        if (fromNodeIndex === toNodeIndex) {
            return ;
        } else if (fromNodeIndex < toNodeIndex) {
            if (insertAfter) {
                updateSeqOf(fromNode.id, toNode.sequence);
                const middleNodes = this.state.topBarNodes.slice(fromNodeIndex + 1, toNodeIndex + 1);
                for (const node of middleNodes) {
                    minusSeqOf(node.id, 1);
                }
            } else {
                updateSeqOf(fromNode.id, toNode.sequence - 1);
                const middleNodes = this.state.topBarNodes.slice(fromNodeIndex + 1, toNodeIndex);
                for (const node of middleNodes) {
                    minusSeqOf(node.id, 1);
                }
            }
        } else {
            if (insertAfter) {
                updateSeqOf(fromNode.id, toNode.sequence + 1);
                const middleNodes = this.state.topBarNodes.slice(toNodeIndex + 1, fromNodeIndex);
                for (const node of middleNodes) {
                    addSeqOf(node.id, 1);
                }
            } else {
                updateSeqOf(fromNode.id, toNode.sequence);
                const middleNodes = this.state.topBarNodes.slice(toNodeIndex, fromNodeIndex);
                for (const node of middleNodes) {
                    addSeqOf(node.id, 1);
                }
            }
        }
        this.setState(this.getInitState());
    }

    renderTopBarNodes = (nodes, activeNodeId) => {
        const items = [];
        for (const node of nodes) {
            items.push(
                <TopBarNode
                  key={node.id}
                  title={node.title}
                  active={node.id === activeNodeId ? true : false}
                  onClick={() => {this.handleTopBarNodeClick(node.id)}}
                  onDragStart={(event) => {this.handleNodeDragStart(node.id, event)}}
                  onDrop={(insertAfter, event) => {this.handleNodeDrop(node.id, insertAfter, event)}}
                  onDelete={() => {this.handleTopBarNodeDelete(node.id)}}
                />
            );
        }
        return items;
    }

    readNodeStructure = (parentNodeId) => {
        // recursive read
        const nodes_data = readChildrenOf(parentNodeId);
        const nodes = []
        for (const data of nodes_data) {
            nodes.push({
                thisNode: data,
                subNodes: this.readNodeStructure(data.id)
            })
        }
        return nodes;
    }

    handleSideBarNodeClick = (nodeId) => {
        const parentIdChain = readParentNodeIdChainOf(nodeId);
        parentIdChain.push(nodeId);
        this.setState({
            activeNodeIdChain: parentIdChain
        });
    }

    handleSideBarNodeExpandClick = (nodeId) => {
        const index = this.state.expandNodeIdList.indexOf(nodeId);
        let newList = [...this.state.expandNodeIdList];
        if (index === -1) {
            newList.push(nodeId);
        } else {
            newList.splice(index, 1);
        }
        this.setState({
            expandNodeIdList: newList
        })
    }

    renderSideBarNodes = (nodes, activeNodeIdChain) => {
        /** recursive render
         * 
         * Params:
         *     nodes [Array[Object]]: [
         *     {
         *         'thisNode': [Object],
         *         'subNodes': [Array[Object]]
         *     },
         *     ...
         *     ]
         */
        let items = [];
        const activeNodeId = activeNodeIdChain[activeNodeIdChain.length - 1];
        for (const nodeBlock of nodes) {
            const thisNode = nodeBlock.thisNode;
            const hasSubNodes = nodeBlock.subNodes.length > 0;
            const expand = this.state.expandNodeIdList.includes(thisNode.id);
            items.push(
                <SideBarNode
                  key={thisNode.id}
                  title={thisNode.title}
                  hasArrow={hasSubNodes}
                  expand={expand}
                  active={thisNode.id === activeNodeId ? true : false}
                  onClick={() => {this.handleSideBarNodeClick(thisNode.id)}}
                  indent={thisNode.level - 1}
                  onExpand={() => {this.handleSideBarNodeExpandClick(thisNode.id)}}
                />
            );
            if (hasSubNodes && expand) {
                items = items.concat(this.renderSideBarNodes(nodeBlock.subNodes, activeNodeIdChain))
            }
        }
        return items;
    }

    render() {
        return (<div
            style={{
                height: '100%',
                width: '100%',
                display: 'grid',
                gridTemplateRows: '5% 95%',
                gridTemplateColumns: '80% 20%'
            }}>
              <TopBar handleTopBarNodeAdd={this.handleTopBarNodeAdd}>
                {this.renderTopBarNodes(this.state.topBarNodes, this.state.activeNodeIdChain[0])}
                <TopBarAddButton onClick={this.handleTopBarNodeAdd}/>
              </TopBar>
              <Page activeNodeId={this.state.activeNodeIdChain[this.state.activeNodeIdChain.length - 1]} />
              <SideBar>
                {this.renderSideBarNodes(this.state.sideBarNodesStructure, this.state.activeNodeIdChain)}
              </SideBar>
        </div>);
    }
}

ReactDOM.render(<App />, document.getElementById('root'))
