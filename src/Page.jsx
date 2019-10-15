import React from 'react';

import db from './db';


/**
 * props:
 *   activePageId [Number]
 * state:
 *   content [String]
 */
export default class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: db.readContentOf(this.props.activePageId)
    }
  }

  render() {
    return (<div>{this.state.content}</div>);
  }
}
