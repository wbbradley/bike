/** @jsx React.DOM */
var d = React.DOM

var Navbar = React.createClass({displayName: 'Navbar',
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
});

var navbar = Navbar({model: model}, [])

$(function () {
	React.renderComponent(navbar, document.getElementById('navbar'))
})
