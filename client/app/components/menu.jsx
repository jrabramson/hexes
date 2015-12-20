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
		var option_cost = this.cost(option.material);
		return <div className='option'>
			<div className={(option.material || '') + ' material'}>
				{option.material || ''}
			</div>
			{_.map(option_cost, (m, v) => {
				return <div key={v} className={v}>
					<span>{v}:&nbsp;</span> 
					<span>{m}</span> 
				</div>;
			})}
		</div>;
	},
	cost(material) {
		var cost_map = {
		  "wood": { 'wealth': 50, "wood": 100, "glass": 50 },
		  "sandstone": { 'wealth': 50, "brick": 100, "glass": 50 },
		  "stone": { 'wealth': 50, "brick": 100, "glass": 50 },
		  "obsidian": { 'wealth': 50, "brick": 100, "ore": 100, "glass": 50 }
		}

		return cost_map[material] || [];
	}
});