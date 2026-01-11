import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import "../sections.css"

function SectionWiseAnalysis({ data }) {
  // Use real data if provided, otherwise show empty state
  const analysisData = data?.sections || []
  const overall = data?.overall || {
    marks: 0,
    totalQuestions: 0,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    accuracy: 0,
  }

  // Build table data with overall row
  const tableData = [
    {
      section: "OVERALL",
      marks: overall.marks || 0,
      totalQs: overall.totalQuestions || 0,
      attempts: overall.attempts || 0,
      correct: overall.correct || 0,
      incorrect: overall.incorrect || 0,
      unanswered: overall.unanswered || 0,
      accuracy: `${overall.accuracy || 0}%`,
      percentile: 0, // Percentile would need to be calculated from all students' data
    },
    ...analysisData.map((section) => ({
      section: section.section,
      marks: section.marks || 0,
      totalQs: section.totalQuestions || 0,
      attempts: section.attempts || 0,
      correct: section.correct || 0,
      incorrect: section.incorrect || 0,
      unanswered: section.unanswered || 0,
      accuracy: `${section.accuracy || 0}%`,
      percentile: 0, // Percentile would need to be calculated from all students' data
    })),
  ]

  return (
    <div className="section-wise-analysis">
      <h2>Section Wise Analysis</h2>

      <div className="charts-grid">
        {analysisData.map((data, idx) => (
          <div key={idx} className="chart-card">
            <h3>{data.section}</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[{ name: "Status", ...data }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Bar dataKey="correct" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="incorrect" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="unanswered" fill="#64748b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="accuracy-display">
              <span className="accuracy-label">Accuracy</span>
              <span className="accuracy-value">{data.accuracy}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <h3>Detailed Performance Metrics</h3>
        <div className="table-container">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Marks</th>
                <th>Total Qs</th>
                <th>Attempts</th>
                <th>Correct</th>
                <th>Incorrect</th>
                <th>Unanswered</th>
                <th>Accuracy %</th>
                <th>Percentile</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx} className={row.section === "OVERALL" ? "overall-row" : ""}>
                  <td className="section-name">{row.section}</td>
                  <td className={row.marks < 0 ? "negative" : "positive"}>{row.marks.toFixed(2)}</td>
                  <td>{row.totalQs}</td>
                  <td>{row.attempts}</td>
                  <td className="correct">{row.correct}</td>
                  <td className="incorrect">{row.incorrect}</td>
                  <td className="unanswered">{row.unanswered}</td>
                  <td>{row.accuracy}</td>
                  <td className="percentile">{row.percentile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SectionWiseAnalysis
