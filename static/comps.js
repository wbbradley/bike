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
		var url, coords, label
		var route, path

		var location = this.props.model.get('location')
		var directions = this.props.model.get('directions')
		var selected_spot = this.props.model.get('selected_spot')
		var sep

		if (location.status == StatusChoices.Ok) {
			coords = '' + location.coords.latitude + ',' + location.coords.longitude
			label = encodeURIComponent('Current Loc')
			url = "http://maps.googleapis.com/maps/api/staticmap?center=" + encodeURIComponent(coords) + "&zoom=17&size=600x300&maptype=roadmap&markers=color:blue|label:" + label + "|" + coords + "&sensor=false"
			if (directions.status == StatusChoices.Ok && selected_spot) {
				routes = directions.routes
				route = routes[0]

				path = '' + coords
				_.forEach(route.legs, function (leg) {
					_.forEach(leg.steps, function (step) {
						path += '|' + step.start_location.lat + ',' + step.start_location.lng
						path += '|' + step.end_location.lat + ',' + step.end_location.lng
					})
				})
				url += '&path=' + encodeURIComponent(path)
			}

			return (
				React.DOM.div( {className:"alert alert-success"}, 
					React.DOM.h2(null, "Your location is ", location.coords.latitude,", ", location.coords.longitude),
					React.DOM.div( {className:"map-image"}, 
						React.DOM.img( {src:url} )
					)
				)
				)
		} else if (location.status == StatusChoices.Empty) {
			return React.DOM.div( {className:"alert alert-info"}, "Your location is unknown.")
		} else if (location.status == StatusChoices.Waiting) {
			return React.DOM.div( {className:"alert alert-info"}, React.DOM.i( {className:"fa fa-spinner fa-spin"}), " Working on locating you...")
		} else if (location.status == StatusChoices.Error) {
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

		if (parking_spots.status == StatusChoices.Ok) {
			locationNodes = parking_spots.locations.map(function(spot) {
				var className = "list-group-item spot"
				if (selected_spot && selected_spot.id == spot.id) {
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
		} else if (parking_spots.status == StatusChoices.Empty) {
			return React.DOM.div(null)
		} else if (parking_spots.status == StatusChoices.Waiting) {
			return React.DOM.div( {className:"alert alert-info"}, React.DOM.i( {className:"fa fa-icon fa-spin"}), " Fetching a list of parking spots for you...")
		} else if (parking_spots.status == StatusChocies.Error) {
			return React.DOM.div( {className:"alert alert-warning"}, parking_spots.error_message)
		} else {
			return React.DOM.div( {className:"alert alert-danger"}, "Unexpected parking spots status.")
		}
	}
})

var Directions = React.createBackboneClass({
	render: function() {
		var _this = this
		var legsNodes, routes, route
		var directions = this.props.model.get('directions')
		var selected_spot = this.props.model.get('selected_spot')

		if (directions.status == StatusChoices.Ok && selected_spot) {
			routes = directions.routes
			// NOTE for the moment we are choosing the
			// first route, eventually, we'd like folks
			// to be able to pick other routes
			route = routes[0]
			if (route && 'legs' in route) {
				legsNodes = route.legs.map(function (leg) {
					var stepsNodes = leg.steps.map(function (step) {
						return (
							React.DOM.li( {className:"step"}, 
								React.DOM.div( {className:"distance"}, step.distance.text),
								React.DOM.span( {dangerouslySetInnerHTML:{__html: step.html_instructions}})
							)
							)
					})
					return React.DOM.ol( {className:"instructions"}, stepsNodes)
				})
				return (
					React.DOM.div( {className:"directions"}, 
						React.DOM.h2(null, "Directions to ", selected_spot.yr_inst),
						React.DOM.h3(null, "Summary: ", route.summary),
						React.DOM.div( {className:"legs"}, legsNodes)
					)
					)
			} else {
				return (
					React.DOM.div( {className:"directions"}, 
						React.DOM.p(null, "This journey has no known path.")
					)
					)
			}
		} else if (directions.status == StatusChoices.Empty) {
			return (
				React.DOM.div( {className:"directions"})
				)
		} else if (directions.status == StatusChoices.Error) {
			return (
				React.DOM.div( {className:"directions"}, 
					React.DOM.div( {className:"alert alert-warning"}, "An error occurred while fetching those directions for you. Please try again later.")
				)
				)
		} else if (directions.status == StatusChoices.Waiting) {
			return (
				React.DOM.div( {className:"directions"}, 
					React.DOM.p(null, 
						React.DOM.i( {className:"fa fa-spinner fa-spin"}), " Fetching directions..."
					)
				)
				)
		}
	}
})

var MainContent = React.createClass({displayName: 'MainContent',
	render: function() {
		return (
			React.DOM.div(null, 
				YourLocation( {model:this.props.model}),
				React.DOM.div( {className:"row"}, 
					React.DOM.div( {className:"col-xs-12 col-sm-6"}, 
						ParkingSpots( {model:this.props.model})
					),
					React.DOM.div( {className:"col-xs-12 col-sm-6"}, 
						Directions( {model:this.props.model})
					)
				)
			)
			)
	}
})

$(function () {
	React.renderComponent(Navbar( {model:model}), document.getElementById('navbar'))
	React.renderComponent(MainContent( {model:model}), document.getElementById('main-content'))
})
