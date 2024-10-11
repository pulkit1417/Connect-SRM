import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

const EventsComponent = () => {
  const [email, setEmail] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const notificationRef = useRef(null);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (isValidEmail(email)) {
      setShowNotification(true);
      setEmail('');
      setIsEmailValid(true);
    } else {
      setIsEmailValid(false);
    }
  };

  const hideNotification = () => {
    if (notificationRef.current) {
      notificationRef.current.classList.remove('show');
      setTimeout(() => {
        setShowNotification(false);
      }, 300);
    }
  };

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  return (
    <main className="flex-grow container mx-auto px-6 py-12">
      {showNotification && (
        <div className="notification-container mt-4 fixed top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm">
          <div ref={notificationRef} className={`notification p-4 rounded bg-green-500 text-white shadow-lg ${showNotification ? 'show' : ''}`}>
            <div className="flex justify-between items-center">
              <p className="font-semibold text-sm">Thank you for subscribing! We'll keep you updated on our exciting events.</p>
              <button onClick={hideNotification} className="text-white ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={ref} className={`flex flex-col lg:flex-row items-center justify-between mb-20 ${inView ? 'animate-on-scroll show' : 'animate-on-scroll'}`}>
        <div className="lg:w-1/2 mb-12 lg:mb-0">
          <h1 className="text-5xl font-bold text-blue-600 mb-6 leading-tight">Exciting Events<br/>Coming Soon!</h1>
          <p className="text-lg text-gray-600 mb-8">Get ready for an unforgettable experience of knowledge and fun. Our team is preparing thrilling events that will challenge your mind and spark your curiosity. Stay tuned for a journey of learning and friendly competition!</p>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105"
            >
              Notify Me
            </button>
          </form>
          {!isEmailValid && <p className="text-red-500 mt-2">Please enter a valid email address.</p>}
        </div>
        <div className="lg:w-1/2 lg:pl-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 rounded-lg blur-xl"></div>
            <img src="coming_soon.jpg" alt="coming-soon" className="relative rounded-lg shadow-2xl w-full h-auto object-cover" />
          </div>
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-3xl font-bold text-blue-600 mb-8 text-center">What to Expect</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Challenging Questions", description: "Test your knowledge with a wide range of intriguing and thought-provoking questions." },
            { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", title: "Team Competitions", description: "Form teams and compete in exciting group quiz challenges." },
            { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: "Interactive Rounds", description: "Engage in various interactive quiz formats and unique challenge rounds." },
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 hover-card">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          width: 100%;
          max-width: 24rem;
        }
        
        .notification {
          opacity: 0;
          transform: translateY(-100%);
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }
        
        .notification.show {
          opacity: 1;
          transform: translateY(0);
        }
        
        .hover-card {
          transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 1s ease-out;
        }
        
        .animate-on-scroll.show {
          opacity: 1;
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .lg\\:w-1\\/2 img {
            height: 300px;
            object-fit: cover;
          }
        }
      `}</style>
    </main>
  );
};

export default EventsComponent;