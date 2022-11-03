
import React, {useState, useContext, useCallback, useEffect} from 'react';
import { styled } from '@mui/material';

const QuarterCircle = styled('div')(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
        width: "60px",
        height: "60px",
    },
    [theme.breakpoints.up('md')]: {
        width: "80px",
        height: "80px",
    },
    [theme.breakpoints.up('lg')]: {
        width: "100px",
        height: "100px",
    },
}));

export default function ColorSelector (props) {

    const [selectedColor, setSelectedColor] = useState("");

    useEffect(() => {
        props.colorSelected(selectedColor);
    }, [selectedColor]);

	return (
		<div className='circle-container'>
            <div className='circle-row'>
                <QuarterCircle className={"quarter-circle quarter-circle-top-left bg-red " + (selectedColor == "red" ? "selected-color" : "")} onClick={()=>setSelectedColor("red")}></QuarterCircle>
                <QuarterCircle className={"quarter-circle quarter-circle-top-right bg-yellow " + (selectedColor == "yellow" ? "selected-color" : "")} onClick={()=>setSelectedColor("yellow")}></QuarterCircle>
            </div>
            <div className='circle-row'>
                <QuarterCircle className={"quarter-circle quarter-circle-bottom-left bg-green " + (selectedColor == "green" ? "selected-color" : "")} onClick={()=>setSelectedColor("green")}></QuarterCircle>
                <QuarterCircle className={"quarter-circle quarter-circle-bottom-right bg-blue " + (selectedColor == "blue" ? "selected-color" : "")} onClick={()=>setSelectedColor("blue")}></QuarterCircle>
            </div>
        </div>
	);
}