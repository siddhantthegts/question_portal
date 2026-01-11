"use client"

import "./QuestionViewer.css"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useUpdateStudentQuestionResponseMutation, useGetStudentQuestionResponsesQuery } from "../store/analyticsApi"

function QuestionViewer({ question }) {
  const location = useLocation()
  const token = location.state?.token || null
  const examId = location.state?.examId || null
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false)
  const [solutionModalOpen, setSolutionModalOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState(question.userReason || 'none')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateStudentQuestionResponse] = useUpdateStudentQuestionResponseMutation()
  
  // Fetch question response data when analyze modal opens
  const {
    data: questionResponseData,
    isLoading: isLoadingQuestionResponse,
    error: questionResponseError,
  } = useGetStudentQuestionResponsesQuery(
    {
      params: {
        questionId: question.questionId,
        examId: examId,
        limit: 1,
      },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    { skip: !analyzeModalOpen || !question?.questionId || !examId || !token }
  )
  
  // Extract the question response (first result if available)
  const questionResponse = questionResponseData?.data?.[0] || null
  
  console.log('Question Response Data:', {
    questionResponseData,
    questionResponse,
    isLoadingQuestionResponse,
    questionResponseError,
  })

  // Helper function to render HTML content (for math and formatting)
  const renderHTML = (html) => {
    if (!html) return null;
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Extract passage text - handle both object and string formats
  const getPassageContent = () => {
    if (!question.passage) return null;
    if (typeof question.passage === 'string') {
      return question.passage;
    }
    if (typeof question.passage === 'object') {
      return question.passage.passage || question.passage.text || null;
    }
    return null;
  };

  const getPassageTitle = () => {
    if (!question.passage || typeof question.passage !== 'object') return null;
    return question.passage.title || null;
  };

  const getStatusBadge = (status) => {
    const badges = {
      correct: { label: "Correct", className: "badge-correct" },
      incorrect: { label: "Incorrect", className: "badge-incorrect" },
      unanswered: { label: "Unanswered", className: "badge-unanswered" },
    }
    return badges[status] || badges.unanswered
  }

  const statusBadge = getStatusBadge(question.status)
  const passageContent = getPassageContent()
  const passageTitle = getPassageTitle()
  const isIncorrect = question.status === 'incorrect'
  const hasExplanation = question.explanation && question.explanation.trim() !== ''

  // Handle reason selection and submission
  const handleReasonChange = async (reason) => {
    setSelectedReason(reason)
    
    // Only submit if we have a StudentQuestionResponse ID and token
    if (question.responseId && token) {
      setIsSubmitting(true)
      try {
        await updateStudentQuestionResponse({
          id: question.responseId,
          data: { userReason: reason },
          headers: { Authorization: `Bearer ${token}` }
        }).unwrap()
        // Update question object with new reason (optimistic update)
        question.userReason = reason
      } catch (error) {
        console.error('Failed to update user reason:', error)
        // Revert selection on error
        setSelectedReason(question.userReason || 'none')
        alert('Failed to save your feedback. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    } else if (!question.responseId) {
      // If no responseId, show a message that feedback cannot be saved
      console.warn('StudentQuestionResponse ID not found. Cannot save feedback.')
      // Still allow selection for UI purposes, but don't save
    }
  }

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
      {passageContent && (
        <div className="question-passage">
          {passageTitle && <h4>{renderHTML(passageTitle)}</h4>}
          {renderHTML(passageContent)}
        </div>
      )}

      {/* Main Question */}
      <div className="question-main">
        <div className="question-text">{renderHTML(question.question)}</div>
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
                <div className="option-text">{renderHTML(option)}</div>
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
                    <span className="metric-label">Your Time (sec)</span>
                    <span className="metric-value">
                      {isLoadingQuestionResponse ? (
                        'Loading...'
                      ) : questionResponse?.timeTaken ? (
                        `${questionResponse.timeTaken}s`
                      ) : (
                        `${question.timeTaken || 0}s`
                      )}
                    </span>
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
                  <li>
                    Time taken to solve: <strong>
                      {isLoadingQuestionResponse ? (
                        'Loading...'
                      ) : questionResponse?.timeTaken ? (
                        `${questionResponse.timeTaken} seconds`
                      ) : (
                        `${question.timeTaken || 0} seconds`
                      )}
                    </strong>
                  </li>
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
                  {hasExplanation ? (
                    <div className="explanation">
                      <h5>Explanation:</h5>
                      {renderHTML(question.explanation)}
                    </div>
                  ) : (
                    <p className="explanation">
                      This is the correct answer because it directly aligns with the main theme and purpose of the
                      passage/question. The other options are distractors that may seem relevant but don't fully address
                      the core concept being tested.
                    </p>
                  )}
                </div>
              </div>

              {/* Feedback Section for Incorrect Answers */}
              {isIncorrect && (
                <div className="solution-section">
                  <h4>Why did you miss this question?</h4>
                  <p className="feedback-description">Help us understand why you got this question wrong. This feedback helps improve our question analysis.</p>
                  <div className="reason-selection">
                    <label className={`reason-option ${selectedReason === 'misread' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="userReason"
                        value="misread"
                        checked={selectedReason === 'misread'}
                        onChange={(e) => handleReasonChange(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <span>Misread the question</span>
                    </label>
                    <label className={`reason-option ${selectedReason === 'misjudged' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="userReason"
                        value="misjudged"
                        checked={selectedReason === 'misjudged'}
                        onChange={(e) => handleReasonChange(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <span>Misjudged the answer</span>
                    </label>
                    <label className={`reason-option ${selectedReason === 'guess' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="userReason"
                        value="guess"
                        checked={selectedReason === 'guess'}
                        onChange={(e) => handleReasonChange(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <span>Guessed the answer</span>
                    </label>
                    <label className={`reason-option ${selectedReason === 'none' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="userReason"
                        value="none"
                        checked={selectedReason === 'none'}
                        onChange={(e) => handleReasonChange(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <span>Other / Not sure</span>
                    </label>
                  </div>
                  {isSubmitting && <p className="submitting-indicator">Saving...</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionViewer
