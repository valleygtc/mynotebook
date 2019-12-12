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
      activePageId: undefined,
      pageWidth: 0.8, // 80%
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

  handleBorderDragStart = (event) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
  }

  handleBorderDrag = (event) => {
    const pageWidth = event.pageX / window.innerWidth;
    console.log('handleBorderDrag: %o', { pageWidth });
    this.setState({
      pageWidth,
    });
  }

  handleBorderDragEnd = (event) => {
    const pageWidth = event.pageX / window.innerWidth;
    console.log('handleBorderDragEnd: %o', { pageWidth });
    this.setState({
      pageWidth,
    });
  }

  // handleDragOver = (event) => {
  //   event.preventDefault();
  //   event.dataTransfer.dropEffect = 'move';
  // }

  // handleDrop = (event) => {
  //   event.preventDefault();
  // }

  render() {
    const { activeSectionId, activePageId, pageWidth } = this.state;

    return (
      <div
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <div
          style={{
            boxSizing: 'border-box',
            height: '4%',
            display: 'flex',
            alignItems: 'flex-end',
            borderBottom: '1px solid black',
          }}
        >
          <TopBar
            activeSectionId={activeSectionId}
            onSectionClick={this.handleSectionClick}
          />
        </div>
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '95%',
            display: 'flex',
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              flex: `0 1 ${pageWidth * 100}%`,
            }}
          >
            <Page
              key={`page-${activePageId}`} //如果activePageId变了，则Page直接re-create。
              activePageId={activePageId}
            />
          </div>
          <div
            style={{
              backgroundColor: 'black',
              width: '2px',
              cursor: 'col-resize',
            }}
            draggable={true}
            onDragStart={this.handleBorderDragStart}
            onDrag={this.handleBorderDrag}
            onDragEnd={this.handleBorderDragEnd}
          />
          <div
            style={{
              flex: `0 1 ${(1 - pageWidth) * 100}%`,
            }}
          >
            <SideBar
              key={`sidebar-${activeSectionId}`} //如果activeTopBarNodeId变了，则SideBar直接re-create。
              sectionId={activeSectionId}
              activePageId={activePageId}
              onPageClick={this.handlePageNodeClick}
            />
          </div>
        </div>
      </div>
    );
  }
}
