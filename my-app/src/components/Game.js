import React, { useState, useContext, useCallback, useEffect } from 'react';
import { SocketContext } from '../context/socket';
import Card from './Card';
import Baraja from '../baraja-react';
import ColorSelector from './ColorSelector';

var spreadFan = {
	direction: 'right',
	easing: 'ease-out',
	origin: {
		x: 50,
		y: 200
	},
	speed: 500,
	range: 100,
	center: true
}

export default function Game(props) {

	const [cards, setCards] = useState([{}]);
	const [showColorSelector, setShowColorSelector] = useState(false);
	const [selectedColor, setSelectedColor] = useState("");
	const [selectedWild, setSelectedWild] = useState(null);
	const [fan, setFan] = useState(spreadFan);
	const [nextCard, setNextCard] = useState({
		number: 1,
		color: "red",
	});

	const socket = useContext(SocketContext);

	const changeCards = useCallback((cards) => {
		setCards(cards);
	}, []);

	const getCardFromObj = (card, index, canClick = true) => {
		if (card == undefined) {
			console.log("Undefined card");
			return;
		}
		return (<Card
			key={index}
			number={card.number}
			color={(card.hasOwnProperty("wildColor") ? card.wildColor : card.color)}
			cardID={index}
			canClick={canClick}
			selectedColor={selectedColor}
			setShowColorSelector={setShowColorSelector}
			setSelectedWild={setSelectedWild} 
			selectedWild={selectedWild} />);
	}

	const handleNewGameData = (gameData) => {
		console.log("New game data: ", gameData);
		setNextCard(gameData.topCard);
		changeCards(gameData.playerCards);
		spreadFan.range = Math.min(180, 50 * Math.log(Object.keys(gameData.playerCards).length));
		setFan(spreadFan);
	};

	const handleEndTurn = () => {
		if(showColorSelector) {
			socket.emit('try playing card', selectedWild, selectedColor);
			setShowColorSelector(false);
			return;
		}
		socket.emit('end turn');
	};

	const handleColorClicked = (color) => {
		setSelectedColor(color);
	};

	const getSelectedWildForBaraja = () => {
		if(!isNaN(parseInt(selectedWild))) {
			return parseInt(selectedWild);
		}
		console.log("NaN :( ", selectedWild);
	}

	useEffect(() => {
		socket.emit('get game data');

		socket.on('game data', handleNewGameData);

		return () => {
			socket.off("game data", handleNewGameData);
		};
	}, [socket]);

	let cardItems = [];
	Object.keys(cards).forEach((index) => {
		let card = cards[index];
		cardItems.push(getCardFromObj(card, index));
	});

	let colorSelector = (showColorSelector ? <ColorSelector colorSelected={(color)=>handleColorClicked(color)} /> : ""); //showColorSelector

	return (
		<div id='game-display'>
			<div>
				<Baraja id='discard-pile' close={true}>
					{getCardFromObj(nextCard, 100, false)}
				</Baraja>
				<Baraja fan={fan} selectedWild={getSelectedWildForBaraja()}>
					{cardItems}
				</Baraja>

				<div className='button' onClick={handleEndTurn}>End Turn</div>

				{colorSelector}
			</div>
		</div>
	);
}