import React from 'react';

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-5xl font-extrabold drop-shadow-lg ml-4">
        Journeo
      </div>
      <div className="flex space-x-4">
        {/* <button className="px-4 py-2 bg-green-500 text-white rounded">Register</button>
        <button className="px-4 py-2 bg-gray-800 text-white rounded">Login</button> */}
      </div>
    </nav>
  );
}

export default Navbar;
