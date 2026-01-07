import React from "react"
import "../sections.css"

export default function DifficultyAnalysis() {
  const difficultyData = [
    {
      section: "Verbal Ability and Reading Comprehension",
      veryEasy: [7],
      easy: [],
      medium: [2, 4, 5, 13, 14, 15, 16, 19, 21, 22, 23],
      difficult: [3, 11, 17, 18],
      veryDifficult: [9, 10, 12, 20, 24],
      totals: { veryEasy: 1, easy: 1, medium: 13, difficult: 5, veryDifficult: 5 },
    },
    {
      section: "Data Interpretation & Logical Reasoning",
      veryEasy: [1, 19],
      easy: [],
      medium: [20, 21, 22],
      difficult: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      veryDifficult: [11, 12, 13, 14, 15, 16, 17, 18],
      totals: { veryEasy: 0, easy: 0, medium: 5, difficult: 10, veryDifficult: 7 },
    },
    {
      section: "Quantitative Aptitude",
      veryEasy: [],
      easy: [],
      medium: [2, 5, 9, 11, 13, 20, 21],
      difficult: [3, 6, 7, 10, 12, 14, 15],
      veryDifficult: [1, 4, 8, 16, 19, 22],
      totals: { veryEasy: 0, easy: 0, medium: 6, difficult: 10, veryDifficult: 7 },
    },
  ]

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
