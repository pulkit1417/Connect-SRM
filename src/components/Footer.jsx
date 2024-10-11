import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-footer text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex flex-col items-center md:items-start">
              <Link to="/" className="flex items-center space-x-3">
                <img src="logo.png" alt="Connect SRM Logo" className="w-14 h-14 rounded-full" />
                <span className="text-2xl font-bold text-primary">Connect SRM</span>
              </Link>
              <p className="mt-2 text-sm text-gray-600">Connecting students, empowering futures.</p>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-lg font-semibold mb-2 text-primary">Contact Us</h3>
              <a
                href="mailto:collegeconnectsrm@gmail.com"
                className="text-gray-600 hover:text-primary transition-colors duration-300"
              >
                collegeconnectsrm&#64;gmail.com
              </a>
              <p className="mt-2 text-sm text-gray-500">&copy; 2024 Connect SRM. All rights reserved.</p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <h3 className="text-lg font-semibold mb-2 text-primary">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://twitter.com/Connect_SRM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors duration-300 transform hover:scale-125"
                >
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a
                  href="https://instagram.com/connect_srm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors duration-300 transform hover:scale-125"
                >
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a
                  href="https://www.linkedin.com/in/connect-srm-90842a329"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors duration-300 transform hover:scale-125"
                >
                  <i className="fab fa-linkedin-in text-xl"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;