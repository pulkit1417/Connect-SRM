import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-surface shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link to="/" className=" brand flex title-font font-medium items-center text-text cursor-pointer">
            <img src="logo.png" alt="logo" className="w-12 h-12 rounded-full shadow-lg" />
            <span className="ml-3 text-xl font-bold">Connect SRM</span>
          </Link>
          <button id="menuToggle" className="md:hidden" onClick={toggleMenu}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
        <nav id="mobileMenu" className={`md:flex md:ml-auto md:flex-wrap md:items-center md:text-base md:justify-center w-full md:w-auto ${isMenuOpen ? 'block' : 'hidden'}`}>
          <Link to="/events" className="block py-2 md:mr-5 hover:text-accent transition-colors duration-200 font-medium">Events</Link>
          <Link to="/features" className="block py-2 md:mr-5 hover:text-accent transition-colors duration-200 font-medium">Features</Link>
          <Link to="/about" className="block py-2 md:mr-5 hover:text-accent transition-colors duration-200 font-medium">About Us</Link>
          <Link to="/contact" className="block py-2 md:mr-5 hover:text-accent transition-colors duration-200 font-medium">Contact</Link>
          <Link to="/" className="inline-flex items-center bg-gradient-to-r from-primary to-accent text-white border-0 py-2 px-6 focus:outline-none hover:from-accent hover:to-primary rounded-full text-base mt-4 md:mt-0 transition-all duration-200 shadow-md hover:shadow-lg w-full md:w-auto">
            Get Started
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-1" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;