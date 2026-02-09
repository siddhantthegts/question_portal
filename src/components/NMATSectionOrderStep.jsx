import { useState, useMemo } from 'react';
import './NMATSectionOrderStep.css';

function NMATSectionOrderStep({ sections, onConfirm, isSubmitting }) {
  const [order, setOrder] = useState(() =>
    (sections || []).map((s) => s.sectionId)
  );

  const orderedSections = useMemo(() => {
    if (!sections?.length) return [];
    const byId = new Map(sections.map((s) => [String(s.sectionId), s]));
    return order
      .map((id) => byId.get(String(id)))
      .filter(Boolean);
  }, [sections, order]);

  const moveUp = (index) => {
    if (index <= 0) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index) => {
    if (index >= order.length - 1) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleStartExam = () => {
    onConfirm(order);
  };

  if (!sections?.length) return null;

  return (
    <div className="nmat-section-order-step">
      <h1 className="nmat-section-order-step__title">Choose your section order</h1>
      <p className="nmat-section-order-step__subtitle">
        Select the order in which you want to attempt the sections. You can change the order using the arrows.
      </p>
      <ol className="nmat-section-order-step__list">
        {orderedSections.map((section, index) => (
          <li key={section.sectionId} className="nmat-section-order-step__item">
            <span className="nmat-section-order-step__position">{index + 1}</span>
            <span className="nmat-section-order-step__name">{section.sectionName}</span>
            <div className="nmat-section-order-step__actions">
              <button
                type="button"
                className="nmat-section-order-step__btn"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="nmat-section-order-step__btn"
                onClick={() => moveDown(index)}
                disabled={index === order.length - 1}
                aria-label="Move down"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="nmat-section-order-step__start"
        onClick={handleStartExam}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving…' : 'Start Exam'}
      </button>
    </div>
  );
}

export default NMATSectionOrderStep;
