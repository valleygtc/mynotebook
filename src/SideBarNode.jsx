import React from 'react';

import SideBarTrangle from './SideBarTrangle.jsx';
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
 *   onDragStart [callback]
 *   onDrop [callback]
 */
export default class SideBarNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOver: false,
      trend2After: true,
    };
    this.boxRef = React.createRef(); // to get box width以用来判断鼠标当前位置是偏左还是偏右。
  }

  handleDragEnter = (event) => {
    event.preventDefault();
    this.setState({
      isOver: true,
    });
  }

  handleDragLeave = (event) => {
    event.preventDefault();
    this.setState({
      isOver: false,
    });
  }

  handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const cursorOffsetY = event.nativeEvent.offsetY;
    const boxHeight = this.boxRef.current.clientHeight;
    if (cursorOffsetY > boxHeight / 2) {
      this.setState({
        trend2After: true,
      });
    } else {
      this.setState({
        trend2After: false,
      });
    }
  }

  handleDrop = (event) => {
    this.setState({
      isOver: false,
    });
    this.props.onDrop(this.state.trend2After, event);
  }

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
    const { title, hasArrow, fold, active, level, onClick, onFold, onDragStart } = this.props;
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
        ref={this.boxRef}
        style={{
          border: active ? '1px solid black' : '',
          backgroundColor: active ? 'green' : 'white',
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative', // 为了子元素trangle的绝对定位。
        }}
        onClick={onClick}
        onContextMenu={this.handleContextMenu}
        draggable={true}
        onDragStart={onDragStart}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
      >
        {this.state.isOver &&
          <SideBarTrangle LeftTop={!this.state.trend2After} />}
        <div
          style={{
            display: 'inline-block',
            marginLeft: `${level * 8}px`
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
