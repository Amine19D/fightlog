import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = "http://localhost:8000"

export default function Programmes() {
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    titre: "", description: "", duree_semaines: "", niveau: "", sport_id: ""
  })
  const [message, setMessage] = useState("")

  useEffect(() => { fetchProgrammes() }, [])

  const fetchProgrammes = async () => {
    try {
      const res = await axios.get(`${API_URL}/programmes/`)
      setProgrammes(res.data.programmes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/programmes/`, {
        ...form,
        duree_semaines: parseInt(form.duree_semaines),
        sport_id: form.sport_id ? parseInt(form.sport_id) : null
      })
      setMessage("Programme créé !")
      setShowForm(false)
      setForm({ titre: "", description: "", duree_semaines: "", niveau: "", sport_id: "" })
      fetchProgrammes()
    } catch (err) {
      setMessage("Erreur lors de la création")
    }
  }

  if (loading) return <div style={styles.loading}>Chargement...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Programmes</h1>
        <button style={styles.btnAdd} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "+ Créer un programme"}
        </button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Nouveau programme</h3>
          <div style={styles.formGrid}>
            {[
              { name: "titre", label: "Titre", placeholder: "Programme boxe débutant" },
              { name: "duree_semaines", label: "Durée (semaines)", placeholder: "8" },
              { name: "niveau", label: "Niveau", placeholder: "débutant / intermédiaire / avancé" },
              { name: "sport_id", label: "ID Sport (optionnel)", placeholder: "1" },
            ].map(f => (
              <div key={f.name} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                <input
                  style={styles.input}
                  value={form[f.name]}
                  onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  required={["titre", "duree_semaines"].includes(f.name)}
                />
              </div>
            ))}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, height: "80px", resize: "vertical" }}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description du programme..."
            />
          </div>
          <button style={styles.btnSubmit} type="submit">Créer</button>
        </form>
      )}

      <div style={styles.list}>
        {programmes.length === 0 ? (
          <p style={styles.empty}>Aucun programme disponible</p>
        ) : (
          programmes.map((p, i) => (
            <div key={p.programme_id || i} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.titre}>{p.titre || p.programme_titre}</h3>
                <span style={styles.badge}>{p.niveau || "tous niveaux"}</span>
              </div>
              <p style={styles.description}>{p.description || "Aucune description"}</p>
              <p style={styles.duree}>⏱ {p.duree_semaines} semaines</p>
              {p.sport_nom && <p style={styles.sport}>🥊 {p.sport_nom}</p>}
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
  list: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: {
    background: "#1a1a1a", border: "1px solid #333",
    borderRadius: "12px", padding: "1.5rem"
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" },
  titre: { color: "#fff", fontSize: "1.1rem" },
  badge: {
    background: "#e6394620", color: "#e63946",
    padding: "3px 12px", borderRadius: "20px", fontSize: "0.75rem"
  },
  description: { color: "#aaa", fontSize: "0.9rem", marginBottom: "0.5rem" },
  duree: { color: "#666", fontSize: "0.85rem" },
  sport: { color: "#e63946", fontSize: "0.85rem", marginTop: "0.3rem" },
  empty: { color: "#666" },
}