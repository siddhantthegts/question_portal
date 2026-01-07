"use client"

import { useState } from "react"
import QuestionViewer from "../QuestionViewer"
import "../sections.css"

function AnswerSheet() {
  const verbalQuestions = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    section: "verbal",
    sectionName: "Verbal Ability & Reading Comprehension",
    type: i % 3 === 0 ? "passage" : "mcq",
    difficulty: ["Easy", "Medium", "Hard"][i % 3],
    timeTaken: Math.floor(Math.random() * 10) + 2,
    accuracy: Math.floor(Math.random() * 100),
    passage:
      i % 3 === 0
        ? `The world's nights are getting alarmingly brighter- bad news for all sorts of creatures, humans included- as light pollution encroaches on darkness almost everywhere. Satellite observations made by researchers during five consecutive Octobers show Earth's artificially lit outdoor area grew by 2% a year from 2012 to 2016. So did nighttime brightness. Light pollution was even worse than that, according to the German-led team, because the sensor used cannot detect some of the LED lighting that is becoming more widespread, specifically blue light.`
        : null,
    question:
      i % 3 === 0
        ? "The thematic highlight of the passage is to:"
        : `Question ${i + 1}: Choose the most appropriate word to fill in the blank.`,
    options:
      i % 3 === 0
        ? [
            "Highlight the role of light pollution in increasing the usage of global consumption of light.",
            "Showcase the multi-faceted side effects of environmental degradation.",
            "Highlight the abject failure of LEDs in curbing light pollution.",
            "Showcase the side effects of light pollution and suggest some remedies.",
          ]
        : ["Option A", "Option B", "Option C", "Option D"],
    userAnswer: ["A", "B", "C", "D", null][i % 5],
    correctAnswer: ["A", "B", "C", "D"][i % 4],
    status: ["correct", "incorrect", "unanswered"][i % 3],
  }))

  // Repeat pattern for other sections
  const dataQuestions = Array.from({ length: 24 }, (_, i) => ({
    id: i + 25,
    number: i + 25,
    section: "data",
    sectionName: "Data Interpretation & Logical Reasoning",
    type: i % 2 === 0 ? "passage" : "mcq",
    difficulty: ["Easy", "Medium", "Hard"][i % 3],
    timeTaken: Math.floor(Math.random() * 10) + 2,
    accuracy: Math.floor(Math.random() * 100),
    passage: i % 2 === 0 ? `Sample data interpretation set... ${i + 25}` : null,
    question: `Question ${i + 25}: What can be inferred from the given data?`,
    options: ["Option A", "Option B", "Option C", "Option D", "Option E"],
    userAnswer: ["A", "B", "C", "D", null][i % 5],
    correctAnswer: "C",
    status: ["correct", "incorrect", "unanswered"][i % 3],
  }))

  const quantQuestions = Array.from({ length: 24 }, (_, i) => ({
    id: i + 49,
    number: i + 49,
    section: "quant",
    sectionName: "Quantitative Aptitude",
    type: "mcq",
    difficulty: ["Easy", "Medium", "Hard"][(i + 1) % 3],
    timeTaken: Math.floor(Math.random() * 8) + 1,
    accuracy: Math.floor(Math.random() * 100),
    question: `If x + y = 10 and xy = 24, find the value of x² + y².`,
    options: ["52", "28", "100", "48"],
    userAnswer: ["A", "B", "C", "D", null][i % 5],
    correctAnswer: "A",
    status: ["correct", "incorrect", "unanswered"][i % 3],
  }))

  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedQuestionId, setSelectedQuestionId] = useState(verbalQuestions[0].id)

  const allSections = [
    { id: "verbal", name: "Verbal Ability & Reading Comprehension", questions: verbalQuestions },
    { id: "data", name: "Data Interpretation & Logical Reasoning", questions: dataQuestions },
    { id: "quant", name: "Quantitative Aptitude", questions: quantQuestions },
  ]

  let filteredQuestions = []
  if (selectedSubject === "all") {
    filteredQuestions = [...verbalQuestions, ...dataQuestions, ...quantQuestions]
  } else {
    const section = allSections.find((s) => s.id === selectedSubject)
    filteredQuestions = section?.questions || []
  }

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
      <div className="subject-filter-bar">
        <div className="filter-buttons">
          {[
            { value: "verbal", label: "Verbal Ability & Reading Comprehension" },
            { value: "data", label: "Data Interpretation & Logical Reasoning" },
            { value: "quant", label: "Quantitative Aptitude" },
            { value: "all", label: "ALL" },
          ].map((option) => (
            <button
              key={option.value}
              className={`filter-btn ${selectedSubject === option.value ? "active" : ""}`}
              onClick={() => {
                setSelectedSubject(option.value)
                setSelectedQuestionId(
                  allSections.find((s) => s.id === (option.value === "all" ? "verbal" : option.value)).questions[0].id,
                )
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

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
          <QuestionViewer question={currentQuestion} />
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
