/** @jsx React.DOM */
var d = React.DOM

var Navbar = React.createBackboneClass({
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


var YourLocation = React.createBackboneClass({
	// TODO (optimization) changeOptions: "change:location",
	render: function() {
		var location = this.props.model.get('location')
		if (location.status == 'found') {
			return (
				React.DOM.div( {className:"alert alert-success"}, 
					React.DOM.h2(null, "Your location is ", location.coords.latitude,", ", location.coords.longitude)
				)
				)
		} else if (location.status == 'none') {
			return React.DOM.div( {className:"alert alert-info"}, "Your location is unknown.")
		} else if (location.status == 'waiting') {
			return React.DOM.div( {className:"alert alert-info"}, "Working on locating you...")
		} else if (location.status == 'error') {
			return React.DOM.div( {className:"alert alert-warning"}, "Failed to locate you.")
		} else {
			return React.DOM.div( {className:"alert alert-danger"}, "Unexpected location status")
		}
	}
})


var ParkingSpots = React.createBackboneClass({
	genClickHandler: function(spot) {
		var _this = this
		return function () {
			// The basic idea here of not implementing all the control
			// logic in this class is just a general separation of view
			// and view-controller -> model-changing concerns.
			selectSpot(_this.props.model, spot)
		}
	},
	render: function() {
		var locationNodes, _this = this
		var parking_spots = this.props.model.get('parking_spots')
		var selected_spot = this.props.model.get('selected_spot')

		if (parking_spots.status == 'ok') {
			locationNodes = parking_spots.locations.map(function(spot) {
				var className = "list-group-item spot"
				if (selected_spot == spot.id) {
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
		} else if (parking_spots.status == 'error') {
			return React.DOM.div( {className:"alert alert-warning"}, parking_spots.error_message)
		} else {
			return React.DOM.div( {className:"alert alert-danger"}, "Unexpected parking spots status.")
		}
	}
})

var Directions = React.createBackboneClass({
	render: function() {
		var legsNodes, routes, route
		var directions = this.props.model.get('directions')
		var selected_spot = this.props.model.get('selected_spot')

		if (directions.status == 'ok') {
			routes = directions.routes
			// TODO for the moment we are choosing the
			// first route, eventually, we'd like folks
			// to be able to pick other routes
			route = routes[0]
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
