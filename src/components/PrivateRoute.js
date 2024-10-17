import React, { useState, useEffect } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredStatus }) => {
  const { user } = useAuth();
  const { eventId, teamId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [eventStatus, setEventStatus] = useState(null);
  const [userTeamId, setUserTeamId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkEventAndTeam = async () => {
      if (!user || !eventId) {
        setIsLoading(false);
        return;
      }

      try {
        // Check event status
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          const currentDateTime = new Date();
          const eventStartDateTime = new Date(`${eventData.date}T${eventData.time}`);
          setEventStatus(currentDateTime >= eventStartDateTime ? 'started' : 'notStarted');
        }

        // Check if user is part of the team
        if (teamId) {
          const teamDoc = await getDoc(doc(db, 'events', eventId, 'teams', teamId));
          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            const isMember = [teamData.teamLeadEmail, teamData.member1Email, teamData.member2Email, teamData.member3Email].includes(user.email);
            if (isMember) {
              setUserTeamId(teamId);
            }
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking event and team:', error);
        setIsLoading(false);
      }
    };

    checkEventAndTeam();
  }, [user, eventId, teamId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (eventStatus !== requiredStatus) {
    return <Navigate to="/events" replace />;
  }

  if (requiredStatus === 'notStarted' && !userTeamId) {
    return <Navigate to="/events" replace />;
  }

  return children;
};

export default PrivateRoute;