
import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';

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

	return (
		<li onClick={cardClicked} className={'card card-color-' + props.color + (props.selectedWild == props.cardID ? " selected-wild" : "")}>
			<div className='card-content'>
				<h1 className='align-left'>{props.number}</h1>
				<h1 className='upside-down-text'>{props.number}</h1>
			</div>
		</li>
	);
}