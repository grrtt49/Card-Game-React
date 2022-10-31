
import { Typography } from '@mui/material';
import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GradeIcon from '@mui/icons-material/Grade';
import SquareIcon from '@mui/icons-material/Square';
import CircleIcon from '@mui/icons-material/Circle';

export default function Card (props) {

	const socket = useContext(SocketContext);

	const cardClicked = () => {
		console.log("CLICKED", props.cardID);
		if (props.canClick) {
			if(props.color == "black") {
				if(props.selectedWild != props.cardID) {
					props.setShowColorSelector(true);
					props.setSelectedWild(props.cardID);
					return;
				}
				props.setShowColorSelector(false);
				props.setSelectedWild(null);
				return;
			}

			props.setSelectedWild(null);
			socket.emit('try playing card', props.cardID);
		}
	}

	let text = props.number;
	switch (text) {
		case "skip":
			text = <DoNotDisturbIcon />;
			break;

		case "reverse":
			text = <SwapHorizIcon />;
			break;

		case "draw 4":
			text = "+4";
			break;

		case "draw 2":
			text = "+2";
			break;
	}

	let colorText = props.color;
	switch (colorText) {
		case "red":
			colorText = <FavoriteIcon />;
			break;
		case "blue":
			colorText = <GradeIcon />;
			break;
		case "green":
			colorText = <SquareIcon />;
			break;
		case "yellow":
			colorText = <CircleIcon />;
			break;
		default:
			colorText = "";
	}

	return (
		<li onClick={cardClicked} className={'card card-color-' + props.color + (props.selectedWild == props.cardID ? " selected-wild" : "")}>
			<div className='card-content'>
				<div>
					<Typography 
						variant='h5'
					>
						{text}
					</Typography>
					<Typography 
						variant='h5'
					>
						{props.colorblind ? colorText : ""}
					</Typography>
				</div>
				<Typography 
					variant='h5'
					sx={{
						transform: "scale(-1, -1)",
						display: {
							xs: 'none',
							sm: 'none',
							md: 'none',
							lg: "inline",
						},
					}}
				>
					{text}
				</Typography>
			</div>
		</li>
	);
}