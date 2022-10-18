class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			cards: props.cards,
			nextCard: props.nextCard,
		};
	}

	changeCards = (cards) => {
		this.setState({ cards: cards });
	}

	setNextCard = (card) => {
		this.setState({ nextCard: card });
	}

	componentDidMount() {
		if (baraja == null) {
			baraja = new Baraja(document.getElementById('baraja-el'), {
				easing: 'ease-in-out',
				speed: 300,
			});

			baraja.fan({
				direction: 'right',
				easing: 'ease-out',
				origin: {
					x: 50,
					y: 200
				},
				speed: 500,
				range: 100,
				center: true
			});
		}

		gameSocketController.socket.on('game data', function(gameData) {
			console.log("New game data: ", gameData);
			this.setNextCard(gameData.topCard);
		}.bind(this));
	}

	componentDidUpdate() {
		gameSocketController.socket.on('game data', function(gameData) {
			console.log("New game data: ", gameData);
			this.setNextCard(gameData.topCard);
		}.bind(this));
	}

	getCardFromObj = (card, index, canClick = true) => {
		return (<Card
			key={index}
			number={card.number}
			color={card.color}
			cardID={index}
			canClick={canClick}
			setNextCard={this.setNextCard} />);
	}

	render() {
		let cardItems = this.state.cards.map((card, index) => {
			return this.getCardFromObj(card, index);
		});

		return (
			<div>
				<ul id='discard-pile' className='baraja-container'>
					{this.getCardFromObj(this.state.nextCard, 100, false)}
				</ul>
				<ul id='baraja-el' className='baraja-container'>
					{cardItems}
				</ul>
			</div>
		);
	}
}