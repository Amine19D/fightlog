import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = "http://localhost:8000"

export default function Seances() {
  const [seances, setSeances] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({
    sport: "", duree_minutes: "", ressenti: "", notes: "", tags: ""
  })

  useEffect(() => { fetchSeances() }, [])

  const fetchSeances = async () => {
    try {
      const res = await axios.get(`${API_URL}/seances/`)
      setSeances(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const q = e.target.value
    setSearch(q)
    if (q.length > 2) {
      const res = await axios.get(`${API_URL}/seances/search?q=${q}`)
      setSeances(res.data.data)
    } else if (q.length === 0) {
      fetchSeances()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/seances/`, {
        ...form,
        duree_minutes: parseInt(form.duree_minutes),
        ressenti: parseInt(form.ressenti),
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean)
      })
      setShowForm(false)
      setForm({ sport: "", duree_minutes: "", ressenti: "", notes: "", tags: "" })
      fetchSeances()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette séance ?")) return
    await axios.delete(`${API_URL}/seances/${id}`)
    fetchSeances()
  }

  if (loading) return <div style={styles.loading}>Chargement...</div>

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mes séances</h1>
        <button style={styles.btnAdd} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "+ Nouvelle séance"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Nouvelle séance</h3>
          <div style={styles.formGrid}>
            {[
              { name: "sport", label: "Sport", placeholder: "boxe, judo, mma..." },
              { name: "duree_minutes", label: "Durée (min)", placeholder: "75" },
              { name: "ressenti", label: "Ressenti (1-5)", placeholder: "4" },
              { name: "tags", label: "Tags (séparés par virgule)", placeholder: "sparring, technique" },
            ].map(f => (
              <div key={f.name} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                <input
                  style={styles.input}
                  value={form[f.name]}
                  onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  required={["sport", "duree_minutes", "ressenti"].includes(f.name)}
                />
              </div>
            ))}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Notes</label>
            <textarea
              style={{ ...styles.input, height: "80px", resize: "vertical" }}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes sur la séance..."
            />
          </div>
          <button style={styles.btnSubmit} type="submit">Enregistrer</button>
        </form>
      )}

      <input
        style={styles.search}
        value={search}
        onChange={handleSearch}
        placeholder="Rechercher dans les séances..."
      />

      <div style={styles.list}>
        {seances.length === 0 ? (
          <p style={styles.empty}>Aucune séance trouvée</p>
        ) : (
          seances.map(s => (
            <div key={s._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.sport}>{s.sport}</span>
                <span style={styles.duree}>{s.duree_minutes} min</span>
                <button onClick={() => handleDelete(s._id)} style={styles.btnDelete}>✕</button>
              </div>
              <p style={styles.notes}>{s.notes}</p>
              <div style={styles.tags}>
                {(s.tags || []).map((t, i) => (
                  <span key={i} style={styles.tag}>{t}</span>
                ))}
              </div>
              <p style={styles.ressenti}>{"⭐".repeat(s.ressenti || 0)}</p>
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
    background: "#1a1a1a", border: "1px solid #333", borderRadius: "12px",
    padding: "1.5rem", marginBottom: "1.5rem"
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
  search: {
    width: "100%", padding: "0.8rem", borderRadius: "8px",
    border: "1px solid #444", background: "#1a1a1a", color: "#fff",
    fontSize: "14px", marginBottom: "1.5rem", boxSizing: "border-box"
  },
  list: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: {
    background: "#1a1a1a", border: "1px solid #333",
    borderRadius: "12px", padding: "1.2rem"
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" },
  sport: { color: "#e63946", fontWeight: 600, textTransform: "capitalize" },
  duree: { color: "#aaa", fontSize: "0.9rem" },
  btnDelete: {
    background: "transparent", border: "none", color: "#666",
    cursor: "pointer", fontSize: "16px"
  },
  notes: { color: "#ccc", fontSize: "0.9rem", margin: "0.5rem 0" },
  tags: { display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.5rem 0" },
  tag: {
    background: "#e6394620", color: "#e63946",
    padding: "2px 10px", borderRadius: "20px", fontSize: "0.75rem"
  },
  ressenti: { fontSize: "0.9rem", marginTop: "0.3rem" },
  empty: { color: "#666" },
}