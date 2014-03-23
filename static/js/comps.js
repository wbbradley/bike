/** @jsx React.DOM */
var d = React.DOM

var Navbar = React.createClass({displayName: 'Navbar',
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
			React.DOM.div( {className:"navbar navbar-default navbar-fixed-top", role:"navigation"}, 
			React.DOM.div( {className:"container"}, 
				React.DOM.div( {className:"navbar-header"}, 
					React.DOM.button( {type:"button", className:"navbar-toggle", 'data-toggle':"collapse", 'data-target':".navbar-collapse"}, React.DOM.span( {className:"sr-only"}, "Toggle navigation"),React.DOM.span( {className:"icon-bar"}),React.DOM.span( {className:"icon-bar"}),React.DOM.span( {className:"icon-bar"})),
					React.DOM.a( {className:"navbar-brand", href:"#"}, "Bike")
				),
				React.DOM.div( {className:"navbar-collapse collapse"}, 
					React.DOM.ul( {className:"nav navbar-nav"}, 
						React.DOM.li( {className:"active"}, React.DOM.a( {href:"#"}, "Rack Finder"))
					)
				)
			)
		)
		)
	}
})


var YourLocation = React.createClass({displayName: 'YourLocation',
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
				React.DOM.div( {className:"alert alert-success"}, 
					React.DOM.h2(null, "Your location is ", this.state.location.coords.latitude,", ", this.state.location.coords.longitude)
				)
				)
		} else if (this.state.location.status == 'none') {
			return React.DOM.div( {className:"alert alert-info"}, "Your location is unknown.")
		} else if (this.state.location.status == 'working') {
			return React.DOM.div( {className:"alert alert-info"}, "Working on locating you...")
		} else if (this.state.location.status == 'failed') {
			return React.DOM.div( {className:"alert alert-warning"}, "Failed to locate you.")
		} else {
			return React.DOM.div( {className:"alert alert-danger"}, "Unexpected location status")
		}
	}
})


var ParkingSpots = React.createClass({displayName: 'ParkingSpots',
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
					React.DOM.a( {key:'spot-' + spot.id, onClick:_this.genClickHandler(spot), className:className}, 
						React.DOM.span( {className:"pull-right"}, spot.yr_inst),
						spot.location_name
					)
					)
			})
			return (
				React.DOM.div( {className:"well"}, 
					React.DOM.h2(null, locationNodes.length, " Bike Parking Spots Found"),
					React.DOM.div( {className:"list-group"}, 
						locationNodes
					)
				)
				)
		} else if (this.state.parking_spots.status == 'error') {
			return React.DOM.div( {className:"alert alert-warning"}, this.state.parking_spots.error_message)
		} else {
			return React.DOM.div( {className:"alert alert-danger"}, "Unexpected parking spots status.")
		}
	}
})

var Directions = React.createClass({displayName: 'Directions',
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
						return React.DOM.div( {className:"instructions", dangerouslySetInnerHTML:{__html: step.html_instructions}})
					})
					return React.DOM.div( {className:"leg"}, stepsNodes)
				})
				return React.DOM.div( {className:"legs"}, legsNodes)
			} else {
				return React.DOM.div( {className:"legs"}, React.DOM.p(null, "This journey has no known path."))
			}
		} else {
			return React.DOM.div( {className:"legs"}, React.DOM.p(null, "No directions are available, yet."))
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
