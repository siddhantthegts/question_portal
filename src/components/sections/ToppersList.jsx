import "../sections.css"

export default function ToppersList() {
  const toppersData = [
    { rank: 1, name: "Shivam Saurya", verbal: 47.0, data: 34.0, quant: 52.0, total: 133.0 },
    { rank: 2, name: "Vinamr Bajaj", verbal: 57.0, data: 23.0, quant: 44.0, total: 124.0 },
    { rank: 3, name: "AVI SHRIVASTAVA", verbal: 37.0, data: 30.0, quant: 45.0, total: 112.0 },
    { rank: 4, name: "Aditiya Gupta", verbal: 52.0, data: 35.0, quant: 22.0, total: 109.0 },
    { rank: 5, name: "Saket Agrawal", verbal: 40.0, data: 35.0, quant: 33.0, total: 108.0 },
    { rank: 6, name: "Protham Chowdhury", verbal: 41.0, data: 30.0, quant: 37.0, total: 108.0 },
    { rank: 7, name: "Anmol Gupta", verbal: 45.0, data: 36.0, quant: 25.0, total: 106.0 },
    { rank: 8, name: "Abhashish Tiwari", verbal: 37.0, data: 36.0, quant: 32.0, total: 105.0 },
  ]

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
