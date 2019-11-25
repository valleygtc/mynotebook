import React from 'react';


/**
 * props:
 *   topLeft [Bool]: 指示absolute position，true则为左上角，false则为右上角。
 */
export default function TopBarTrangle({ topLeft }) {
  return (
    <div
      style={{
        width: 0,
        height: 0,
        border: 'solid 5px',
        borderColor: 'black transparent transparent transparent',
        position: 'absolute',
        top: '-6px',
        left: topLeft ? '-6px' : '',
        right: !topLeft ? '-6px' : ''
      }}
    />
  );
}
