import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      navigate("/dashboard")
    } catch {
      setError("Email ou mot de passe incorrect")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🥊 FightLog</h1>
        <h2 style={styles.title}>Connexion</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p style={styles.link}>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f0f0f",
  },
  card: {
    background: "#1a1a1a",
    padding: "2.5rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid #333",
  },
  logo: {
    textAlign: "center",
    color: "#e63946",
    marginBottom: "0.5rem",
    fontSize: "2rem",
  },
  title: {
    textAlign: "center",
    color: "#fff",
    marginBottom: "1.5rem",
    fontWeight: 500,
  },
  field: { marginBottom: "1rem" },
  label: { display: "block", color: "#aaa", marginBottom: "0.4rem", fontSize: "14px" },
  input: {
    width: "100%",
    padding: "0.7rem",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "#111",
    color: "#fff",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    background: "#e63946",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  error: { color: "#e63946", fontSize: "13px", marginBottom: "1rem", textAlign: "center" },
  link: { textAlign: "center", color: "#aaa", marginTop: "1rem", fontSize: "14px" },
}