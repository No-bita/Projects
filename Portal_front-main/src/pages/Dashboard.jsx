import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Layout/Loader";
import api from "../services/api";
import "./Dashboard.css";

const years = ["2024"]; // Hardcoded exam years
const slots = {
  "2024": [
    "Jan 27 Shift 1", "Jan 27 Shift 2", "Jan 29 Shift 1", "Jan 29 Shift 2",
    "Jan 30 Shift 1", "Jan 30 Shift 2", "Jan 31 Shift 1", "Jan 31 Shift 2",
    "Feb 1 Shift 1", "Feb 1 Shift 2", "Apr 04 Shift 1", "Apr 04 Shift 2",
    "Apr 05 Shift 1", "Apr 05 Shift 2", "Apr 06 Shift 1", "Apr 06 Shift 2",
    "Apr 08 Shift 1", "Apr 08 Shift 2", "Apr 09 Shift 1", "Apr 09 Shift 2"
  ]
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedShift, setSelectedShift] = useState(slots[years[0]][0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStartExam = async (e) => {
    e.preventDefault();
    setError(null);
    setIsStarting(true);
  
    // Only clear answers and markedQuestions from localStorage
    localStorage.removeItem("answers");
    localStorage.removeItem("markedQuestions");
  
    // Convert spaces to underscores for consistency
    const formattedShift = selectedShift.replace(/\s+/g, "_");
  
    try {
      console.log("Starting Exam with:", { year: selectedYear, slot: formattedShift });
  
      // Removed localStorage.setItem for examYear and examSlot
  
      // Fetch questions from backend
      const { data: questions } = await api.post("/api/questions", {
        year: selectedYear,
        slot: formattedShift
      });
  
      console.log("Fetched Questions:", questions);
  
      // Pass year and slot directly in navigation state instead of using localStorage
      navigate("/exam", { 
        state: { 
          questions,
          year: selectedYear,
          slot: formattedShift
        } 
      });
    } catch (err) {
      console.error("Exam start error:", err);
      setError(err.response?.data?.message || "Failed to start exam");
    } finally {
      setIsStarting(false);
    }
  };  

  if (!user) return null;
  if (isLoading) return <Loader fullPage />;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome back, {user.name}</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      {error && (
        <div className="dashboard-alert error" role="alert">
          {error}
        </div>
      )}

      <section className="exam-selector">
        <h2>Start New Attempt</h2>
        
        <form onSubmit={handleStartExam}>
          <div className="form-group">
            <label htmlFor="year-select">Select Year</label>
            <select 
              id="year-select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedShift(slots[e.target.value][0]); 
              }}
              disabled={isStarting}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="shift-select">Select Shift</label>
            <select
              id="shift-select"
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              disabled={isStarting || !selectedYear}
            >
              {slots[selectedYear].map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="primary-button"
            disabled={isStarting || !selectedShift}
          >
            {isStarting ? <Loader size="small" /> : "Start Exam"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Dashboard; 