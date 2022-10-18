
class Card extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showComponent: true,
		};
	}

	cardClicked = async () => {
		console.log("CLICKED", this.props.cardID);
		if (this.props.canClick) {
			let data = await gameSocketController.tryPlayingCard(this.props.cardID);
			let success = data.success;
			if (success) {
				this.setState({
					showComponent: false,
				}, function() {
					baraja.cardRemoved();
					console.log("nextCard: ", data);
					this.props.setNextCard(data.gameData.topCard);
				});
			}
		}
	}

	render() {
		//-color-${this.props.color}
		return this.state.showComponent ? (
			<li onClick={this.cardClicked} className={'card ' + 'card-color-' + this.props.color}>
				<div className='card-content'>
					<h1>{this.props.number}</h1>
					<h1 className='upside-down-text'>{this.props.number}</h1>
				</div>
			</li>
		) : "";
	}
}