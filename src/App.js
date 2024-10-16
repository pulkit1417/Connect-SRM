import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './components/css/About.css';
import './App.css';
import SignupForm from './components/SignUp';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/events" element={<Events />} />
              <Route path="/club-events" element={<ClubEvents />} />
              <Route path="/features" element={<Features />} />
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
              <Route path="/register/:eventId" element={<TeamRegistrationForm />} />
              <Route path="/event-details/:id" element={<EventDetails />} />
              <Route path="/addNewEvent" element={<AddEvents />} />
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