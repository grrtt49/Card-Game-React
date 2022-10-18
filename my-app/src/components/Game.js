import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import Card from './Card';
import Baraja from 'baraja-js';
// import 'baraja-js/dist/css/baraja.css';

export default function Game (props) {

	const [cards, setCards] = useState([]); //props.cards
    const [nextCard, setNextCard] = useState({
		number: 1,
		color: "red",
	}); //props.nextCard

	const socket = useContext(SocketContext);

	const baraja = null;

	const changeNextCard = useCallback((card) => {
		setNextCard(card);
	}, []);

	const getCardFromObj = (card, index, canClick = true) => {
		return (<Card
			key={index}
			number={card.number}
			color={card.color}
			cardID={index}
			canClick={canClick}
			setNextCard={changeNextCard} />);
	}

	const handleNewGameData = (gameData) => {
		console.log("New game data: ", gameData);
		changeNextCard(gameData.topCard);
	};

	useEffect(() => {
		// if (baraja == null) {
		// 	baraja = new Baraja(document.getElementById('baraja-el'), {
		// 		easing: 'ease-in-out',
		// 		speed: 300,
		// 	});

		// 	baraja.fan({
		// 		direction: 'right',
		// 		easing: 'ease-out',
		// 		origin: {
		// 			x: 50,
		// 			y: 200
		// 		},
		// 		speed: 500,
		// 		range: 100,
		// 		center: true
		// 	});
		// }

		socket.on('game data', handleNewGameData);

		return () => {
            socket.off("game data", handleNewGameData);
        };
	}, [socket]);

	let cardItems = cards.map((card, index) => {
		return getCardFromObj(card, index);
	});

	return (
		<div id='game-display'>
			<ul id='discard-pile' className='baraja-container'>
				{getCardFromObj(nextCard, 100, false)}
			</ul>
			<ul id='baraja-el' className='baraja-container'>
				{cardItems}
			</ul>
		</div>
	);
}