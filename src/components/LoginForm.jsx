import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("error");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (location.state?.message) {
      displayNotification(location.state.message, "error");
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const displayNotification = (message, type) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      displayNotification("Please fill in all fields", "error");
      setLoading(false);
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        displayNotification("Please verify your email before logging in. Check your inbox for the verification email.", "error");
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", userCredential.user.email));
      
      if (!userDoc.exists()) {
        await auth.signOut();
        displayNotification("User account not found. Please contact support.", "error");
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      
      if (userData.disabled) {
        await auth.signOut();
        displayNotification("Account disabled. Please contact an admin.", "error");
        setLoading(false);
        return;
      }

      // Only call login function if all checks pass
      await login(userCredential.user);
      displayNotification("Login successful!", "success");
      navigate("/events");
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "An error occurred during login.";
      
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }
      
      displayNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email || !password) {
      displayNotification("Please enter your email and password", "error");
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        displayNotification("Verification email sent. Please check your inbox and spam folder.", "success");
      } else {
        displayNotification("Your email is already verified.", "success");
      }
      
      // Always sign out after sending verification email
      await auth.signOut();
    } catch (error) {
      console.error("Error resending verification email:", error);
      displayNotification(
        "Failed to send verification email. Please check your credentials and try again.", 
        "error"
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-8"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                          focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                        ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Logging in..." : "Login"}
            </button>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            Don't have an account?{" "}
            <a href="/signup" className="text-indigo-600 hover:text-indigo-500">
              Sign up
            </a>
          </motion.p>
        </form>
      </motion.div>
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 max-w-sm z-50"
          >
            <div
              className={`${
                notificationType === "error"
                  ? "bg-red-100 border-red-500 text-red-700"
                  : "bg-green-100 border-green-500 text-green-700"
              } border-l-4 p-4 rounded shadow-lg`}
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  {notificationType === "error" ? (
                    <AlertTriangle className="h-6 w-6 text-red-500 mr-4" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  )}
                </div>
                <div>
                  <p className="font-bold">
                    {notificationType === "error" ? "Error" : "Success"}
                  </p>
                  <p>{notificationMessage}</p>
                  {notificationType === "error" &&
                    notificationMessage.includes("verify your email") && (
                      <button
                        onClick={resendVerificationEmail}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Resend verification email
                      </button>
                    )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginForm;