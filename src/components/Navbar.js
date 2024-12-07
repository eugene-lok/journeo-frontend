import React from 'react';
import {Map} from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="w-full bg-zinc-900 backdrop-blur-sm px-6 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Map className="w-6 h-6 text-teal-500" />
          <span className="text-xl font-semibold text-zinc-100">
            Journeo
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;