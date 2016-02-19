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
			    <Option option={this.data.option} hex={this.data.hovered} />
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
	building(type) {
		if (type == undefined) {
			return Empty;
		}
		return {
			tower: Tower,
			production: Production,
			village: Village
		}[type]
	},
	getInitialState() {
	    return {
	        hex: this.props.hex,
	        structure: {}
	    };
	},
	componentWillReceiveProps(nextProps) {
	    if (nextProps.hex && nextProps.hex.state) {
	    	this.setState({
	    		hex: nextProps.hex,
	    		structure: nextProps.hex.state.structure
	    	});
	    }
	},
	render() {
		var hex      = this.state.hex;
		var Building = this.building(hex.state ? hex.state.type : undefined)
		var x        = hex.x ? hex.x : ''
		var y        = hex.y ? hex.y : ''
		var owner    = hex.owner ? hex.owner : 'No Owner';

		return <div className='hovered'>
			<div className={(hex.terrain || '') + ' terrain'}>
				{hex.terrain || ''}
			</div>
			<div className={(hex.owner || '') + ' owner'}>
				{hex.terrain && owner}
			</div>
			<div className='coordinates'>
				{x + (hex.x ? ', ' : '') + y}
			</div>
			<div className={(hex.level || '') + ' level'}>
				<Building state={hex.state} />
			</div>
		</div>;
	},
	owner(hex) {
		if (hex.owner == undefined) {
			return hex.owner || 'No Owner'
		} else {
			return hex.owner || ''
		}
	}
});

Empty = React.createClass({ render() {return <div></div>; } });

Tower = React.createClass({
	getInitialState() {
	    return {
	    	type: '',
	    	level: 0,
	    	struct: {},
	    	loaded: false
	    };
	},
	componentWillReceiveProps(nextProps) {
	    if (nextProps.structure) {
	    	this.setState({
	    		type: nextProps.state.type,
	    		level: nextProps.state.level,
	    		struct: nextProps.state.structure,
	    		loaded: true
	    	});
	    }
	},
	render() {
		if (this.state.loaded) {
			return this.state.struct.material.map((x, i) => {
				return <span key={i}>
						{struct.material[i][0].toUpperCase() + struct.material[i].slice(1) + ' Tower'}
					</span>;
			});
		}
		return  <div></div>;
	}
})

Production = React.createClass({
	getInitialState() {
	    return {
	    	type: '',
	    	level: 0,
	    	struct: {}
	    };
	},
	componentWillReceiveProps(nextProps) {
	    if (nextProps.structure) {
	    	this.setState({
	    		type: nextProps.state.type,
	    		level: nextProps.state.level,
	    		struct: nextProps.state.structure
	    	});
	    }
	},
	render() {
		return <div>
				production
			</div>;
	}
})

Village = React.createClass({
	getInitialState() {
	    return {
	    	type: '',
	    	level: 0,
	    	struct: {}
	    };
	},
	componentWillReceiveProps(nextProps) {
	    if (nextProps.state && nextProps.state.structure) {
	    	this.setState({
	    		type: nextProps.state.type,
	    		level: nextProps.state.level,
	    		struct: nextProps.state.structure
	    	});
	    }
	},
	render() {
		return <div>
				village
			</div>;
	}
})

Option = React.createClass({
	getInitialState: function() {
    return {
        tooltip: {},
        hex: {}
    };
	},
	componentWillReceiveProps: function(nextProps) {
		if (nextProps.option.tooltip) {
			this.setState({
				tooltip: nextProps.option.tooltip,
				hex: nextProps.hex
			});
		}
	},
	render: function() {
		var tooltip = this.state.tooltip;
		var hex = this.state.hex;

		return <div className='option'>
			<div className={(tooltip.title || '')}>
				<h3>{tooltip.title || ''}</h3>
				<div>
					{_.map(tooltip.cost, (k, v) => {
						return <span key={v}> <span className={v}>{k}</span> </span>;
					})}
				</div>
				<div dangerouslySetInnerHTML={{__html: this.parse_body(tooltip.body, hex)}}></div>
			</div>
		</div>;
	},
	parse_body: function(body, hex) {
		body = body || '';
		return body.replace(/\{(.*?)\}/g, "<span class='option-resource'> " + hex.resource + "</span>")
						   .replace(/\[(.*?)\]/g, ($0, $1) => { return "<span class='option-inc'> " + this.parse_increment($1, hex) + "</span>" })
						   .replace(/\|(.*?)\|/g, ($0, $1) => { return "<span class='option-highlight'> " + $1 + "</span>" });
	},
	parse_increment: function(inc, hex) {
		var params = inc.split('');
		var level = hex.state.level + 1;
		var amount = params[1] * level;

		return params[0] + amount;
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