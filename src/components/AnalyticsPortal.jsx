"use client"

import { useState } from "react"
import AnswerSheet from "./sections/AnswerSheet"
import SectionWiseAnalysis from "./sections/SectionWiseAnalysis"
import DifficultyAnalysis from "./sections/DifficultyAnalysis"
import TimeAnalysis from "./sections/TimeAnalysis"
import ToppersList from "./sections/ToppersList"
import "./AnalyticsPortal.css"

function AnalyticsPortal() {
  const [activeTab, setActiveTab] = useState("answer-sheet")

  const tabs = [
    { id: "answer-sheet", label: "Answer Sheet" },
    { id: "section-wise", label: "Section Wise Analysis" },
    { id: "difficulty", label: "Difficulty Analysis" },
    { id: "time", label: "Time Analysis" },
    { id: "toppers", label: "Toppers List" },
  ]

  return (
    <div className="analytics-portal">
      <div className="analytics-header">
        <h1>CatMock Difficult Mock 12 2025</h1>
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
        {activeTab === "answer-sheet" && <AnswerSheet />}
        {activeTab === "section-wise" && <SectionWiseAnalysis />}
        {activeTab === "difficulty" && <DifficultyAnalysis />}
        {activeTab === "time" && <TimeAnalysis />}
        {activeTab === "toppers" && <ToppersList />}
      </div>
    </div>
  )
}

export default AnalyticsPortal
