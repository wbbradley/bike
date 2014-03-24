from flask import Flask, render_template
from flask.ext.socketio import SocketIO, emit
from models import Location, haversine, StatusChoices
import requests
import logging


LOG = logging.getLogger('bike')

global app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'Uber is Cool'
socketio = SocketIO(app)


# A note about Flask-SocketIO: the emit call will look at the global request
# object. A smell, for sure, but fun to use for small lightweight projects.


@socketio.on('find-nearest-query', namespace='/live')
def io_find_nearest_query(query):
    if 'location' in query:
        # choose some reasonable defaults for now
        query.setdefault('target_class', 'bike-parking')
        query.setdefault('limit', 10)
        query.setdefault('max_distance', 1000)

        # IGNORE target_class for now
        LOG.debug(u"User is at " + str(query['location']))
        LOG.debug(u"Let's find the {} nearest {}".format(query['limit'], query['target_class']))
        longitude = query.get('location', {}).get('coords', {}).get('longitude', None)
        latitude = query.get('location', {}).get('coords', {}).get('latitude', None)
        results = []
        if longitude and latitude:
            for location in Location.select().filter(Location.location_name != '_undetermined'):
                km_distance = haversine(longitude, latitude,
                    location.coord_longitude, location.coord_latitude)
                if km_distance < query['max_distance']:
                    # NOTE: Reverse priority queue would be a more optimal way of doing this insertion.
                    # NOTE: See slicing below.
                    results.append({
                        'km_distance': km_distance,
                        'location': location.serialize()
                        })
                else:
                    LOG.info('Filtering out {} because it is {}km away.'.format(location.yr_inst, km_distance))
            limit = query.get('limit')
            LOG.info("Found {} parking spots".format(len(results)))
            emit('bike-parking-results', {
                'status': StatusChoices.Ok,
                'locations': [result['location'] for result in sorted(results, key=lambda x:x['km_distance'])[:limit]]
                })
        # else:
            # LOG.error("No lat/lon in location query")
            # emit('bike-parking-results', {
                # 'status': 'error',
                # 'error_message': 'No latitude/longitude in location query'
                # })
    else:
        LOG.error("No location specified in query.")
        emit('bike-parking-results', {
            'status': StatusChoices.Error,
            'error_message': 'No location specified in query.'
            })


@socketio.on('get-directions', namespace='/live')
def io_get_directions(query):
    url = 'http://maps.googleapis.com/maps/api/directions/json?origin={},{}&destination={},{}&sensor=true&mode={}'.format(
        query['origin']['latitude'],
        query['origin']['longitude'],
        query['destination']['latitude'],
        query['destination']['longitude'],
        query['travel_mode']
        )
    r = requests.get(url)
    if 200 <= r.status_code < 300:
        result = r.json()
        if result.get('status') == 'OK':
            LOG.info('Sending directions to client. {}'.format(result.get('routes')))
            emit('directions', {
                'status': StatusChoices.Ok,
                'routes': result.get('routes'),
                })
            return
        else:
            LOG.error(u'Failed GET request to {}'.format(url))

        emit('directions', {
            'status': StatusChoices.Error,
            'error_message': result.get('error_message', 'An unknown error occurred.'),
            })
    else:
        LOG.error(u'Failed GET request to {} - status_code = {}'.format(url, r.status_code))
        pass


@app.route('/')
def mainpage():
    return render_template('index.html')


def runserver(opts, port=8000, host="0.0.0.0"):
    # Flask Global SMELL
    global app

    app.debug = opts.debug
    app.static_path = '/static'

    # put a nice Socket IO treatment around the whole app
    socketio.run(app, port=port, host=host)
