import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle((prevAngle) => (prevAngle + 1) % 360);
    }, 50);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
      // You might want to show an error message to the user here
    }
  };
  const getGlowingStyle = () => ({
    backgroundImage: `linear-gradient(${gradientAngle}deg, #2563EB, #0EA5E9, #1D4ED8, #2563EB)`,
    backgroundSize: '300% 300%',
    animation: 'gradientShift 5s ease infinite',
  });

  const handleEventsClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <header className="bg-surface shadow-md sticky top-0 z-50">
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link to="/" className="brand flex title-font font-medium items-center text-text cursor-pointer">
            <img src="logo.png" alt="logo" className="w-12 h-12 rounded-full shadow-lg" />
            <span className="ml-3 text-xl font-bold">Connect SRM</span>
          </Link>
          <button id="menuToggle" className="md:hidden text-text" onClick={toggleMenu}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
        <nav id="mobileMenu" className={`md:flex md:ml-auto md:flex-wrap md:items-center md:text-base md:justify-center w-full md:w-auto ${isMenuOpen ? 'block' : 'hidden'}`}>
          <Link 
            to="/events" 
            className="block py-2 px-4 md:mr-5 font-bold text-white rounded-full transition-all duration-300 relative overflow-hidden shadow-lg"
            style={getGlowingStyle()}
            onClick={handleEventsClick}
          >
            <span className="relative z-10">Events</span>
          </Link>
          <Link to="/features" className="block py-2 md:py-0 md:mr-5 hover:text-accent transition-colors duration-200 font-medium text-text">Features</Link>
          <Link to="/about" className="block py-2 md:py-0 md:mr-5 hover:text-accent transition-colors duration-200 font-medium text-text">About Us</Link>
          <Link to="/contact" className="block py-2 md:py-0 md:mr-5 hover:text-accent transition-colors duration-200 font-medium text-text">Contact</Link>
          {user ? (
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown}
            className="inline-flex items-center bg-gradient-to-r from-primary to-accent text-white border-0 py-2 px-6 focus:outline-none hover:from-accent hover:to-primary rounded-full text-base mt-4 md:mt-0 transition-all duration-200 shadow-md hover:shadow-lg w-full md:w-auto"
          >
            <User className="mr-2" size={18} />
            <span className="truncate max-w-[150px]">{user.displayName || user.email}</span>
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-1" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg">
              <Link to={`/profile/${encodeURIComponent(user.email)}`} className="block px-4 py-2 text-sm text-text hover:bg-background flex items-center">
                <Settings className="mr-2" size={18} />
                Profile
              </Link>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-text hover:bg-background flex items-center">
                <LogOut className="mr-2" size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className="inline-flex items-center bg-gradient-to-r from-primary to-accent text-white border-0 py-2 px-6 focus:outline-none hover:from-accent hover:to-primary rounded-full text-base mt-4 md:mt-0 transition-all duration-200 shadow-md hover:shadow-lg w-full md:w-auto">
          Login
          <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-1" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </Link>
      )}
          </nav>
      </div>
    </header>
  );
};

export default Navbar;