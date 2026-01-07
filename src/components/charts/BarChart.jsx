import "./BarChart.css"

export default function BarChart({ correct, incorrect, unanswered }) {
  const total = correct + incorrect + unanswered
  const correctPercent = (correct / total) * 100
  const incorrectPercent = (incorrect / total) * 100
  const unansweredPercent = (unanswered / total) * 100

  const maxValue = Math.max(correct, incorrect, unanswered)

  return (
    <div className="bar-chart">
      <div className="chart-bars">
        <div className="bar-group">
          <div className="bar correct" style={{ height: `${(correct / maxValue) * 200}px` }} />
          <div className="bar-label">{correct}</div>
          <div className="bar-title">Correct</div>
        </div>

        <div className="bar-group">
          <div className="bar incorrect" style={{ height: `${(incorrect / maxValue) * 200}px` }} />
          <div className="bar-label">{incorrect}</div>
          <div className="bar-title">Incorrect</div>
        </div>

        <div className="bar-group">
          <div className="bar unanswered" style={{ height: `${(unanswered / maxValue) * 200}px` }} />
          <div className="bar-label">{unanswered}</div>
          <div className="bar-title">Unanswered</div>
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot correct" /> Correct
        </div>
        <div className="legend-item">
          <span className="legend-dot incorrect" /> Incorrect
        </div>
        <div className="legend-item">
          <span className="legend-dot unanswered" /> Unanswered
        </div>
      </div>
    </div>
  )
}
