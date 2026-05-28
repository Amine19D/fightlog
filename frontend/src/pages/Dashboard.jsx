import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API_URL = "http://localhost:8000"

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState([])
  const [seances, setSeances] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, seancesRes] = await Promise.all([
        axios.get(`${API_URL}/users/${user.id}/stats`),
        axios.get(`${API_URL}/seances/?limit=5`)
      ])
      setStats(statsRes.data.stats_entrainement)
      setSeances(seancesRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={styles.loading}>Chargement...</div>

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bonjour, {user?.prenom} 👊</h1>

      <div style={styles.statsGrid}>
        {stats.length === 0 ? (
          <div style={styles.emptyCard}>Aucune séance enregistrée</div>
        ) : (
          stats.map((s, i) => (
            <div key={i} style={styles.statCard}>
              <h3 style={styles.sport}>{s._id || "Sport"}</h3>
              <p style={styles.statNum}>{s.total_seances}</p>
              <p style={styles.statLabel}>séances</p>
              <p style={styles.statSub}>{s.duree_totale} min total</p>
              <p style={styles.statSub}>Ressenti moyen : {s.ressenti_moyen?.toFixed(1)}/5</p>
            </div>
          ))
        )}
      </div>

      <h2 style={styles.subtitle}>Dernières séances</h2>
      <div style={styles.seancesList}>
        {seances.length === 0 ? (
          <p style={styles.empty}>Aucune séance pour l'instant</p>
        ) : (
          seances.map((s) => (
            <div key={s._id} style={styles.seanceCard}>
              <div style={styles.seanceHeader}>
                <span style={styles.sport}>{s.sport}</span>
                <span style={styles.duree}>{s.duree_minutes} min</span>
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
  title: { fontSize: "1.8rem", marginBottom: "1.5rem", color: "#fff" },
  subtitle: { fontSize: "1.3rem", margin: "2rem 0 1rem", color: "#ddd" },
  loading: { color: "#fff", textAlign: "center", padding: "4rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" },
  statCard: {
    background: "#1a1a1a", border: "1px solid #333", borderRadius: "12px",
    padding: "1.5rem", textAlign: "center"
  },
  emptyCard: { color: "#666", padding: "1rem" },
  sport: { color: "#e63946", fontWeight: 600, fontSize: "1rem", textTransform: "capitalize" },
  statNum: { fontSize: "2.5rem", fontWeight: 700, color: "#fff", margin: "0.5rem 0" },
  statLabel: { color: "#aaa", fontSize: "0.9rem" },
  statSub: { color: "#666", fontSize: "0.8rem", marginTop: "0.3rem" },
  seancesList: { display: "flex", flexDirection: "column", gap: "1rem" },
  seanceCard: {
    background: "#1a1a1a", border: "1px solid #333", borderRadius: "12px", padding: "1.2rem"
  },
  seanceHeader: { display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" },
  duree: { color: "#aaa", fontSize: "0.9rem" },
  notes: { color: "#ccc", fontSize: "0.9rem", margin: "0.5rem 0" },
  tags: { display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.5rem 0" },
  tag: {
    background: "#e6394620", color: "#e63946", padding: "2px 10px",
    borderRadius: "20px", fontSize: "0.75rem"
  },
  ressenti: { fontSize: "0.9rem", marginTop: "0.3rem" },
  empty: { color: "#666" },
}