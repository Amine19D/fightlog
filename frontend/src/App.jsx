import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Seances from "./pages/Seances"
import Profile from "./pages/Profile"

function PrivateRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div style={{ color: "#fff", textAlign: "center", padding: "4rem" }}>Chargement...</div>
  return token ? children : <Navigate to="/login" />
}

function AppRoutes() {
  const { token } = useAuth()
  return (
    <BrowserRouter>
      {token && <Navbar />}
      <div style={{ background: "#0f0f0f", minHeight: "100vh" }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/seances" element={<PrivateRoute><Seances /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}