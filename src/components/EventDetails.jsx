import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Users,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ChevronUp as ChevronUpIcon,
} from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullRules, setShowFullRules] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [userTeamId, setUserTeamId] = useState(null);
  const { user } = useAuth();
  const [shortlistedTeams, setShortlistedTeams] = useState([]);
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [eventCredits, setEventCredits] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          const eventDate = new Date(eventData.date);
          const lastRegistrationDate =
            eventData.lastRegistrationTimestamp?.toDate();

          setEvent({
            id: eventDoc.id,
            ...eventData,
            formattedDate: formatDate(eventDate),
            formattedTime: formatTime(eventDate),
            lastRegistrationDate: formatDate(lastRegistrationDate),
            lastRegistrationTime: formatTime(lastRegistrationDate),
          });
          setIsRegistrationOpen(new Date() < lastRegistrationDate);
        } else {
          console.log("No such event!");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();

    const checkUserTeam = async () => {
      if (user && user.email) {
        try {
          const teamsCollectionRef = collection(db, `events/${id}/teams`);
          const teamsSnapshot = await getDocs(teamsCollectionRef);

          for (const teamDoc of teamsSnapshot.docs) {
            const teamData = teamDoc.data();
            const memberFields = [
              "teamLeadEmail",
              "member1Email",
              "member2Email",
              "member3Email",
            ];
            for (const field of memberFields) {
              if (teamData[field] === user.email) {
                setUserTeamId(teamDoc.id);
                return;
              }
            }
          }

          setUserTeamId(null);
        } catch (error) {
          console.error("Error checking user team:", error);
        }
      }
    };

    checkUserTeam();

    // Set up real-time listener for teams subcollection
    const teamsCollectionRef = collection(db, `events/${id}/teams`);
    const unsubscribe = onSnapshot(
      teamsCollectionRef,
      async (snapshot) => {
        const teamsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const teamsWithDetails = await Promise.all(
          teamsData.map(async (team) => {
            const teamMembers = await fetchTeamMemberDetails(team);
            const totalCredits = calculateTotalCredits(teamMembers);
            return {
              ...team,
              teamMembers,
              totalCredits,
            };
          })
        );

        // Fetch shortlisted teams and their ecredits
        const shortlistedTeamsRef = collection(
          db,
          `events/${id}/shortlistedTeams`
        );
        const shortlistedSnapshot = await getDocs(shortlistedTeamsRef);

        if (!shortlistedSnapshot.empty) {
          const shortlistedTeamsData = shortlistedSnapshot.docs.map((doc) => ({
            id: doc.id,
            ecredits: doc.data().ecredits || 0,
          }));

          const shortlistedTeamsWithDetails = teamsWithDetails.filter((team) =>
            shortlistedTeamsData.some((shortlisted) => shortlisted.id === team.id)
          ).map((team) => ({
            ...team,
            ecredits: shortlistedTeamsData.find((shortlisted) => shortlisted.id === team.id)?.ecredits || 0,
          }));

          const sortedShortlistedTeams = sortTeams(shortlistedTeamsWithDetails, true);
          setShortlistedTeams(sortedShortlistedTeams);
        } else {
          const sortedTeams = sortTeams(teamsWithDetails, false);
          setShortlistedTeams(sortedTeams);
        }

        const sortedAllTeams = sortTeams(teamsWithDetails, false);
        setTeams(sortedAllTeams);
      },
      (error) => {
        console.error("Error fetching teams:", error);
      }
    );

    return () => unsubscribe();
  }, [id, user]);

  const sortTeams = (teams, useEcredits) => {
    return teams.sort((a, b) => {
      if (useEcredits) {
        return b.ecredits - a.ecredits;
      }
      return b.totalCredits - a.totalCredits;
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    const options = { day: "numeric", month: "long", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-IN", options);
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    return formattedDate.replace(/\d+/, day + suffix);
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const fetchTeamMemberDetails = async (team) => {
    const memberDetails = [];
    const roles = ["teamLead", "member1", "member2", "member3"];

    for (const role of roles) {
      if (team[`${role}Email`]) {
        try {
          const userDoc = await getDoc(doc(db, "users", team[`${role}Email`]));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            memberDetails.push({
              role,
              name: userData.name || userData.email.split("@")[0],
              email: team[`${role}Email`],
              credits: userData.credits || 0,
            });
          }
        } catch (error) {
          console.error(`Error fetching details for ${role}:`, error);
        }
      }
    }

    return memberDetails;
  };

  const calculateTotalCredits = (teamMembers) => {
    return teamMembers.reduce((total, member) => total + member.credits, 0);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const toggleTeamExpansion = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const getRankingColor = (index) => {
    switch (index) {
      case 0:
        return "bg-yellow-300";
      case 1:
        return "bg-gray-300";
      case 2:
        return "bg-amber-600";
      default:
        return "bg-white";
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const toggleRules = () => {
    setShowFullRules(!showFullRules);
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleRegisterNow = () => {
    navigate(`/register/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center text-2xl text-red-600 mt-10">
        Event not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen relative">
      <button
        onClick={handleBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300 bg-white px-4 py-2 rounded-full shadow-md"
      >
        <ChevronLeft className="mr-2" size={20} />
        Back to Events
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className="relative">
          <img
            src={event.posterUrl}
            alt={`${event.name} poster`}
            className="w-full h-64 md:h-96 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <h2 className="text-3xl md:text-5xl font-bold mb-2 text-white">
              {event.name}
            </h2>
            <p className="text-xl md:text-2xl text-gray-300">
              Organized by {event.clubName}
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center text-gray-700 bg-gray-100 p-4 rounded-lg">
              <Calendar className="mr-4 text-blue-600" size={24} />
              <div>
                <span className="font-semibold">Date</span>
                <p className="text-lg">{event.formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-700 bg-gray-100 p-4 rounded-lg">
              <Clock className="mr-4 text-blue-600" size={24} />
              <div>
                <span className="font-semibold">Time</span>
                <p className="text-lg">{event.time} am</p>
              </div>
            </div>
            <div className="flex items-center text-gray-700 bg-gray-100 p-4 rounded-lg">
              <MapPin className="mr-4 text-blue-600" size={24} />
              <div>
                <span className="font-semibold">Location</span>
                <p className="text-lg">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-700 bg-gray-100 p-4 rounded-lg">
              <Users className="mr-4 text-blue-600" size={24} />
              <div>
                <span className="font-semibold">
                  {shortlistedTeams.length < teams.length
                    ? "Shortlisted Teams"
                    : "Teams Registered"}
                </span>
                <p className="text-lg">
                  {shortlistedTeams.length < teams.length
                    ? shortlistedTeams.length
                    : teams.length}
                </p>
              </div>
            </div>
          </div>
          <div
            className={`mb-8 ${
              isRegistrationOpen
                ? "bg-green-100 border-green-500"
                : "bg-red-100 border-red-500"
            } border-l-4 p-6 rounded-lg`}
          >
            <h4 className="text-xl font-semibold flex items-center mb-4">
              <AlertCircle className="mr-3" size={24} />
              Registration {isRegistrationOpen ? "Open" : "Closed"}
            </h4>
            <p
              className={`${
                isRegistrationOpen ? "text-green-700" : "text-red-700"
              } text-lg`}
            >
              Last date to register:{" "}
              <span className="font-semibold">
                {event.lastRegistrationDate}
              </span>
            </p>
            <p
              className={`${
                isRegistrationOpen ? "text-green-700" : "text-red-700"
              } text-lg`}
            >
              Last time to register:{" "}
              <span className="font-semibold">
                {event.lastRegistrationTime}
              </span>
            </p>
          </div>
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Event Description</h3>
            <p className="text-gray-700 leading-relaxed text-lg">
              {isMobile
                ? showFullDescription
                  ? event.description
                  : truncateText(event.description, 150)
                : event.description}
            </p>
            {isMobile && event.description.length > 150 && (
              <button
                onClick={toggleDescription}
                className="text-blue-600 hover:text-blue-800 mt-4 font-semibold"
              >
                {showFullDescription ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Rules</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
              {event.rules && event.rules.length > 0 ? (
                isMobile ? (
                  <>
                    {(showFullRules
                      ? event.rules
                      : event.rules.slice(0, 3)
                    ).map((rule, index) => (
                      <li key={index} className="mb-3">
                        {rule}
                      </li>
                    ))}
                    {event.rules.length > 3 && (
                      <button
                        onClick={toggleRules}
                        className="text-blue-600 hover:text-blue-800 mt-4 font-semibold"
                      >
                        {showFullRules ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </>
                ) : (
                  event.rules.map((rule, index) => (
                    <li key={index} className="mb-3">
                      {rule}
                    </li>
                  ))
                )
              ) : (
                <li>No specific rules mentioned.</li>
              )}
            </ul>
          </div>
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">Prizes</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
              {event.prizes && event.prizes.length > 0 ? (
                event.prizes.map((prize, index) => (
                  <li key={index} className="mb-3">
                    <span className="font-semibold">{`${
                      index + 1
                    }${getOrdinalSuffix(index + 1)} Prize:`}</span>{" "}
                    {prize}
                  </li>
                ))
              ) : (
                <li>No prize information available.</li>
              )}
            </ul>
          </div>
          {isRegistrationOpen && !userTeamId && (
            <div className="mb-8">
              <button
                onClick={handleRegisterNow}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-md"
              >
                Register Now
              </button>
            </div>
          )}
          {isRegistrationOpen && userTeamId && (
            <div className="mb-8">
              <a
                href={event.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Join WhatsApp Group
              </a>
            </div>
          )}
          <div className="mt-8 px-4 sm:px-6 lg:px-8">
  <h3 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">
    {shortlistedTeams.length < teams.length ? "Shortlisted Teams" : "Team Rankings"}
  </h3>
  {(showAllTeams ? teams : shortlistedTeams).length > 0 ? (
    <>
      <ul className="space-y-4 sm:space-y-6">
        {(showAllTeams ? teams : shortlistedTeams).map((team, index) => (
          <li
            key={team.id}
            className={`${getRankingColor(index)} p-4 sm:p-6 rounded-xl shadow-xl transition-all duration-300 hover:shadow-lg`}
          >
                  {/* Mobile View */}
                  <div className="sm:hidden">
  <div
    className="flex justify-between items-center cursor-pointer"
    onClick={() => toggleTeamExpansion(team.id)}
  >
    <div className="flex items-center space-x-3">
      <span className="font-bold text-xl min-w-[30px] text-gray-700">
        {`${index + 1}.`}
      </span>
      <span className="font-bold text-lg text-gray-800">
        {team.teamName}
      </span>
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-base font-semibold text-gray-700">
        {shortlistedTeams.length < teams.length && !showAllTeams
          ? team.ecredits || 0
          : team.totalCredits || 0}
      </span>
      {expandedTeam === team.id ? (
        <ChevronUp size={20} className="text-gray-600" />
      ) : (
        <ChevronDown size={20} className="text-gray-600" />
      )}
    </div>
  </div>
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{
      height: expandedTeam === team.id ? "auto" : 0,
      opacity: expandedTeam === team.id ? 1 : 0,
    }}
    transition={{ duration: 0.3 }}
    className="mt-4 overflow-hidden"
  >
    {team.teamMembers && team.teamMembers.length > 0 ? (
      <div className="space-y-3 bg-gray-50 rounded-lg p-3 mt-2">
        {team.teamMembers.map((member, memberIndex) => (
          <div
            key={memberIndex}
            className="bg-white p-3 rounded-lg shadow-sm"
          >
            <p className="font-semibold text-base text-gray-800">
              {member.name}
            </p>
            <p className="text-sm text-gray-600">
              {member.role === "teamLead"
                ? "Team Lead"
                : `Member ${memberIndex}`}
            </p>
            <p className="text-sm text-gray-600">
              Credits: {member.credits}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-600 italic text-sm mt-2">
        No team member details available.
      </p>
    )}
  </motion.div>
</div>
                        {/* Desktop View */}
                        <div className="hidden sm:block">
              <div
                className="flex flex-row justify-between items-center cursor-pointer"
                onClick={() => toggleTeamExpansion(team.id)}
              >
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-2xl min-w-[40px] text-gray-700">
                    {`${index + 1}.`}
                  </span>
                  <div>
                    <span className="font-bold text-xl text-gray-800">
                      {team.teamName}
                    </span>
                    <p className="text-md text-gray-600">
                      Lead:{" "}
                      {team.teamMembers?.find(
                        (member) => member.role === "teamLead"
                      )?.name || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-700">
                    {shortlistedTeams.length < teams.length && !showAllTeams
                      ? `Event Credits: ${team.ecredits || 0}`
                      : `Total Credits: ${team.totalCredits || 0}`}
                  </span>
                  {expandedTeam === team.id ? (
                    <ChevronUp size={20} className="text-gray-600 ml-2" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600 ml-2" />
                  )}
                </div>
              </div>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: expandedTeam === team.id ? "auto" : 0,
                  opacity: expandedTeam === team.id ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="mt-6 overflow-hidden"
              >
                {team.teamMembers && team.teamMembers.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {team.teamMembers.map((member, memberIndex) => (
                      <div
                        key={memberIndex}
                        className="bg-gray-100 p-4 rounded-lg shadow-sm"
                      >
                        <p className="font-semibold text-lg text-gray-800">
                          {member.name}
                        </p>
                        <p className="text-md text-gray-600">
                          Role:{" "}
                          {member.role === "teamLead"
                            ? "Team Lead"
                            : `Member ${memberIndex}`}
                        </p>
                        <p className="text-md text-gray-600">
                          Credits: {member.credits}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 italic text-base">
                    No team member details available.
                  </p>
                )}
              </motion.div>
            </div>
          </li>
        ))}
      </ul>
      {shortlistedTeams.length < teams.length && (
        <button
          onClick={() => setShowAllTeams(!showAllTeams)}
          className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-md"
        >
          {showAllTeams ? "Show Shortlisted Teams" : "Show All Teams"}
        </button>
      )}
    </>
  ) : (
    <div
      className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 sm:p-6 rounded-lg"
      role="alert"
    >
      <p className="font-bold text-lg sm:text-xl mb-2">No teams registered</p>
      <p className="text-base sm:text-lg">
        There are currently no teams registered for this event.
      </p>
    </div>
  )}
</div>

        </div>
      </motion.div>
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300"
        >
          <ChevronUpIcon size={24} />
        </button>
      )}
    </div>
  );
};

export default EventDetails;
