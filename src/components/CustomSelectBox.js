import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';


const CustomSelectBox = ({ className, options, value, onChange, appendText }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className={`schedule__select ${className}`} onClick={() => setIsOpen(!isOpen)}>
            <div className="schedule__select__selected">
                {options.find(option => option.value === value).displayName}
                <span className="schedule__select__selected--appendText">{appendText}</span>
                <span className={`icon ${isOpen ? 'icon--open' : ''}`}>
                    <FontAwesomeIcon icon={faChevronDown} />
                </span>
            </div>
            {isOpen && (
                <ul className="schedule__select__options">
                    {options.filter(option => option.value !== value).map((option, index) => (
                        <li key={index} onClick={() => handleChange(option)}>
                            {option.displayName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomSelectBox;