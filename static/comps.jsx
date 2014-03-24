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
				<div className="alert alert-success">
					<h2>Your location is {location.coords.latitude}, {location.coords.longitude}</h2>
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
			locationNodes = parking_spots.locations.map(function(spot) {
				var className = "list-group-item spot"
				if (selected_spot && selected_spot.id == spot.id) {
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
								<div className="distance">{step.distance.text}</div>
								<span dangerouslySetInnerHTML={{__html: step.html_instructions}}/>
							</li>
							)
					})
					return <ol className="instructions">{stepsNodes}</ol>
				})
				return (
					<div className="directions">
						<h2>Directions to {selected_spot.yr_inst}</h2>
						<h3>Summary: {route.summary}</h3>
						<div className="legs">{legsNodes}</div>
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
	React.renderComponent(<Navbar model={model}/>, document.getElementById('navbar'))
	React.renderComponent(<MainContent model={model}/>, document.getElementById('main-content'))
})
