import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase.config';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, AlertTriangle, Upload, Users, MessageCircle, X, AlertCircle, Bell, Calendar } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';


const TeamRegistrationForm = () => {
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    teamName: '',
    teamLeadName: '',
    teamLeadEmail: '',
    member1Email: '',
    member2Email: '',
    member3Email: ''
  });
  const [formError, setFormError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        setEventDetails(eventDoc.data());
      } else {
        showAlertMessage('Event not found', 'error');
      }
    };

    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (user && user.email) {
      const fetchUserDetails = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.email));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData(prevData => ({
              ...prevData,
              teamLeadName: userData.name || user.name || '',
              teamLeadEmail: user.email
            }));
          } else {
            setFormData(prevData => ({
              ...prevData,
              teamLeadName: user.name || '',
              teamLeadEmail: user.email
            }));
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          showAlertMessage('Error fetching user details. Please try again.', 'error');
        }
      };
      fetchUserDetails();
    } else if (user) {
      setFormData(prevData => ({
        ...prevData,
        teamLeadName: user.name || '',
        teamLeadEmail: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkUserInExistingTeam = async (email) => {
    const teamsRef = collection(db, 'events', eventId, 'teams');
    const queries = [
      query(teamsRef, where('teamLeadEmail', '==', email)),
      query(teamsRef, where('member1Email', '==', email)),
      query(teamsRef, where('member2Email', '==', email)),
      query(teamsRef, where('member3Email', '==', email))
    ];

    for (let q of queries) {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return true;
      }
    }
    return false;
  };

  const checkUserExists = async (email) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const checkTeamNameExists = async (teamName) => {
    const teamsRef = collection(db, 'events', eventId, 'teams');
    const q = query(teamsRef, where('teamName', '==', teamName));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const validateForm = async () => {
    const requiredFields = ['teamName', 'teamLeadName', 'teamLeadEmail', 'member1Email'];
    for (let field of requiredFields) {
      if (formData[field] === '') {
        showAlertMessage('Team name, team lead, and at least one member are required.', 'error');
        return false;
      }
    }

    if (await checkTeamNameExists(formData.teamName)) {
      showAlertMessage('This team name is already taken. Please choose a different name.', 'error');
      return false;
    }

    const emails = [formData.teamLeadEmail, formData.member1Email, formData.member2Email, formData.member3Email]
      .filter(email => email !== '');

    if (emails.length < 2 || emails.length > 4) {
      showAlertMessage('Team must have between 2 and 4 members (including team lead).', 'error');
      return false;
    }

    if (new Set(emails).size !== emails.length) {
      showAlertMessage('Each team member must have a unique email address.', 'error');
      return false;
    }

    for (let email of emails) {
      if (!(await checkUserExists(email))) {
        showAlertMessage(`User with email ${email} is not a user of Connect SRM`, 'error');
        return false;
      }

      if (await checkUserInExistingTeam(email)) {
        showAlertMessage('One or more team members are already registered in another team for this event.', 'error');
        return false;
      }
    }

    return true;
  };

  const showAlertMessage = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleBack = () => {
    navigate(-1);
  };

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

  const uploadLogo = async (teamId) => {
    if (!logoFile) return null;
    try {
      const storageRef = ref(storage, `teamLogos/${eventId}/${teamId}`);
      await uploadBytes(storageRef, logoFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading logo:", error);
      showAlertMessage("Failed to upload team logo. Team registered without a logo.", 'warning');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!user) {
      showAlertMessage('You must be logged in to register a team.', 'error');
      return;
    }

    setSubmitting(true);
    if (await validateForm()) {
      try {
        const teamData = {
          teamName: formData.teamName,
          teamLeadEmail: formData.teamLeadEmail,
          teamLeadName: formData.teamLeadName,
          member1Email: formData.member1Email,
          member2Email: formData.member2Email || null,
          member3Email: formData.member3Email || null,
        };
        
        const docRef = await addDoc(collection(db, 'events', eventId, 'teams'), teamData);
        
        if (logoFile) {
          const logoUrl = await uploadLogo(docRef.id);
          if (logoUrl) {
            await updateDoc(docRef, { logoUrl: logoUrl });
          }
        }
        
        if (eventDetails && eventDetails.whatsappLink) {
          setWhatsappLink(eventDetails.whatsappLink);
          setShowWhatsappModal(true);
        } else {
          showAlertMessage('Team registered successfully! Redirecting to events page...', 'success');
          setTimeout(() => {
            navigate("/events");
          }, 3000);
        }
      } catch (error) {
        showAlertMessage('Error registering team: ' + error.message, 'error');
      }
    }
    setSubmitting(false);
  };

  const handleWhatsappModalClose = () => {
    setShowWhatsappModal(false);
    showAlertMessage('Team registered successfully! Redirecting to events page...', 'success');
    setTimeout(() => {
      navigate("/events");
    }, 3000);
  };

  const WhatsappModal = ({ whatsappLink, handleWhatsappModalClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-md w-full"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Join Event Group</h3>
            <button
              onClick={handleWhatsappModalClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-center text-gray-600 mb-4">
              Stay connected with your team and get real-time event updates!
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-700 mb-3">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <span>Connect with participants</span>
              </div>
              <div className="flex items-center text-gray-700 mb-3">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <span>Receive important announcements</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="bg-purple-100 rounded-full p-2 mr-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <span>Get schedule reminders</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
              onClick={handleWhatsappModalClose}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Join WhatsApp Group
            </a>
            <button
              onClick={handleWhatsappModalClose}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-300"
            >
              <X className="mr-2 h-5 w-5" />
              Maybe Later
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p>You can always join later from the event page</p>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-4">You must be logged in to register for an event.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300"
        >
          Log In
        </button>
      </div>
    );
  }

  if (!eventDetails) {
    return <div>Loading event details...</div>;
  }

  return (      
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={handleBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Events
      </button>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden md:max-w-2xl">
        <div className="p-8 w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Team Registration for {eventDetails.name}</h2>
          
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-grow">
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                  Team Name *
                </label>
                <input
                  id="teamName"
                  name="teamName"
                  type="text"
                  required
                  value={formData.teamName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Team logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <input
                  id="teamLogo"
                  name="teamLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="teamLogo"
                  className="mt-2 cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Upload className="h-4 w-4 inline-block mr-1" />
                  Upload Logo
                </label>
              </div>
            </div>
            
            {['teamLeadName', 'teamLeadEmail'].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  id={field}
                  name={field}
                  type={field.includes('Email') ? 'email' : 'text'}
                  value={formData[field]}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-600 sm:text-sm"
                />
              </div>
            ))}

            {[1, 2, 3].map((memberNumber) => (
              <div key={`member${memberNumber}Email`}>
                <label htmlFor={`member${memberNumber}Email`} className="block text-sm font-medium text-gray-700">
                  Team Member {memberNumber} Email {memberNumber === 1 ? '*' : ''}
                </label>
                <input
                  id={`member${memberNumber}Email`}
                  name={`member${memberNumber}Email`}
                  type="email"
                  required={memberNumber === 1}
                  value={formData[`member${memberNumber}Email`]}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            ))}

            <div>
              <p className="text-sm text-gray-500 italic">
                * Required fields. Team must have between 2 and 4 members (including team lead).
              </p>
              <p className="text-sm text-gray-500 italic mt-2">
                Note: One person cannot create more than one team or participate in more than one team for this event.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Registering Team...' : 'Register Team'}
              </button>
            </div>
          </form>
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
            <div className={`${
              alertType === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700'
            } border-l-4 p-4 rounded shadow-lg`} role="alert">
              <div className="flex">
                <div className="py-1">
                  <AlertTriangle className={`h-6 w-6 ${
                    alertType === 'error' ? 'text-red-500' : 'text-green-500'
                  } mr-4`} />
                </div>
                <div>
                  <p className="font-bold">{alertType === 'error' ? 'Error' : 'Success'}</p>
                  <p>{alertMessage}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {showWhatsappModal && (
          <WhatsappModal
            whatsappLink={whatsappLink}
            handleWhatsappModalClose={handleWhatsappModalClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamRegistrationForm;