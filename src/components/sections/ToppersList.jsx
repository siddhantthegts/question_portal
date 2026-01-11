import "../sections.css"

export default function ToppersList({ data = [] }) {
  // Use real data if provided, otherwise show empty state
  const toppersData = data.length > 0 ? data : []

  return (
    <div className="toppers-list">
      <div className="toppers-header">
        <h2>Toppers List</h2>
        <button className="consistent-toppers-btn">Consistent Toppers</button>
      </div>

      <div className="toppers-table-container">
        <table className="toppers-table">
          <thead>
            <tr>
              <th>All India Rank</th>
              <th>Student Name</th>
              <th>Verbal Ability and Reading Comprehension</th>
              <th>Data Interpretation & Logical Reasoning</th>
              <th>Quantitative Aptitude</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {toppersData.map((row) => (
              <tr key={row.rank}>
                <td className="rank">{row.rank}</td>
                <td className="name">{row.name}</td>
                <td className="score">{row.verbal.toFixed(2)}</td>
                <td className="score">{row.data.toFixed(2)}</td>
                <td className="score">{row.quant.toFixed(2)}</td>
                <td className="score total">{row.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
