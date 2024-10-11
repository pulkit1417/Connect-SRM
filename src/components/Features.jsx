import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faRankingStar, faUsersRectangle, faBook } from '@fortawesome/free-solid-svg-icons';

const FeatureCard = ({ icon, title, description, delay }) => (
  <div className={`group relative w-full bg-gray-100 rounded-2xl p-4 transition-all duration-500 max-md:max-w-md max-md:mx-auto md:w-2/5 md:h-64 xl:p-7 xl:w-1/4 hover:bg-primary fade-in-up feature-card`} style={{ animationDelay: `${delay}s` }}>
    <div className="bg-white rounded-full flex justify-center items-center mb-5 w-14 h-14 icon-bounce">
      <FontAwesomeIcon icon={icon} className="text-primary text-xl" />
    </div>
    <h4 className="text-xl font-semibold text-gray-900 mb-3 capitalize transition-all duration-500 group-hover:text-white">{title}</h4>
    <p className="text-sm font-normal text-gray-500 transition-all duration-500 leading-5 group-hover:text-white">
      {description}
    </p>
  </div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: faBullhorn,
      title: "Announcement",
      description: "Stay informed with the latest updates. Our announcement feature ensures you never miss crucial news and alerts.",
      delay: 0.4
    },
    {
      icon: faRankingStar,
      title: "Leaderboard",
      description: "Highlight top achievers and foster competition with our leaderboard feature, perfect for tracking performance.",
      delay: 0.6
    },
    {
      icon: faUsersRectangle,
      title: "Community",
      description: "Join and interact with a vibrant community, share insights, and collaborate on projects with ease.",
      delay: 0.8
    },
    {
      icon: faBook,
      title: "Notes",
      description: "Capture and organize key insights with our notes feature, enhancing your productivity and keeping everything at your fingertips.",
      delay: 1
    }
  ];

  return (
    <section className="py-24 -mt-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 lg:mb-16 flex justify-center items-center flex-col gap-x-0 gap-y-6 lg:gap-y-0 lg:flex-row lg:justify-between max-md:max-w-lg max-md:mx-auto">
          <div className="relative w-full text-center lg:text-left lg:w-2/4 fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 leading-[3.25rem] lg:mb-6 mx-auto max-w-max lg:max-w-md lg:mx-0">Enjoy these finest features with our App</h2>
          </div>
          <div className="relative w-full text-center lg:text-left lg:w-2/4 fade-in-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-lg font-normal text-gray-500 mb-5">We provide all the tools you need to simplify your daily tasks and streamline your workflow with ease.</p>
            <a href="/" className="flex flex-row items-center justify-center gap-2 text-base font-semibold text-primary lg:justify-start hover-scale">
              Get Started 
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 15L11.0858 11.4142C11.7525 10.7475 12.0858 10.4142 12.0858 10C12.0858 9.58579 11.7525 9.25245 11.0858 8.58579L7.5 5" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </a>
          </div>
        </div>
        <div className="flex justify-center items-center gap-x-5 gap-y-8 lg:gap-y-0 flex-wrap md:flex-wrap lg:flex-nowrap lg:flex-row lg:justify-between lg:gap-x-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
      <style jsx>{`
        .fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.5s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes iconBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .icon-bounce {
          animation: iconBounce 2s infinite;
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;