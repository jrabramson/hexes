Menu = React.createClass({
	mixins: [ReactMeteorData],
	getMeteorData() {
		return {
			hovered: Session.get('hovered'),
			option: Session.get('option'),
			market: Market.findOne(),
			user: Meteor.user(),
			timer: Timer.findOne()
		}
	},
	render() {
		return <div>
				<div className='sidebar_section'>
				  <div className='main_box'></div>
				  <span className='main_title'>Hexes.io</span>      
				  <span className='turn_count'>Turn {this.data.timer.turns} / 500 </span>
				</div>
				<Dashboard user={this.data.user} />
	      <MarketPlace values={this.data.market} user={this.data.user} />
		    <div className='sidebar_section'>
		      <Hovered hex={this.data.hovered} />
			    <Option option={this.data.option} />
		    </div>
	    </div>
	}
});

Dashboard = React.createClass({
	render() {
		$user = this.props.user || {};
		return <div className='sidebar_section'>
				  <IncludeTemplate template={Template.loginButtons} />   
				  <div className='sidebar_tooltip'> Hexes: {$user.owned ? $user.owned.length : ''} </div>
				  <div className='sidebar_tooltip'> Population: {$user.population} </div>
				  <div className='sidebar_tooltip'> Wealth: {$user.wealth} </div>
				</div>
	}
});

MarketPlace = React.createClass({
	loggedIn() {
		var market = this.props.values;
		var user = this.props.user;
		return <div className='sidebar_section'>
			  <div className='sidebar_resource'> 
			  	<span>{user.resources.wood} wood</span> 
			  	<div className='trade'>
			  	  <span className='buy' onClick={this.buy} data-res='wood'>+</span>
			  		<span className='value'> {market.wood.value}w </span>
			  		<span className='sell' onClick={this.sell} data-res='wood'>-</span>
			  	</div>
			  </div>
			  <div className='sidebar_resource'> 
			  	<span>{user.resources.ore} ore</span> 
			  	<div className='trade'>
			  	  <span className='buy' onClick={this.buy} data-res='ore'>+</span>
			  		<span className='value'> {market.ore.value}w </span>
			  		<span className='sell' onClick={this.sell} data-res='ore'>-</span>
			  	</div>
			  </div>
			  <div className='sidebar_resource'> 
			  	<span>{user.resources.glass} glass</span> 
			  	<div className='trade'>
			  	  <span className='buy' onClick={this.buy} data-res='glass'>+</span>
			  		<span className='value'> {market.glass.value}w </span>
			  		<span className='sell' onClick={this.sell} data-res='glass'>-</span>
			  	</div>
			  </div>
			  <div className='sidebar_resource'> 
			  	<span>{user.resources.grain} grain</span> 
			  	<div className='trade'>
			  	  <span className='buy' onClick={this.buy} data-res='grain'>+</span>
			  		<span className='value'> {market.grain.value}w </span>
			  		<span className='sell' onClick={this.sell} data-res='grain'>-</span>
			  	</div>
			  </div>
			  <div className='sidebar_resource'> 
			  	<span>{user.resources.fish} fish</span> 
			  	<div className='trade'>
			  	  <span className='buy' onClick={this.buy} data-res='fish'>+</span>
			  		<span className='value'> {market.fish.value}w </span>
			  		<span className='sell' onClick={this.sell} data-res='fish'>-</span>
			  	</div>
			  </div>
			  <div className='sidebar_resource'> 
			  	<span>{user.resources.brick} brick</span> 
			  	<div className='trade'>
			  	  <span className='buy' onClick={this.buy} data-res='brick'>+</span>
			  		<span className='value'> {market.brick.value}w </span>
			  		<span className='sell' onClick={this.sell} data-res='brick'>-</span>
			  	</div>
			  </div>
		</div>;
	},
	loggedOut() {
		return <div className='sidebar_section'></div>;
	},
	render() {
		return this.props.user ? this.loggedIn() : this.loggedOut();
	},
	buy(e) {
		Actions.buyResource(e.target.dataset.res);
	},
	sell(e) {
		Actions.sellResource(e.target.dataset.res);
	}
});

Hovered = React.createClass({
	render() {
		var hex = this.props.hex;
		return <div className='hovered'>
			<div className={(hex.terrain || '') + ' terrain'}>
				{hex.terrain || ''}
			</div>
			<div className={(hex.owner || '') + ' owner'}>
				{this.owner(hex)}
			</div>
			<div className={(hex.level || '') + ' level'}>
				{this.building(hex)}
			</div>
		</div>;
	},
	owner(hex) {
		if (hex.terrain) {
			return hex.owner || 'No Owner'
		} else {
			return hex.owner || ''
		}
	},
	building(hex) {
		var tower = hex.structure || {};
		var prod = hex.production || {};

		if (tower.level > prod.level) {
			return tower.material.map((x, i) => {
				return <span key={i}>
						{tower.material[i][0].toUpperCase() + tower.material[i].slice(1) + ' Tower'}
					</span>;
			});
		}
	}
});

Option = React.createClass({
	render() {
		var tooltip = this.props.option.tooltip || {};
		return <div className='option'>
			<div className={(tooltip.title || '')}>
				<h3>{tooltip.title || ''}</h3>
				<div>
					{_.map(tooltip.cost, (k, v) => {
						return <span key={v}> <span className={v}>{k}</span> </span>;
					})}
				</div>
				<div>
					{tooltip.body}
				</div>
			</div>
		</div>;
	}
});

var IncludeTemplate = React.createClass({
  componentDidMount: function() {
    var componentRoot = ReactDOM.findDOMNode(this);
    var parentNode = componentRoot.parentNode;
    parentNode.removeChild(componentRoot);
    return Blaze.render(this.props.template, parentNode);
  },
  render: function(template) {
    return (<div />)
  }
});