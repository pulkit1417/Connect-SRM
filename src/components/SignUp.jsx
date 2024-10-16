import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ChevronRight, AlertCircle } from 'lucide-react';
import { db, auth } from '../firebase.config';

const RequiredAsterisk = () => (
  <span className="text-red-500 ml-1">*</span>
);

const FormField = ({ label, id, type, value, onChange, error, options }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}<RequiredAsterisk /></label>
    {type === 'select' ? (
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
      >
        <option value="">Select {label}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>{option.label || option}</option>
        ))}
      </select>
    ) : (
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
      />
    )}
    {error && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{error}</p>}
  </div>
);

const SignupForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        reg: '',
        email: '',
        password: '',
        confirmPassword: '',
        year: '',
        course: '',
        branch: '',
        section: '',
        accommodation: '',
        phone: '',
        dob: '',
        gender: '',
    });
    const [errors, setErrors] = useState({});
    const [showEmailTooltip, setShowEmailTooltip] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleChange = (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        if (name === 'email') {
            setShowEmailTooltip(value && !value.toLowerCase().endsWith('@srmist.edu.in'));
        }

        if (name === 'course') {
            setFormData(prevState => ({
                ...prevState,
                branch: value.toLowerCase() === 'b.tech' ? prevState.branch : ''
            }));
        }

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (!formData[key] && (key !== 'branch' || formData.course.toLowerCase() === 'b.tech')) {
                newErrors[key] = 'This field is required';
            }
        });

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        const lowercaseEmail = formData.email.toLowerCase();
        if (!lowercaseEmail.endsWith('@srmist.edu.in')) {
            newErrors.email = 'Please enter a valid college Email.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const signUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const lowercaseEmail = formData.email.toLowerCase();
            const userCredential = await createUserWithEmailAndPassword(auth, lowercaseEmail, formData.password);
            const user = userCredential.user;
            
            await updateProfile(user, {
                displayName: formData.name,
                photoURL: "https://firebasestorage.googleapis.com/v0/b/srm-app-f063c.appspot.com/o/aboutUs%2F878685_user_512x512.png?alt=media&token=3da5779f-ba28-4733-b430-64222abcafd6",
            });
            
            await sendEmailVerification(user);
            
            await addUser(lowercaseEmail);
            
            setSuccess('Account created successfully! A verification email has been sent to your inbox. Please verify your email before logging in.');
            
            // Sign out the user immediately after signup
            await auth.signOut();
            
            setTimeout(() => {
                navigate("/login");
            }, 5000); // Increased delay to 5 seconds to give users more time to read the message
        } catch (error) {
            console.error("Signup error:", error);
            setError(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const addUser = async (lowercaseEmail) => {
        const usersRef = doc(db, "users", lowercaseEmail);
        const userData = {
            name: formData.name,
            reg: formData.reg,
            email: lowercaseEmail,
            year: formData.year,
            course: formData.course,
            branch: formData.course.toLowerCase() === 'b.tech' ? formData.branch : '',
            section: formData.section,
            accommodation: formData.accommodation,
            phone: formData.phone,
            dob: formData.dob,
            gender: formData.gender,
            totalProjects: 0,
            sort: serverTimestamp(),
            credits: 0,
            pcredits: 0,
            dcredits: 0,
            rank: 0,
            leetcode: "",
            linkedIn: "",
            gitHub: "",
            instagram: "",
            profile: "https://firebasestorage.googleapis.com/v0/b/srm-app-f063c.appspot.com/o/aboutUs%2F878685_user_512x512.png?alt=media&token=3da5779f-ba28-4733-b430-64222abcafd6"
        };
        Object.keys(userData).forEach(key => userData[key] === undefined && delete userData[key]);

        await setDoc(usersRef, userData);
    };

    const yearOptions = ['First', 'Second', 'Third', 'Fourth'];
    const courseOptions = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Pharma'];
    const branchOptions = ['Core', 'AIML', 'Data Science', 'CSBS', 'Cyber Security', 'Cloud Computing'];
    const sectionOptions = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-12">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Create your account</h2>
                {success && (
                    <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg">
                        {success}
                    </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); signUp(); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Name" id="name" type="text" value={formData.name} onChange={handleChange} error={errors.name} />
                        <FormField label="Registration Number" id="reg" type="text" value={formData.reg} onChange={handleChange} error={errors.reg} />
                        <div className="relative col-span-full">
                            <FormField label="Email address" id="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                            {showEmailTooltip && (
                                <div className="absolute right-0 top-0 mt-10 mr-1 bg-red-100 text-red-800 text-xs rounded-lg py-1 px-2">
                                    Must end with srmist.edu.in
                                </div>
                            )}
                        </div>
                        <FormField label="Password" id="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
                        <FormField label="Confirm Password" id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                        <FormField label="Year" id="year" type="select" value={formData.year} onChange={handleChange} error={errors.year} options={yearOptions} />
                        <FormField label="Course" id="course" type="select" value={formData.course} onChange={handleChange} error={errors.course} options={courseOptions} />
                        {formData.course.toLowerCase() === 'b.tech' && (
                            <FormField label="Branch" id="branch" type="select" value={formData.branch} onChange={handleChange} error={errors.branch} options={branchOptions} />
                        )}
                        <FormField label="Section" id="section" type="select" value={formData.section} onChange={handleChange} error={errors.section} options={sectionOptions} />
                        <FormField label="Accommodation" id="accommodation" type="select" value={formData.accommodation} onChange={handleChange} error={errors.accommodation} options={[{ value: 'hosteler', label: 'Hosteler' }, { value: 'day-scholar', label: 'Day Scholar' }]} />
                        <FormField label="Phone Number" id="phone" type="tel" value={formData.phone} onChange={handleChange} error={errors.phone} />
                        <FormField label="Date of Birth" id="dob" type="date" value={formData.dob} onChange={handleChange} error={errors.dob} />
                        <FormField label="Gender" id="gender" type="select" value={formData.gender} onChange={handleChange} error={errors.gender} options={genderOptions} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {loading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {loading ? "Signing up..." : "Sign up"}
                        <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account? <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">Login</a>
                </p>
            </div>
        </div>
    );
};

export default SignupForm;