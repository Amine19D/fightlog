import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = "http://localhost:8000"

export default function Clubs() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: "", adresse: "", ville: "", telephone: "" })
  const [message, setMessage] = useState("")

  useEffect(() => { fetchClubs() }, [])

  const fetchClubs = async () => {
    try {
      const res = await axios.get(`${API_URL}/clubs/`)
      setClubs(res.data.clubs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/clubs/`, form)
      setMessage("Club créé avec succès !")
      setShowForm(false)
      setForm({ nom: "", adresse: "", ville: "", telephone: "" })
      fetchClubs()
    } catch (err) {
      setMessage("Erreur lors de la création")
    }
  }

  const handleRejoindre = async (clubId) => {
    try {
      await axios.post(`${API_URL}/clubs/${clubId}/rejoindre`)
      setMessage("Vous avez rejoint le club !")
      fetchClubs()
    } catch (err) {
      setMessage("Erreur ou déjà membre")
    }
  }

  if (loading) return <div style={styles.loading}>Chargement...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Clubs</h1>
        <button style={styles.btnAdd} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "+ Créer un club"}
        </button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Nouveau club</h3>
          <div style={styles.formGrid}>
            {[
              { name: "nom", label: "Nom du club", placeholder: "Fight Club Paris" },
              { name: "adresse", label: "Adresse", placeholder: "12 rue des arts" },
              { name: "ville", label: "Ville", placeholder: "Paris" },
              { name: "telephone", label: "Téléphone", placeholder: "01 23 45 67 89" },
            ].map(f => (
              <div key={f.name} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                <input
                  style={styles.input}
                  value={form[f.name]}
                  onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  required
                />
              </div>
            ))}
          </div>
          <button style={styles.btnSubmit} type="submit">Créer</button>
        </form>
      )}

      <div style={styles.grid}>
        {clubs.length === 0 ? (
          <p style={styles.empty}>Aucun club disponible</p>
        ) : (
          clubs.map(club => (
            <div key={club.id} style={styles.card}>
              <h3 style={styles.clubNom}>{club.nom}</h3>
              <p style={styles.info}>📍 {club.adresse}, {club.ville}</p>
              <p style={styles.info}>📞 {club.telephone}</p>
              <button
                style={styles.btnRejoindre}
                onClick={() => handleRejoindre(club.id)}
              >
                Rejoindre
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: "2rem", maxWidth: "900px", margin: "0 auto", color: "#fff" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title: { fontSize: "1.8rem", color: "#fff" },
  loading: { color: "#fff", textAlign: "center", padding: "4rem" },
  btnAdd: {
    background: "#e63946", color: "#fff", border: "none",
    padding: "0.6rem 1.2rem", borderRadius: "8px", cursor: "pointer", fontSize: "14px"
  },
  form: {
    background: "#1a1a1a", border: "1px solid #333",
    borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem"
  },
  formTitle: { color: "#fff", marginBottom: "1rem" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  field: { marginBottom: "1rem" },
  label: { display: "block", color: "#aaa", marginBottom: "0.4rem", fontSize: "13px" },
  input: {
    width: "100%", padding: "0.7rem", borderRadius: "8px",
    border: "1px solid #444", background: "#111", color: "#fff",
    fontSize: "14px", boxSizing: "border-box"
  },
  btnSubmit: {
    background: "#e63946", color: "#fff", border: "none",
    padding: "0.7rem 2rem", borderRadius: "8px", cursor: "pointer"
  },
  message: { color: "#4caf50", marginBottom: "1rem", fontSize: "14px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" },
  card: {
    background: "#1a1a1a", border: "1px solid #333",
    borderRadius: "12px", padding: "1.5rem"
  },
  clubNom: { color: "#e63946", fontSize: "1.1rem", marginBottom: "0.8rem" },
  info: { color: "#aaa", fontSize: "0.9rem", marginBottom: "0.4rem" },
  btnRejoindre: {
    background: "transparent", border: "1px solid #e63946",
    color: "#e63946", padding: "0.5rem 1rem", borderRadius: "6px",
    cursor: "pointer", marginTop: "0.8rem", fontSize: "13px"
  },
  empty: { color: "#666" },
}