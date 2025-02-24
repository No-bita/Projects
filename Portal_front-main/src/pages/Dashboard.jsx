import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Layout/Loader";
import api from "../services/api";
import "./Dashboard.css";

const years = ["2024"];
const slots = {
  "2024": [
    "Jan 27 Shift 1", "Jan 27 Shift 2", "Jan 29 Shift 1", "Jan 29 Shift 2",
    "Feb 1 Shift 1", "Feb 1 Shift 2", "Apr 04 Shift 1", "Apr 04 Shift 2"
  ]
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedShift, setSelectedShift] = useState(slots[years[0]][0]);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [performance, setPerformance] = useState({ totalTests: 0, accuracy: 0, bestScore: 0 });

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });

    // Fetch Performance & Exam History
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get(`/api/dashboard-stats?user_id=${user.id}`);
        setPerformance(data.performance || {});
        setExamHistory(data.history || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, [user, navigate]); 

  const handleStartExam = async (e) => {
    e.preventDefault();
    setError(null);
    setIsStarting(true);
  
    localStorage.removeItem("answers");
    localStorage.removeItem("markedQuestions");
  
    const formattedShift = selectedShift.replace(/\s+/g, "_");
  
    try {
      console.log("Starting Exam:", { year: selectedYear, slot: formattedShift });

      const { data: questions } = await api.post("/api/questions", {
        year: selectedYear,
        slot: formattedShift
      });

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

  const handleRetryExam = (attempt) => {
    navigate("/exam", {
      state: {
        year: attempt.year,
        slot: attempt.slot,
        questions: attempt.questions,
      },
    });
  };

  return (
    <div className="dashboard-container">
      {/* ✅ Header Section */}
      <header className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <h1>Welcome, <span className="username">{user?.name || "User"}</span></h1>
        </div>
        <button onClick={logout} className="logout-button">Logout</button>
      </header>

      {/* ✅ Performance Overview */}
      <section className="performance-overview">
        <h2>📊 Your Progress</h2>
        <div className="stats-grid">
          <div className="stat-card"><p>Total Tests</p><h3>{performance.totalTests}</h3></div>
          <div className="stat-card"><p>Best Score</p><h3>{performance.bestScore}</h3></div>
          <div className="stat-card"><p>Accuracy</p><h3>{performance.accuracy}%</h3></div>
        </div>
      </section>

      {/* ✅ Error Message */}
      {error && <div className="dashboard-alert error">{error}</div>}

      {/* ✅ Exam Selection Section */}
      <section className="exam-card">
        <h2>📖 Start New Attempt</h2>
        
        <form onSubmit={handleStartExam}>
          <div className="form-group">
            <label>Select Year</label>
            <select 
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedShift(slots[e.target.value][0]); 
              }}
              disabled={isStarting}
            >
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Select Shift</label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              disabled={isStarting || !selectedYear}
            >
              {slots[selectedYear].map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="start-button" disabled={isStarting}>
            {isStarting ? <Loader size="small" /> : "🚀 Start Exam"}
          </button>
        </form>
      </section>

      {/* ✅ Exam History Section */}
      {examHistory.length > 0 && (
        <section className="exam-history">
          <h2>📜 Recent Attempts</h2>
          <table className="exam-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exam Slot</th>
                <th>Score</th>
                <th>Retry</th>
              </tr>
            </thead>
            <tbody>
              {examHistory.slice(0, 5).map((attempt, index) => (
                <tr key={index}>
                  <td>{new Date(attempt.timestamp).toLocaleDateString()}</td>
                  <td>{attempt.slot}</td>
                  <td>{attempt.score}</td>
                  <td>
                    <button 
                      className="retry-button" 
                      onClick={() => handleRetryExam(attempt)}
                    >
                      🔄 Retry
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
