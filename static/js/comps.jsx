/** @jsx React.DOM */
var d = React.DOM

var Navbar = React.createClass({
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
});

var navbar = Navbar({model: model}, [])

$(function () {
	React.renderComponent(navbar, document.getElementById('navbar'))
})
