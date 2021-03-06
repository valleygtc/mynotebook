import React from 'react';


export default function TopBarAddButton({ onClick }) {
  return (
    <div
      style={{
        border: '1px solid black',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onClick}
    >
      +
    </div>
  );
}
