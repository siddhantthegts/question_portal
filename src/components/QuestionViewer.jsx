"use client"

import "./QuestionViewer.css"
import { useState } from "react"

function QuestionViewer({ question }) {
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false)
  const [solutionModalOpen, setSolutionModalOpen] = useState(false)

  const getStatusBadge = (status) => {
    const badges = {
      correct: { label: "Correct", className: "badge-correct" },
      incorrect: { label: "Incorrect", className: "badge-incorrect" },
      unanswered: { label: "Unanswered", className: "badge-unanswered" },
    }
    return badges[status] || badges.unanswered
  }

  const statusBadge = getStatusBadge(question.status)

  return (
    <div className="question-viewer-full">
      {/* Question Header */}
      <div className="question-header">
        <div className="question-title-section">
          <h2 className="question-title">Question {question.number}</h2>
          <span className={`status-badge ${statusBadge.className}`}>{statusBadge.label}</span>
        </div>
        <div className="question-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Difficulty</span>
            <span className="metadata-value">{question.difficulty}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Time Taken</span>
            <span className="metadata-value">{question.timeTaken}s</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Accuracy</span>
            <span className="metadata-value">{question.accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Passage (if exists) */}
      {question.passage && (
        <div className="question-passage">
          <p>{question.passage}</p>
        </div>
      )}

      {/* Main Question */}
      <div className="question-main">
        <p className="question-text">{question.question}</p>
      </div>

      {/* Options */}
      <div className="question-options">
        {question.options.map((option, idx) => {
          const optionLetter = String.fromCharCode(65 + idx) // A, B, C, D, E
          const isUserAnswer = optionLetter === question.userAnswer
          const isCorrect = optionLetter === question.correctAnswer
          const isIncorrect = isUserAnswer && question.userAnswer !== question.correctAnswer

          return (
            <div
              key={idx}
              className={`option-item ${isCorrect ? "correct" : ""} ${isIncorrect ? "incorrect" : ""} ${isUserAnswer && isCorrect ? "selected-correct" : ""}`}
            >
              <div className="option-indicator">
                <span className="option-letter">{optionLetter}</span>
                {isUserAnswer && <span className="user-indicator">✓</span>}
              </div>
              <div className="option-content">
                <p className="option-text">{option}</p>
              </div>
              {isCorrect && <span className="correct-label">Correct Answer</span>}
              {isIncorrect && <span className="incorrect-label">Your Answer</span>}
            </div>
          )
        })}
      </div>

      {/* Answer Summary */}
      <div className="answer-summary">
        <div className="summary-item">
          <span className="summary-label">Your Answer:</span>
          <span className="summary-value">{question.userAnswer || "Not Answered"}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Correct Answer:</span>
          <span className="summary-value correct">{question.correctAnswer}</span>
        </div>
      </div>

      <div className="question-actions">
        <button className="action-btn analyze-btn" onClick={() => setAnalyzeModalOpen(true)}>
          <span className="btn-icon">📊</span>
          Analyze Question
        </button>
        <button className="action-btn solution-btn" onClick={() => setSolutionModalOpen(true)}>
          <span className="btn-icon">💡</span>
          Show Solution
        </button>
      </div>

      {analyzeModalOpen && (
        <div className="modal-backdrop" onClick={() => setAnalyzeModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Question Analysis</h3>
              <button className="modal-close" onClick={() => setAnalyzeModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="analysis-section">
                <h4>Performance Metrics</h4>
                <div className="metrics-grid">
                  <div className="metric">
                    <span className="metric-label">Students Attempted</span>
                    <span className="metric-value">85%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Correct Percentage</span>
                    <span className="metric-value correct">{question.accuracy}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Incorrect Percentage</span>
                    <span className="metric-value incorrect">{100 - question.accuracy}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Avg Time (sec)</span>
                    <span className="metric-value">{question.timeTaken + 2}s</span>
                  </div>
                </div>
              </div>
              <div className="analysis-section">
                <h4>Question Insights</h4>
                <ul className="insights-list">
                  <li>This question tests your understanding of {question.sectionName}</li>
                  <li>
                    Difficulty level: <strong>{question.difficulty}</strong>
                  </li>
                  <li>Average time to solve: {question.timeTaken + 2} seconds</li>
                  <li>Common mistake: Students often choose option B due to misunderstanding</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {solutionModalOpen && (
        <div className="modal-backdrop" onClick={() => setSolutionModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Solution & Explanation</h3>
              <button className="modal-close" onClick={() => setSolutionModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="solution-section">
                <h4>Step-by-Step Solution</h4>
                <div className="steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <strong>Read and Understand:</strong> Carefully read the passage or question to identify key
                      information.
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <strong>Analyze:</strong> Break down the question into smaller parts and identify what's being
                      asked.
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <strong>Eliminate:</strong> Cross out obviously wrong options to narrow down choices.
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <strong>Verify:</strong> Check the correct answer against the passage or logic to confirm.
                    </div>
                  </div>
                </div>
              </div>
              <div className="solution-section">
                <h4>Correct Answer</h4>
                <div className="correct-answer-box">
                  <p>
                    <strong>Answer: {question.correctAnswer}</strong>
                  </p>
                  <p className="explanation">
                    This is the correct answer because it directly aligns with the main theme and purpose of the
                    passage/question. The other options are distractors that may seem relevant but don't fully address
                    the core concept being tested.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionViewer
