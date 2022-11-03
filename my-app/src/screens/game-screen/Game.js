import React, { useState, useContext, useCallback, useEffect } from 'react';
import { SocketContext } from '../../context/socket';
import Card from './Card';
import Baraja from '../../baraja-react';
import ColorSelector from './ColorSelector';
import Messenger from './Messenger';
import Button from '@mui/material/Button';
import { Stack, Chip, Badge } from '@mui/material';
import GameOverScreen from './GameOverScreen';
import Confetti from 'react-dom-confetti';
import EastIcon from '@mui/icons-material/East';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import SettingsIcon from '@mui/icons-material/Settings';

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

	const [showGameOver, setShowGameOver] = useState(false);
	const [gameOverData, setGameOverData] = useState({});
	const [cards, setCards] = useState([{}]);
	const [showColorSelector, setShowColorSelector] = useState(false);
	const [selectedColor, setSelectedColor] = useState("");
	const [selectedWild, setSelectedWild] = useState(null);
	const [fan, setFan] = useState(spreadFan);
	const [playerTurnData, setPlayerTurnData] = useState([]);
	const [isReversed, setIsReversed] = useState(false);
	const [nextCard, setNextCard] = useState({
		number: 1,
		color: "red",
	});

	const socket = useContext(SocketContext);

	const theme = useTheme();
  	const sm = useMediaQuery(theme.breakpoints.only('sm'));
  	const md = useMediaQuery(theme.breakpoints.only('md'));
  	const lg = useMediaQuery(theme.breakpoints.only('lg'));
  	const xl = useMediaQuery(theme.breakpoints.only('xl'));

	let hoverMagnitude = 30;
	if(sm) {
		hoverMagnitude = 40;
	}
	else if(md) {
		hoverMagnitude = 55;
	}
	else if(lg) {
		hoverMagnitude = 55;
	}
	else if(xl) {
		hoverMagnitude = 60;
	}

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
				colorblind={props.colorblindMode}
			/>
		);
	}

	const handleNewGameData = (gameData) => {
		console.log("New game data: ", gameData);
		setNextCard(gameData.topCard);
		changeCards(gameData.playerCards);
		setPlayerTurnData(gameData.playerTurnData);
		setIsReversed(gameData.isReversed);
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

	const compareCardObjects = (a, b) => {
		// console.log("Comparing: ", a, " with: ", b);
		if(a.color < b.color) {
			return -1;
		}
		if(a.color > b.color) {
			return 1;
		}
		if(typeof a.number == "string" && typeof b.number != "string") {
			return -1;
		}
		if(typeof a.number != "string" && typeof b.number == "string") {
			return 1;
		}
		if(a.number > b.number) {
			return -1;
		}
		if(a.number < b.number) {
			return 1;
		}
		return 0;
	};

	const getCardArray = (cards) => {
		let array = [];
		Object.keys(cards).forEach((index) => {
			cards[index].cardID = index;
			array.push(cards[index]);
		});
		return array;
	}

	const getCardIndexFromID = (findCardId) => {
		console.log("Getting card from id: ", findCardId);
		let cardsArray = getCardArray(cards);
		let sortedCards = [...cardsArray].sort(compareCardObjects);
		let cardIndex = null;
		let i = 0;
		console.log("Sorted cards: ", sortedCards);
		sortedCards.every((card) => {
			console.log("Checking: ", card.cardID);
			if(card.cardID == findCardId) {
				cardIndex = i;
				return false; 
			}
			i++;
			return true;
		});

		return cardIndex;
	};

	const handleBackToHome = () => {
		props.backToHome();
		socket.emit("left current game");
	};

	const handleGameOver = (data) => {
		setShowGameOver(true);
		setGameOverData(data);
	}

	useEffect(() => {
		socket.emit('get game data');

		socket.on('game data', handleNewGameData);
		socket.on('game over', handleGameOver);

		return () => {
		socket.off('game over', handleGameOver);
		socket.off("game data", handleNewGameData);
		};
	}, [socket, gameOverData, showGameOver]);

	const compareCards = (a, b) => {
		if(a.props.color < b.props.color) {
			return -1;
		}
		if(a.props.color > b.props.color) {
			return 1;
		}
		if(typeof a.props.number == "string" && typeof b.props.number != "string") {
			return -1;
		}
		if(typeof a.props.number != "string" && typeof b.props.number == "string") {
			return 1;
		}
		if(a.props.number > b.props.number) {
			return -1;
		}
		if(a.props.number < b.props.number) {
			return 1;
		}
		return 0;
	};

	let cardItems = [];
	Object.keys(cards).forEach((index) => {
		let card = cards[index];
		cardItems.push(getCardFromObj(card, index));
	});
	cardItems.sort(compareCards);

	let colorSelector = (showColorSelector ? <ColorSelector colorSelected={(color)=>handleColorClicked(color)} colorblind={props.colorblindMode} /> : ""); //showColorSelector

	let playerChips = [];
	playerTurnData.forEach((player, index) => {
		playerChips.push(
			<Badge badgeContent={player.numCards} color="secondary"  key={index}>
				<Chip label={player.name} color={player.isCurrent ? "primary" : "default"} />
			</Badge>
		); 
	});

	let val = true;

	return (
		<Stack spacing={4}>
			<Stack spacing={2} alignItems="center">
				<Stack direction="row" justifyContent="center" spacing={3}>
					{playerChips}
				</Stack>
				<EastIcon 
					sx={{
						transition: "transform 0.5s ease-in",
						transform: "rotate("+(isReversed ? 180 : 0)+"deg)"
					}}
				/>
			</Stack>
			<Stack justifyContent="center" alignItems="center">
				<Confetti 
					active={showGameOver} 
					config={{
						elementCount: 100,
						spread: 80,
						startVelocity: 50,
						angle: 135,
					}}
				/>
				<Confetti 
					active={showGameOver} 
					config={{
						elementCount: 100,
						spread: 80,
						startVelocity: 50,
						angle: 45,
					}}
				/>
			</Stack>

			<div id='game-display'>
				<div>
					<Baraja id='discard-pile' close={true}>
						{getCardFromObj(nextCard, 100, false)}
					</Baraja>
					<Baraja 
						fan={fan} 
						selectedWild={getSelectedWildForBaraja()} 
						options={{
							hoverMagnitude: hoverMagnitude
						}}
					>
						{cardItems}
					</Baraja>
				</div>
			</div>
			<Stack justifyContent="center" alignItems="center" spacing={3} sx={{marginBottom: "65px"}}>
				{colorSelector}
				<Button variant="contained" onClick={handleEndTurn}>End Turn</Button>
			</Stack>
			<Box height="50px"></Box>

			<Messenger />
			<GameOverScreen isOpen={showGameOver} onClose={()=>setShowGameOver(false)} onBackToHome={handleBackToHome} gameData={gameOverData}/>
		</Stack>
	);
	/*
				{
					won: "true", 
					players: [
						{name: "grrtt", numCards: 0},
						{name: "Nikki", numCards: 8},
						{name: "Mom", numCards: 2},
						{name: "Dad", numCards: 7},
						{name: "Kevin", numCards: 1},
					],
				}
	*/
}