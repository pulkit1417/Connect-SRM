import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import EventCard from './EventCard';
import { useNavigate } from 'react-router-dom';

const ClubEvents = () => {
  const [events, setEvents] = useState([]);
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const eventsCollection = collection(db, 'events');
      const eventQuery = query(eventsCollection, orderBy('createdAt', 'desc'));
      const eventSnapshot = await getDocs(eventQuery);
      const eventList = eventSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredTeams: doc.data().registeredTeams || 0,
      }));
      setEvents(eventList);
    };

    fetchEvents();
  }, []);

  const handleAddNew = () => {
    navigate(`/addNewEvent`);
  }

  const handleViewDetails = (eventId) => {
    navigate(`/event-details/${eventId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const canAddEvent = user.clubAdmin === true;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Upcoming College Events</h2>
      <div className="flex justify-between mb-6">
        {canAddEvent && (
          <button
            onClick={handleAddNew}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300"
          >
            Add New Event
          </button>
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