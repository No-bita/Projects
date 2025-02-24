import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ExamPage.css";

const ExamPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initializing state with default values from location or localStorage
  const [examData, setExamData] = useState({
    questions: location.state?.questions || [],
    answers: JSON.parse(localStorage.getItem("answers") || "[]"),
    markedQuestions: JSON.parse(localStorage.getItem("markedQuestions") || "{}"),
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
  const [timerClass, setTimerClass] = useState("");

  const examYear = location.state?.year || localStorage.getItem("year");
  const examSlot = location.state?.slot || localStorage.getItem("slot");

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update timer color dynamically
  useEffect(() => {
    if (timeLeft < 1800) setTimerClass("danger");
    else if (timeLeft < 3600) setTimerClass("warning");
    else setTimerClass("");
  }, [timeLeft]);

  // Update localStorage only when necessary
  useEffect(() => {
    localStorage.setItem("answers", JSON.stringify(examData.answers));
    localStorage.setItem("markedQuestions", JSON.stringify(examData.markedQuestions));
  }, [examData.answers, examData.markedQuestions]);

  // Format time (HH:MM:SS)
  const formatTime = (seconds) =>
    new Date(seconds * 1000).toISOString().substr(11, 8);

  // Get the answer for the current question
  const getCurrentAnswer = useCallback(() => {
    const currentQuestion = examData.questions[currentQuestionIndex];
    return examData.answers.find((a) => a.question_id === Number(currentQuestion?.question_id)) || {};
  }, [examData.answers, examData.questions, currentQuestionIndex]);

  // Update Answer for the Current Question
  const updateAnswer = useCallback((selectedValue) => {
    const currentQuestion = examData.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const questionId = Number(currentQuestion.question_id);
    const newAnswer = { question_id: questionId, selected_answer: Number(selectedValue) };

    setExamData((prev) => ({
      ...prev,
      answers: prev.answers.some((a) => a.question_id === questionId)
        ? prev.answers.map((a) => (a.question_id === questionId ? newAnswer : a))
        : [...prev.answers, newAnswer],
    }));
  }, [examData.questions, currentQuestionIndex]);

  // Handle Option Selection
  const handleOptionSelect = (option) => updateAnswer(option);

  // Handle Integer Input for Numerical Questions
  const handleIntegerInput = (e) => {
    const inputValue = e.target.value;
    if (/^[0-9]*$/.test(inputValue)) updateAnswer(inputValue);
  };

  // Mark Question for Review
  const handleMarkForReview = () => {
    const currentQuestion = examData.questions[currentQuestionIndex];
    const isAnswered = !!examData.answers.find((a) => a.question_id === currentQuestion?.question_id);
    const markType = isAnswered ? "reviewedWithAnswer" : "reviewedWithoutAnswer";

    setExamData((prev) => ({
      ...prev,
      markedQuestions: {
        ...prev.markedQuestions,
        [currentQuestionIndex]: prev.markedQuestions[currentQuestionIndex] === markType ? null : markType,
      },
    }));
  };

  // Navigate to Previous or Next Question
  const handleNavigation = (direction) => setCurrentQuestionIndex((prev) => prev + direction);

  // Submit Exam Attempt
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You are not authenticated. Please log in first.");
      navigate("/login");
      return;
    }

    try {
      const formattedAnswers = examData.answers.map((answer) => ({
        question_id: Number(answer.question_id),
        selected_answer: answer.selected_answer !== "" ? Number(answer.selected_answer) : null,
      }));

      const examSubmissionData = {
        user_id: localStorage.getItem("user_id"),
        user_name: localStorage.getItem("user_name"),
        year: examYear,
        slot: examSlot,
        answers: formattedAnswers,
        markedQuestions: examData.markedQuestions,
      };

      const response = await fetch("http://localhost:5001/api/save-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(examSubmissionData),
      });

      if (response.ok) {
        alert("Attempt saved successfully!");
        navigate("/results");
      } else {
        const result = await response.json();
        alert(`Submission Failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error submitting attempt:", error);
      alert("An error occurred while submitting.");
    }
  };

  return (
    <div className="exam-container">
      <div className="exam-content">
        <div className="exam-header">
          <h1>Exam in Progress</h1>
          <p className={`exam-timer ${timerClass}`}>Time Left: <span>{formatTime(timeLeft)}</span></p>
        </div>

        <div className="exam-question-container">
          <h2>Question {currentQuestionIndex + 1}:</h2>
          {examData.questions[currentQuestionIndex]?.image && (
            <img src={examData.questions[currentQuestionIndex].image} alt="Question" className="exam-question-image" />
          )}
          <p className="exam-question">{examData.questions[currentQuestionIndex]?.question}</p>

          {examData.questions[currentQuestionIndex]?.type === "MCQ" ? (
            <div className="exam-options">
              {examData.questions[currentQuestionIndex]?.options.map((option, index) => (
                <div
                  key={index}
                  className={`exam-option ${getCurrentAnswer().selected_answer === Number(option) ? "selected" : ""}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          ) : (
            <input type="text" pattern="[0-9]*" className="integer-input" value={getCurrentAnswer()?.selected_answer ?? ""} onChange={handleIntegerInput} />
          )}
        </div>
      </div>

      <div className="exam-navigation-panel">
        <h3>Questions</h3>
        <div className="question-grid">
          {examData.questions.map((_, index) => (
            <button key={index} className={`question-button ${examData.answers.find((a) => a.question_id === index + 1) ? "answered" : "not-visited"}`} onClick={() => setCurrentQuestionIndex(index)}>
              {index + 1}
            </button>
          ))}
        </div>
        <button onClick={handleMarkForReview} className="mark-review-button">
          {examData.markedQuestions[currentQuestionIndex] ? "Unmark Review" : "Mark for Review"}
        </button>
        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default ExamPage;
