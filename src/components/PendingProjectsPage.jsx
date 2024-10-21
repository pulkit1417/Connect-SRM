import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Check, X, AlertCircle } from 'lucide-react';

const PendingProjectsPage = () => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { eventId } = useParams();

  useEffect(() => {
    fetchPendingProjects();
  }, [eventId]);

  const fetchPendingProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const shortlistedTeamsCollection = collection(db, `events/${eventId}/shortlistedTeams`);
      const pendingProjectsQuery = query(
        shortlistedTeamsCollection,
        where('fillerProjectStatus', '==', 'pending')
      );
      const pendingProjectsSnapshot = await getDocs(pendingProjectsQuery);

      const projectsData = pendingProjectsSnapshot.docs.map((teamDoc) => {
        const teamData = teamDoc.data();
        return {
          teamId: teamDoc.id,
          teamName: teamData.team.teamName,
          fillerProject: teamData.fillerProjectUrl,
          mainProject: teamData.mainProjectUrl,
          fillerProjectStatus: teamData.fillerProjectStatus,
          mainProjectStatus: teamData.mainProjectStatus,
          ecredits: teamData.ecredits || 0,
        };
      }).filter(project => project.fillerProject || project.mainProject);

      setPendingProjects(projectsData);
    } catch (error) {
      console.error("Error fetching pending projects:", error);
      setError("Failed to fetch pending projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectVerification = async (teamId, projectType, status) => {
    try {
      setUpdating(true);
      const teamRef = doc(db, `events/${eventId}/shortlistedTeams/${teamId}`);

      const updateData = {
        [`${projectType}ProjectStatus`]: status,
      };

      let newCredits = 0;
      if (status === 'approved') {
        const creditsInput = document.querySelector(`#credits-${teamId}-${projectType}`);
        newCredits = parseInt(creditsInput.value, 10);
        if (isNaN(newCredits)) {
          throw new Error("Invalid credit value");
        }
      }

      // Get the current project data
      const currentProject = pendingProjects.find(project => project.teamId === teamId);
      
      // Calculate the new total ecredits
      const totalCredits = currentProject.ecredits + newCredits;
      
      updateData.ecredits = totalCredits;

      await updateDoc(teamRef, updateData);

      setPendingProjects(prevProjects => 
        prevProjects.map(project => {
          if (project.teamId === teamId) {
            return {
              ...project,
              [`${projectType}ProjectStatus`]: status,
              ecredits: totalCredits
            };
          }
          return project;
        }).filter(project => 
          project.fillerProjectStatus === 'pending' || project.mainProjectStatus === 'pending'
        )
      );

      alert(`${projectType.charAt(0).toUpperCase() + projectType.slice(1)} project ${status} successfully${status === 'approved' ? ` and ${newCredits} credits assigned. Total credits: ${totalCredits}` : ''}!`);
    } catch (error) {
      console.error("Error verifying project:", error);
      alert("Failed to verify project. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Pending Projects</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 mr-2" />
            <p className="font-bold">Error</p>
          </div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-primary hover:text-primary transition-colors duration-300 bg-white px-4 py-2 rounded-full shadow-md"
        >
          <ChevronLeft className="mr-2" size={20} />
          Back to Events
        </button>
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Pending Projects</h1>
        {pendingProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No pending projects at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pendingProjects.map((project) => (
              <div 
                key={project.teamId}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl p-6"
              >
                <h2 className="text-2xl font-bold mb-2 text-gray-800">{project.teamName}</h2>
                <p className="text-sm text-gray-600 mb-4">Total Credits: {project.ecredits}</p>
                {project.fillerProject && project.fillerProjectStatus === 'pending' && (
                  <ProjectVerificationSection
                    project={project}
                    projectType="filler"
                    handleProjectVerification={handleProjectVerification}
                    updating={updating}
                  />
                )}
                {project.mainProject && project.mainProjectStatus === 'pending' && (
                  <ProjectVerificationSection
                    project={project}
                    projectType="main"
                    handleProjectVerification={handleProjectVerification}
                    updating={updating}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectVerificationSection = ({ project, projectType, handleProjectVerification, updating }) => (
  <div className="mb-6">
    <p className="text-sm text-gray-600 mb-2 flex items-center">
      {projectType.charAt(0).toUpperCase() + projectType.slice(1)} Project: 
      <a href={project[`${projectType}Project`]} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-2 flex items-center">
        View <ExternalLink size={14} className="ml-1" />
      </a>
    </p>
    <div className="flex items-center mt-3">
      <input
        type="number"
        id={`credits-${project.teamId}-${projectType}`}
        placeholder="Credits"
        className="w-24 mr-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        onClick={() => handleProjectVerification(project.teamId, projectType, 'approved')}
        className="mr-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center"
        disabled={updating}
      >
        <Check size={16} className="mr-1" /> Approve
      </button>
      <button
        onClick={() => handleProjectVerification(project.teamId, projectType, 'rejected')}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center"
        disabled={updating}
      >
        <X size={16} className="mr-1" /> Reject
      </button>
    </div>
  </div>
);

export default PendingProjectsPage;