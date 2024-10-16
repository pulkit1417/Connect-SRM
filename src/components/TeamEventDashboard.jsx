import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import { User, Star, Trophy, ArrowLeft, Users } from 'lucide-react';

const TeamEventDashboard = () => {
  const { eventId, teamId } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamDocRef = doc(db, `events/${eventId}/teams/${teamId}`);
        const teamDoc = await getDoc(teamDocRef);
        if (teamDoc.exists()) {
          const teamData = { id: teamDoc.id, ...teamDoc.data() };
          setTeam(teamData);
          await fetchTeamMemberDetails(teamData);
        } else {
          setError('Team not found');
        }

        const eventDocRef = doc(db, `events/${eventId}`);
        const eventDoc = await getDoc(eventDocRef);
        if (eventDoc.exists()) {
          setEventName(eventDoc.data().name || 'Event');
        }
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, teamId]);

  const fetchTeamMemberDetails = async (teamData) => {
    const memberEmails = [
      teamData.teamLeadEmail,
      teamData.member1Email,
      teamData.member2Email,
      teamData.member3Email
    ].filter(Boolean);

    const memberDetails = await Promise.all(memberEmails.map(async (email) => {
      const userDoc = await getUserByEmail(email);
      return {
        email,
        name: userDoc?.name || email,
        credits: userDoc?.credits || 0,
        isLead: email === teamData.teamLeadEmail
      };
    }));

    setTeamMembers(memberDetails);
  };

  const getUserByEmail = async (email) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  };

  const handleBack = () =>{
    navigate(-1);
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
  
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!team) return <div className="text-center p-4">No team data available</div>;

  const isMember = user && teamMembers.some(member => member.email === user.email);

  if (!isMember) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span className="text-sm sm:text-base">Back to Events</span>
        </button>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-4 py-5 sm:p-6 bg-purple-600 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold">{eventName}</h1>
                <h2 className="mt-1 text-lg sm:text-xl">Team: {team.teamName}</h2>
              </div>
              <div className="bg-white text-purple-600 rounded-full p-3">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg sm:text-xl leading-6 font-medium text-gray-900 mb-4">Team Members</h3>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.email} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-medium">{member.name}</span>
                      {member.isLead && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Team Lead
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center mt-2 sm:mt-0">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="text-gray-600 font-semibold">{member.credits} credits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h4 className="text-lg font-medium text-gray-900">Event Status</h4>
                <p className="mt-1 text-sm text-gray-500">Event is currently in progress</p>
              </div>
              <div className="bg-purple-100 rounded-full p-4">
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamEventDashboard;