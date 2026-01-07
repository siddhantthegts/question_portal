import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import "../sections.css"

function SectionWiseAnalysis() {
  const analysisData = [
    {
      section: "Verbal Ability and Reading Comprehension",
      correct: 2,
      incorrect: 12,
      unanswered: 10,
      accuracy: 14,
    },
    {
      section: "Data Interpretation & Logical Reasoning",
      correct: 9,
      incorrect: 13,
      unanswered: 0,
      accuracy: 40,
    },
    {
      section: "Quantitative Aptitude",
      correct: 1,
      incorrect: 21,
      unanswered: 0,
      accuracy: 4,
    },
  ]

  const tableData = [
    {
      section: "OVERALL",
      marks: -1.0,
      totalQs: 68,
      attempts: 58,
      correct: 12,
      incorrect: 46,
      unanswered: 10,
      accuracy: "20%",
      percentile: 2.09,
    },
    {
      section: "Verbal Ability and Reading Comprehension",
      marks: -5.0,
      totalQs: 24,
      attempts: 14,
      correct: 2,
      incorrect: 12,
      unanswered: 10,
      accuracy: "14%",
      percentile: 0.74,
    },
    {
      section: "Data Interpretation & Logical Reasoning",
      marks: 16.0,
      totalQs: 22,
      attempts: 22,
      correct: 9,
      incorrect: 13,
      unanswered: 0,
      accuracy: "40%",
      percentile: 76.41,
    },
    {
      section: "Quantitative Aptitude",
      marks: -12.0,
      totalQs: 22,
      attempts: 22,
      correct: 1,
      incorrect: 21,
      unanswered: 0,
      accuracy: "4%",
      percentile: 0,
    },
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
