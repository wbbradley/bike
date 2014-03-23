# model contains a location
# location can be one of:
#   'none'
#   'working'
#   'found'
#   'failed'
# TODO: handle motion

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
      status: 'failed'

geoOptions =
  enableHighAccuracy: true
  maximumAge: 30000
  timeout: 27000

@Location = Backbone.Model

socket = io.connect 'http://' + document.domain + ':' + window.location.port + '/live'

socket.on 'connect', ->
  @emit 'find-nearest-query',
    target_class: 'bike-parking'
    limit: 10
    location: model.get('location')

socket.on 'bike-parking-results', (parking_spots) ->
  console.dir(parking_spots)
  model.set
   parking_spots: parking_spots

socket.on 'directions', (data) ->
  console.dir(data)
  model.set
   routes: data


@model = model = new Backbone.Model
  location:
    status: 'none'

$ ->
  model.set
    location:
      status: 'working'
  navigator?.geolocation?.getCurrentPosition geoSuccess, geoError, geoOptions


getDirections = () ->
  # Let's query the server for directions.
  # First, let's make sure we know where we're going and where we are
  parking_spots = model.get('parking_spots')
  current_location = model.get('location')

  if parking_spots?.length > 0 && current_location?.status is 'found'
    parking_spot = parking_spots[0]
    model.set
      directions:
        status: 'working'

    socket.emit 'get-directions',
      origin:
        latitude: current_location.coords.latitude
        longitude: current_location.coords.longitude
      destination:
        latitude: parking_spot.bike_parking.coord_latitude
        longitude: parking_spot.bike_parking.coord_longitude
      travel_mode: 'bicycling'
  else
    console.warn "We don't yet have results from our bike-parking query."


@socket = socket
