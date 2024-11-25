import React from 'react';

const Popup = ({ index, name, address }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-1">Location {index}</h2>
      <h3 className="text-sm font-medium">{name}</h3>
      {/* {primaryType && (
        <h4 className="text-sm text-gray-500 mb-1">{primaryType}</h4>
      )} */}
      <p className="text-xs text-gray-600">{address}</p>
    </div>
  );
};

export default Popup;