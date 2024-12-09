import React from 'react';
import PropTypes from 'prop-types';
import { Globe, Phone, MapPin, ExternalLink } from 'lucide-react';

const Popup = ({ properties = null }) => {
  if (!properties) {
    return (
      <div className="p-4 bg-zinc-800 backdrop-blur-sm rounded-lg shadow-lg border border-zinc-700">
        <p className="text-zinc-400">No data available.</p>
      </div>
    );
  }

  const {
    index,
    name,
    address,
    primaryTypeDisplayName,
    website,
    googleMapsUri,
    phone,
    photoUri
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
    <div className="p-4 bg-zinc-800 backdrop-blur-sm rounded-lg shadow-lg border border-zinc-700 max-w-xs">
      <div className="space-y-3">
      {photoUri && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden -mt-2 -mx-2">
            <img
              src={photoUri}
              alt={`Photo of ${name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div>
          <h2 className="text-lg font-medium text-zinc-100">{name || 'N/A'}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-zinc-700 rounded text-xs text-zinc-100">
              Location {index || 'N/A'}
            </span>
            {primaryTypeDisplayNameText?.text && (
              <span className="px-2 py-0.5 bg-teal-500 text-zinc-100 rounded text-xs">
                {primaryTypeDisplayNameText.text}
              </span>
            )}
          </div>
        </div>

        {address && (
          <div className="flex items-start gap-2 text-zinc-300">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-400" />
            <p className="text-sm">{address}</p>
          </div>
        )}

        {/* Links */}
        <div className="space-y-2 pt-1">
          {website && website !== 'N/A' && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="truncate">Website</span>
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          )}

          {googleMapsUri && googleMapsUri !== 'N/A' && (
            <a
              href={googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>View on Maps</span>
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          )}

          {phone && phone !== 'N/A' && (
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Phone className="w-4 h-4 text-zinc-400" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      </div>
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
    photoUri: PropTypes.string
  }),
};

export default Popup;