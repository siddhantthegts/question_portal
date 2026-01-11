import React from 'react';
import './SectionSummaryModal.css';

function SectionSummaryModal({ isOpen, onClose, onContinue, sectionName, attemptedCount, unansweredCount, totalQuestions, isTimeout = false }) {
  if (!isOpen) return null;

  return (
    <div className="section-summary-modal-overlay" onClick={!isTimeout ? onClose : undefined}>
      <div className="section-summary-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isTimeout ? '⏰ Time Up!' : '📋 Section Summary'}</h2>
          <p className="section-name">{sectionName}</p>
        </div>
        
        <div className="modal-content">
          <div className="summary-stats">
            <div className="stat-card attempted">
              <div className="stat-icon">✓</div>
              <div className="stat-info">
                <div className="stat-value">{attemptedCount}</div>
                <div className="stat-label">Attempted</div>
              </div>
            </div>
            
            <div className="stat-card unanswered">
              <div className="stat-icon">?</div>
              <div className="stat-info">
                <div className="stat-value">{unansweredCount}</div>
                <div className="stat-label">Unanswered</div>
              </div>
            </div>
            
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-value">{totalQuestions}</div>
                <div className="stat-label">Total Questions</div>
              </div>
            </div>
          </div>

          <div className="summary-table">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-attempted">
                  <td>✅ Attempted</td>
                  <td>{attemptedCount}</td>
                  <td>{totalQuestions > 0 ? Math.round((attemptedCount / totalQuestions) * 100) : 0}%</td>
                </tr>
                <tr className="row-unanswered">
                  <td>❓ Unanswered</td>
                  <td>{unansweredCount}</td>
                  <td>{totalQuestions > 0 ? Math.round((unansweredCount / totalQuestions) * 100) : 0}%</td>
                </tr>
                <tr className="row-total">
                  <td><strong>Total</strong></td>
                  <td><strong>{totalQuestions}</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {isTimeout && (
            <div className="timeout-message">
              <p>⏰ Your time for this section has ended. The section will be automatically submitted.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!isTimeout && (
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          )}
          <button className="btn-continue" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default SectionSummaryModal;

