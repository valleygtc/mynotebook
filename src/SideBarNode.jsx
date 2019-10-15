import React from 'react';

import config from './config';

const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;

const { MAX_PAGE_LEVEL, MIN_PAGE_LEVEL } = config;


/**
 * props:
 *   title [String]
 *   hasArrow [Boolean]
 *   fold [Boolean]
 *   active [Boolean]
 *   level [Number]
 * 
 *   onClick [callback]
 *   onFold [callback]
 *   onDelete [callback]
 *   onLevelUp [callback]
 *   onLevelDown [callback]
 */
export default class SideBarNode extends React.Component {
  handleContextMenu = (event) => {
    event.preventDefault();

    //activate this node
    this.props.onClick();

    const menu = new Menu();
    menu.append(new MenuItem({ label: 'delete', click: this.props.onDelete }));
    const canUpgrade = (this.props.level > MAX_PAGE_LEVEL);
    const canDowngrade = (this.props.level < MIN_PAGE_LEVEL);
    menu.append(new MenuItem({
      label: '创建子页',
      click: this.props.onLevelDown,
      enabled: canDowngrade
    }));
    menu.append(new MenuItem({
      label: '升级子页',
      click: this.props.onLevelUp,
      enabled: canUpgrade
    }));
    menu.popup();
    event.stopPropagation();
  }

  render() {
    const { title, hasArrow, fold, active, level, onClick, onFold } = this.props;
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
          border: active ? '1px solid black' : '',
          backgroundColor: active ? 'green' : 'white',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={onClick}
        onContextMenu={this.handleContextMenu}
      >
        <div
          style={{
            display: 'inline-block',
            margin: `${level * 8}px`
          }}
          onClick={onFold}
        >
          {arrow}
        </div>
        <div
          style={{
            display: 'inline-block'
          }}
        >
          {title}
        </div>
      </div>
    );
  }
}
