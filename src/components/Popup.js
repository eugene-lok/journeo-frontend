// Popup.js
import React from 'react';
import PropTypes from 'prop-types';

const Popup = ({ properties }) => {
  if (!properties) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <p className="text-xs text-gray-600">No data available.</p>
      </div>
    );
  }

  const {
    index,
    name,
    address,
    isAirport,
    primaryType,
    primaryTypeDisplayName,
    googleId,
    website,
    googleMapsUri,
    phone,
  } = properties;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-xs">
      <h2 className="text-lg font-semibold mb-1">Location {index || 'N/A'}</h2>
      <h3 className="text-sm font-medium">{name || 'N/A'}</h3>
      <p className="text-xs text-gray-600">{address || 'N/A'}</p>

      {website && website !== 'N/A' && (
        <p className="text-xs text-blue-600 mt-1">
          <span className="font-semibold">Website:</span>{' '}
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {website}
          </a>
        </p>
      )}
      {googleMapsUri && googleMapsUri !== 'N/A' && (
        <p className="text-xs text-blue-600 mt-1">
          <span className="font-semibold">Google Maps:</span>{' '}
          <a
            href={googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Maps
          </a>
        </p>
      )}
      {phone && phone !== 'N/A' && (
        <p className="text-xs text-gray-500 mt-1">
          <span className="font-semibold">Phone:</span> {phone}
        </p>
      )}
    </div>
  );
};

// Define PropTypes
Popup.propTypes = {
  properties: PropTypes.shape({
    index: PropTypes.number,
    name: PropTypes.string,
    address: PropTypes.string,
    isAirport: PropTypes.bool,
    primaryType: PropTypes.string,
    primaryTypeDisplayName: PropTypes.string,
    googleId: PropTypes.string,
    website: PropTypes.string,
    googleMapsUri: PropTypes.string,
    phone: PropTypes.string,
  }),
};

// Define Default Props
Popup.defaultProps = {
  properties: null,
};

export default Popup;
