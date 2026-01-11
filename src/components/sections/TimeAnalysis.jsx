import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import "../sections.css"

export default function TimeAnalysis({ data = [] }) {
  // Helper function to render HTML content (for math and formatting)
  const renderHTML = (html) => {
    if (!html) return null;
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };
  // Use real data if provided, otherwise show empty state
  const timeAnalysisData = data.length > 0 ? data : []

  const times = timeAnalysisData.map((d) => d.time).filter((t) => t > 0)
  const avgTime = times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) : 0
  const maxTime = times.length > 0 ? Math.max(...times) : 0
  const minTime = times.length > 0 ? Math.min(...times) : 0

  // Group by section (if section info is available in data)
  // For now, we'll calculate section time from the data
  const sectionTimeMap = {}
  timeAnalysisData.forEach((item) => {
    // Assuming we can group by some section identifier
    // This would need to be enhanced based on actual data structure
    const section = item.section || "Overall"
    if (!sectionTimeMap[section]) {
      sectionTimeMap[section] = { totalTime: 0, count: 0 }
    }
    sectionTimeMap[section].totalTime += item.time || 0
    sectionTimeMap[section].count += 1
  })

  const sectionTimeData = Object.keys(sectionTimeMap).map((section) => ({
    section,
    totalTime: sectionTimeMap[section].totalTime,
    avgPerQ: sectionTimeMap[section].count > 0
      ? (sectionTimeMap[section].totalTime / sectionTimeMap[section].count).toFixed(1)
      : 0,
  }))

  // Time distribution chart data
  const timeDistribution = [
    { range: "0-5s", count: times.filter((t) => t >= 0 && t < 5).length },
    { range: "5-10s", count: times.filter((t) => t >= 5 && t < 10).length },
    { range: "10-20s", count: times.filter((t) => t >= 10 && t < 20).length },
    { range: "20-30s", count: times.filter((t) => t >= 20 && t < 30).length },
    { range: "30+s", count: times.filter((t) => t >= 30).length },
  ]

  return (
    <div className="time-analysis">
      <h2>Time Analysis & Metrics</h2>

      <div className="metrics-summary">
        <div className="metric-card">
          <div className="metric-value">{avgTime}s</div>
          <div className="metric-label">Average Time Per Question</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{maxTime}s</div>
          <div className="metric-label">Longest Time Taken</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{minTime}s</div>
          <div className="metric-label">Shortest Time Taken</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{(sectionTimeData.reduce((a, b) => a + b.totalTime, 0) / 60).toFixed(1)}m</div>
          <div className="metric-label">Total Exam Time</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Time by Section</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sectionTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="section" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="totalTime" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Time Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="range" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <h3>Question-wise Time Details</h3>
        <div className="time-table-container">
          <table className="time-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Question</th>
                <th>Time Taken (s)</th>
                <th>% Students Correct</th>
              </tr>
            </thead>
            <tbody>
              {timeAnalysisData.map((row, idx) => (
                <tr key={idx}>
                  <td className="number">{row.no}</td>
                  <td className="question" title={row.question?.replace(/<[^>]*>/g, '') || ''}>
                    {renderHTML(row.question)}
                  </td>
                  <td className="time">{row.time}s</td>
                  <td className="percent">{row.percent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
