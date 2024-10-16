import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, LifeBuoy } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <main className="flex  items-center justify-center bg-gray-100 px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <AlertTriangle className="h-24 w-24 text-yellow-500 animate-pulse" />
        </div>
        <p className="text-lg font-semibold text-primary">404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Oops! Page not found
        </h1>
        <p className="mt-6 text-lg leading-7 text-gray-600">
          We've searched high and low, but we couldn't find the page you're looking for.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300 ease-in-out"
          >
            <Home className="mr-2 h-5 w-5" />
            Go back home
          </Link>
          <Link
            to="/contact"
            className="flex items-center text-sm font-semibold text-gray-900 border-2 border-primary p-2 rounded-md hover:bg-primary hover:text-white transition-all duration-300 ease-in-out"
          >
            <LifeBuoy className="mr-2 h-5 w-5" />
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;