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
			<div className="navbar navbar-default navbar-fixed-top" role="navigation">
				<div className="container">
					<div className="navbar-header">
						<button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse"><span className="sr-only">Toggle navigation</span><span className="icon-bar"></span><span className="icon-bar"></span><span className="icon-bar"></span></button>
						<a className="navbar-brand" href="#">Find Bike Racks</a>
					</div>
					<div className="navbar-collapse collapse">
						<ul className="nav navbar-nav">
							<li>
								<form className="navbar-form" role="search">
									<div className="form-group">
										<input type="text" className="form-control" onChange={this.handleSearchTextChange} placeholder='Try another location...' />
									</div>&nbsp;
									<button onClick={this.search} className="btn btn-default">Search</button>
								</form>
							</li>
						</ul>
						<ul className="nav navbar-nav navbar-right">
							<li><a href="javascript:startGeolocation({useSensor:true})"><i className="fa fa-location-arrow"/> Refresh</a></li>
						</ul>
					</div>
				</div>
			</div>
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
				friendlyHeader = <p>{geoloc.friendly}</p>
			} else {
				friendlyHeader = null
			}
			return (
				<div className="your-location well">
					{friendlyHeader}
					<div className="map-image">
						<img src={url} />
					</div>
				</div>
				)
		} else if (location.status == StatusChoices.Empty) {
			return <div className="alert alert-info">Your location is unknown.</div>
		} else if (location.status == StatusChoices.Waiting) {
			return <div className="alert alert-info"><i className="fa fa-spinner fa-spin"/> Working on locating you...</div>
		} else if (location.status == StatusChoices.Error) {
			return <div className="alert alert-warning">Failed to locate you.</div>
		} else {
			return <div className="alert alert-danger">Unexpected location status</div>
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
						<a href={href} key={'spot-' + spot.id} className={className}>
							<div className="row">
								<div className="col-xs-4 col-sm-3">
									<img src={streetview_url} />
								</div>
								<div className="col-xs-8 col-sm-9">
									<h5>{spot._label}. {spot.location_name}</h5>
									<p>{spot.yr_inst}</p>
								</div>
							</div>
						</a>
						)
				})
			} else {
				locationInfo = <p>No parking options are available near this location right now.</p>
			}
			return (
				<div className="well">
					<h3>Parking options</h3>
					<div className="list-group">
						{locationInfo}
					</div>
				</div>
				)
		} else if (parking_spots.status == StatusChoices.Empty) {
			return <div/>
		} else if (parking_spots.status == StatusChoices.Waiting) {
			return <div className="alert alert-info"><i className="fa fa-icon fa-spin"/> Fetching a list of parking spots for you...</div>
		} else if (parking_spots.status == StatusChocies.Error) {
			return <div className="alert alert-warning">{parking_spots.error_message}</div>
		} else {
			return <div className="alert alert-danger">Unexpected parking spots status.</div>
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
							<li className="step">
								<div className="distance"><span className="label label-default">{step.distance.text}</span></div>
								<span dangerouslySetInnerHTML={{__html: step.html_instructions}}/>
							</li>
							)
					})
					return <ol className="instructions">{stepsNodes}</ol>
				})
				streetview_url = "http://maps.googleapis.com/maps/api/streetview?size=640x240&location=" + selected_spot.coord_latitude + "," + selected_spot.coord_longitude + "&fov=180&sensor=true"
				return (
					<div className="directions well">
						<div className="preview" style={{'background-image': 'url(' + streetview_url + ')'}}>
							<div className="darken">
								<h3>{selected_spot.yr_inst}</h3>
							</div>
						</div>
						<h4>{route.summary}</h4>
						<div className="legs">{legsNodes}</div>
						<div className="copyright">{route.copyrights}</div>
					</div>
					)
			} else {
				return (
					<div className="directions">
						<p>This journey has no known path.</p>
					</div>
					)
			}
		} else if (directions.status == StatusChoices.Empty) {
			return (
				<div className="directions"></div>
				)
		} else if (directions.status == StatusChoices.Error) {
			return (
				<div className="directions">
					<div className="alert alert-warning">An error occurred while fetching those directions for you. Please try again later.</div>
				</div>
				)
		} else if (directions.status == StatusChoices.Waiting) {
			return (
				<div className="directions">
					<p>
						<i className='fa fa-spinner fa-spin'/> Fetching directions...
					</p>
				</div>
				)
		}
	}
})

var MainContent = React.createClass({
	render: function() {
		return (
			<div>
				<YourLocation model={this.props.model}/>
				<div className="row">
					<div className="col-xs-12 col-sm-6">
						<ParkingSpots model={this.props.model}/>
					</div>
					<div className="col-xs-12 col-sm-6">
						<Directions model={this.props.model}/>
					</div>
				</div>
			</div>
			)
	}
})

$(function () {
	React.initializeTouchEvents(true)
	React.renderComponent(<Navbar model={model}/>, document.getElementById('navbar'))
	React.renderComponent(<MainContent model={model}/>, document.getElementById('main-content'))
})
