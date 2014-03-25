/** @jsx React.DOM */
var d = React.DOM

var Navbar = React.createBackboneClass({
	getInitialState: function() {
		return {searchText: ''}
	},
	handleSearchTextChange: function (event) {
		this.setState({searchText: event.target.value})
	},
	search: function(event) {
		window.event.preventDefault()
		startGeolocation({
			useSensor: false,
			search: this.state.searchText
		})
	},
	render: function() {
		var location = this.props.model.get('location')

		return (
			React.DOM.div( {className:"navbar navbar-default navbar-fixed-top", role:"navigation"}, 
				React.DOM.div( {className:"container"}, 
					React.DOM.div( {className:"navbar-header"}, 
						React.DOM.button( {type:"button", className:"navbar-toggle", 'data-toggle':"collapse", 'data-target':".navbar-collapse"}, React.DOM.span( {className:"sr-only"}, "Toggle navigation"),React.DOM.span( {className:"icon-bar"}),React.DOM.span( {className:"icon-bar"}),React.DOM.span( {className:"icon-bar"})),
						React.DOM.a( {className:"navbar-brand brand-image"}, React.DOM.img( {src:"/static/img/nearbyparking.svg"})),
						React.DOM.a( {className:"navbar-brand"}, "nearbyparking.co")
					),
					React.DOM.div( {className:"navbar-collapse collapse"}, 
						React.DOM.ul( {className:"nav navbar-nav"}, 
							React.DOM.li(null, 
								React.DOM.form( {className:"navbar-form", role:"search"}, 
									React.DOM.div( {className:"form-group"}, 
										React.DOM.input( {type:"text", className:"form-control", onChange:this.handleSearchTextChange, placeholder:"Try another location..."} )
									)," ",
									React.DOM.button( {onClick:this.search, className:"btn btn-default"}, "Search")
								)
							)
						),
						React.DOM.ul( {className:"nav navbar-nav navbar-right"}, 
							React.DOM.li(null, React.DOM.a( {href:"javascript:startGeolocation({useSensor:true})"}, React.DOM.i( {className:"fa fa-location-arrow"}), " Refresh"))
						)
					)
				)
			)
			)
	}
})


