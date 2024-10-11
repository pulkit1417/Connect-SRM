import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [email, setEmail] = useState('');
  const [subscribeFormValid, setSubscribeFormValid] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setSubscribeFormValid(e.target.validity.valid);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (subscribeFormValid) {
      setNotificationMessage(`Successfully subscribed: ${email}`);
      setShowNotification(true);
      setEmail('');
      setSubscribeFormValid(false);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };
  
  return (
    <>
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <section className="text-gray-700 bg-white mt-14 mb-24">
        <div className="container mx-auto flex px-5 py-12 md:py-16 md:flex-row flex-col items-center">
          {/* Left Side */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-8 md:mb-0 items-center text-center"
          >
            <h1 className="title-font sm:text-5xl text-4xl mb-4 font-bold text-gray-900 leading-tight">
              Revolutionize Your
              <br className="hidden lg:inline-block" />
              <span className="text-primary">Student Engagement</span>
            </h1>
            <p className="mb-6 leading-relaxed text-lg">
              Connect SRM empowers educational institutions to build stronger relationships with students. Our innovative platform streamlines communication, enhances support, and drives student success.
            </p>
            <form onSubmit={handleSubmit} className="flex w-full md:justify-start justify-center items-end mb-4">
              <div className="relative mr-4 md:w-full lg:w-full xl:w-1/2 w-2/4">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  className="w-full bg-gray-100 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base outline-none text-gray-700 py-2 px-4 leading-8 transition-colors duration-200 ease-in-out"
                  required
                />
                {!subscribeFormValid && email && (
                  <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!subscribeFormValid}
                className="inline-flex text-white bg-gradient-to-r from-primary to-accent border-0 py-2 px-6 focus:outline-none hover:from-accent hover:to-primary rounded-full text-lg transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-gray-500 mb-4 w-full">
              Stay updated with our latest features and releases.
            </p>
            <div className="flex lg:flex-row md:flex-col">
              <a
                href="https://play.google.com/store/apps/details?id=com.siddharthnarela.APP&hl=en_US"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-primary to-accent text-white inline-flex py-2 px-4 rounded-lg items-center hover:from-accent hover:to-primary focus:outline-none transition-all duration-200 shadow-md hover:shadow-lg no-underline transform hover:-translate-y-1 hover:scale-105"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-5 h-5"
                  viewBox="0 0 512 512"
                >
                  <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z"></path>
                </svg>
                <span className="ml-3 flex items-start flex-col leading-none">
                  <span className="text-xs mb-1">GET IT ON</span>
                  <span className="title-font font-medium">Google Play</span>
                </span>
              </a>
            </div>
          </motion.div>
          {/* Right Side */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6"
          >
            <img
              src="Connect SRM.png"
              alt="hero"
              className="object-cover object-center rounded-lg shadow-2xl animate-float"
            />
          </motion.div>
        </div>

        {/* Animated Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="fixed top-5 left-0 right-0 flex justify-center items-center z-50"
            >
              <div className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md">
                {notificationMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default Home;