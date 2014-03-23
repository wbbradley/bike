@currentLocation = null

geoSuccess = (currentLocation) ->
  if currentLocation
    @currentLocation = currentLocation
    socket.emit 'find-nearest-query',
      target_class: 'bike-parking'
      limit: 10
      location: currentLocation

geoError = () ->
  # TODO - set some local state to inform user

geoOptions =
  enableHighAccuracy: true
  maximumAge: 30000
  timeout: 27000

navigator?.geolocation?.getCurrentPosition geoSuccess, geoError, geoOptions

@Location = Backbone.Model

socket = io.connect 'http://' + document.domain + ':' + window.location.port + '/live'

socket.on 'connect', ->
  @emit 'find-nearest-query',
    target_class: 'bike-parking'
    limit: 10
    location: @currentLocation

socket.on 'query-results', (data) ->
  console.dir(data)
  model.set
   results: data

socket.on 'directions', (data) ->
  console.dir(data)
  model.set
   directions: data


@model = model = new Backbone.Model
  hello: 'world'



getDirections = () ->
  results = if model.has('results') then model.get('results') else []
  if results.length > 0
    socket.emit 'get-directions',
      from: [0, 0]
      to: [0, 0]


@socket = socket
