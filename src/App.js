import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Events from './components/Events';
import Features from './components/Features';
import NotFound from './components/NotFound';
import LoginForm from './components/LoginForm';
import TeamRegistrationForm from './components/Registrations';
import EventDetails from './components/EventDetails';
import ClubEvents from './components/Events';
import AddEvents from './components/AddEvents';
import PublicRoute from './components/PublicRoute';
import PrivateRoute from './components/PrivateRoute';
import Profile from './components/Profile';
import TeamDashboard from './components/TeamDashboard';
import TeamEventDashboard from './components/TeamEventDashboard';
import PendingProjectsPage from './components/PendingProjectsPage';
import './components/css/About.css';
import { useAuth } from './context/AuthContext';
import './App.css';
import SignupForm from './components/SignUp';
import AdminDashboard from './components/AdminDashboard';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <div className="App flex flex-col min-h-screen">
//           <Navbar />
//           <main className="flex-grow">
//             <Routes>
//               <Route path="/" element={<Home />} />
//               <Route path="/about" element={<About />} />
//               <Route path="/contact" element={<Contact />} />
//               <Route path="/events" element={<Events />} />
//               <Route path="/club-events" element={<ClubEvents />} />
//               <Route path="/features" element={<Features />} />
//               <Route path="/adminDash" element={<AdminDashboard />} />
//               <Route
//                 path="/login"
//                 element={
//                   <PublicRoute>
//                     <LoginForm />
//                   </PublicRoute>
//                 }
//               />
//               <Route
//                 path="/signup"
//                 element={
//                     <SignupForm />
//                 }
//               />
//               <Route path="/register/:eventId" element={<TeamRegistrationForm />} />
//               <Route path="/event-details/:id" element={<EventDetails />} />
//               <Route path="/addNewEvent" element={<AddEvents />} />
//               <Route path="/profile/:email" element={<Profile />} />
//               <Route path="/pending-projects/:eventId" element={<PendingProjectsPage />} />
//               <Route
//                 path="/dashboard/:eventId/:teamId"
//                 element={
//                   <PrivateRoute requiredStatus="notStarted">
//                     <TeamDashboard />
//                   </PrivateRoute>
//                 }
//               />
//               <Route
//                 path="/event-dashboard/:eventId/:teamId"
//                 element={
//                   <PrivateRoute requiredStatus="started">
//                     <TeamEventDashboard />
//                   </PrivateRoute>
//                 }
//               />
//               <Route path="*" element={<NotFound />} />
//             </Routes>
//           </main>
//           <Footer />
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is an admin or clubAdmin
  if (!user.isAdmin && !user.clubAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Updated App.js with protected admin routes
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/events" element={<Events />} />
              <Route path="/club-events" element={<ClubEvents />} />
              <Route path="/features" element={<Features />} />
              <Route path="/event-details/:id" element={<EventDetails />} />

              {/* Authentication routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginForm />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <SignupForm />
                }
              />

              {/* Admin-only routes */}
              <Route
                path="/adminDash"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/addNewEvent"
                element={
                  <AdminRoute>
                    <AddEvents />
                  </AdminRoute>
                }
              />
              <Route
                path="/pending-projects/:eventId"
                element={
                  <AdminRoute>
                    <PendingProjectsPage />
                  </AdminRoute>
                }
              />

              {/* Protected team routes */}
              <Route path="/register/:eventId" element={<TeamRegistrationForm />} />
              <Route path="/profile/:email" element={<Profile />} />
              <Route
                path="/dashboard/:eventId/:teamId"
                element={
                  <PrivateRoute requiredStatus="notStarted">
                    <TeamDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/event-dashboard/:eventId/:teamId"
                element={
                  <PrivateRoute requiredStatus="started">
                    <TeamEventDashboard />
                  </PrivateRoute>
                }
              />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
