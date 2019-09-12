import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { initDB, readChildrenOf, readParentNodeIdChainOf, readContentOf, 
    minusSeqOf, addSeqOf, updateSeqOf,
    addNode, deleteNode } from './db';

const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;


class TopBar extends React.Component {
    /**
     * props:
     *     activeNodeId [Number]
     *     onNodeClick [callback func]
     */
    constructor(props) {
        super(props);
        this.state = {
            topBarNodes: readChildrenOf(null)
        }
    }

    refresh = () => {
        this.setState({
            topBarNodes: readChildrenOf(null)
        })
    }

    handleNodeAdd = () => {
        const topBarNodes = this.state.topBarNodes;
        addNode(0, topBarNodes.length + 1, null, '未命名', '');
        this.refresh();
    }

    handleNodeDelete = (nodeId) => {
        deleteNode(nodeId);
        this.refresh();
    }

    handleNodeClick = (nodeId) => {
        console.log('TopBar handleNodeClick');
        if (nodeId === this.props.activeNodeId) {
            return
        } else {
            console.log(`TopBar handleNodeClick: call this.props.onNodeClick(${nodeId})`);
            this.props.onNodeClick(nodeId);
        }
    }

    handleContextMenu = (event) => {
        event.preventDefault();
        const menu = new Menu();
        menu.append(new MenuItem({ label: 'add node', click: this.handleNodeAdd}));
        menu.popup();
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
        this.refresh();
    }

    renderNodes = (nodes, activeNodeId) => {
        const items = [];
        for (const node of nodes) {
            items.push(
                <TopBarNode
                  key={node.id}
                  title={node.title}
                  active={node.id === activeNodeId ? true : false}
                  onClick={() => {this.handleNodeClick(node.id)}}
                  onDragStart={(event) => {this.handleNodeDragStart(node.id, event)}}
                  onDrop={(insertAfter, event) => {this.handleNodeDrop(node.id, insertAfter, event)}}
                  onDelete={() => {this.handleNodeDelete(node.id)}}
                />
            );
        }
        return items;
    }

    render() {
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
              {this.renderNodes(this.state.topBarNodes, this.props.activeNodeId)}
              <TopBarAddButton onClick={this.handleNodeAdd} />
          </div>);
    }
}


class TopBarNode extends React.Component {
    /**
     * props:
     *     title [String]
     *     active [Boolean]
     * 
     *     onClick [callback func]
     *     onDragStart [callback func]
     *     onDrop [callback func]
     *     onDelete [callback func]
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
        //activate this node
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
     * props:
     *     topBarNodeId [Number]
     *     activeNodeId [Number]
     *     onNodeClick [callback func]
     */
    constructor(props) {
        super(props);
        this.state = {
            sideBarNodesStructure: this.readNodeStructure(this.props.topBarNodeId),
            expandNodeIdList: []
        }
    }

    refresh = () => {
        this.setState({
            sideBarNodesStructure: this.readNodeStructure(this.props.topBarNodeId),
        })
    }

    handleNodeExpandClick = (nodeId) => {
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

    handleNodeAdd = () => {
        addNode(1, this.state.sideBarNodesStructure.length + 1, this.props.topBarNodeId, '未命名', '');
        this.refresh();
    }

    handleNodeDelete = (nodeId) => {
        deleteNode(nodeId);
        this.refresh();
    }

    handleContextMenu = (event) => {
        // 如果没有active的topbar node，那么右键无任何效果。
        if (this.props.activeNodeId === undefined) {
            return;
        }

        event.preventDefault();
        const menu = new Menu();
        menu.append(new MenuItem({ label: 'add node', click: this.handleNodeAdd}));
        menu.popup();
    }

    readNodeStructure = (parentNodeId) => {
        /** recursive read
         * 
         * Return: {
         *     thisNode: [Object]
         *     subNodes: [Array[Object]]
         * }
         */
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

    renderSideBarNodes = (nodes, activeNodeId) => {
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
                  onClick={() => {this.props.onNodeClick(thisNode.id)}}
                  indent={thisNode.level - 1}
                  onExpand={() => {this.handleNodeExpandClick(thisNode.id)}}
                  onDelete={() => {this.handleNodeDelete(thisNode.id)}}
                />
            );
            if (hasSubNodes && expand) {
                items = items.concat(this.renderSideBarNodes(nodeBlock.subNodes, activeNodeId))
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
              {this.props.activeNodeId !== undefined &&
                 <SideBarAddButton onClick={this.handleNodeAdd} />}
              {this.renderSideBarNodes(this.state.sideBarNodesStructure, this.props.activeNodeId)}
          </div>);
    }
}


class SideBarNode extends React.Component {
    /**
     * props:
     *     title [String]
     *     hasArrow [Boolean]
     *     expand [Boolean]
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
        const {title, hasArrow, expand, active, indent, onClick, onExpand} = this.props;
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
        this.state = {
            activeTopBarNodeId: undefined,
            activeNodeId: undefined
        }
    }

    handleTopBarNodeClick = (nodeId) => {
        this.setState({
            activeTopBarNodeId: nodeId
        });
        this.handleNodeClick(nodeId);
    }

    handleSideBarNodeClick = (nodeId) => {
        console.log(`handleSideBarNodeClick(${nodeId})`)
        this.handleNodeClick(nodeId);
    }

    handleNodeClick = (nodeId) => {
        this.setState({
            activeNodeId: nodeId
        });
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
              <TopBar
                 activeNodeId={this.state.activeTopBarNodeId}
                 onNodeClick={this.handleTopBarNodeClick} />
              <Page activeNodeId={this.state.activeNodeId} />
              <SideBar
                 key={this.state.activeTopBarNodeId} //如果activeTopBarNodeId变了，则SideBar直接re-create。
                 topBarNodeId={this.state.activeTopBarNodeId}
                 activeNodeId={this.state.activeNodeId}
                 onNodeClick={this.handleSideBarNodeClick}/>
        </div>);
    }
}

ReactDOM.render(<App />, document.getElementById('root'))
