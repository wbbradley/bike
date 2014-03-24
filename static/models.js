// Generated by CoffeeScript 1.7.1
var Bike, StatusChoices, geoError, geoOptions, geoSuccess, getDirections, model, selectSpot, socket, startGeolocation,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StatusChoices = (function() {
  function StatusChoices() {}

  StatusChoices.Ok = 'ok';

  StatusChoices.Empty = 'empty';

  StatusChoices.Waiting = 'waiting';

  StatusChoices.Error = 'error';

  return StatusChoices;

})();

geoSuccess = function(current_location) {
  if (current_location) {
    model.set({
      location: {
        timestamp: current_location.timestamp,
        coords: current_location.coords,
        status: 'ok'
      }
    });
    return socket.emit('find-nearest-query', {
      target_class: 'bike-parking',
      limit: 10,
      location: model.get('location')
    });
  }
};

geoError = function() {
  console.warn('Failure acquiring geoLocation data');
  return model.set({
    location: {
      timestamp: (new Date()).getTime() / 1000.0,
      coords: null,
      status: StatusChoices.Error
    }
  });
};

geoOptions = {
  enableHighAccuracy: true,
  maximumAge: 30000,
  timeout: 27000
};

this.Location = Backbone.Model;

socket = io.connect('http://' + document.domain + ':' + window.location.port + '/live');

socket.on('connect', function() {
  var _ref;
  if (((_ref = model.get('location')) != null ? _ref.status : void 0) === StatusChoices.Ok) {
    model.set({
      parking_spots: {
        status: StatusChoices.Waiting
      }
    });
    return this.emit('find-nearest-query', {
      target_class: 'bike-parking',
      limit: 10,
      location: model.get('location')
    });
  } else {
    return model.set({
      parking_spots: {
        status: StatusChoices.Empty
      }
    });
  }
});

socket.on('bike-parking-results', function(results) {
  var _ref, _ref1;
  console.log('bike-parking-results');
  console.dir(results);
  model.set({
    parking_spots: results
  });
  return selectSpot(model, (_ref = model.get('parking_spots')) != null ? (_ref1 = _ref.locations) != null ? _ref1[0] : void 0 : void 0);
});

socket.on('directions', function(data) {
  console.log('directions');
  console.dir(data);
  return model.set({
    directions: data
  });
});

Bike = (function(_super) {
  __extends(Bike, _super);

  function Bike() {
    this.initialize = __bind(this.initialize, this);
    this.clear = __bind(this.clear, this);
    return Bike.__super__.constructor.apply(this, arguments);
  }

  Bike.prototype.clear = function() {
    return this.set({
      location: {
        status: StatusChoices.Empty
      },
      parking_spots: {
        status: StatusChoices.Empty
      },
      selected_spot: null,
      directions: {
        status: StatusChoices.Empty
      }
    });
  };

  Bike.prototype.initialize = function() {
    Bike.__super__.initialize.apply(this, arguments);
    return this.clear;
  };

  return Bike;

})(Backbone.Model);

this.model = model = new Bike;

startGeolocation = function() {
  var _ref;
  model.clear();
  model.set({
    location: {
      status: StatusChoices.Waiting
    }
  });
  return typeof navigator !== "undefined" && navigator !== null ? (_ref = navigator.geolocation) != null ? _ref.getCurrentPosition(geoSuccess, geoError, geoOptions) : void 0 : void 0;
};

$(function() {
  return startGeolocation();
});

getDirections = function(model) {
  var current_location, parking_spots, selected_spot;
  parking_spots = model.get('parking_spots');
  current_location = model.get('location');
  selected_spot = model.get('selected_spot');
  if (selected_spot && (current_location != null ? current_location.status : void 0) === 'ok') {
    model.set({
      directions: {
        status: StatusChoices.Waiting
      }
    });
    return socket.emit('get-directions', {
      origin: {
        latitude: current_location.coords.latitude,
        longitude: current_location.coords.longitude
      },
      destination: {
        latitude: selected_spot.coord_latitude,
        longitude: selected_spot.coord_longitude
      },
      travel_mode: 'bicycling'
    });
  } else {
    return console.warn("We don't yet have results from our bike-parking query.");
  }
};

selectSpot = function(model, spot) {
  model.set({
    selected_spot: spot
  });
  return getDirections(model);
};

this.socket = socket;