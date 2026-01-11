"use client"

import { useState } from "react"
import { useLocation } from "react-router-dom"
import { useAnalyticsData } from "../hooks/useAnalyticsData"
import AnswerSheet from "./sections/AnswerSheet"
import SectionWiseAnalysis from "./sections/SectionWiseAnalysis"
import DifficultyAnalysis from "./sections/DifficultyAnalysis"
import TimeAnalysis from "./sections/TimeAnalysis"
import ToppersList from "./sections/ToppersList"
import "./AnalyticsPortal.css"

function AnalyticsPortal() {
  const location = useLocation()
  const token = location.state?.token || null
  const { examStructure, sectionWise, difficulty, timeAnalysis, answerSheet, toppers, isLoading, error } = useAnalyticsData(token)
  
  const [activeTab, setActiveTab] = useState("answer-sheet")

  const tabs = [
    { id: "answer-sheet", label: "Answer Sheet" },
    { id: "section-wise", label: "Section Wise Analysis" },
    { id: "difficulty", label: "Difficulty Analysis" },
    { id: "time", label: "Time Analysis" },
    { id: "toppers", label: "Toppers List" },
  ]

  if (isLoading) {
    return (
      <div className="analytics-portal">
        <div className="analytics-header">
          <h1>Loading Analytics...</h1>
          <p className="subtitle">Please wait while we fetch your performance data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-portal">
        <div className="analytics-header">
          <h1>Error Loading Analytics</h1>
          <p className="subtitle">Unable to load analytics data. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-portal">
      <div className="analytics-header">
        <h1>{examStructure?.examName || "Exam Analytics"}</h1>
        <p className="subtitle">Comprehensive Performance Analytics</p>
      </div>

      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "answer-sheet" && (
          <AnswerSheet 
            data={answerSheet} 
            examStructure={examStructure}
            isLoading={isLoading}
          />
        )}
        {activeTab === "section-wise" && <SectionWiseAnalysis data={sectionWise} />}
        {activeTab === "difficulty" && <DifficultyAnalysis data={difficulty} />}
        {activeTab === "time" && <TimeAnalysis data={timeAnalysis} />}
        {activeTab === "toppers" && <ToppersList data={toppers} />}
      </div>
    </div>
  )
}

export default AnalyticsPortal
