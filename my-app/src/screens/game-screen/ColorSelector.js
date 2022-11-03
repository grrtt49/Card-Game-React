
import React, {useState, useContext, useCallback, useEffect} from 'react';
import { styled } from '@mui/material';

import FavoriteIcon from '@mui/icons-material/Favorite';
import GradeIcon from '@mui/icons-material/Grade';
import SquareIcon from '@mui/icons-material/Square';
import CircleIcon from '@mui/icons-material/Circle';

const QuarterCircle = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        textAlign: "center",
    },
    [theme.breakpoints.down('md')]: {
        width: "60px",
        height: "60px",
        lineHeight: "60px",
    },
    [theme.breakpoints.up('md')]: {
        width: "80px",
        height: "80px",
        lineHeight: "80px",
    },
    [theme.breakpoints.up('lg')]: {
        width: "100px",
        height: "100px",
        lineHeight: "100px",
    },
}));

export default function ColorSelector (props) {

    const [selectedColor, setSelectedColor] = useState("");

    useEffect(() => {
        props.colorSelected(selectedColor);
    }, [selectedColor]);

    let colorblindIndicators = {red: "", blue: "", green: "", yellow: ""};
    if(props.colorblind) {
        colorblindIndicators.red = <FavoriteIcon />;
        colorblindIndicators.blue = <GradeIcon />;
        colorblindIndicators.green = <SquareIcon />;
        colorblindIndicators.yellow = <CircleIcon />;
    }

	return (
		<div className='circle-container'>
            <div className='circle-row'>
                <QuarterCircle className={"quarter-circle quarter-circle-top-left bg-red " + (selectedColor == "red" ? "selected-color" : "")} onClick={()=>setSelectedColor("red")}>
                    {colorblindIndicators.red}
                </QuarterCircle>
                <QuarterCircle className={"quarter-circle quarter-circle-top-right bg-yellow " + (selectedColor == "yellow" ? "selected-color" : "")} onClick={()=>setSelectedColor("yellow")}>
                    {colorblindIndicators.yellow}
                </QuarterCircle>
            </div>
            <div className='circle-row'>
                <QuarterCircle className={"quarter-circle quarter-circle-bottom-left bg-green " + (selectedColor == "green" ? "selected-color" : "")} onClick={()=>setSelectedColor("green")}>
                    {colorblindIndicators.green}
                </QuarterCircle>
                <QuarterCircle className={"quarter-circle quarter-circle-bottom-right bg-blue " + (selectedColor == "blue" ? "selected-color" : "")} onClick={()=>setSelectedColor("blue")}>
                    {colorblindIndicators.blue}
                </QuarterCircle>
            </div>
        </div>
	);
}