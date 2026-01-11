import React from 'react';
import './CATSubmissionWarningModal.css';

function CATSubmissionWarningModal({ isOpen, onClose, timeRemaining }) {
  if (!isOpen) return null;

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined || seconds <= 0) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="cat-warning-modal-overlay" onClick={onClose}>
      <div className="cat-warning-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚠️ Submission Notice</h2>
        </div>
        
        <div className="modal-content">
          <div className="warning-icon">⏰</div>
          <p className="warning-message">
            You cannot submit this section until the time is complete.
          </p>
          <p className="time-remaining">
            Time remaining: <strong>{formatTime(timeRemaining)}</strong>
          </p>
          <p className="warning-detail">
            For CAT exams, you must wait until the section time expires before you can submit and move to the next section.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-ok" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default CATSubmissionWarningModal;

