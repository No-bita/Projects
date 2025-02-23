import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "./ExamPage.css"; 

const ExamPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Ensure answers is always an array from localStorage
  const initialAnswers = JSON.parse(localStorage.getItem("answers") || "[]");
  const answersArray = Array.isArray(initialAnswers) ? initialAnswers : [];

  // Initialize state with answers as an array
  const [examData, setExamData] = useState({
    questions: location.state?.questions || [],
    answers: answersArray,
    markedQuestions: JSON.parse(localStorage.getItem("markedQuestions") || "{}"),
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
  
  const [examYear, setExamYear] = useState(location.state?.year || localStorage.getItem("year"));
  const [examSlot, setExamSlot] = useState(location.state?.slot || localStorage.getItem("slot"));

  // Start the timer and update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer); // Stop the timer if time reaches 0
          handleSubmit(); // Optionally, submit the test when time is up
          return 0;
        }
        return prevTime - 1; // Decrease time by 1 second
      });
    }, 1000);

    return () => clearInterval(timer); // Clean up the interval when component unmounts
  }, []);

  // Combine storage updates and load user/exam metadata
  useEffect(() => {
    if (user) {
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("user_name", user.name);
    }

    if (examYear) localStorage.setItem("year", examYear);
    if (examSlot) localStorage.setItem("slot", examSlot);

    // Store examData in localStorage
    localStorage.setItem("answers", JSON.stringify(examData.answers));
    localStorage.setItem("markedQuestions", JSON.stringify(examData.markedQuestions));
  }, [user, examYear, examSlot, examData]);

  // Auto-save to localStorage on answers or marks change
  useEffect(() => {
    try {
      localStorage.setItem("answers", JSON.stringify(examData.answers));
      localStorage.setItem("markedQuestions", JSON.stringify(examData.markedQuestions));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [examData]);

  // Helper function to format time
  const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

  // Helper to get answer for current question
  const getCurrentAnswer = () => {
    const currentQuestion = examData.questions[currentQuestionIndex];
    return examData.answers.find(a => a.question_id === currentQuestion?.id);
  };

  // Helper to update answer for current question ensuring the required format
  const updateAnswer = (selectedValue) => {
    const currentQuestion = examData.questions[currentQuestionIndex];
    if (!currentQuestion) return;
    const questionId = String(currentQuestion.question_id);
    const existingIndex = examData.answers.findIndex(a => a.question_id === questionId);
    const newAnswer = { question_id: questionId, selected_answer: Number(selectedValue) };
    let updatedAnswers;
    if (existingIndex > -1) {
      updatedAnswers = [...examData.answers];
      updatedAnswers[existingIndex] = newAnswer;
    } else {
      updatedAnswers = [...examData.answers, newAnswer];
    }
    setExamData(prev => ({ ...prev, answers: updatedAnswers }));
  };

  const handleOptionSelect = (option) => {
    // Convert option to number when storing the answer
    updateAnswer(option);
  };

  const handleIntegerInput = (e) => {
    const inputValue = e.target.value;
    if (/^[0-9]*$/.test(inputValue) && inputValue !== "") {
      updateAnswer(inputValue);
    } else if (inputValue === "") {
      // Optionally, remove answer if field is cleared
      const currentQuestion = examData.questions[currentQuestionIndex];
      if (!currentQuestion) return;
      const questionId = currentQuestion.id;
      const updatedAnswers = examData.answers.filter(a => a.question_id !== questionId);
      setExamData(prev => ({ ...prev, answers: updatedAnswers }));
    }
  };

  const handleMarkForReview = () => {
    const currentQuestion = examData.questions[currentQuestionIndex];
    const isAnswered = !!examData.answers.find(a => a.question_id === currentQuestion.id);
    const markType = isAnswered ? "reviewedWithAnswer" : "reviewedWithoutAnswer";

    setExamData(prev => ({
      ...prev,
      markedQuestions: {
        ...prev.markedQuestions,
        [currentQuestionIndex]: prev.markedQuestions[currentQuestionIndex] === markType ? null : markType
      }
    }));
  };

  const handleNavigation = (direction) => {
    setCurrentQuestionIndex(prev => prev + direction);
  };

  const handleSubmit = async () => {
    // Fetch the token from localStorage
    const token = localStorage.getItem("token");
  
    // Check if the token is available
    if (!token) {
      alert("You are not authenticated. Please log in first.");
      navigate("/login"); // Redirect to login if the token is missing
      return;
    }
  
    try {
      // Collect all the necessary data to be sent to the backend
      const examSubmissionData = {
        user_id: localStorage.getItem("user_id"),
        user_name: localStorage.getItem("user_name"),
        year: localStorage.getItem("year"),  // Ensure these values exist
        slot: localStorage.getItem("slot"),
        answers: examData.answers,
        markedQuestions: examData.markedQuestions,
      };
  
      const response = await fetch("http://localhost:5001/api/save-attempt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, // ✅ Correct format
        body: JSON.stringify(examSubmissionData),
      });
      
  
      const result = await response.json();
      if (response.ok) {
        alert("Attempt saved successfully!");
        localStorage.clear(); // Clear all saved data after successful submission
        navigate("/results");
      } else {
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
          <p className="exam-timer">Time Left: <span>{formatTime(timeLeft)}</span></p>
        </div>

        <div className="exam-question-container">
          <h2>Question {currentQuestionIndex + 1}:</h2>
          
          {examData.questions[currentQuestionIndex]?.image && (
            <img 
              src={examData.questions[currentQuestionIndex].image} 
              alt="Question Illustration" 
              className="exam-question-image"
            />
          )}

          <p className="exam-question">{examData.questions[currentQuestionIndex]?.question}</p>

          {examData.questions[currentQuestionIndex]?.type === "MCQ" ? (
            <div className="exam-options">
              {examData.questions[currentQuestionIndex]?.options.map((option, index) => {
                const currentAnswer = getCurrentAnswer();
                return (
                  <div 
                    key={index}
                    className={`exam-option ${currentAnswer && currentAnswer.selected_answer === Number(option) ? "selected" : ""}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="exam-integer-input">
              <input
                type="text"
                pattern="[0-9]*"
                className="integer-input"
                value={getCurrentAnswer()?.selected_answer || ""}
                onChange={handleIntegerInput}
              />
            </div>
          )}

        </div>
      </div>

      <div className="exam-navigation-panel">
        <h3>Questions</h3>
        <div className="question-grid">
          {examData.questions.map((question, index) => {
            const answered = examData.answers.find(a => a.question_id === String(question.question_id));
            return (
              <button 
                key={index} 
                className={`question-button 
                  ${answered ? "answered" : "not-visited"} 
                  ${examData.markedQuestions[index] === "reviewedWithAnswer" ? "marked-with-answer" : ""}
                  ${examData.markedQuestions[index] === "reviewedWithoutAnswer" ? "marked-without-answer" : ""}
                `}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <button onClick={handleMarkForReview} className="mark-review-button">
          {examData.markedQuestions[currentQuestionIndex] ? "Unmark Review" : "Mark for Review"}
        </button>

        <div className="exam-buttons">
          <button className="submit-button" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
