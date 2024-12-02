import React from 'react';
import PropTypes from 'prop-types';

const Popup = ({ properties = null }) => {
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

  const primaryTypeDisplayNameText = (() => {
    try {
      return typeof primaryTypeDisplayName === 'string'
        ? JSON.parse(primaryTypeDisplayName)
        : primaryTypeDisplayName;
    } catch (error) {
      console.error('Error parsing primaryTypeDisplayName:', error);
      return null; 
    }
  })();

  return (
    <div className="p-4 font-sans bg-white rounded-lg shadow-md max-w-xs">
      <h2 className="text-lg font-medium">{name || 'N/A'}</h2>
      <h3 className="text-sm font-medium">(Location {index || 'N/A'})</h3>
      {primaryTypeDisplayNameText?.text && (
        <p className="text-xs mt-1 font-bold text-gray-700">
          {primaryTypeDisplayNameText.text}
        </p>
      )}
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

export default Popup;
