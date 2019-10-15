import React from 'react';

import db from './db';
import TopBarNode from './TopBarNode.jsx';
import TopBarAddButton from './TopBarAddButton.jsx';

const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;


/**
 * props:
 *   activeSectionId [Number]
 *   onSectionClick [callback]
 * state:
 *   sections [Array[Object]]: {id [Number], sequence [Number], title [String]}
 */
export default class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sections: db.readSections()
    }
  }

  refresh = () => {
    this.setState({
      sections: db.readSections()
    })
  }

  handleSectionAdd = () => {
    const sections = this.state.sections;
    db.addSection(sections.length, '未命名');
    this.refresh();
  }

  handleSectionDelete = (id) => {
    db.deleteSection(id);
    this.refresh();
    // section删除后，同时更新sidebar。
    this.props.onSectionClick(undefined);
  }

  handleSectionClick = (id) => {
    console.log(`TopBar handleSectionClick(${id})`);
    if (id === this.props.activeSectionId) {
      return
    } else {
      console.log(`TopBar handleSectionClick call this.props.onSectionClick(${id})`);
      this.props.onSectionClick(id);
    }
  }

  handleContextMenu = (event) => {
    event.preventDefault();
    const menu = new Menu();
    menu.append(new MenuItem({ label: 'Add Section', click: this.handleSectionAdd }));
    menu.popup();
  }

  handleSectionDragStart = (id, event) => {
    event.dataTransfer.setData('fromId', id);
    event.dataTransfer.dropEffect = 'move';
  }

  handleSectionDrop = (toId, dropAfter, event) => {
    event.preventDefault();
    const fromId = parseInt(event.dataTransfer.getData('fromId'));
    // perform section move: write database and refresh: retrive data then setState(sections).
    let fromSection, toSection;
    for (const sec of this.state.sections) {
      if (sec.id === fromId) {
        fromSection = sec;
      }
      if (sec.id === toId) {
        toSection = sec;
      }
    }
    const [fromSeq, toSeq] = [fromSection.sequence, toSection.sequence];
    console.log({ fromSection, toSection, dropAfter });
    if (fromSeq === toSeq) {
      return;
    } else if (fromSeq < toSeq) {
      if (dropAfter) {
        db.updateSeqOfSection(fromSection.id, toSection.sequence);
        const middleSections = this.state.sections.slice(fromSeq + 1, toSeq + 1);
        for (const sec of middleSections) {
          db.minusSeqOfSection(sec.id, 1);
        }
      } else {
        db.updateSeqOfSection(fromSection.id, toSection.sequence - 1);
        const middleSections = this.state.sections.slice(fromSeq + 1, toSeq);
        for (const sec of middleSections) {
          db.minusSeqOfSection(sec.id, 1);
        }
      }
    } else {
      if (dropAfter) {
        db.updateSeqOfSection(fromSection.id, toSection.sequence + 1);
        const middleSections = this.state.sections.slice(toSeq + 1, fromSeq);
        for (const sec of middleSections) {
          db.addSeqOfSection(sec.id, 1);
        }
      } else {
        db.updateSeqOfSection(fromSection.id, toSection.sequence);
        const middleSections = this.state.sections.slice(toSeq, fromSeq);
        for (const sec of middleSections) {
          db.addSeqOfSection(sec.id, 1);
        }
      }
    }
    this.refresh();
  }

  render() {
    const secItems = this.state.sections.map((sec) => (
      <TopBarNode
        key={sec.id}
        title={sec.title}
        active={sec.id === this.props.activeSectionId ? true : false}
        onClick={() => { this.handleSectionClick(sec.id) }}
        onDragStart={(event) => { this.handleSectionDragStart(sec.id, event) }}
        onDrop={(dropAfter, event) => { this.handleSectionDrop(sec.id, dropAfter, event) }}
        onDelete={() => { this.handleSectionDelete(sec.id) }}
      />
    ));

    return (
      <div
        style={{
          gridColumn: '1/3',
          borderBottom: '1px solid black',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}
        onContextMenu={this.handleContextMenu}
      >
        {secItems}
        <TopBarAddButton onClick={this.handleSectionAdd} />
      </div>
    );
  }
}
