import React, { useState } from "react";
import "./SmartKeyboard.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { setKeyboardValue } from "../store/keyboardSlice";

const SmartKeyboard = ({ keyboardType = "alphabet", onChange }) => {
  
  const numericKeys = ["1","2","3","4","5","6","7","8","9","0"];
  const alphabetKeys = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const text = useSelector((state) => state.keyboard.value);
  const dispatch = useDispatch()
  const handleButtonClick = (key) => {
    const newText = text + key;
    dispatch(setKeyboardValue(newText))
    if (onChange) onChange(newText);
  };

  const handleDelete = () => {
    const newText = text.slice(0, -1);
    dispatch(setKeyboardValue(newText));
    if (onChange) onChange(newText);
  };

  const keys = keyboardType.toLowerCase() === "numeric" ? numericKeys : alphabetKeys;

  


  const handleInputChange = (e) => {
const newText = e.target.value;
    dispatch(setKeyboardValue(newText));
    if (onChange) onChange(newText);
  };

  return (
    <div className="keyboard-container">
        <div className="keyboard-input-row">
        <input
          type="text"
          name="keyboardInput"
          id="keyboard-input"
          value={text}
          onChange={handleInputChange}
        />
        </div>

        <div className="keyboard-keys-row">
      {keys.map((key) => (
        <button 
          key={key} 
          className="keyboard-key"
          onClick={() => handleButtonClick(key)}
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