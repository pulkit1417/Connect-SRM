// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Calendar, Clock, MapPin, Users } from 'lucide-react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase.config';
// import { useAuth } from '../context/AuthContext';

// const EventCard = ({ event }) => {
//   const navigate = useNavigate();
//   const [teamCount, setTeamCount] = useState(0);
//   const { user } = useAuth();
//   const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);
//   const [isEventStarted, setIsEventStarted] = useState(false);
//   const [userTeamId, setUserTeamId] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isShortlisted, setIsShortlisted] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       if (event.id) {
//         await fetchTeamCount();
//         if (user) {
//           await checkUserTeam();
//           await checkIfShortlisted();
//         }
//       }

//       // Parse the lastRegistrationTimestamp
//       const lastRegistrationDateTime = parseLastRegistrationTimestamp(event.lastRegistrationTimestamp);
//       const currentDateTime = new Date();

//       // Check if registration is closed
//       setIsRegistrationClosed(currentDateTime > lastRegistrationDateTime);

//       // Check if event has started
//       const eventStartDateTime = new Date(`${event.date}T${event.time}`);
//       setIsEventStarted(currentDateTime >= eventStartDateTime);
      
//       setIsLoading(false);
//     };

//     fetchData();
//   }, [event, user]);

//   const checkIfShortlisted = async () => {
//     try {
//       const shortlistedTeamsRef = collection(db, `events/${event.id}/shortlistedTeams`);
//       const shortlistedSnapshot = await getDocs(shortlistedTeamsRef);

//       if (!shortlistedSnapshot.empty) {
//         const shortlistedTeamsData = shortlistedSnapshot.docs.map((doc) => doc.id);
//         setIsShortlisted(shortlistedTeamsData.includes(userTeamId));
//       } else {
//         setIsShortlisted(false);
//       }
//     } catch (error) {
//       console.error('Error checking if team is shortlisted:', error);
//     }
//   };

//   const fetchTeamCount = async () => {
//     try {
//       const teamsCollectionRef = collection(db, `events/${event.id}/teams`);
//       const teamsSnapshot = await getDocs(teamsCollectionRef);
//       setTeamCount(teamsSnapshot.size);
//     } catch (error) {
//       console.error('Error fetching team count:', error);
//     }
//   };

//   const checkUserTeam = async () => {
//     if (user && user.email) {
//       try {
//         const teamsCollectionRef = collection(db, `events/${event.id}/teams`);
//         const teamsSnapshot = await getDocs(teamsCollectionRef);
        
//         for (const teamDoc of teamsSnapshot.docs) {
//           const teamData = teamDoc.data();
//           const memberFields = ['teamLeadEmail', 'member1Email', 'member2Email', 'member3Email'];
//           for (const field of memberFields) {
//             if (teamData[field] === user.email) {
//               setUserTeamId(teamDoc.id);
//               return;
//             }
//           }
//         }
        
//         setUserTeamId(null);
//       } catch (error) {
//         console.error('Error checking user team:', error);
//       }
//     }
//   };

//   const handleViewDetails = () => {
//     navigate(`/event-details/${event.id}`);
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = date.getDate();
//     const month = date.toLocaleString('default', { month: 'long' });
//     const year = date.getFullYear();

//     const getOrdinalSuffix = (n) => {
//       const s = ['th', 'st', 'nd', 'rd'];
//       const v = n % 100;
//       return n + (s[(v - 20) % 10] || s[v] || s[0]);
//     };

//     return `${getOrdinalSuffix(day)} ${month} ${year}`;
//   };

//   const formatTime = (timeString) => {
//     const [hours, minutes] = timeString.split(':');
//     const date = new Date();
//     date.setHours(parseInt(hours));
//     date.setMinutes(parseInt(minutes));
//     return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
//   };

//   const formatLastRegistrationTimestamp = (timestamp) => {
//     const date = parseLastRegistrationTimestamp(timestamp);
//     const day = date.getDate();
//     const month = date.toLocaleString('default', { month: 'long' });
//     const year = date.getFullYear();
//     const time = date.toLocaleString('en-US', { 
//       hour: 'numeric', 
//       minute: 'numeric', 
//       hour12: true 
//     });

//     const getOrdinalSuffix = (n) => {
//       const s = ['th', 'st', 'nd', 'rd'];
//       const v = n % 100;
//       return n + (s[(v - 20) % 10] || s[v] || s[0]);
//     };

//     return `${getOrdinalSuffix(day)} ${month} ${year}, ${time}`;
//   };

//   const parseLastRegistrationTimestamp = (timestamp) => {
//     if (timestamp instanceof Date) {
//       return timestamp;
//     }
//     if (typeof timestamp === 'object' && timestamp.toDate instanceof Function) {
//       return timestamp.toDate(); // Handle Firestore Timestamp object
//     }
//     if (typeof timestamp === 'number') {
//       return new Date(timestamp); // Handle Unix timestamp
//     }
//     if (typeof timestamp === 'string') {
//       // Try parsing as ISO string
//       const date = new Date(timestamp);
//       if (!isNaN(date.getTime())) {
//         return date;
//       }
//       // If it's not a valid ISO string, try custom parsing
//       const [datePart, timePart] = timestamp.split(' at ');
//       if (datePart && timePart) {
//         const [day, month, year] = datePart.split(' ');
//         const [time] = timePart.split(' ');
//         const dateString = `${month} ${day}, ${year} ${time} GMT+0530`;
//         return new Date(dateString);
//       }
//     }
//     console.error('Unable to parse timestamp:', timestamp);
//     return new Date(); // Return current date as fallback
//   };

