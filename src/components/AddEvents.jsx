import React, { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, Timestamp, getDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AddEvents = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userClubName, setUserClubName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    clubName: '',
    date: '',
    time: '',
    location: '',
    posterUrl: '',
    description: '',
    rules: [''],
    prizes: [''],
    lastRegistrationDate: '',
    lastRegistrationTime: '',
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserClubName(user.email);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserClubName = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const clubName = userData.clubName || '';
        setUserClubName(clubName);
        setFormData(prevState => ({
          ...prevState,
          clubName: clubName
        }));
      }
    } catch (error) {
      console.error("Error fetching user club name:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (index, field) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to add an event.");
      return;
    }
    try {
      const lastRegistrationDateTime = new Date(`${formData.lastRegistrationDate}T${formData.lastRegistrationTime}`);
      const docRef = await addDoc(collection(db, 'events'), {
        ...formData,
        createdBy: user.email,
        createdAt: serverTimestamp(),
        lastRegistrationTimestamp: Timestamp.fromDate(lastRegistrationDateTime),
      });
      alert("Event added successfully!");
      navigate('/events');
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to add event. Please try again.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-4">You must be logged in to add an event.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Events
      </button>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold mb-6 text-center">Add New Event</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
              Event Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="clubName" className="block text-gray-700 font-bold mb-2">
              Club Name
            </label>
            <input
              type="text"
              id="clubName"
              name="clubName"
              value={formData.clubName}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-gray-700 font-bold mb-2">
              Event Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-gray-700 font-bold mb-2">
              Event Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-gray-700 font-bold mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="posterUrl" className="block text-gray-700 font-bold mb-2">
              Poster URL
            </label>
            <input
              type="url"
              id="posterUrl"
              name="posterUrl"
              value={formData.posterUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="lastRegistrationDate" className="block text-gray-700 font-bold mb-2">
              Last Registration Date
            </label>
            <input
              type="date"
              id="lastRegistrationDate"
              name="lastRegistrationDate"
              value={formData.lastRegistrationDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="lastRegistrationTime" className="block text-gray-700 font-bold mb-2">
              Last Registration Time
            </label>
            <input
              type="time"
              id="lastRegistrationTime"
              name="lastRegistrationTime"
              value={formData.lastRegistrationTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {['rules', 'prizes'].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 font-bold mb-2">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              {formData[field].map((item, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange(e, index, field)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayField(index, field)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField(field)}
                className="bg-green-500 text-white px-3 py-1 rounded mt-2 text-sm"
              >
                Add {field.slice(0, -1)}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300"
          >
            Add Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEvents;