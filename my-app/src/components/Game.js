import React, { useState, useContext, useCallback, useEffect } from 'react';
import { SocketContext } from '../context/socket';
import Card from './Card';
import Baraja from '../baraja-react';
import ColorSelector from './ColorSelector';
import Messenger from './Messenger';
import Button from '@mui/material/Button';
import { Stack, Chip, Badge } from '@mui/material';

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
	const [playerTurnData, setPlayerTurnData] = useState([]);
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
		return (
			<Card
				key={index}
				number={card.number}
				color={(card.hasOwnProperty("wildColor") ? card.wildColor : card.color)}
				cardID={index}
				canClick={canClick}
				selectedColor={selectedColor}
				setShowColorSelector={setShowColorSelector}
				setSelectedWild={setSelectedWild} 
				selectedWild={selectedWild} 
			/>
		);
	}

	const handleNewGameData = (gameData) => {
		console.log("New game data: ", gameData);
		setNextCard(gameData.topCard);
		changeCards(gameData.playerCards);
		setPlayerTurnData(gameData.playerTurnData);
		spreadFan.range = Math.min(120, 50 * Math.log(Object.keys(gameData.playerCards).length));
		setFan(spreadFan);
		if(gameData.isTurn) {
			props.handlePlayerInfoMessage("It's your turn now!");
		}
	};

	const handleEndTurn = () => {
		if(showColorSelector) { //if wild is selected
			socket.emit('try playing card', selectedWild, selectedColor);
			setShowColorSelector(false);
			setSelectedWild(null);
			return;
		}
		socket.emit('end turn');
	};

	const handleColorClicked = (color) => {
		setSelectedColor(color);
	};

	const getSelectedWildForBaraja = () => {
		if(!isNaN(parseInt(selectedWild))) {
			let selectedID =  parseInt(selectedWild);
			let index = getCardIndexFromID(selectedID);
			return index;
		}
		console.log("NaN :( ", selectedWild);
	}

	const getCardIndexFromID = (findCardId) => {
		let cardIndex = null;
		let i = 0;
		Object.keys(cards).every((cardId) => {
			if(cardId == findCardId) {
				cardIndex = i;
				return false;
			}
			i++;
			return true;
		});

		return cardIndex;
	};

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

	let playerChips = [];
	playerTurnData.forEach((player, index) => {
		playerChips.push(
			<Badge badgeContent={player.numCards} color="secondary"  key={index}>
				<Chip label={player.name} color={player.isCurrent ? "primary" : "default"} />
			</Badge>
		); 
	});

	return (
		<Stack spacing={4}>
			<Stack direction="row" justifyContent="center" spacing={3}>
				{playerChips}
			</Stack>

			<div id='game-display'>
				<div>
					<Baraja id='discard-pile' close={true}>
						{getCardFromObj(nextCard, 100, false)}
					</Baraja>
					<Baraja fan={fan} selectedWild={getSelectedWildForBaraja()}>
						{cardItems}
					</Baraja>
				</div>
			</div>
			<Stack justifyContent="center" alignItems="center" spacing={3}>
				{colorSelector}
				<Button variant="contained" onClick={handleEndTurn}>End Turn</Button>
			</Stack>

			<Messenger />
		</Stack>
	);
}