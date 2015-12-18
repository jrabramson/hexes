Menu = React.createClass({
	mixins: [ReactMeteorData],
	getMeteorData() {
		return {
			hovered: Session.get('hovered'),
			option: Session.get('option')
		}
	},
	render() {
		return <div>
			<Hovered hex={this.data.hovered} />
			<Option option={this.data.option} />
		</div>
	}
});

Hovered = React.createClass({
	render() {
		var hex = this.props.hex;
		return <div className='hovered'>
			<div className={(hex.terrain || '') + ' terrain'}>
				{hex.terrain || 'None'}
			</div>
			<div className={(hex.owner   || '') + ' owner'}>
				{hex.owner || 'Unclaimed'}
			</div>
			<div className={(hex.level   || '') + ' level'}>
				{hex.level || 'None'}
			</div>
		</div>;
	}
});

Option = React.createClass({
	render() {
		var option = this.props.option;
		return <div className='option'>
			<div className={(option.material || '') + ' material'}>
				{option.material || ''}
			</div>
			<div className={(option.type   || '') + ' type'}>
				{option.type || ''}
			</div>
		</div>;
	}
});