import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Settings, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(0);
  const { user, logout, error, clearError } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle((prevAngle) => (prevAngle + 1) % 360);
    }, 50);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
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
      closeMenu();
      navigate('/login');
    } else {
      closeMenu();
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @media (max-width: 768px) {
            .mobile-nav-btn {
              margin-top:1rem;
              width: auto;
              margin-left: 1rem; 
              margin-bottom: 10px; 
              display: flex;
              align-items: center;
              justify-content: center;
              padding-left: 1rem;
              padding-right: 1rem;
            }
            
            .mobile-nav-btn svg {
              margin-left: 8px;
              width: 16px;
              height: 16px;
            }
          }
        `}
      </style>
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link to="/" className="flex title-font font-medium items-center text-gray-900 cursor-pointer" onClick={closeMenu}>
            <img src="https://firebasestorage.googleapis.com/v0/b/srm-app-f063c.appspot.com/o/teamLogos%2Flogo.png?alt=media&token=1ef1528d-1cfb-4470-ab2d-6abac588051b" alt="logo" className="w-12 h-12 rounded-full shadow-lg" />
            <span className="ml-3 text-xl font-bold">Connect SRM</span>
          </Link>
          <button className="md:hidden text-gray-900" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            )}
          </button>
        </div>
        <nav ref={menuRef} className={`md:flex md:ml-auto md:flex-wrap md:items-center md:text-base md:justify-center w-full md:w-auto ${isMenuOpen ? 'block' : 'hidden'}`}>
          <Link
            to="/events"
            className="events block py-2 px-4 md:mr-5 font-bold text-white rounded-full transition-all duration-300 relative overflow-hidden shadow-lg mobile-nav-btn"
            style={getGlowingStyle()}
            onClick={handleEventsClick}
          >
            <span className="relative z-10">Events</span>
          </Link>
          <Link to="/features" className="block py-2 md:py-0 md:mr-5 hover:text-blue-500 transition-colors duration-200 font-medium text-gray-900 mobile-nav-btn" onClick={closeMenu}>Features</Link>
          <Link to="/about" className="block py-2 md:py-0 md:mr-5 hover:text-blue-500 transition-colors duration-200 font-medium text-gray-900 mobile-nav-btn" onClick={closeMenu}>About Us</Link>
          <Link to="/contact" className="block py-2 md:py-0 md:mr-5 hover:text-blue-500 transition-colors duration-200 font-medium text-gray-900 mobile-nav-btn" onClick={closeMenu}>Contact</Link>
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 py-2 px-6 focus:outline-none hover:from-blue-600 hover:to-blue-700 rounded-full text-base mt-4 md:mt-0 transition-all duration-200 shadow-md hover:shadow-lg w-full md:w-auto mobile-nav-btn"
              >
                <User className="mr-2" size={18} />
                <span className="truncate max-w-[150px]">{user.name || user.email}</span>
                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-1" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                  <Link to={`/profile/${encodeURIComponent(user.email)}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" onClick={closeMenu}>
                    <Settings className="mr-2" size={18} />
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <LogOut className="mr-2" size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 py-2 px-4 focus:outline-none hover:from-blue-600 hover:to-blue-700 rounded-full text-base mt-4 md:mt-0 transition-all duration-200 shadow-md hover:shadow-lg w-full md:w-auto mobile-nav-btn" onClick={closeMenu}>
              <span>Login</span>
              <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-4 h-4 ml-2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </Link>
          )}
        </nav>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </header>
  );
};

export default Navbar;