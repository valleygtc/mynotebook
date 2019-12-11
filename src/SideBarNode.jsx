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
      mouseOver: false,
      dragOver: false,
      tend2After: true,
    };
    this.boxRef = React.createRef(); // to get box width以用来判断鼠标当前位置是偏左还是偏右。
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

  handleMouseEnter = (event) => {
    event.preventDefault();
    console.log('handleMouseEnter: %o', { title: this.props.title })
    this.setState({
      mouseOver: true,
    });
  }

  handleMouseLeave = (event) => {
    event.preventDefault();
    console.log('handleMouseLeave: %o', { title: this.props.title })
    this.setState({
      mouseOver: false,
    });
  }

  handleDragEnter = (event) => {
    event.preventDefault();
    this.setState({
      dragOver: true,
    });
  }

  handleDragLeave = (event) => {
    event.preventDefault();
    this.setState({
      dragOver: false,
    });
  }

  handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const cursorOffsetY = event.nativeEvent.offsetY;
    const boxHeight = this.boxRef.current.clientHeight;
    if (cursorOffsetY > boxHeight / 2) {
      this.setState({
        tend2After: true,
      });
    } else {
      this.setState({
        tend2After: false,
      });
    }
  }

  handleDrop = (event) => {
    this.setState({
      dragOver: false,
    });
    this.props.onDrop(this.state.tend2After, event);
  }

  render() {
    const { title, hasArrow, fold, active, level, onClick, onFold, onDragStart } = this.props;
    const { mouseOver, dragOver, tend2After } = this.state;

    let arrow;
    if (hasArrow) {
        arrow = fold ? (<span>{'>'}</span>) : (<span>{'v'}</span>)
    } else {
      arrow = null;
    }

    let backgroundColor;
    if (active) {
      backgroundColor = 'green';
    } else {
      backgroundColor = mouseOver ? 'rgb(169,169,169)' : 'white';
    }

    return (
      <div
        ref={this.boxRef}
        style={{
          // drag over加分割线指示。
          border: `1px solid ${backgroundColor}`,
          borderTopColor: (dragOver && !tend2After) ? 'black' : backgroundColor,
          borderBottomColor: (dragOver && tend2After) ? 'black' : backgroundColor,
          backgroundColor: backgroundColor,
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative', // 为了子元素trangle的绝对定位。
        }}
        onClick={onClick}
        onContextMenu={this.handleContextMenu}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        draggable={true}
        onDragStart={onDragStart}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
      >
        {dragOver &&
          <SideBarTrangle LeftTop={!tend2After} />}
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