//   const renderActionButton = () => {
//     if (isRegistrationClosed && !userTeamId) {
//       return (
//         <button
//           disabled
//           className="flex-1 bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
//         >
//           Registration Closed
//         </button>
//       );
//     }

//     if (isEventStarted) {
//       return userTeamId ? (
//         isShortlisted ? (
//           <Link
//             to={`/event-dashboard/${event.id}/${userTeamId}`}
//             className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors duration-300 text-center"
//           >
//             Event Dashboard
//           </Link>
//         ) : (
//           <button
//             disabled
//             className="flex-1 bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
//           >
//             Not Shortlisted
//           </button>
//         )
//       ) : (
//         <button
//           disabled
//           className="flex-1 bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
//         >
//           Not Registered
//         </button>
//       );
//     }

//     return userTeamId ? (
//       isShortlisted ? (
//         <Link
//           to={`/dashboard/${event.id}/${userTeamId}`}
//           className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300 text-center"
//         >
//           Team Dashboard
//         </Link>
//       ) : (
//         <button
//           disabled
//           className="flex-1 bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
//         >
//           Not Shortlisted
//         </button>
//       )
//     ) : (
//       <Link
//         to={`/register/${event.id}`}
//         className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300 text-center"
//       >
//         Register Now
//       </Link>
//     );
//   };

