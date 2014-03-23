/** @jsx React.DOM */
var d = React.DOM

var Navbar = React.createClass({
	getInitialState: function() {
		return this.props.model.toJSON()
	},
	handleModelChange: function() {
		this.setState(this.props.model.toJSON())
	},
	componentDidMount: function() {
		console.log('Navbar:componentDidMount')
		if (!('changeHandler' in this)) {
			this.changeHandler = _.bind(this.handleModelChange, this)
		}
		model.on('change', this.changeHandler)
	},
	componentWillUnmount: function() {
		console.log('Navbar:componentDidUnmount')
		model.off('change', this.changeHandler)
	},
	render: function() {
		return (
			<div className="navbar navbar-default navbar-fixed-top" role="navigation">
			<div className="container">
				<div className="navbar-header">
					<button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse"><span className="sr-only">Toggle navigation</span><span className="icon-bar"></span><span className="icon-bar"></span><span className="icon-bar"></span></button>
					<a className="navbar-brand" href="#">Bike</a>
				</div>
				<div className="navbar-collapse collapse">
					<ul className="nav navbar-nav">
						<li className="active"><a href="#">Rack Finder</a></li>
					</ul>
				</div>
			</div>
		</div>
		)
	}
})


var YourLocation = React.createClass({
	getInitialState: function() {
		return this.props.model.toJSON()
	},
	handleModelChange: function() {
		this.setState(this.props.model.toJSON())
	},
	componentDidMount: function() {
		console.log('YourLocation:componentDidMount')
		if (!('changeHandler' in this)) {
			this.changeHandler = _.bind(this.handleModelChange, this)
		}
		model.on('change', this.changeHandler)
	},
	componentWillUnmount: function() {
		console.log('YourLocation:componentDidUnmount')
		model.off('change', this.changeHandler)
	},
	render: function() {
		if (this.state.location.status == 'found') {
			return (
				<div className="alert alert-success">
					<h2>Your location is {this.state.location.coords.latitude}, {this.state.location.coords.longitude}</h2>
				</div>
				)
		} else if (this.state.location.status == 'none') {
			return <div className="alert alert-info">Your location is unknown.</div>
		} else if (this.state.location.status == 'working') {
			return <div className="alert alert-info">Working on locating you...</div>
		} else if (this.state.location.status == 'failed') {
			return <div className="alert alert-warning">Failed to locate you.</div>
		} else {
			return <div className="alert alert-danger">Unexpected location status</div>
		}
	}
})


var ParkingSpots = React.createClass({
	getInitialState: function() {
		return this.props.model.toJSON()
	},
	handleModelChange: function() {
		this.setState(this.props.model.toJSON())
	},
	componentDidMount: function() {
		console.log('ParkingSpots:componentDidMount')
		if (!('changeHandler' in this)) {
			this.changeHandler = _.bind(this.handleModelChange, this)
		}
		model.on('change', this.changeHandler)
	},
	componentWillUnmount: function() {
		console.log('ParkingSpots:componentDidUnmount')
		model.off('change', this.changeHandler)
	},
	genClickHandler: function(spot) {
		var _this = this
		return function () {
			_this.props.model.set({selected_spot: spot.id})
		}
	},
	render: function() {
		var locationNodes, _this = this
		if (this.state.parking_spots.status == 'ok') {
			locationNodes = this.state.parking_spots.locations.map(function(spot) {
				var className = "list-group-item spot"
				if (_this.state.selected_spot == spot.id) {
					className += " active"
				}
				return (
					<a key={'spot-' + spot.id} onClick={_this.genClickHandler(spot)} className={className}>
						<span className="pull-right">{spot.yr_inst}</span>
						{spot.location_name}
					</a>
					)
			})
			return (
				<div className="well">
					<h2>{locationNodes.length} Bike Parking Spots Found</h2>
					<div className="list-group">
						{locationNodes}
					</div>
				</div>
				)
		} else if (this.state.parking_spots.status == 'error') {
			return <div className="alert alert-warning">{this.state.parking_spots.error_message}</div>
		} else {
			return <div className="alert alert-danger">Unexpected parking spots status.</div>
		}
	}
})

var Directions = React.createClass({
	getInitialState: function() {
		return this.props.model.toJSON()
	},
	handleModelChange: function() {
		this.setState(this.props.model.toJSON())
	},
	componentDidMount: function() {
		console.log('Directions:componentDidMount')
		if (!('changeHandler' in this)) {
			this.changeHandler = _.bind(this.handleModelChange, this)
		}
		model.on('change', this.changeHandler)
	},
	componentWillUnmount: function() {
		console.log('Directions:componentDidUnmount')
		model.off('change', this.changeHandler)
	},
	render: function() {
		var legsNodes, routes, route
		if (this.state && 'routes' in this.state) {
			routes = this.state.routes
			// TODO for the moment we are choosing the
			// first route, eventually, we'd like folks
			// to be able to pick other routes
			route = routes.length ? routes[0] : null
			if (route && 'legs' in route) {
				legsNodes = route.legs.map(function (leg) {
					var stepsNodes = leg.steps.map(function (step) {
						return <div className="instructions" dangerouslySetInnerHTML={{__html: step.html_instructions}}/>
					})
					return <div className="leg">{stepsNodes}</div>
				})
				return <div className="legs">{legsNodes}</div>
			} else {
				return <div className="legs"><p>This journey has no known path.</p></div>
			}
		} else {
			return <div className="legs"><p>No directions are available, yet.</p></div>
		}
	}
})

var navbar = Navbar({model: model}, [])
var parking_spots = ParkingSpots({model: model}, [])
var directions = Directions({model: model}, [])
var your_location = YourLocation({model: model}, [])

$(function () {
	React.renderComponent(navbar, document.getElementById('navbar'))
	React.renderComponent(your_location, document.getElementById('your-location'))
	React.renderComponent(parking_spots, document.getElementById('parking-spots'))
	React.renderComponent(directions, document.getElementById('directions'))
})
