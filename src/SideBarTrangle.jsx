import React from 'react';


/**
 * props:
 *   LeftTop [Bool]: 指示absolute position，true则为左上角，false则为左下角。
 */
export default function TopBarTrangle({ LeftTop }) {
  return (
    <div
      style={{
        width: 0,
        height: 0,
        border: 'solid 5px',
        borderColor: 'black transparent transparent transparent',
        position: 'absolute',
        left: '-6px',
        top: LeftTop ? '-6px' : '',
        bottom: !LeftTop ? '-6px' : ''
      }}
    />
  );
}
