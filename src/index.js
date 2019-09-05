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


function Node({title, hasArrow, expand, active, onClick}) {
    /**
     * props:
     *     title [String]
     *     hasArrow [Boolean]
     *     expand [Boolean]
     *     active [Boolean]
     * 
     *     handleClick [callback func]
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
    return (<div
        style={{
            border: '1px solid black',
            backgroundColor: active ? 'green' : 'white'
        }}
        onClick={onClick}>
      {arrow}
      <span>{title}</span>
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
            sideBarNodes: [],
            activeNodeIdChain: [] // level(层级) low -> high
        };
    }

    renderTopBarNodes = (nodes, activeNodeId) => {
        const items = [];
        for (const node of nodes) {
            items.push(
                <Node key={node.id}
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
            sideBarNodes: this.readNodeStructure(nodeId)
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
            const hasArrow = nodeBlock.subNodes ? true : false;
            items.push(
                <Node
                  key={thisNode.id}
                  title={thisNode.title}
                  hasArrow={hasArrow}
                  expand={thisNode.expand}
                  active={thisNode.id === activeNodeId ? true : false}
                  onClick={() => {this.handleSideBarNodeClick(thisNode.id)}}
                />
            );
            if (nodeBlock.subNodes) {
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
                {this.renderSideBarNodes(this.state.sideBarNodes, this.state.activeNodeIdChain)}
              </SideBar>
        </div>);
    }
}

ReactDOM.render(<App />, document.getElementById('root'))
