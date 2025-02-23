import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ExamPage from "./pages/ExamPage";

function App() {
  return (
    <AuthProvider> {/* ✅ Keep AuthProvider here */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ✅ Temporarily allow /exam without examId */}
        <Route path="/exam" element={<ExamPage />} />

        {/* ✅ Protect dashboard but allow exam access for now */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
