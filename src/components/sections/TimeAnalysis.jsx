import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import "../sections.css"

export default function TimeAnalysis() {
  const timeAnalysisData = [
    { no: 1, question: "The thematic highlight of the passage is to:", time: 4, percent: 52.7 },
    { no: 2, question: "Which of the following cannot be inferred from the passage?", time: 25, percent: 55.35 },
    { no: 3, question: "Which of the following is true according to the passage?", time: 2, percent: 28.1 },
    {
      no: 4,
      question: "Which statement from the passage best illustrates the idea that energy-efficient...",
      time: 1,
      percent: 46.83,
    },
    {
      no: 5,
      question: "According to Aristotle's view on virtue, which of the following best captures...",
      time: 1,
      percent: 56.59,
    },
    {
      no: 6,
      question: "According to Aristotle's view on virtue, which of the following statements best describes...",
      time: 1,
      percent: 46.43,
    },
    { no: 7, question: "For what purpose does Aristotle use the analogy of a sharp knife...", time: 1, percent: 81.47 },
  ]

  const times = timeAnalysisData.map((d) => d.time)
  const avgTime = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)
  const maxTime = Math.max(...times)
  const minTime = Math.min(...times)

  // Section time metrics (mock data)
  const sectionTimeData = [
    { section: "Verbal", totalTime: 120, avgPerQ: 17.1 },
    { section: "Data Interpretation", totalTime: 95, avgPerQ: 8.6 },
    { section: "Quantitative", totalTime: 85, avgPerQ: 10.6 },
  ]

  // Time distribution chart data
  const timeDistribution = [
    { range: "0-5s", count: 12 },
    { range: "5-10s", count: 8 },
    { range: "10-20s", count: 6 },
    { range: "20-30s", count: 3 },
    { range: "30+s", count: 1 },
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
                  <td className="question">{row.question}</td>
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
