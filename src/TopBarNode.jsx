import React from 'react';

import TopBarTrangle from './TopBarTrangle.jsx'

const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;


/**
 * props:
 *   title [String]
 *   active [Boolean]
 * 
 *   onClick [callback]
 *   onDragStart [callback]
 *   onDrop [callback]
 *   onDelete [callback]
 */
export default class TopBarNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseOver: false,
      dragOver: false,
      tend2After: true,
    }
    this.boxRef = React.createRef(); // to get box width以用来判断鼠标当前位置是偏左还是偏右。
  }

  handleContextMenu = (event) => {
    event.preventDefault();
    //activate this section
    this.props.onClick();

    const menu = new Menu();
    menu.append(new MenuItem({ label: 'delete', click: this.props.onDelete }));
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
      dragOver: true
    })
  }

  handleDragLeave = (event) => {
    event.preventDefault();
    this.setState({
      dragOver: false
    })
  }

  handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const cursorOffsetX = event.nativeEvent.offsetX;
    const boxWidth = this.boxRef.current.clientWidth;
    if (cursorOffsetX > boxWidth / 2) {
      this.setState({
        tend2After: true
      })
    } else {
      this.setState({
        tend2After: false
      })
    }
  }

  handleDrop = (event) => {
    this.setState({
      dragOver: false
    })
    this.props.onDrop(this.state.tend2After, event);
  }

  render() {
    const { title, active, onClick, onDragStart } = this.props;
    const { mouseOver, dragOver, tend2After } = this.state;

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
          border: '1px solid black',
          backgroundColor: backgroundColor,
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative' // 为了子元素trangle的绝对定位。
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
          <TopBarTrangle topLeft={!tend2After} />}
        <div
          style={{
            margin: '5px 10px 0',
            pointerEvents: 'none' // 防止子元素触发ondragleave事件。
          }}
        >
          {title}
        </div>
      </div>
    );
  }
}
