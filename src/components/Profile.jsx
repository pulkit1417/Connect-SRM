  import React, { useState, useEffect } from 'react';
  import { useParams, useNavigate, Link } from 'react-router-dom';
  import { getFirestore, doc, updateDoc, collection, query, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
  import { 
    Mail, 
    Award, 
    Calendar, 
    Users, 
    Hash, 
    Star, 
    MapPin,
    FileText, 
    Clock, 
    ChevronRight, 
    Github, 
    Instagram, 
    Linkedin, 
    Code, 
    X,
    RefreshCw,
    AlertCircle,
    Plus
  } from 'lucide-react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { toast } from 'react-toastify';

  // User Info Item Component
  const UserInfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <Icon className="text-indigo-600" size={24} />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const ProjectForm = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [gitUser, setGitUser] = useState('');
    const [gitRepo, setGitRepo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!title || !description || !gitUser || !gitRepo) {
        toast.error("All fields are required!");
        return;
      }
      setIsLoading(true);
      try {
        await onSubmit({ title, description, gitUser, gitRepo });
        onClose();
        setTitle('');
        setDescription('');
        setGitUser('');
        setGitRepo('');
        toast.success("Project submitted successfully!");
      } catch (error) {
        console.error("Error submitting project:", error);
        toast.error("Error submitting project. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">Add New Project</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-black">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Project Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="GitHub Username"
                  value={gitUser}
                  onChange={(e) => setGitUser(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="GitHub Repository Name"
                  value={gitRepo}
                  onChange={(e) => setGitRepo(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-300"
                >
                  {isLoading ? 'Submitting...' : 'Submit Project'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Event Card Component
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

  // Social Media Popup Component
  const SocialMediaPopup = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [socials, setSocials] = useState(initialData);
    const [activeField, setActiveField] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const { email } = useParams();
  
    const handleChange = (e) => {
      setSocials({ ...socials, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        setVerifying(true);
        const db = getFirestore();
        const decodedEmail = decodeURIComponent(email);
        
        const updates = { ...socials };
        
        // If LeetCode username has changed
        if (socials.leetcode !== initialData.leetcode) {
          updates.leetcodeStatus = 'pending';
          
          try {
            const leetcodeRef = collection(db, "leetcode");
            await addDoc(leetcodeRef, {
              name: initialData.name || '',
              email: decodedEmail,
              leetcode: socials.leetcode,
              sort: serverTimestamp(),
              status: 'pending'
            });
            
            alert("LeetCode username submitted for verification. It will be displayed after verification.");
          } catch (leetcodeError) {
            console.error("Error updating leetcode verification:", leetcodeError);
            throw new Error("Failed to submit LeetCode verification");
          }
        }
    
        // Update user document
        const userRef = doc(db, "users", decodedEmail);
        await updateDoc(userRef, updates);
        
        await onSubmit(updates);
        onClose();
        
      } catch (error) {
        console.error("Error updating social profiles:", error);
        alert(error.message || "An error occurred while updating profiles. Please try again.");
      } finally {
        setVerifying(false);
      }
    };

    const socialIcons = {
      gitHub: Github,
      leetcode: Code,
      instagram: Instagram,
      linkedin: Linkedin,
    };

    if (!isOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <motion.h2 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-black"
                >
                  Connect Your Profiles
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-[#6B7280] hover:text-black transition-colors duration-300"
                >
                  <X size={24} />
                </motion.button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {Object.entries(socialIcons).map(([key, Icon]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Object.keys(socialIcons).indexOf(key) * 0.1 }}
                    className="relative"
                  >
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className={`h-5 w-5 ${activeField === key ? 'text-primary' : 'text-[#6B7280]'} transition-colors duration-300`} />
                      </div>
                      <input
                        type="text"
                        name={key}
                        id={key}
                        value={socials[key]}
                        onChange={handleChange}
                        onFocus={() => setActiveField(key)}
                        onBlur={() => setActiveField(null)}
                        className="block w-full pl-10 pr-3 py-2 text-black bg-transparent border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 ease-in-out"
                        placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)}${key === 'leetcode' ? ' (Requires Verification)' : ''}`}
                      />
                      {key === 'leetcode' && socials.leetcodeStatus === 'pending' && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-yellow-500 text-sm">Pending Verification</span>
                        </div>
                      )}
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: activeField === key ? 1 : 0 }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-[#0EA5E9] origin-left"
                      />
                    </div>
                  </motion.div>
                ))}
                <div className="flex justify-end space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-[#374151] hover:bg-[#4B5563] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={verifying}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out disabled:opacity-50"
                  >
                    {verifying ? 'Connecting...' : 'Connect Profiles'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Main Profile Component
  const Profile = () => {
    const { email } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [projects, setProjects] = useState([]);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const db = getFirestore();
        const decodedEmail = decodeURIComponent(email);
        
        // Set up real-time listener for user data
        const userRef = doc(db, 'users', decodedEmail);
        const unsubscribeUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUser(doc.data());
          } else {
            throw new Error('User not found');
          }
        });

        // Set up real-time listener for projects
        const projectsRef = collection(db, 'users', decodedEmail, 'projects');
        const unsubscribeProjects = onSnapshot(projectsRef, (snapshot) => {
          const projectsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProjects(projectsList);
        });

        // Fetch events where the user participated
        const eventsQuery = query(collection(db, 'events'));
        const eventSnapshots = await getDocs(eventsQuery);
        const eventList = await Promise.all(eventSnapshots.docs.map(async (eventDoc) => {
          const eventData = eventDoc.data();
          const teamsQuery = query(collection(db, 'events', eventDoc.id, 'teams'));
          const teamsSnapshot = await getDocs(teamsQuery);
          const userTeam = teamsSnapshot.docs.find(teamDoc => {
            const teamData = teamDoc.data();
            return [teamData.member1Email, teamData.member2Email, teamData.member3Email, teamData.teamLeadEmail].includes(decodedEmail);
          });
          return { 
            id: eventDoc.id, 
            ...eventData, 
            teamDetails: userTeam ? { ...userTeam.data(), teamId: userTeam.id } : null 
          };
        }));
        setEvents(eventList.filter(event => event.teamDetails !== null));

        setLoading(false);
        
        // Cleanup function to unsubscribe from all listeners
        return () => {
          unsubscribeUser();
          unsubscribeProjects();
        };
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email]);

  const approvedProjects = projects.filter(project => project.status === 'approved');
    
  
    const isLeetCodeVerified = (user) => {
      return user.leetcode && (user.leetcodeStatus === 'verified' || user.leetcodeStatus === 'accepted');
    };
  
    const refreshCredits = async () => {
      if (!isLeetCodeVerified(user)) {
        alert("Please add and verify your LeetCode username first.");
        return;
      }
  
      setRefreshing(true);
      try {
        const response = await fetch(`https://mission-api-eight.vercel.app/${user.leetcode}/solved/`);
        const data = await response.json();
  
        const easy = data.acSubmissionNum[1].count;
        const medium = data.acSubmissionNum[2].count;
        const hard = data.acSubmissionNum[3].count;
        const totalQuestions = easy + medium + hard;
        const dcredits = easy + medium * 2 + hard * 3;
        const total = dcredits + (user.pcredits || 0);
  
        const db = getFirestore();
        const userRef = doc(db, "users", decodeURIComponent(email));
        await updateDoc(userRef, {
          dcredits: dcredits,
          credits: total,
          dsa: totalQuestions
        });
  
        alert("Your credits have been updated successfully!");
      } catch (error) {
        console.error("Error refreshing credits:", error);
        alert("Failed to refresh credits. Please try again later.");
      } finally {
        setRefreshing(false);
      }
    };
  
    const renderRefreshButton = () => {
      if (!user.leetcode) {
        return (
          <div className="flex items-center text-yellow-600 bg-yellow-100 px-4 py-2 rounded-full">
            <AlertCircle className="mr-2" size={16} />
            <span className="text-sm">Add LeetCode username</span>
          </div>
        );
      }
  
      if (!isLeetCodeVerified(user)) {
        return (
          <div className="flex items-center text-yellow-600 bg-yellow-100 px-4 py-2 rounded-full">
            <AlertCircle className="mr-2" size={16} />
            <span className="text-sm">Verify LeetCode username</span>
          </div>
        );
      }
  
      return (
        <button
          onClick={refreshCredits}
          disabled={refreshing}
          className={`flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-300 ${
            refreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {refreshing ? (
            <RefreshCw className="animate-spin mr-2" size={16} />
          ) : (
            <RefreshCw className="mr-2" size={16} />
          )}
          <span className="text-sm">Refresh Credits</span>
        </button>
      );
    };
  
  
    const handleViewDetails = (eventId) => {
      navigate(`/event-details/${eventId}`);
    };
  
    const handleExploreEvents = () => {
      navigate(`/events`);
    };
  
    const handleOpenPopup = () => {
      setIsPopupOpen(true);
    };
  
    const handleClosePopup = () => {
      setIsPopupOpen(false);
    };
  
    const handleSubmitSocials = async (socialData) => {
      try {
        const db = getFirestore();
        const userRef = doc(db, 'users', decodeURIComponent(email));
        await updateDoc(userRef, socialData);
        // No need to update user state here, as it will be updated by the real-time listener
      } catch (err) {
        console.error('Error updating social media profiles:', err);
        // Handle error (e.g., show an error message to the user)
      }
    };
    const handleAddProject = async (projectData) => {
      try {
        const db = getFirestore();
        const decodedEmail = decodeURIComponent(email);
        const userRef = doc(db, 'users', decodedEmail);
        const projectsRef = collection(userRef, 'projects');
        const projectRequestsRef = collection(db, 'projectRequests');
  
        const timestamp = new Date();
        const newProjectData = {
          ...projectData,
          expoToken: user.expoToken,
          name: user.name,
          timestamp: `${timestamp.getDate()}/${timestamp.getMonth() + 1}/${timestamp.getFullYear()} ${timestamp.toTimeString().split(' ')[0]}`,
          author: decodedEmail,
          sort: serverTimestamp(),
          profile: user.profile,
          status: 'pending'
        };
  
        const newProjectRef = await addDoc(projectsRef, newProjectData);
        await addDoc(projectRequestsRef, { ...newProjectData, dId: newProjectRef.id });
  
        // No need to manually update projects state as it will be handled by the onSnapshot listener
        toast.success(`Great job, ${user.name}! Project submitted successfully!`);
      } catch (error) {
        console.error("Error adding project:", error);
        toast.error("Error submitting project. Please try again later.");
        throw error;
      }
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">{user.name}</h1>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={handleOpenPopup}
                      className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors duration-300"
                    >
                      <Plus size={16} className="mr-2" />
                      <span className="text-sm">Add Socials</span>
                    </button>
                    {renderRefreshButton()}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                  <UserInfoItem icon={Mail} label="Email" value={email} />
                  <UserInfoItem icon={Award} label="Credits" value={user.credits || 0} />
                  <UserInfoItem icon={Star} label="Rank" value={user.rank || 'N/A'} />
                  <UserInfoItem icon={Hash} label="Reg. Number" value={user.reg || 'N/A'} />
                </div>
                {(user.gitHub || user.instagram || user.linkedin || isLeetCodeVerified(user)) && (
                  <div className="mt-6 bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      Social Profiles
                    </h3>
                    <div className="flex flex-wrap gap-6">
                      {user.gitHub && (
                        <a
                          href={`https://github.com/${user.gitHub}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 text-gray-900 hover:text-indigo-600 transition-colors duration-300"
                        >
                          <i className="fa-brands fa-github text-2xl hover:scale-110 transition-all"></i>                  
                        </a>
                      )}
                      {isLeetCodeVerified(user) && (
                        <a
                          href={`https://leetcode.com/${user.leetcode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 text-yellow-600 hover:text-yellow-700 transition-colors duration-300"
                        >
                          <Code className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </a>
                      )}
                      {user.instagram && (
                        <a
                          href={`https://instagram.com/${user.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors duration-300"
                        >
                          <i className="fa-brands fa-instagram text-2xl hover:scale-110 transition-all"></i>
                        </a>
                      )}
                      {user.linkedin && (
                        <a
                          href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-300"
                        >
                          <i className="fa-brands fa-linkedin text-2xl hover:scale-110 transition-all"></i>
                        </a>
                      )}
                    </div>
                  </div>
                )}
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
    
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 mt-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <FileText className="mr-3 text-indigo-600" size={28} />
                My Projects
              </h2>
              <button
                onClick={() => setIsProjectFormOpen(true)}
                className="bg-indigo-600 text-white py-2 px-4 rounded-full hover:bg-indigo-700 transition-colors duration-300 flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add Project
              </button>
            </div>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <div key={project.id} className="bg-gray-50 rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex justify-between items-center">
                      <a
                        href={`https://github.com/${project.gitUser}/${project.gitRepo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        View on GitHub
                      </a>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                        project.status === 'accepted' ? 'bg-green-200 text-green-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-600 text-lg mb-4">No projects added yet.</p>
                <button 
                  onClick={() => setIsProjectFormOpen(true)}
                  className="bg-indigo-600 text-white py-2 px-6 rounded-full hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center mx-auto"
                >
                  Add Your First Project <ChevronRight size={20} className="ml-2" />
                </button>
              </div>
            )}
          </div>
    
          <ProjectForm
            isOpen={isProjectFormOpen}
            onClose={() => setIsProjectFormOpen(false)}
            onSubmit={handleAddProject}
          />
    
          <SocialMediaPopup
            isOpen={isPopupOpen}
            onClose={handleClosePopup}
            onSubmit={handleSubmitSocials}
            initialData={{
              gitHub: user?.gitHub || '',
              leetcode: user?.leetcode || '',
              instagram: user?.instagram || '',
              linkedin: user?.linkedin || ''
            }}
          />
        </div>
      </div>
    );

}

export default Profile;