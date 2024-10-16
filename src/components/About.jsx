import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <section id="about" className="text-text body-font bg-white py-8 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          {/* About Us Section */}
          <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-primary animate-slide-in-left">About Us</h1>
            <p className="mb-4 leading-relaxed text-base sm:text-lg text-muted animate-fade-in">
              Connect SRM is dedicated to bridging the gap between students and institution. Our mission is to create an intuitive platform that fosters seamless communication, engagement, and collaboration.
            </p>
            <p className="mb-4 leading-relaxed text-base sm:text-lg text-muted animate-fade-in" style={{animationDelay: '0.2s'}}>
              By leveraging modern technology, we provide tools that not only enhance academic management but also focus on strengthening student-institution relationships. We believe that engaged students are empowered learners.
            </p>
            <p className="text-base sm:text-lg text-muted animate-fade-in" style={{animationDelay: '0.4s'}}>
              Join us as we revolutionize student engagement, streamline support systems, and build a more connected academic environment where growth and success are prioritized for all stakeholders.
            </p>
            <div className="flex justify-center lg:justify-start mt-8 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <Link to="/contact" className="cursor-pointer inline-flex text-white bg-gradient-to-r from-primary to-accent border-0 py-2 px-6 focus:outline-none hover:from-accent hover:to-primary rounded-full text-lg shadow-md hover:shadow-lg transition-all duration-200">
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Team Section */}
          <div className="lg:w-1/2 w-full animate-fade-in-smooth">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Our Team</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 justify-items-center">
              {/* Team Member 1 */}
              <TeamMember
                name="Siddharth Narela"
                role="Founder"
                image="sn.jpg"
                linkedin="https://www.linkedin.com/in/siddharth-narela-11ba04185"
                github="https://github.com/siddharthnarela"
              />
              
              {/* Team Member 2 */}
              <TeamMember
                name="Pulkit Gupta"
                role="Co-Founder"
                image="pg.jpg"
                linkedin="https://www.linkedin.com/in/pulkitgupta2408"
                github="https://github.com/pulkit1417"
              />

              {/* Team Member 3 */}
              <TeamMember
                name="Kushagra Pandey"
                role="Co-Founder"
                image="kp.jpg"
                linkedin="https://www.linkedin.com/in/kushagra-pandey-24257a240"
                github="https://www.github.com/opkpEh"
              />

              {/* Team Member 4 */}
              <TeamMember
                name="Harsh Bhushan Dixit"
                role="Co-Founder"
                image="hd.jpg"
                linkedin="https://www.linkedin.com/in/harsh-bhushan-dixit-0953b52b1"
                github="https://github.com/HarshBhushanD"
              />

              {/* Team Member 5 */}
              <TeamMember
                name="Anubhav Parashar"
                role="Co-Founder"
                image="ap.jpg"
                linkedin="https://www.linkedin.com/in/anubhav-parashar-4aa61b280/"
                github="https://github.com/AnubhavScripts"
              />

              {/* Team Member 6 */}
              <TeamMember
                name="Azman Idrisi"
                role="Graphic Design Lead"
                image="ma.jpg"
                linkedin="https://www.linkedin.com/in/azman-idrisi"
                github="https://github.com/Azman-Idrisi"
              />

              {/* Team Member 7 */}
              <TeamMember
                name="Aparna Singh"
                role="Marketing Lead"
                image="as.jpg"
                linkedin="https://www.linkedin.com/in/aparna-singh-8614b9333"
                github="https://www.github.com/aparna12-03"
              />

              {/* Other Members */}
              <div className="text-center mb-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 overflow-hidden rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                  <img src="logo.png" alt="Other Members" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm">Other Members...</h3>
                <div className="flex justify-center mt-1">
                  <a href="https://linktr.ee/connect_srm" target="_blank" rel="noopener noreferrer" className="text-[#12e312]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                      <path fill="currentColor" d="m13.736 5.853l4.005-4.117l2.325 2.38l-4.2 4.005h5.908v3.305h-5.937l4.229 4.108l-2.325 2.334l-5.74-5.769l-5.741 5.769l-2.325-2.325l4.229-4.108H2.226V8.121h5.909l-4.2-4.004l2.324-2.381l4.005 4.117V0h3.472zm-3.472 10.306h3.472V24h-3.472z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TeamMember = ({ name, role, image, linkedin, github }) => (
  <div className="text-center mb-4">
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 overflow-hidden rounded-full shadow-md hover:shadow-lg transition-all duration-300">
      <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
    </div>
    <h3 className="font-semibold text-xs sm:text-sm">{name}</h3>
    <p className="text-xs text-muted">{role}</p>
    <div className="flex justify-center mt-1">
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="mx-1">
        <i className="fab fa-linkedin text-lg sm:text-xl text-primary transition-colors duration-300"></i>
      </a>
      <a href={github} target="_blank" rel="noopener noreferrer" className="mx-1">
        <i className="fab fa-github text-lg sm:text-xl text-black transition-colors duration-300"></i>
      </a>
    </div>
  </div>
);

export default AboutUs;