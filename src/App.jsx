import React from 'react';

import db from './db';
import TopBar from './TopBar.jsx';
import SideBar from './SideBar.jsx';
import Page from './Page.jsx';


/**
 * state:
 *   activeSectionId [Number]
 *   activePageId [Number]
 */
export default class App extends React.Component {
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
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'grid',
          gridTemplateRows: '5% 95%',
          gridTemplateColumns: '80% 20%'
        }}
      >
        <TopBar
          activeSectionId={this.state.activeSectionId}
          onSectionClick={this.handleSectionClick}
        />
        <div>
          <Page
            key={this.state.activePageId} //如果activePageId变了，则Page直接re-create。
            activePageId={this.state.activePageId}
          />
        </div>
        <SideBar
          key={this.state.activeSectionId} //如果activeTopBarNodeId变了，则SideBar直接re-create。
          sectionId={this.state.activeSectionId}
          activePageId={this.state.activePageId}
          onPageClick={this.handlePageNodeClick}
        />
      </div>
    );
  }
}