var YourLocation = React.createBackboneClass({
	getFriendly: function() {
		var geoloc = this.props.model.get('geoloc')
		if (geoloc && 'friendly' in geoloc) {
			return geoloc.friendly
		} else {
			return null
		}
	},
	render: function() {
		var url, end_coords, label
		var route, path, paths

		var location = this.props.model.get('location')
		var geoloc = this.props.model.get('geoloc')
		var directions = this.props.model.get('directions')
		var selected_spot = this.props.model.get('selected_spot')
		var parking_spots = this.props.model.get('parking_spots')

		if (location.status == StatusChoices.Ok) {
			url = "http://maps.googleapis.com/maps/api/staticmap?size=640x480&scale=2&maptype=roadmap&sensor=true"

			// Add markers for all of our results
			if (parking_spots.status == StatusChoices.Ok) {
				_.forEach(parking_spots.locations, function (spot) {
					var color = 'yellow'
					if (selected_spot && (spot.id == selected_spot.id)) {
					   color = 'blue'
					}
					url += "&markers=" + encodeURIComponent("color:" + color + "|label:" + spot._label + "|" + spot.coord_latitude + "," + spot.coord_longitude)
				})
			} else {
				console.warn("Couldn't find valid parking spots to label.")
			}

			if (directions.status == StatusChoices.Ok && selected_spot) {
				end_coords = '' + selected_spot.coord_latitude + ',' + selected_spot.coord_longitude
				routes = directions.routes
				route = routes[0]
				paths = ''
				_.forEach(route.legs, function (leg) {
					_.forEach(leg.steps, function (step) {
						if (('polyline' in step) && ('points' in step.polyline)) {
							paths += '&path=color:0xFE9700|enc:' + encodeURIComponent(step.polyline.points)
						} else {
							console.warn("Couldn't find polyline points for route.")
						}
					})
				})
				if (paths.length + url.length < 2000) {
					url += paths
				}
			} else {
				url += "&center=" + location.coords.latitude + "," + location.coords.longitude
				url += "&zoom=16"
			}
			var friendlyDiv
			if (geoloc.friendly) {
				friendlyHeader = React.DOM.p(null, geoloc.friendly)
			} else {
				friendlyHeader = null
			}
			return (
				React.DOM.div( {className:"your-location well"}, 
					friendlyHeader,
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
			if (parking_spots.locations.length > 0) {
				locationInfo = parking_spots.locations.map(function(spot) {
					var className = "list-group-item spot"
					var href = "javascript:selectSpot(model, " + spot.id + ");event.preventDefault()"
					if (selected_spot && selected_spot.id == spot.id) {
						className += " active"
					}
					streetview_url = "http://maps.googleapis.com/maps/api/streetview?size=128x128&location=" + spot.coord_latitude + "," + spot.coord_longitude + "&fov=90&heading=235&pitch=10&sensor=true"
					return (
						React.DOM.a( {href:href, key:'spot-' + spot.id, className:className}, 
							React.DOM.div( {className:"row"}, 
								React.DOM.div( {className:"col-xs-4 col-sm-3"}, 
									React.DOM.img( {src:streetview_url} )
								),
								React.DOM.div( {className:"col-xs-8 col-sm-9"}, 
									React.DOM.h5(null, spot._label,". ", spot.location_name),
									React.DOM.p(null, spot.yr_inst)
								)
							)
						)
						)
				})
			} else {
				locationInfo = React.DOM.p(null, "No parking options are available near this location right now.")
			}
			return (
				React.DOM.div( {className:"well"}, 
					React.DOM.h3(null, "Parking options"),
					React.DOM.div( {className:"list-group"}, 
						locationInfo
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
								React.DOM.div( {className:"distance"}, React.DOM.span( {className:"label label-default"}, step.distance.text)),
								React.DOM.span( {dangerouslySetInnerHTML:{__html: step.html_instructions}})
							)
							)
					})
					return React.DOM.ol( {className:"instructions"}, stepsNodes)
				})
				streetview_url = "http://maps.googleapis.com/maps/api/streetview?size=640x240&location=" + selected_spot.coord_latitude + "," + selected_spot.coord_longitude + "&fov=180&sensor=true"
				return (
					React.DOM.div( {className:"directions well"}, 
						React.DOM.div( {className:"preview", style:{'background-image': 'url(' + streetview_url + ')'}}, 
							React.DOM.div( {className:"darken"}, 
								React.DOM.h3(null, selected_spot.yr_inst)
							)
						),
						React.DOM.h4(null, route.summary),
						React.DOM.div( {className:"legs"}, legsNodes),
						React.DOM.div( {className:"copyright"}, route.copyrights)
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
				React.DOM.div( {class:"page-header"}, 
					React.DOM.h1(null, "nearbyparking.co ", React.DOM.small(null, "remember your lock!")),
					React.DOM.p(null, 
						"Welcome to nearbyparking.co. This site is designed to let"+' '+
						"you quickly find a parking spot for your bike. Data is"+' '+
						"sourced from ", React.DOM.a( {href:"https://data.sfgov.org/Transportation/Bicycle-Parking-Public-/w969-5mn4"}, "Data SF: Bicycle Parking"),"."
					),
					React.DOM.p(null, 
						"After you’ve located yourself on the map, try selecting alternate parking locations."
					)
				),
				YourLocation( {model:this.props.model}),
				React.DOM.div( {className:"row"}, 
					React.DOM.div( {className:"col-xs-12 col-sm-6"}, 
						ParkingSpots( {model:this.props.model})
					),
					React.DOM.div( {className:"col-xs-12 col-sm-6"}, 
						Directions( {model:this.props.model})
					)
				),
				React.DOM.p(null, 
					"Thanks for visiting."
				)
			)
			)
	}
})

$(function () {
	React.initializeTouchEvents(true)
	React.renderComponent(Navbar( {model:model}), document.getElementById('navbar'))
	React.renderComponent(MainContent( {model:model}), document.getElementById('main-content'))
})
