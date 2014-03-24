# all asynchronous model properties contain a status
# # variable which can take one of the following states:
class StatusChoices
  @Ok = 'ok'
  @Empty = 'empty'
  @Waiting = 'waiting'
  @Error = 'error'

geoSuccess = (current_location) ->
  if current_location
    model.set
      location:
        timestamp: current_location.timestamp
        coords: current_location.coords
        status: 'ok'

    socket.emit 'find-nearest-query',
      target_class: 'bike-parking'
      limit: 10
      location: model.get('location')

geoError = () ->
  console.warn('Failure acquiring geoLocation data')
  model.set
    location:
      timestamp: (new Date()).getTime() / 1000.0
      coords: null
      status: StatusChoices.Error

geoOptions =
  enableHighAccuracy: true
  maximumAge: 30000
  timeout: 27000

@Location = Backbone.Model

socket = io.connect 'http://' + document.domain + ':' + window.location.port + '/live'

socket.on 'connect', ->
  if model.get('location')?.status is StatusChoices.Ok
    model.set
     parking_spots:
       status: StatusChoices.Waiting
    @emit 'find-nearest-query',
      target_class: 'bike-parking'
      limit: 10
      location: model.get('location')
  else
    model.set
     parking_spots:
       status: StatusChoices.Empty

socket.on 'bike-parking-results', (results) ->
  console.log('bike-parking-results')
  console.dir(results)

  # stash the parking spot results in our data model
  model.set
   parking_spots: results

  # Go ahead and select the first result for the user
  selectSpot model, model.get('parking_spots')?.locations?[0]


socket.on 'directions', (data) ->
  console.log('directions')
  console.dir(data)
  model.set
   directions: data

class Bike extends Backbone.Model
  clear: =>
    @set
      location:
        status: StatusChoices.Empty
      parking_spots:
        status: StatusChoices.Empty
      selected_spot: null
      directions:
        status: StatusChoices.Empty

  initialize: =>
    super
    @clear

# Initialize the client side app model
@model = model = new Bike

startGeolocation = ->
  model.clear()
  model.set
    location:
      status: StatusChoices.Waiting
  navigator?.geolocation?.getCurrentPosition geoSuccess, geoError, geoOptions


# upon page load, let's go ahead and start the geolocation process
$ -> do startGeolocation

getDirections = (model) ->
  # Let's query the server for directions.
  # First, let's make sure we know where we're going and where we are
  parking_spots = model.get('parking_spots')
  current_location = model.get('location')
  selected_spot = model.get('selected_spot')

  if selected_spot and current_location?.status is 'ok'
    model.set
      directions:
        status: StatusChoices.Waiting

    socket.emit 'get-directions',
      origin:
        latitude: current_location.coords.latitude
        longitude: current_location.coords.longitude
      destination:
        latitude: selected_spot.coord_latitude
        longitude: selected_spot.coord_longitude
      travel_mode: 'bicycling'
  else
    console.warn "We don't yet have results from our bike-parking query."

selectSpot = (model, spot) ->
  model.set selected_spot: spot
  getDirections model

@socket = socket
