import React from 'react';

import db from './db';
import config from './config';
import SideBarNode from './SideBarNode.jsx';
import SideBarAddButton from './SideBarAddButton.jsx';

const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;

const { MAX_PAGE_LEVEL, MIN_PAGE_LEVEL } = config;


/**
 * props:
 *   sectionId [Number]
 *   activePageId [Number]
 *   onPageClick [callback]
 * 
 * state:
 *   pages [Array[Object]]
 *   foldPageIdList: [Array[Number]]
 */
export default class SideBar extends React.Component {
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

  handlePageLevelUp = (page) => {
    if (page.level <= MAX_PAGE_LEVEL) {
      return;
    }
    db.UpgradePage(page.id, 1);
    this.refresh();
  }

  handlePageLevelDown = (page) => {
    if (page.level >= MIN_PAGE_LEVEL) {
      return;
    }
    db.DowngradePage(page.id, 1);
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
    if (this.props.sectionId === undefined) {
      return;
    }

    event.preventDefault();
    const menu = new Menu();
    menu.append(new MenuItem({ label: 'add node', click: this.handlePageAdd }));
    menu.popup();
  }

  /**
   * Params:
   *   pages [Array[Object]]: {
   *     id: [Number],
   *     section_id: [Number],
   *     level: [Number],
   *     sequence: [Number],
   *     title: [String]
   *   }
   *   activePageId [Number]
   */
  renderPages = (pages, activePageId) => {
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
          onClick={() => { this.props.onPageClick(p.id) }}
          level={p.level}
          onFold={() => { this.handleFoldClick(p.id) }}
          onDelete={() => { this.handlePageDelete(p.id) }}
          onLevelUp={() => { this.handlePageLevelUp(p) }}
          onLevelDown={() => { this.handlePageLevelDown(p) }}
        />
      );
      if (fold && hasSubPages) {
        // skip to last subPage.判定条件：
        //   下一个page的level < 当前遍历的page，或到最后一个page了，就判定为the last subPage。
        while (true) {
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
        onContextMenu={this.handleContextMenu}
      >
        {this.props.sectionId !== undefined &&
          <SideBarAddButton onClick={this.handlePageAdd} />}
        {this.renderPages(this.state.pages, this.props.activePageId)}
      </div>
    );
  }
}
