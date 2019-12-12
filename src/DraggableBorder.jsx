import React from 'react';


export default function DraggableBorder({
  onDrag,
}) {
  const handleBorderDrag = (event) => {
    const leftWidthPercentage = event.pageX / window.innerWidth;
    onDrag(leftWidthPercentage);
  }

  const handleMouseUp = (event) => {
    console.log('handleMouseUp');
    event.preventDefault();
    window.removeEventListener('mousemove', handleBorderDrag);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  const handleMouseDown = (event) => {
    console.log('handleMouseDown');
    event.preventDefault();
    window.addEventListener('mousemove', handleBorderDrag);
    window.addEventListener('mouseup', handleMouseUp);
  }

  return (
    <div
      style={{
        backgroundColor: 'black',
        width: '2px',
        cursor: 'col-resize',
      }}
      onMouseDown={handleMouseDown}
    />
  )
}
