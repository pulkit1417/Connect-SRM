import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, getDocs, collection, query, where, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { User, UserMinus, UserPlus, AlertTriangle, Star, ArrowLeft, Users, Upload } from 'lucide-react';

const TeamDashboard = () => {
  const { eventId, teamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `teamLogos/${eventId}/${teamId}`);
      await uploadBytes(storageRef, logoFile);
      const logoUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(db, `events/${eventId}/teams/${teamId}`), { logoUrl });
      setTeam(prevTeam => ({ ...prevTeam, logoUrl }));
      showAlertMessage('Logo uploaded successfully!', 'success');
    } catch (error) {
      console.error("Error uploading logo:", error);
      showAlertMessage("Failed to upload team logo.", 'error');
    } finally {
      setUploading(false);
    }
  };

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

  const updateTeam = async (updatedTeam) => {
    try {
      const teamDocRef = doc(db, `events/${eventId}/teams/${teamId}`);
      await updateDoc(teamDocRef, updatedTeam);
      setTeam(prevTeam => ({ ...prevTeam, ...updatedTeam }));
      await fetchTeamMemberDetails({ ...team, ...updatedTeam });
    } catch (err) {
      setError('Error updating team');
      console.error(err);
    }
  };

  const checkMemberInOtherTeams = async (email) => {
    const teamsRef = collection(db, `events/${eventId}/teams`);
    const q = query(teamsRef, 
      where('teamLeadEmail', '==', email),
      where('member1Email', '==', email),
      where('member2Email', '==', email),
      where('member3Email', '==', email)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const addMember = async () => {
    if (!team) return;
    const memberCount = Object.keys(team).filter(key => key.startsWith('member') && key.endsWith('Email') && team[key]).length;
    if (memberCount >= 3) {
      showAlertMessage('Team is already full');
      return;
    }
    if (Object.values(team).includes(newMemberEmail)) {
      showAlertMessage('Member already in the team');
      return;
    }
    const userDoc = await getUserByEmail(newMemberEmail);
    if (!userDoc) {
      showAlertMessage('User has not registered in Connect SRM');
      return;
    }
    const isInOtherTeam = await checkMemberInOtherTeams(newMemberEmail);
    if (isInOtherTeam) {
      showAlertMessage('Member is already in another team');
      return;
    }
    const newMemberKey = `member${memberCount + 1}Email`;
    const updatedTeam = {
      [newMemberKey]: newMemberEmail,
    };
    await updateTeam(updatedTeam);
    setNewMemberEmail('');
  };

  const removeMember = async (memberEmail) => {
    if (!team) return;
    const updatedTeam = { ...team };
    const memberKeys = ['teamLeadEmail', 'member1Email', 'member2Email', 'member3Email'];
    const memberIndex = memberKeys.findIndex(key => updatedTeam[key] === memberEmail);

    if (memberIndex === -1) {
      showAlertMessage('Member not found in the team');
      return;
    }

    // Shift members up
    for (let i = memberIndex; i < memberKeys.length - 1; i++) {
      updatedTeam[memberKeys[i]] = updatedTeam[memberKeys[i + 1]] || null;
    }
    updatedTeam[memberKeys[memberKeys.length - 1]] = null;

    // Update team lead name if necessary
    if (memberIndex === 0 && updatedTeam.member1Email) {
      const newLeadDoc = await getUserByEmail(updatedTeam.member1Email);
      if (newLeadDoc) {
        updatedTeam.teamLeadName = newLeadDoc.name;
      }
    }

    await updateTeam(updatedTeam);
  };

  const leaveTeam = async () => {
    if (!team || !user) return;
    const updatedTeam = { ...team };
    const memberKeys = ['teamLeadEmail', 'member1Email', 'member2Email', 'member3Email'];
    const memberIndex = memberKeys.findIndex(key => updatedTeam[key] === user.email);
    
    if (memberIndex === -1) {
      showAlertMessage('You are not a member of this team');
      return;
    }

    // If the team lead is leaving, promote the next member
    if (memberIndex === 0) {
      if (!updatedTeam.member1Email) {
        // If there's no other member, delete the team
        const teamDocRef = doc(db, `events/${eventId}/teams/${teamId}`);
        await deleteDoc(teamDocRef);
        navigate('/events');
        return;
      } else {
        // Promote the next member to team lead
        const newLeadDoc = await getUserByEmail(updatedTeam.member1Email);
        if (newLeadDoc) {
          updatedTeam.teamLeadName = newLeadDoc.name;
        }
      }
    }

    // Shift members up
    for (let i = memberIndex; i < memberKeys.length - 1; i++) {
      updatedTeam[memberKeys[i]] = updatedTeam[memberKeys[i + 1]] || null;
    }
    updatedTeam[memberKeys[memberKeys.length - 1]] = null;

    await updateTeam(updatedTeam);
    navigate('/events');
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleRemoveMember = (memberEmail) => {
    setMemberToRemove(memberEmail);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveMember = async () => {
    await removeMember(memberToRemove);
    setShowRemoveConfirm(false);
    setMemberToRemove(null);
  };

  const handleLeaveTeam = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeaveTeam = async () => {
    await leaveTeam();
    setShowLeaveConfirm(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
  
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!team) return <div className="text-center">No team data available</div>;

  const isMember = user && teamMembers.some(member => member.email === user.email);
  const isLeader = team.teamLeadEmail === (user ? user.email : null);

  if (!isMember) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Events
        </button>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{eventName}</h1>
                <h2 className="text-xl mt-1 font-semibold">{team.teamName}</h2>
              </div>
              {logoPreview ? (
                <img src={logoPreview} alt="Team Logo" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="bg-white text-purple-600 rounded-full p-3">
                  <Users className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>
          

          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Team Members</h3>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <motion.div
                  key={member.email}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{member.name}</span>
                      {member.isLead && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Team Lead
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {isLeader && !member.isLead && (
                      <button
                        onClick={() => handleRemoveMember(member.email)}
                        className="text-red-600 hover:text-red-800 mr-2 transition-colors duration-200"
                      >
                        <UserMinus className="h-5 w-5" />
                      </button>
                    )}
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-600 mr-4">{member.credits}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {teamMembers.length < 4 && (
              <div className="mt-6">
                <div className="flex">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="New member's email"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={addMember}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={handleLeaveTeam}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <UserMinus className="h-5 w-5 mr-2" />
                Leave Team
              </button>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 max-w-sm z-50"
          >
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg" role="alert">
              <div className="flex">
                <div className="py-1">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-4" />
                </div>
                <div>
                  <p className="font-bold">Error</p>
                  <p>{alertMessage}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(showLeaveConfirm || showRemoveConfirm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {showLeaveConfirm
                ? "Confirm Leave Team"
                : "Confirm Remove Member"}
            </h3>
            <p className="mb-6 text-gray-600">
              {showLeaveConfirm
                ? "Are you sure you want to leave the team? This action cannot be undone."
                : `Are you sure you want to remove ${memberToRemove} from the team? This action cannot be undone.`}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  setShowRemoveConfirm(false);
                  setMemberToRemove(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={
                  showLeaveConfirm ? confirmLeaveTeam : confirmRemoveMember
                }
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
              >
                {showLeaveConfirm ? "Leave Team" : "Remove Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;