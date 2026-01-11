import React from "react"
import "../sections.css"

export default function DifficultyAnalysis({ data = [] }) {
  // Use real data if provided, otherwise show empty state
  const difficultyData = data.length > 0 ? data : []

  const renderQuestionTags = (questions, color) => {
    if (!questions || questions.length === 0) return null
    return questions.map((q, idx) => (
      <span key={idx} className={`question-tag ${color}`}>
        {q}
      </span>
    ))
  }

  return (
    <div className="difficulty-analysis">
      <h2>Difficulty Analysis</h2>

      <div className="difficulty-table-container">
        <table className="difficulty-table">
          <thead>
            <tr>
              <th colSpan="5" className="difficulty-header">
                <span className="ve">Very Easy (VE)</span>
                <span className="e">Easy (E)</span>
                <span className="m">Medium (M)</span>
                <span className="d">Difficult (D)</span>
                <span className="vd">Very Difficulty (VD)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {difficultyData.map((data, idx) => (
              <React.Fragment key={idx}>
                <tr className="section-row">
                  <td colSpan="5">{data.section}</td>
                </tr>
                <tr className="questions-row">
                  <td className="ve">{renderQuestionTags(data.veryEasy, "ve")}</td>
                  <td className="e">{renderQuestionTags(data.easy, "e")}</td>
                  <td className="m">{renderQuestionTags(data.medium, "m")}</td>
                  <td className="d">{renderQuestionTags(data.difficult, "d")}</td>
                  <td className="vd">{renderQuestionTags(data.veryDifficult, "vd")}</td>
                </tr>
                <tr className="totals-row">
                  <td>{data.totals.veryEasy}</td>
                  <td>{data.totals.easy}</td>
                  <td>{data.totals.medium}</td>
                  <td>{data.totals.difficult}</td>
                  <td>{data.totals.veryDifficult}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
