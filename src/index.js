import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { readChildrenOf } from './db'


class TopBar extends React.Component {
    /**
     * props:
     *     activeNodeId [Number]
     *     handleNodeClick [callback func]
     */
    constructor(props) {
        super(props);
        this.state = {
            nodes: this.readTopBarNodes()
        }
    }

    readTopBarNodes() {
        return readChildrenOf(null);
    }

    renderTopBarNodes(nodes, activeNodeId) {
        const items = [];
        for (const node of nodes) {
            items.push(
                <Node key={node.id}
                      title={node.title}
                      active={node.id === activeNodeId ? true : false}
                      handleClick={() => {this.props.handleNodeClick(node.id)}} />
            );
        }
        return items;
    }

    render(){
        return (<div
            style={{
                gridColumn: '1/3',
                borderBottom: '1px solid black',
                display: 'flex',
                flexWrap: 'wrap'
            }}>
              {this.renderTopBarNodes(this.state.nodes, this.props.activeNodeId)}
        </div>);
    }
}


class SideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: this.readSideBarNodes(this.props.activeNodeIdChain[0]),
            expandNodes: []
        }
    }

    readSideBarNodes(parentNodeId) {
        // recursive read
        const nodes_data = readChildrenOf(parentNodeId);
        const nodes = []
        for (const data of nodes_data) {
            nodes.push({
                thisNode: data,
                subNodes: this.readSideBarNodes(data.id)
            })
        }
        return nodes;
    }

    renderSideBarNodes(nodes) {
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
            const hasArrow = nodeBlock.subNodes ? true : false;
            items.push(
                <Node key={thisNode.id}
                        title={thisNode.title}
                        hasArrow={hasArrow}
                        expand={thisNode.expand}
                        active={thisNode.active} />
            );
            if (nodeBlock.subNodes) {
                items = items.concat(this.renderSideBarNodes(nodeBlock.subNodes))
            }
        }
        return items;
    }

    render() {
        return (<div
            style={{
                borderLeft: '1px solid black',
                display: 'flex',
                flexDirection: 'column'
            }}>
              {this.renderSideBarNodes(this.state.nodes)}
        </div>);
    }
}


function Node({title, hasArrow, expand, active, handleClick}) {
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
        onClick={handleClick}>
      {arrow}
      <span>{title}</span>
    </div>);
}


class Page extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: this.readPage(this.props.activeNodeId)
        }
    }

    readPage(nodeId) {
        // TODO
        return 'test content';
    }

    render() {
        return (<div>{this.state.content}</div>);
    }
}


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeNodeIdChain: [1, 2, 3]
        };
    }

    handleTopBarNodeClick = (nodeId) => {
        this.setState({
            activeNodeIdChain: [nodeId]
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
              <TopBar activeNodeId={this.state.activeNodeIdChain[0]}
                      handleNodeClick={this.handleTopBarNodeClick} />
              <Page activeNodeId={this.state.activeNodeIdChain[this.state.activeNodeIdChain.length - 1]} />
              <SideBar activeNodeIdChain={this.state.activeNodeIdChain} />
        </div>);
    }
    
}

ReactDOM.render(<App />, document.getElementById('root'))
