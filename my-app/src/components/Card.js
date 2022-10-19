
import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';

export default function Card (props) {

    const [showComponent, setShowComponent] = useState(true);

	const socket = useContext(SocketContext);

	const setComponentDisplay = useCallback((show) => {
        setShowComponent(show);
    }, []);

	const cardClicked = () => {
		console.log("CLICKED", props.cardID);
		if (props.canClick) {
			socket.emit('try playing card', props.cardID, onCardPlayed);
		}
	}

	const onCardPlayed = (success) => {
		setComponentDisplay(false);
		this.props.setNextCard(props.cardID);

		// baraja.cardRemoved();
		// console.log("nextCard: ", data);
		// this.props.setNextCard(data.gameData.topCard);
	};

	return showComponent ? (
		<li onClick={cardClicked} className={'card card-color-' + props.color}>
			<div className='card-content'>
				<h1 className='align-left'>{props.number}</h1>
				<h1 className='upside-down-text'>{props.number}</h1>
			</div>
		</li>
	) : "";
}