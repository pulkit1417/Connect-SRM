import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import emailjs from '@emailjs/browser';

const ContactForm = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    emailjs.init("G3vZQsFGEWTN344ei");
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await emailjs.send("service_4po8z8e", "template_lkf3fsg", data);
      setNotificationMessage("Your message sent successfully!!");
      setNotificationType('success');
      reset();
    } catch (err) {
      console.error('Error sending email:', err);
      setNotificationType('error');
      if (err.status === 412) {
        setNotificationMessage("There was an issue with the email service. Please try again later or contact support.");
      } else {
        setNotificationMessage("An error occurred while sending your message. Please try again.");
      }
    } finally {
      setShowNotification(true);
      setIsLoading(false);
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  return (
    <section id="contact" className="text-gray-700 body-font bg-gray-100 py-12 relative">
      {/* Notification slider */}
      <div className={`fixed top-0 left-0 right-0 flex justify-center transition-all duration-500 ease-in-out z-50 ${showNotification ? 'translate-y-5' : '-translate-y-full'}`}>
        <div className={`px-4 py-2 rounded-md shadow-md text-white ${notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notificationMessage}
        </div>
      </div>

      <div className="container mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-700 animate-fade-in">Contact Us</h2>
        <p className="mb-8 leading-relaxed text-lg text-center text-gray-600 animate-fade-in" style={{animationDelay: '0.2s'}}>
          We'd love to hear from you. Please fill out the form below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg bg-white shadow-md rounded-lg p-8 animate-slide-up">
          <div className="mb-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              {...register("name", { required: "Please enter your name." })}
              placeholder="Your Name"
              className="w-full bg-gray-100 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base py-3 px-4 leading-8 outline-none transition-all duration-200 ease-in-out"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="mb-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register("email", { 
                required: "Please enter your email.",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              placeholder="Your Email"
              className="w-full bg-gray-100 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base py-3 px-4 leading-8 outline-none transition-all duration-200 ease-in-out"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-6 animate-fade-in" style={{animationDelay: '0.8s'}}>
            <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="message">Message</label>
            <textarea
              id="message"
              {...register("message", { required: "Please enter your message." })}
              placeholder="Your Message"
              className="w-full bg-gray-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base py-3 px-4 h-32 leading-6 outline-none transition-all duration-200 ease-in-out"
            ></textarea>
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
          </div>

          <div className="flex justify-center animate-fade-in" style={{animationDelay: '1s'}}>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white py-3 px-6 rounded-full hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 relative disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className={isLoading ? 'opacity-0' : ''}>Send Message</span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="loader"></div>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default ContactForm;