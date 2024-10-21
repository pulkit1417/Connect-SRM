import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import { User, Trophy, ArrowLeft, Users, Shield, Award, Star, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';

const ProjectSubmissionModal = ({ isOpen, closeModal, projectType, onSubmit }) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitConfirmed, setIsSubmitConfirmed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitConfirmed) {
      onSubmit(projectType, githubUrl);
      setGithubUrl('');
      closeModal();
    } else {
      setIsSubmitConfirmed(true);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Submit {projectType} Project
                </Dialog.Title>
                {isSubmitConfirmed ? (
                  <div className="mt-4">
                    <p className="text-gray-600">
                      Are you sure you want to submit your {projectType} project?
                      This cannot be changed later.
                    </p>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                        onClick={handleSubmit}
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        onClick={() => setIsSubmitConfirmed(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-4">
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="Enter GitHub URL"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                      >
                        Submit Project
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const TeamEventDashboard = () => {
  const { eventId, teamId } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [shortlistedTeamDetails, setShortlistedTeamDetails] = useState(null);
  const navigate = useNavigate();
  const [isFillerModalOpen, setIsFillerModalOpen] = useState(false);
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch team data
        const teamDocRef = doc(db, `events/${eventId}/teams/${teamId}`);
        const teamDoc = await getDoc(teamDocRef);
        if (teamDoc.exists()) {
          const teamData = { id: teamDoc.id, ...teamDoc.data() };
          setTeam(teamData);
          await fetchTeamMemberDetails(teamData);
        } else {
          setError('Team not found');
        }

        // Fetch event and shortlisted team data
        const eventDocRef = doc(db, `events/${eventId}`);
        const eventDoc = await getDoc(eventDocRef);
        if (eventDoc.exists()) {
          setEventName(eventDoc.data().name || 'Event');
          
          // Fetch shortlisted team details
          const shortlistedTeamRef = doc(db, `events/${eventId}/shortlistedTeams/${teamId}`);
          const shortlistedTeamDoc = await getDoc(shortlistedTeamRef);
          if (shortlistedTeamDoc.exists()) {
            setShortlistedTeamDetails(shortlistedTeamDoc.data());
          }
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

  const handleProjectSubmit = async (projectType, githubUrl) => {
    try {
      const shortlistedTeamRef = doc(db, `events/${eventId}/shortlistedTeams/${teamId}`);
      const shortlistedTeamDoc = await getDoc(shortlistedTeamRef);
      const currentData = shortlistedTeamDoc.data();

      // Check if the project has already been submitted
      if (currentData[`${projectType}ProjectStatus`]) {
        alert(`${projectType} project has already been submitted and cannot be changed.`);
        return;
      }

      await updateDoc(shortlistedTeamRef, {
        [`${projectType}ProjectUrl`]: githubUrl,
        [`${projectType}ProjectStatus`]: 'pending',
      });
      
      // Update local state
      setShortlistedTeamDetails(prev => ({
        ...prev,
        [`${projectType}ProjectUrl`]: githubUrl,
        [`${projectType}ProjectStatus`]: 'pending',
      }));

      alert(`${projectType} project submitted successfully!`);
    } catch (error) {
      console.error("Error submitting project:", error);
      alert("Failed to submit project. Please try again.");
    }
  };  


  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-red-500 text-lg font-medium">{error}</div>
    </div>
  );

  if (!team) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-gray-600 text-lg font-medium">No team data available</div>
    </div>
  );

  const isMember = user && teamMembers.some(member => member.email === user.email);

  if (!isMember) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-purple-600 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span className="text-sm font-medium">Back to Events</span>
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Event Credits and Status Section - Left Side */}
          <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Event Progress</h2>
            <div className="bg-purple-100 rounded-full p-3">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          {shortlistedTeamDetails && (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Event Credits</span>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="font-bold text-gray-800">
                      {shortlistedTeamDetails.ecredits || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                    {shortlistedTeamDetails.fillerProjectStatus === undefined && (
                      <button
                        onClick={() => setIsFillerModalOpen(true)}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-300 flex items-center justify-center"
                      >
                        <Github className="mr-2 h-5 w-5" />
                        Submit Filler Event Project
                      </button>
                    )}
                    {shortlistedTeamDetails.mainProjectStatus === undefined && (
                      <button
                        onClick={() => setIsMainModalOpen(true)}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-300 flex items-center justify-center"
                      >
                        <Github className="mr-2 h-5 w-5" />
                        Submit Main Project
                      </button>
                    )}
                  </div>

                  {shortlistedTeamDetails.fillerProjectStatus !== undefined && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        Filler Project Status: 
                        <span className={`font-semibold ${
                          shortlistedTeamDetails.fillerProjectStatus === 'approved' ? 'text-green-600' :
                          shortlistedTeamDetails.fillerProjectStatus === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {' '}{shortlistedTeamDetails.fillerProjectStatus.charAt(0).toUpperCase() + shortlistedTeamDetails.fillerProjectStatus.slice(1)}
                        </span>
                      </p>
                    </div>
                  )}

                  {shortlistedTeamDetails.mainProjectStatus !== undefined && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Main Project Status: 
                        <span className={`font-semibold ${
                          shortlistedTeamDetails.mainProjectStatus === 'approved' ? 'text-green-600' :
                          shortlistedTeamDetails.mainProjectStatus === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {' '}{shortlistedTeamDetails.mainProjectStatus.charAt(0).toUpperCase() + shortlistedTeamDetails.mainProjectStatus.slice(1)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Content - Right Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header Section */}
            <div className="relative bg-purple-600 p-8">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-purple-400 to-purple-800"></div>
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-white">
                  <h1 className="text-4xl font-bold mb-2">{eventName}</h1>
                  <p className="text-purple-200 text-lg">{team.teamName}</p>
                </div>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  {team.logoUrl ? (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300 to-purple-400 rounded-full opacity-75 group-hover:opacity-100 transition duration-300"></div>
                      <img 
                        src={team.logoUrl} 
                        alt="Team Logo"
                        className="relative h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://firebasestorage.googleapis.com/v0/b/srm-app-f063c.appspot.com/o/aboutUs%2F878685_user_512x512.png?alt=media&token=3da5779f-ba28-4733-b430-64222abcafd6';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-purple-200 flex items-center justify-center border-4 border-white shadow-lg">
                      <Users className="h-16 w-16 text-purple-600" />
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Team Members Section */}
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {teamMembers.map((member, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={member.email}
                    className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-center">
                      <div className="bg-purple-100 rounded-full p-3 mr-3">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        {member.isLead && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Award className="h-3 w-3 mr-1" />
                            Team Lead
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <ProjectSubmissionModal
        isOpen={isFillerModalOpen}
        closeModal={() => setIsFillerModalOpen(false)}
        projectType="filler"
        onSubmit={handleProjectSubmit}
      />

      <ProjectSubmissionModal
        isOpen={isMainModalOpen}
        closeModal={() => setIsMainModalOpen(false)}
        projectType="main"
        onSubmit={handleProjectSubmit}
      />
    </div>
  );
};

export default TeamEventDashboard;