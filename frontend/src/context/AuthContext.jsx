import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const API_URL = "http://localhost:8000"
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchMe = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/me`)
      setUser(res.data)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password })
    const t = res.data.access_token
    localStorage.setItem("token", t)
    axios.defaults.headers.common["Authorization"] = `Bearer ${t}`
    setToken(t)
  }

  const register = async (data) => {
    await axios.post(`${API_URL}/auth/register`, data)
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)