# all asynchronous model properties contain a status
# # variable which can take one of the following states:
#   'none'
#   'waiting'
#   'found'
#   'error'

geoSuccess = (current_location) ->
  if current_location
    model.set
      location:
        timestamp: current_location.timestamp
        coords: current_location.coords
        status: 'found'

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
      status: 'error'

geoOptions =
  enableHighAccuracy: true
  maximumAge: 30000
  timeout: 27000

@Location = Backbone.Model

socket = io.connect 'http://' + document.domain + ':' + window.location.port + '/live'

socket.on 'connect', ->
  model.set
   parking_spots:
     status: 'searching'
  @emit 'find-nearest-query',
    target_class: 'bike-parking'
    limit: 10
    location: model.get('location')

socket.on 'bike-parking-results', (results) ->
  console.log('bike-parking-results')
  console.dir(results)
  model.set
   parking_spots: results
   selected_spot: if (results.length > 0) then results[0].id else null

socket.on 'directions', (data) ->
  console.log('directions')
  console.dir(data)
  model.set
   directions: data


# Initialize the client side app model
@model = model = new Backbone.Model
  location:
    status: 'none'
  parking_spots:
    status: 'none'
  selected_spot: null
  directions:
    status: 'none'

$ ->
  model.set
    location:
      status: 'waiting'
  navigator?.geolocation?.getCurrentPosition geoSuccess, geoError, geoOptions


getDirections = (model) ->
  # Let's query the server for directions.
  # First, let's make sure we know where we're going and where we are
  parking_spots = model.get('parking_spots')
  current_location = model.get('location')
  selected_spot = model.get('selected_spot')

  if selected_spot and parking_spots?.status is 'ok' and current_location?.status is 'found'
    parking_spot = _.find parking_spots.locations, id: selected_spot
    model.set
      directions:
        status: 'waiting'

    socket.emit 'get-directions',
      origin:
        latitude: current_location.coords.latitude
        longitude: current_location.coords.longitude
      destination:
        latitude: parking_spot.coord_latitude
        longitude: parking_spot.coord_longitude
      travel_mode: 'bicycling'
  else
    console.warn "We don't yet have results from our bike-parking query."

selectSpot = (model, spot) ->
  if model.get('selected_spot') isnt spot.id
    model.set
      selected_spot: spot.id
    getDirections model

@socket = socket
