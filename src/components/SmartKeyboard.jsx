import React, { useState } from "react";
import "./SmartKeyboard.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const SmartKeyboard = ({ keyboardType = "alphabet", getText }) => {
  
  const numericKeys = ["1","2","3","4","5","6","7","8","9","0"];
  const alphabetKeys = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const [text,setText] = useState('');

  const handleButtonClick = (key) => {
    setText(text + key)
  }

  const handleDelete = () => {
    setText(text.substring(0,text.length-1))
  }

  const keys = keyboardType.toLowerCase() === "numeric" ? numericKeys : alphabetKeys;

  


  return (
    <div className="keyboard-container">
        <div className="keyboard-input-row">
        <input type="text" name="keyboardInput" id="keyboard-input" value={text}/>
        </div>

        <div className="keyboard-keys-row">
      {keys.map((key) => (
        <button 
          key={key} 
          className="keyboard-key"
          onClick={() => handleButtonClick(key)}
          getText= {() => getInputText && getInputText(text)}
        >
          {key}
        </button>
        
      ))}
       <FontAwesomeIcon
        icon={faTrash}
        color="#c00b0bff"
        className="keyboard-key"
        onClick={() => handleDelete()}
      />
        </div>
        
    </div>
  );
};

export default SmartKeyboard;