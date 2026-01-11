"use client"

import { useState, useMemo } from "react"
import QuestionViewer from "../QuestionViewer"
import "../sections.css"

function AnswerSheet({ data = [], examStructure = null }) {
  // Transform real data into the format expected by the component
  // Note: data comes from exam-question-answer API and already includes question details
  const allSections = useMemo(() => {
    console.log('AnswerSheet received data:', {
      dataLength: data.length,
      dataSample: data.slice(0, 2),
      examStructureExists: !!examStructure,
    });
    
    if (!data.length) {
      console.warn('AnswerSheet: No data received');
      return []
    }

    // Group questions by section from exam-question-answer data
    const sectionsMap = {}
    
    data.forEach((item) => {
      const sectionId = item.section || item.sectionName.toLowerCase().replace(/\s+/g, "-")
      
      if (!sectionsMap[item.sectionId]) {
        sectionsMap[item.sectionId] = {
          id: sectionId,
          name: item.sectionName,
          questions: [],
        }
      }

      sectionsMap[item.sectionId].questions.push({
        id: item.questionId,
        number: item.number,
        section: sectionId,
        sectionName: item.sectionName,
        type: item.type || (item.options?.length > 0 ? "mcq" : "descriptive"),
        difficulty: item.difficulty || "medium",
        timeTaken: item.timeTaken || 0,
        accuracy: item.accuracy || 0,
        passage: item.passage || null,
        question: item.question || null,
        options: item.options || [],
        userAnswer: item.userAnswer,
        correctAnswer: item.correctAnswer,
        status: item.status,
        explanation: item.explanation || null,
        responseId: item.responseId || null,
        userReason: item.userReason || 'none',
      })
    })

    return Object.values(sectionsMap)
  }, [data])

  const [selectedSubject, setSelectedSubject] = useState("all")
  const firstQuestionId = allSections.length > 0 && allSections[0].questions.length > 0
    ? allSections[0].questions[0].id
    : null
  const [selectedQuestionId, setSelectedQuestionId] = useState(firstQuestionId)

  const filteredQuestions = useMemo(() => {
    if (selectedSubject === "all") {
      return allSections.flatMap((section) => section.questions)
    } else {
      const section = allSections.find((s) => s.id === selectedSubject)
      return section?.questions || []
    }
  }, [selectedSubject, allSections])

  const currentQuestion = filteredQuestions.find((q) => q.id === selectedQuestionId) || filteredQuestions[0]
  const currentQuestionIndex = filteredQuestions.findIndex((q) => q.id === selectedQuestionId)

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestionId(questionId)
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setSelectedQuestionId(filteredQuestions[currentQuestionIndex - 1].id)
    } else if (selectedSubject !== "all") {
      const currentIndex = allSections.findIndex((s) => s.id === selectedSubject)
      if (currentIndex > 0) {
        const prevSection = allSections[currentIndex - 1]
        setSelectedSubject(prevSection.id)
        setSelectedQuestionId(prevSection.questions[prevSection.questions.length - 1].id)
      }
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setSelectedQuestionId(filteredQuestions[currentQuestionIndex + 1].id)
    } else if (selectedSubject !== "all") {
      const currentIndex = allSections.findIndex((s) => s.id === selectedSubject)
      if (currentIndex < allSections.length - 1) {
        const nextSection = allSections[currentIndex + 1]
        setSelectedSubject(nextSection.id)
        setSelectedQuestionId(nextSection.questions[0].id)
      }
    }
  }

  return (
    <div className="answer-sheet-container">
      {/* Subject Filter */}
      {allSections.length > 0 && (
        <div className="subject-filter-bar">
          <div className="filter-buttons">
            {allSections.map((section) => (
              <button
                key={section.id}
                className={`filter-btn ${selectedSubject === section.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedSubject(section.id)
                  if (section.questions.length > 0) {
                    setSelectedQuestionId(section.questions[0].id)
                  }
                }}
              >
                {section.name}
              </button>
            ))}
            <button
              className={`filter-btn ${selectedSubject === "all" ? "active" : ""}`}
              onClick={() => {
                setSelectedSubject("all")
                if (filteredQuestions.length > 0) {
                  setSelectedQuestionId(filteredQuestions[0].id)
                }
              }}
            >
              ALL
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="answer-sheet-main">
        {/* Left: Question Grid */}
        <div className="question-grid-panel">
          <div className="question-grid-header">
            <h3>Questions ({filteredQuestions.length})</h3>
          </div>
          <div className="question-grid">
            {filteredQuestions.map((q) => (
              <button
                key={q.id}
                className={`question-grid-item status-${q.status} ${selectedQuestionId === q.id ? "selected" : ""}`}
                onClick={() => handleQuestionSelect(q.id)}
                title={`Q${q.number}: ${q.status}`}
              >
                {q.number}
              </button>
            ))}
          </div>
          <div className="question-grid-legend">
            <div className="legend-item">
              <span className="legend-dot correct"></span>Correct
            </div>
            <div className="legend-item">
              <span className="legend-dot incorrect"></span>Incorrect
            </div>
            <div className="legend-item">
              <span className="legend-dot unanswered"></span>Unanswered
            </div>
          </div>
        </div>

        {/* Right: Question Viewer */}
        <div className="question-viewer-panel">
          {currentQuestion ? (
            <QuestionViewer question={currentQuestion} />
          ) : (
            <div className="no-question-message">
              <p>No questions available</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="answer-sheet-footer">
        <button
          className="nav-btn prev-btn"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 && selectedSubject === "all"}
        >
          ← Previous
        </button>
        <span className="nav-info">
          Question {currentQuestionIndex + 1} of {filteredQuestions.length}
        </span>
        <button
          className="nav-btn next-btn"
          onClick={handleNext}
          disabled={currentQuestionIndex === filteredQuestions.length - 1 && selectedSubject === "all"}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default AnswerSheet
