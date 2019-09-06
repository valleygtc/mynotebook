import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { readChildrenOf, readParentChainOf, readContentOf } from './db'


function TopBar({children}) {
    return (<div
        style={{
            gridColumn: '1/3',
            borderBottom: '1px solid black',
            display: 'flex',
            flexWrap: 'wrap'
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


function TopBarNode({title, active, onClick}) {
    /**
     * props:
     *     title [String]
     *     active [Boolean]
     * 
     *     onClick [callback func]
     */
    return (<div
        style={{
            border: '1px solid black',
            backgroundColor: active ? 'green' : 'white'
        }}
        onClick={onClick}>
      <span>{title}</span>
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
            backgroundColor: active ? 'green' : 'white'
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
        this.state = {
            topBarNodes: readChildrenOf(null),
            sideBarNodesStructure: [],
            activeNodeIdChain: [], // level(层级) low -> high
            expandNodeIdList: []
        };
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
                />
            );
        }
        return items;
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

    handleSideBarNodeClick = (nodeId) => {
        const parentChain = readParentChainOf(nodeId);
        const parentIdChain = parentChain.reverse().map((node) => {
            return node.id;
        });
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

    render() {
        return (<div
            style={{
                height: '100%',
                width: '100%',
                display: 'grid',
                gridTemplateRows: '5% 95%',
                gridTemplateColumns: '80% 20%'
            }}>
              <TopBar>
                {this.renderTopBarNodes(this.state.topBarNodes, this.state.activeNodeIdChain[0])}
              </TopBar>
              <Page activeNodeId={this.state.activeNodeIdChain[this.state.activeNodeIdChain.length - 1]} />
              <SideBar>
                {this.renderSideBarNodes(this.state.sideBarNodesStructure, this.state.activeNodeIdChain)}
              </SideBar>
        </div>);
    }
}

ReactDOM.render(<App />, document.getElementById('root'))
