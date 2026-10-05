import React from 'react';

import './spinner.css'; // Importe o arquivo CSS

const Spinner = ({ width = '40px', color = 'lightblue' }) => {
  const loaderStyle = {
    width,
    height: width,
    borderColor: color,
    borderRightColor: 'transparent',
  };

  return <div className="loader" style={loaderStyle}></div>;
};

export default Spinner;
