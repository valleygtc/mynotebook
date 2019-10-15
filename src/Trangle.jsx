import React from 'react';


export default function Trangle() {
  return (
    <div
      style={{
        width: 0,
        height: 0,
        border: 'solid 5px',
        borderColor: 'black transparent transparent transparent',
        position: 'absolute',
        top: '-6px',
        right: '-6px'
      }}
    />
  );
}
