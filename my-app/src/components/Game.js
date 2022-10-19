import React, {useState, useContext, useCallback, useEffect} from 'react';
import {SocketContext} from '../context/socket';
import Card from './Card';
import Baraja from '../baraja-react';
// import 'baraja-js/dist/css/baraja.css';

const spreadFan = {
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

export default function Game (props) {

	const [cards, setCards] = useState([{}, {}]);
	const [fan, setFan] = useState({});
    const [nextCard, setNextCard] = useState({
		number: 1,
		color: "red",
	}); 

	const socket = useContext(SocketContext);

	const changeNextCard = useCallback((cardID) => {
		setNextCard(cards[cardID]);
		removeCard(cardID);
	}, []);

	const changeCards = useCallback((cards) => {
		setCards(cards);
	}, []);

	const changeFan = useCallback((fan) => {
		setFan(fan);
	}, []);

	const removeCard = useCallback((cardID) => {
		setCards(cards.filter((cardInList, i) => {
			return i !== cardID;
		}));
	});

	const getCardFromObj = (card, index, canClick = true) => {
		if(card == undefined) {
			console.log("Undefined card");
			return;
		}
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
		changeCards(gameData.playerCards);
		changeFan(spreadFan);
	};

	useEffect(() => {
		socket.emit('get game data');

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
			<div>
				<Baraja id='discard-pile' close={true}>
					{getCardFromObj(nextCard, 100, false)}
				</Baraja>
				<Baraja fan={fan}>
					{cardItems}
				</Baraja>
			</div>
		</div>
	);
}