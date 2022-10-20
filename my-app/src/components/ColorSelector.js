
import React, {useState, useContext, useCallback, useEffect} from 'react';

export default function ColorSelector (props) {

    const [selectedColor, setSelectedColor] = useState("");

    useEffect(() => {
        props.colorSelected(selectedColor);
    }, [selectedColor]);

	return (
		<div className='circle-container'>
            <div className='circle-row'>
                <div className={"quarter-circle quarter-circle-top-left bg-red " + (selectedColor == "red" ? "selected-color" : "")} onClick={()=>setSelectedColor("red")}></div>
                <div className={"quarter-circle quarter-circle-top-right bg-yellow " + (selectedColor == "yellow" ? "selected-color" : "")} onClick={()=>setSelectedColor("yellow")}></div>
            </div>
            <div className='circle-row'>
                <div className={"quarter-circle quarter-circle-bottom-left bg-green " + (selectedColor == "green" ? "selected-color" : "")} onClick={()=>setSelectedColor("green")}></div>
                <div className={"quarter-circle quarter-circle-bottom-right bg-blue " + (selectedColor == "blue" ? "selected-color" : "")} onClick={()=>setSelectedColor("blue")}></div>
            </div>
        </div>
	);
}