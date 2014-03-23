/** @jsx React.DOM */
var d = React.DOM

var Navbar = React.createBackboneClass({
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


var YourLocation = React.createBackboneClass({
	// TODO (optimization) changeOptions: "change:location",
	render: function() {
		var location = this.props.model.get('location')
		if (location.status == 'found') {
			return (
				<div className="alert alert-success">
					<h2>Your location is {location.coords.latitude}, {location.coords.longitude}</h2>
				</div>
				)
		} else if (location.status == 'none') {
			return <div className="alert alert-info">Your location is unknown.</div>
		} else if (location.status == 'waiting') {
			return <div className="alert alert-info">Working on locating you...</div>
		} else if (location.status == 'error') {
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

		if (parking_spots.status == 'ok') {
			locationNodes = parking_spots.locations.map(function(spot) {
				var className = "list-group-item spot"
				if (selected_spot == spot.id) {
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
		} else if (parking_spots.status == 'error') {
			return <div className="alert alert-warning">{parking_spots.error_message}</div>
		} else {
			return <div className="alert alert-danger">Unexpected parking spots status.</div>
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
