import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ Ensure correct path
import { useNavigate } from "react-router-dom";
import "./Results.css"; // ✅ Styled Results Page

const Results = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchResults = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        const year = localStorage.getItem("year");
        const slot = localStorage.getItem("slot");

        if (!user_id || !year || !slot) {
          setError("Missing user attempt data.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5001/api/results/calculate?user_id=${user_id}&year=${year}&slot=${encodeURIComponent(slot)}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Error fetching results");
        }
        setResults(data);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err.message || "Failed to fetch results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [navigate, user]);

  return (
    <div className="results-container">
      <h1>📊 Exam Results</h1>

      {loading && <p>Loading results...</p>}
      {error && <p className="error-message">{error}</p>}

      {results && (
        <>
          {/* ✅ Score Summary Section */}
          <div className="score-summary">
            <div className="score-box correct">
              <span>✅ Correct</span>
              <strong>{results.correct_answers}</strong>
            </div>
            <div className="score-box incorrect">
              <span>❌ Incorrect</span>
              <strong>{results.incorrect_answers}</strong>
            </div>
            <div className="score-box unattempted">
              <span>⏳ Unattempted</span>
              <strong>{results.unanswered}</strong>
            </div>
            <div className="score-box final-score">
              <span>🏆 Final Score</span>
              <strong>{results.score}</strong>
            </div>
          </div>

          {/* ✅ Progress Bar for Performance Overview */}
          <div className="progress-bar">
            <div
              className="progress correct"
              style={{ width: `${(results.correct_answers / results.total_questions) * 100}%` }}
            ></div>
            <div
              className="progress incorrect"
              style={{ width: `${(results.incorrect_answers / results.total_questions) * 100}%` }}
            ></div>
            <div
              className="progress unattempted"
              style={{ width: `${(results.unanswered / results.total_questions) * 100}%` }}
            ></div>
          </div>

          {/* ✅ Detailed Results Table */}
          <div className="detailed-results">
            <h2>📋 Detailed Results</h2>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Question ID</th>
                  <th>Your Answer</th>
                  <th>Correct Answer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.answers.map((answer, index) => (
                  <tr key={index} className={answer.status}>
                    <td>{answer.question_id}</td>
                    <td>{answer.user_answer !== null ? answer.user_answer : "N/A"}</td>
                    <td>{answer.correct_answer}</td>
                    <td className={`status ${answer.status}`}>
                      {answer.status === "correct" ? "✅ Correct" : 
                       answer.status === "incorrect" ? "❌ Incorrect" : 
                       "⏳ Unattempted"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <button className="back-button" onClick={() => navigate("/")}>🔙 Go to Dashboard</button>
    </div>
  );
};

export default Results;
