import React from 'react';

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md p-2 flex justify-between items-center">
      <div className="text-3xl font-extrabold drop-shadow-lg ml-4">
        Journeo
      </div>
      <div className="flex items-center space-x-4 mr-4">
        {/* GitHub Icon */}
        <a
          href="https://github.com/eugene-lok"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-800 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-6 h-6"
          >
            <path d="M12 .297C5.373.297 0 5.67 0 12.297c0 5.301 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.021c-3.338.726-4.033-1.416-4.033-1.416-.546-1.389-1.333-1.759-1.333-1.759-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.809 1.305 3.495.997.108-.775.419-1.305.762-1.605-2.665-.306-5.467-1.334-5.467-5.93 0-1.309.468-2.381 1.236-3.221-.123-.305-.535-1.532.117-3.193 0 0 1.008-.324 3.301 1.23.957-.266 1.983-.399 3.003-.405 1.02.006 2.046.139 3.005.405 2.29-1.554 3.296-1.23 3.296-1.23.653 1.661.241 2.888.118 3.193.771.84 1.235 1.911 1.235 3.221 0 4.607-2.807 5.617-5.479 5.917.431.37.815 1.096.815 2.209v3.282c0 .319.192.694.801.576C20.565 22.092 24 17.595 24 12.297 24 5.67 18.627.297 12 .297z" />
          </svg>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
