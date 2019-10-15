import React from 'react';

import Trangle from './Trangle.jsx'

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
      isOver: false,
      trendToRight: true
    }
    this.boxRef = React.createRef(); // to get box width以用来判断鼠标当前位置是偏左还是偏右。
  }

  handleDragEnter = (event) => {
    event.preventDefault();
    this.setState({
      isOver: true
    })
  }

  handleDragLeave = (event) => {
    event.preventDefault();
    this.setState({
      isOver: false
    })
  }

  handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const cursorOffsetX = event.nativeEvent.offsetX;
    const boxWidth = this.boxRef.current.clientWidth;
    if (cursorOffsetX > boxWidth / 2) {
      this.setState({
        trendToRight: true
      })
    } else {
      this.setState({
        trendToRight: false
      })
    }
  }

  handleDrop = (event) => {
    this.setState({
      isOver: false
    })
    this.props.onDrop(this.state.trendToRight, event);
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

  render() {
    const { title, active, onClick, onDragStart } = this.props;
    return (
      <div
        ref={this.boxRef}
        style={{
          border: '1px solid black',
          backgroundColor: active ? 'green' : 'white',
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative' // 为了子元素trangle的绝对定位。
        }}
        onClick={onClick}
        draggable={true}
        onDragStart={onDragStart}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onContextMenu={this.handleContextMenu}
      >
        {(this.state.isOver && !this.state.trendToRight) &&
          <Trangle />}
        <div
          style={{
            margin: '5px 10px 0',
            pointerEvents: 'none' // 防止子元素触发ondragleave事件。
          }}
        >
          {title}
        </div>
        {(this.state.isOver && this.state.trendToRight) &&
          <Trangle />}
      </div>
    );
  }
}
