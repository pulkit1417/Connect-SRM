import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, query, getDocs } from 'firebase/firestore';
import { Mail, Award, Calendar, Users, Hash, Star, MapPin, Clock, ChevronRight } from 'lucide-react';

const UserInfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
    <Icon className="text-indigo-600" size={24} />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const EventCard = ({ event, onViewDetails }) => {
  const navigate = useNavigate();
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);
  const [isEventStarted, setIsEventStarted] = useState(false);
  const [userTeamId, setUserTeamId] = useState(null);

  useEffect(() => {
    const checkEventStatus = () => {
      const lastRegistrationDate = new Date(event.lastRegistrationTimestamp);
      const currentDate = new Date();
      setIsRegistrationClosed(currentDate > lastRegistrationDate);

      const eventStartDate = new Date(`${event.date}T${event.time}`);
      setIsEventStarted(currentDate >= eventStartDate);
    };

    checkEventStatus();
    setUserTeamId(event.teamDetails?.teamId);
  }, [event]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : (day % 100 - 20) % 10 || day % 10];
    return `${day}${suffix} ${month} ${year}`;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const EventInfo = ({ icon: Icon, text }) => (
    <div className="flex items-center text-gray-600">
      <Icon className="mr-2 h-5 w-5 text-indigo-600" />
      <span>{text}</span>
    </div>
  );

  const handleTeamDashboard = () => {
    navigate(`/dashboard/${event.id}/${event.teamDetails.teamId}`);
  };

  const renderActionButton = () => {
    if (isRegistrationClosed && !userTeamId) {
      return (
        <button
          disabled
          className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed"
        >
          Registration Closed
        </button>
      );
    }

    if (isEventStarted) {
      return userTeamId ? (
        <Link
          to={`/event-dashboard/${event.id}/${userTeamId}`}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center"
        >
          Event Dashboard <ChevronRight size={20} className="ml-2" />
        </Link>
      ) : (
        <button
          disabled
          className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed"
        >
          Not Registered
        </button>
      );
    }

    return userTeamId ? (
      <button
        onClick={handleTeamDashboard}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
      >
        Team Dashboard <ChevronRight size={20} className="ml-2" />
      </button>
    ) : (
      <Link
        to={`/register/${event.id}`}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center"
      >
        Register Now <ChevronRight size={20} className="ml-2" />
      </Link>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img src={event.posterUrl || 'https://via.placeholder.com/400x200'} alt={`${event.name} poster`} className="w-full h-48 object-cover" />
        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-bl-lg font-semibold">
          {event.clubName}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-gray-800">{event.name}</h3>
        <div className="space-y-2 mb-4">
          <EventInfo icon={Calendar} text={formatDate(event.date)} />
          <EventInfo icon={Clock} text={formatTime(event.time)} />
          <EventInfo icon={MapPin} text={event.location} />
        </div>
        {event.teamDetails && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-indigo-600 flex items-center font-semibold">
              <Users className="mr-2" size={18} />Team: {event.teamDetails.teamName}
            </p>
            <p className="text-gray-600 mt-1 pl-6">Lead: {event.teamDetails.teamLeadName}</p>
          </div>
        )}
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => onViewDetails(event.id)}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center"
          >
            View Details <ChevronRight size={20} className="ml-2" />
          </button>
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const db = getFirestore();
        
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', decodeURIComponent(email)));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        } else {
          throw new Error('User not found');
        }

        // Fetch events where the user participated
        const eventsQuery = query(collection(db, 'events'));
        const eventSnapshots = await getDocs(eventsQuery);
        const eventList = await Promise.all(eventSnapshots.docs.map(async (eventDoc) => {
          const eventData = eventDoc.data();
          const teamsQuery = query(collection(db, 'events', eventDoc.id, 'teams'));
          const teamsSnapshot = await getDocs(teamsQuery);
          const userTeam = teamsSnapshot.docs.find(teamDoc => {
            const teamData = teamDoc.data();
            return [teamData.member1Email, teamData.member2Email, teamData.member3Email, teamData.teamLeadEmail].includes(email);
          });
          return { 
            id: eventDoc.id, 
            ...eventData, 
            teamDetails: userTeam ? { ...userTeam.data(), teamId: userTeam.id } : null 
          };
        }));
        setEvents(eventList.filter(event => event.teamDetails !== null));

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email]);

  const handleViewDetails = (eventId) => {
    navigate(`/event-details/${eventId}`);
  };
  
  const handleExploreEvents = () => {
    navigate(`/events`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white text-center p-8 bg-red-600 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12">
          <div className="md:flex">
            <div className="md:flex-shrink-0 w-full md:w-1/3 lg:w-1/4">
              <img 
                src={user.profile || 'https://via.placeholder.com/300'}
                alt={user.name}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="p-8 md:flex-grow">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{user.name}</h1>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                <UserInfoItem icon={Mail} label="Email" value={email} />
                <UserInfoItem icon={Award} label="Credits" value={user.credits || 0} />
                <UserInfoItem icon={Star} label="Rank" value={user.rank || 'N/A'} />
                <UserInfoItem icon={Hash} label="Reg. Number" value={user.reg || 'N/A'} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 flex items-center">
            <Calendar className="mr-3 text-indigo-600" size={28} />
            My Events
          </h2>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} onViewDetails={handleViewDetails} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600 text-lg mb-4">No events participated yet.</p>
              <button 
                onClick={handleExploreEvents} 
                className="bg-indigo-600 text-white py-2 px-6 rounded-full hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center mx-auto"
              >
                Explore Events <ChevronRight size={20} className="ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;