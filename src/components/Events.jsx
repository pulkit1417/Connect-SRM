import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import EventCard from './EventCard';
import { useNavigate } from 'react-router-dom';

const ClubEvents = () => {
  const [events, setEvents] = useState([]);
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const eventsCollection = collection(db, 'events');
    const eventQuery = query(eventsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(eventQuery, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredTeams: doc.data().registeredTeams || 0,
      }));
      setEvents(eventList);
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Redirect to login page if user is not authenticated
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  const handleAddNew = () => {
    navigate(`/addNewEvent`);
  }

  const handleAdmin = () =>{
    navigate(`/adminDash`);
  }

  const handleViewDetails = (eventId) => {
    navigate(`/event-details/${eventId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is not authenticated, don't render anything (redirection will happen)
  if (!user) {
    return null;
  }

  const canAddEvent = user?.clubAdmin === true;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Upcoming College Events</h2>
      <div className="flex gap-4 mb-6">
        {canAddEvent && (
          <>          <button
            onClick={handleAddNew}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300"
          >
            Add New Event
          </button>
          <button
          onClick={handleAdmin}
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors duration-300"
        >
          Admin Dashboard
        </button>
        </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard 
            key={event.id}
            event={event}
            onViewDetails={() => handleViewDetails(event.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ClubEvents;