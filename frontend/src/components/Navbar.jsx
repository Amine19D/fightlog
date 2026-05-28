import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.logo}>🥊 FightLog</Link>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/seances" style={styles.link}>Séances</Link>
        <Link to="/profile" style={styles.link}>Profil</Link>
        <span style={styles.user}>{user?.prenom}</span>
        <button onClick={handleLogout} style={styles.logout}>Déconnexion</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    background: "#1a1a1a",
    borderBottom: "1px solid #333",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: { color: "#e63946", fontSize: "1.3rem", fontWeight: 700, textDecoration: "none" },
  links: { display: "flex", alignItems: "center", gap: "1.5rem" },
  link: { color: "#ccc", textDecoration: "none", fontSize: "14px" },
  user: { color: "#aaa", fontSize: "14px" },
  logout: {
    background: "transparent",
    border: "1px solid #e63946",
    color: "#e63946",
    padding: "0.4rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
}