//   if (isLoading) {
//     return (
//       <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
//       <div className="relative">
//         <img src={event.posterUrl} alt={`${event.name} poster`} className="w-full h-48 object-cover" />
//         <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 m-2 rounded">
//           {event.clubName}
//         </div>
//       </div>
//       <div className="p-6">
//         <h3 className="text-2xl font-bold mb-3 text-gray-800">{event.name}</h3>
//         <div className="space-y-2 mb-4">
//           <div className="flex items-center text-gray-600">
//             <Calendar className="mr-2 h-5 w-5 text-blue-500" />
//             <span>{formatDate(event.date)}</span>
//           </div>
//           <div className="flex items-center text-gray-600">
//             <Clock className="mr-2 h-5 w-5 text-blue-500" />
//             <span>{formatTime(event.time)}</span>
//           </div>
//           <div className="flex items-center text-gray-600">
//             <MapPin className="mr-2 h-5 w-5 text-blue-500" />
//             <span>{event.location}</span>
//           </div>
//           {user && (
//             <div className="flex items-center text-gray-600">
//               <Users className="mr-2 h-5 w-5 text-blue-500" />
//               <span>{teamCount} teams registered</span>
//             </div>
//           )}
//           <div className="flex items-center text-gray-600">
//             <Calendar className="mr-2 h-5 w-5 text-blue-500" />
//             <span>Registration ends: {formatLastRegistrationTimestamp(event.lastRegistrationTimestamp)}</span>
//           </div>
//         </div>
//         <div className="flex space-x-2">
//           <button
//             onClick={handleViewDetails}
//             className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300"
//           >
//             View Details
//           </button>
//           {renderActionButton()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EventCard;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const [teamCount, setTeamCount] = useState(0);
  const { user } = useAuth();
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);
  const [isEventStarted, setIsEventStarted] = useState(false);
  const [userTeamId, setUserTeamId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShortlisted, setIsShortlisted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (event.id) {
        await fetchTeamCount();
        if (user) {
          await checkUserTeam();
          await checkIfShortlisted();
        }
      }

      // Parse the lastRegistrationTimestamp
      const lastRegistrationDateTime = parseLastRegistrationTimestamp(event.lastRegistrationTimestamp);
      const currentDateTime = new Date();

      // Check if registration is closed
      setIsRegistrationClosed(currentDateTime > lastRegistrationDateTime);

      // Check if event has started
      const eventStartDateTime = new Date(`${event.date}T${event.time}`);
      setIsEventStarted(currentDateTime >= eventStartDateTime);
      
      setIsLoading(false);
    };

    fetchData();
  }, [event, user]);

  const checkIfShortlisted = async () => {
    try {
      const shortlistedTeamsRef = collection(db, `events/${event.id}/shortlistedTeams`);
      const shortlistedSnapshot = await getDocs(shortlistedTeamsRef);

      if (!shortlistedSnapshot.empty) {
        const isUserShortlisted = await checkIfUserIsShortlisted(shortlistedSnapshot.docs);
        setIsShortlisted(isUserShortlisted);
      } else {
        setIsShortlisted(false);
      }
    } catch (error) {
      console.error('Error checking if team is shortlisted:', error);
    }
  };

  const checkIfUserIsShortlisted = async (shortlistedTeams) => {
    if (user && user.email) {
      try {
        for (const teamDoc of shortlistedTeams) {
          const teamData = await getDoc(doc(db, `events/${event.id}/teams`, teamDoc.id));
          const memberFields = ['teamLeadEmail', 'member1Email', 'member2Email', 'member3Email'];
          for (const field of memberFields) {
            if (teamData.data()[field] === user.email) {
              setUserTeamId(teamDoc.id);
              return true;
            }
          }
        }
        setUserTeamId(null);
        return false;
      } catch (error) {
        console.error('Error checking if user is in shortlisted team:', error);
        return false;
      }
    }
    return false;
  };

  const fetchTeamCount = async () => {
    try {
      const teamsCollectionRef = collection(db, `events/${event.id}/teams`);
      const teamsSnapshot = await getDocs(teamsCollectionRef);
      setTeamCount(teamsSnapshot.size);
    } catch (error) {
      console.error('Error fetching team count:', error);
    }
  };

  const checkUserTeam = async () => {
    if (user && user.email) {
      try {
        const teamsCollectionRef = collection(db, `events/${event.id}/teams`);
        const teamsSnapshot = await getDocs(teamsCollectionRef);
        
        for (const teamDoc of teamsSnapshot.docs) {
          const teamData = teamDoc.data();
          const memberFields = ['teamLeadEmail', 'member1Email', 'member2Email', 'member3Email'];
          for (const field of memberFields) {
            if (teamData[field] === user.email) {
              setUserTeamId(teamDoc.id);
              return;
            }
          }
        }
        
        setUserTeamId(null);
      } catch (error) {
        console.error('Error checking user team:', error);
      }
    }
  };

  const handleViewDetails = () => {
    navigate(`/event-details/${event.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const getOrdinalSuffix = (n) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const formatLastRegistrationTimestamp = (timestamp) => {
    const date = parseLastRegistrationTimestamp(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });

    const getOrdinalSuffix = (n) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinalSuffix(day)} ${month} ${year}, ${time}`;
  };

  const parseLastRegistrationTimestamp = (timestamp) => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'object' && timestamp.toDate instanceof Function) {
      return timestamp.toDate(); // Handle Firestore Timestamp object
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp); // Handle Unix timestamp
    }
    if (typeof timestamp === 'string') {
      // Try parsing as ISO string
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
      // If it's not a valid ISO string, try custom parsing
      const [datePart, timePart] = timestamp.split(' at ');
      if (datePart && timePart) {
        const [day, month, year] = datePart.split(' ');
        const [time] = timePart.split(' ');
        const dateString = `${month} ${day}, ${year} ${time} GMT+0530`;
        return new Date(dateString);
      }
    }
    console.error('Unable to parse timestamp:', timestamp);
    return new Date(); // Return current date as fallback
  };

  const renderActionButton = () => {
    if (isRegistrationClosed && !userTeamId && !isShortlisted) {
      return (
        <button
          disabled
          className="flex-1 bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
        >
          Registration Closed
        </button>
      );
    }

    if (isEventStarted) {
      return userTeamId ? (
        isShortlisted ? (
          <Link
            to={`/event-dashboard/${event.id}/${userTeamId}`}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors duration-300 text-center"
          >
            Event Dashboard
          </Link>
        ) : (
          <button
            disabled
            className="flex-1 bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
          >
            Not Shortlisted
          </button>
        )
      ) : (
        isShortlisted ? (
          <button
            disabled
            className="flex-1 bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
          >
            Not Registered
          </button>
        ) : (
          <button
            disabled
            className="flex-1 bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
          >
            Not Shortlisted
          </button>
        )
      );
    }

    return userTeamId ? (
      isShortlisted ? (
        <Link
          to={`/dashboard/${event.id}/${userTeamId}`}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300 text-center"
        >
          Team Dashboard
        </Link>
      ) : (
        <button
          disabled
          className="flex-1 bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
        >
          Not Shortlisted
        </button>
      )
    ) : (
      isShortlisted ? (
        <Link
          to={`/register/${event.id}`}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300 text-center"
        >
          Register Now
        </Link>
      ) : (
        <button
          disabled
          className="flex-1 bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
        >
          Not Shortlisted
        </button>
      )
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img src={event.posterUrl} alt={`${event.name} poster`} className="w-full h-48 object-cover" />
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 m-2 rounded">
          {event.clubName}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-3 text-gray-800">{event.name}</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="mr-2 h-5 w-5 text-blue-500" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="mr-2 h-5 w-5 text-blue-500" />
            <span>{formatTime(event.time)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="mr-2 h-5 w-5 text-blue-500" />
            <span>{event.location}</span>
          </div>
          {user && (
            <div className="flex items-center text-gray-600">
              <Users className="mr-2 h-5 w-5 text-blue-500" />
              <span>{teamCount} teams registered</span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Calendar className="mr-2 h-5 w-5 text-blue-500" />
            <span>Registration ends: {formatLastRegistrationTimestamp(event.lastRegistrationTimestamp)}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors duration-300"
          >
            View Details
          </button>
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
};

export default EventCard;