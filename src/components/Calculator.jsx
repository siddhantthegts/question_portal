import { useState } from 'react';
import './Calculator.css';

function Calculator({ onClose }) {
  const [expr, setExpr] = useState('');
  const isOperator = (v) => ['+','-','*','/'].includes(v);
  const append = (val) => {
    setExpr((prev) => {
      if (isOperator(val)) {
        if (prev === '' || isOperator(prev.slice(-1))) {
          return prev.slice(0, -1) + val; // replace previous op or ignore leading op
        }
      }
      return prev + val;
    });
  };
  const clear = () => setExpr('');
  const calculate = () => {
    try {
      // eslint-disable-next-line no-eval
      const res = eval(expr || '0');
      setExpr(String(res));
    } catch {
      setExpr('Error');
    }
  };

  const buttons = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];

  return (
    <div className="calculator-fixed">
      <button className="close-btn" onClick={onClose}>×</button>
      <input className="display" value={expr} readOnly />
      <div className="keys">
        <button className="key clear" onClick={clear}>C</button>
        {buttons.map((b) => (
          <button key={b} className="key" onClick={b==='='?calculate:()=>append(b)}>{b}</button>
        ))}
      </div>
    </div>
  );
}

export default Calculator;
