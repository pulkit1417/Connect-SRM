import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, writeBatch, getDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Users, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shortlistCounts, setShortlistCounts] = useState({});
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventList = await Promise.all(eventsSnapshot.docs.map(async (doc) => {
        const eventData = doc.data();
        const event = {
          id: doc.id,
          name: eventData.clubName,
          description: eventData.description,
          date: eventData.date,
          location: eventData.location,
          lastRegistrationDate: eventData.lastRegistrationDate,
          teamsCount: 0,
          shortlistedTeamsCount: eventData.shortlistedTeamsCount || 0,
          pendingProjectsCount: 0
        };

        const teamsCollection = collection(db, `events/${doc.id}/teams`);
        const teamSnapshot = await getDocs(teamsCollection);
        event.teamsCount = teamSnapshot.size;

        const shortlistedTeamsCollection = collection(db, `events/${doc.id}/shortlistedTeams`);
        const shortlistedTeamsSnapshot = await getDocs(shortlistedTeamsCollection);
        event.pendingProjectsCount = shortlistedTeamsSnapshot.docs.filter(teamDoc => {
          const teamData = teamDoc.data();
          return (teamData.fillerProjectStatus === 'pending' && teamData.fillerProjectUrl) || 
                 (teamData.mainProjectStatus === 'pending' && teamData.mainProjectUrl);
        }).length;

        return event;
      }));

      setEvents(eventList);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleShortlistCountChange = (eventId, count) => {
    setShortlistCounts(prev => ({ ...prev, [eventId]: count }));
  };

  const shortlistTeams = async (eventId) => {
    setUpdating(true);
    const count = parseInt(shortlistCounts[eventId]);
    
    try {
      const teamsCollectionRef = collection(db, `events/${eventId}/teams`);
      const teamsSnapshot = await getDocs(teamsCollectionRef);

      const teamsWithCredits = await Promise.all(teamsSnapshot.docs.map(async (teamDoc) => {
        const teamData = teamDoc.data();
        const totalCredits = await calculateTeamCredits(teamData);
        return { id: teamDoc.id, ...teamData, totalCredits };
      }));

      const sortedTeams = teamsWithCredits.sort((a, b) => b.totalCredits - a.totalCredits);
      const teamsToShortlist = sortedTeams.slice(0, count);

      const batch = writeBatch(db);

      teamsToShortlist.forEach((team) => {
        const shortlistRef = doc(db, `events/${eventId}/shortlistedTeams`, team.id);
        batch.set(shortlistRef, {
          team, 
          credits: team.totalCredits, 
          ecredits: 0,
        });
      });

      const eventRef = doc(db, 'events', eventId);
      batch.update(eventRef, { shortlistedTeamsCount: count });

      await batch.commit();

      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, shortlistedTeamsCount: count }
          : event
      ));

      setShortlistCounts(prev => ({ ...prev, [eventId]: '' }));
    } catch (error) {
      console.error("Error shortlisting teams:", error);
      setError("Failed to shortlist teams. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const calculateTeamCredits = async (teamData) => {
    let totalCredits = 0;
    const memberRoles = ['teamLead', 'member1', 'member2', 'member3'];

    for (const role of memberRoles) {
      if (teamData[`${role}Email`]) {
        const userDoc = await getDoc(doc(db, 'users', teamData[`${role}Email`]));
        if (userDoc.exists()) {
          totalCredits += userDoc.data().credits || 0;
        }
      }
    }

    return totalCredits;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMonth(9); // Set month to October (0-indexed, so 9 is October)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Admin Dashboard</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 mr-2" />
            <p className="font-bold">Error</p>
          </div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
      <button
          onClick={handleBack}
          className="mb-6 flex items-center text-primary hover:text-primary transition-colors duration-300 bg-white px-4 py-2 rounded-full shadow-md"
        >
          <ChevronLeft className="mr-2" size={20} />
          Back to Events
        </button>
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">{event.name}</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-primary" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-primary" />
                    <span>Registration closes: {formatDate(event.lastRegistrationDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3 text-primary" />
                    <span>Teams: {event.teamsCount} | Shortlisted: {event.shortlistedTeamsCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <input
                    type="number"
                    min="0"
                    max={event.teamsCount}
                    placeholder="Teams to shortlist"
                    value={shortlistCounts[event.id] || ''}
                    onChange={(e) => handleShortlistCountChange(event.id, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={() => shortlistTeams(event.id)}
                    disabled={updating || !shortlistCounts[event.id]}
                    className={`px-6 py-2 rounded-lg text-white font-medium transition-colors duration-300 ${
                      updating || !shortlistCounts[event.id]
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary'
                    }`}
                  >
                    {updating ? 'Shortlisting...' : 'Shortlist'}
                  </button>
                </div>
                <div className="mt-6">
                  <Link
                    to={`/pending-projects/${event.id}`}
                    className="inline-flex items-center text-primary hover:text-primary transition-colors duration-300"
                  >
                    View Pending Projects
                    {event.pendingProjectsCount > 0 && ` (${event.pendingProjectsCount})`}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;