from flask import Flask, render_template
from flaskext.lesscss import lesscss
from flask.ext.socketio import SocketIO, emit
from models import import_location_data, Location, haversine

import logging
LOG = logging.getLogger('bike')

global app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'Uber is Cool'
socketio = SocketIO(app)


# A note about Flask-SocketIO: the emit call will look at the global request
# object. A smell, for sure, but fun to use for small lightweight projects.

@socketio.on('refresh', namespace='/live')
def io_refresh_location_data(data):
    import_location_data()
    emit('location-data', [Location.serialize(location) for location in Location.select()])


@socketio.on('find-nearest-query', namespace='/live')
def io_find_nearest_query(query):
    if 'location' in query:
        # choose some reasonable defaults for now
        query.setdefault('target_class', 'bike-parking')
        query.setdefault('limit', 10)

        # IGNORE target_class for now
        LOG.debug(u"User is at " + str(query['location']))
        LOG.debug(u"Let's find the {} nearest {}".format(query['limit'], query['target_class']))
        longitude = query.get('location', {}).get('coords', {}).get('longitude', None)
        latitude = query.get('location', {}).get('coords', {}).get('latitude', None)
        results = []
        if longitude and latitude:
            for location in Location.select():
                km_distance = haversine(longitude, latitude,
                    location.coord_longitude, location.coord_latitude)

                # NOTE: Reverse priority queue would be a more optimal way of doing this insertion.
                # NOTE: See slicing below.
                results.append({
                    'km_distance': km_distance,
                    'bike_parking': location.serialize()
                    })
            limit = query.get('limit')
            emit('query-results', sorted(results, key=lambda x:x['km_distance'])[:limit])
        else:
            LOG.error("No lat/lon in location query")


@socketio.on('get-directions', namespace='/live')
def io_get_directions(query):
    # HACK
    emit('directions', [location.coords() for location in Location.select().limit(4)])

    # http://open.mapquestapi.com/directions/v2/route?key=YOUR_KEY_HERE&ambiguities=ignore&from=Lancaster,PA&to=York,PA&callback=renderNarrativeP


@app.route('/')
def mainpage():
    return render_template('index.html')


def runserver(opts, port=8000, host=None):
    # Flask Global SMELL
    global app

    app.debug = opts.debug
    app.static_path = '/static'

    # turn on automatic LESS file compilation
    lesscss(app)

    # put a nice Socket IO treatment around the whole app
    socketio.run(app, port=port, host=host)
