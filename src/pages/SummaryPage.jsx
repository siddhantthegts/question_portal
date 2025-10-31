import { useSelector, useDispatch } from 'react-redux';
import questions from '../data/questions';
import { resetTest } from '../store/testSlice';
import { useNavigate } from 'react-router-dom';

function SummaryPage() {
  const { answers } = useSelector((state) => state.test);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const correct = questions.filter(
    (q) => answers[q.id]?.optionIndex === q.answer,
  ).length;

  const totalTime = Object.values(answers).reduce(
    (sum, a) => sum + (a.timeTaken || 0),
    0,
  );

  const handleRestart = () => {
    dispatch(resetTest());
    navigate('/question/1');
  };

  return (
    <div className="summary-page">
      <h2>Summary</h2>
      <p>
        Correct: {correct}/{questions.length}
      </p>
      <p>Total time: {(totalTime / 1000).toFixed(1)}s</p>
      <button onClick={handleRestart}>Restart</button>
    </div>
  );
}

export default SummaryPage;
