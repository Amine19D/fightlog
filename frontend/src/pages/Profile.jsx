import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API_URL = "http://localhost:8000"

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    poids_kg: user?.poids_kg || ""
  })
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API_URL}/users/me`, form)
      setSuccess("Profil mis à jour !")
      setError("")
    } catch {
      setError("Erreur lors de la mise à jour")
      setSuccess("")
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mon profil</h1>
      <div style={styles.card}>
        <div style={styles.avatar}>
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        <p style={styles.email}>{user?.email}</p>
        <p style={styles.role}>{user?.role}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {success && <p style={styles.success}>{success}</p>}
          {error && <p style={styles.error}>{error}</p>}
          {[
            { name: "prenom", label: "Prénom" },
            { name: "nom", label: "Nom" },
            { name: "poids_kg", label: "Poids (kg)" },
          ].map(f => (
            <div key={f.name} style={styles.field}>
              <label style={styles.label}>{f.label}</label>
              <input
                style={styles.input}
                value={form[f.name]}
                onChange={e => setForm({ ...form, [f.name]: e.target.value })}
              />
            </div>
          ))}
          <button style={styles.button} type="submit">Mettre à jour</button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: "2rem", maxWidth: "500px", margin: "0 auto", color: "#fff" },
  title: { fontSize: "1.8rem", marginBottom: "1.5rem" },
  card: {
    background: "#1a1a1a", border: "1px solid #333",
    borderRadius: "12px", padding: "2rem", textAlign: "center"
  },
  avatar: {
    width: "80px", height: "80px", borderRadius: "50%",
    background: "#e63946", color: "#fff", fontSize: "1.8rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 1rem", fontWeight: 700
  },
  email: { color: "#aaa", fontSize: "14px", marginBottom: "0.3rem" },
  role: { color: "#e63946", fontSize: "13px", marginBottom: "1.5rem", textTransform: "capitalize" },
  form: { textAlign: "left" },
  field: { marginBottom: "1rem" },
  label: { display: "block", color: "#aaa", marginBottom: "0.4rem", fontSize: "13px" },
  input: {
    width: "100%", padding: "0.7rem", borderRadius: "8px",
    border: "1px solid #444", background: "#111", color: "#fff",
    fontSize: "14px", boxSizing: "border-box"
  },
  button: {
    width: "100%", padding: "0.8rem", background: "#e63946",
    color: "#fff", border: "none", borderRadius: "8px",
    fontSize: "15px", cursor: "pointer", marginTop: "0.5rem"
  },
  success: { color: "#4caf50", textAlign: "center", marginBottom: "1rem", fontSize: "13px" },
  error: { color: "#e63946", textAlign: "center", marginBottom: "1rem", fontSize: "13px" },
}