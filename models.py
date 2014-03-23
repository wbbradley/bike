from os.path import join
from peewee import (SqliteDatabase, Model, CharField, DecimalField,
    BooleanField, IntegerField, )
from datetime import datetime
import logging
import requests
from math import radians, cos, sin, asin, sqrt


# code mercilessly stolen from
# http://stackoverflow.com/questions/4913349/haversine-formula-in-python-bearing-and-distance-between-two-gps-points
def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance between two points on the earth
    (specified in decimal degrees)
    """
    # convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))

    # 6367 km is the radius of the Earth
    km = 6367 * c
    return km


LOG = logging.getLogger('bike')

database = SqliteDatabase(None)
database.last_locations_update = datetime(1970, 1, 1)

def database_connect(base_dir):
    db_filename = join(base_dir, 'bike.db')
    database.init(db_filename)
    database.connect()
    database.create_table(Location, safe=True)
    database.commit()


class BaseModel(Model):
    class Meta:
        database = database


class Location(BaseModel):
    location_name = CharField()
    yr_inst = CharField()
    bike_parking = CharField()
    racks_installed = IntegerField(default=0)
    racks = CharField()
    placement = CharField()
    spaces = IntegerField(default=0)
    status = CharField()
    status_detail = CharField()
    status_description = CharField()
    acting_agent = CharField()
    action = CharField()
    installed_by_2 = CharField()
    yr_installed = CharField()
    coord_needs_recoding = BooleanField()
    coord_latitude = DecimalField()
    coord_longitude = DecimalField()

    def coords(self):
        return (self.coord_latitude, self.coord_longitude)

    def serialize(self, opts=None):
        return {
            'id': self.id,
            'location_name': self.location_name,
            'yr_inst': self.yr_inst,
            'bike_parking': self.bike_parking,
            'racks_installed': self.racks_installed,
            'racks': self.racks,
            'placement': self.placement,
            'spaces': self.spaces,
            'status': self.status,
            'status_detail': self.status_detail,
            'status_description': self.status_description,
            'acting_agent': self.acting_agent,
            'action': self.action,
            'installed_by_2': self.installed_by_2,
            'yr_installed': self.yr_installed,
            'coord_needs_recoding': self.coord_needs_recoding,
            'coord_latitude': self.coord_latitude,
            'coord_longitude': self.coord_longitude,
            }

    class Meta:
        # Use an explicitly versioned table name in case we want to
        # do data or schema migrations later.
        db_table = 'location01'


def munge_datum(datum):
    # Take a location record from our intended data source and munge it
    # to look like our internal representation
    initial = {}
    fields = Location._meta.fields
    for key in datum.keys():
        if key in fields:
            initial[key] = fields[key].coerce(datum[key])
        elif key != 'coordinates':
            LOG.warning("Found key in datum that has no column in Location table ({})".format(key))
    initial['coord_needs_recoding'] = datum.get('coordinates', {}).get('needs_recoding')
    initial['coord_latitude'] = datum.get('coordinates', {}).get('latitude')
    initial['coord_longitude'] = datum.get('coordinates', {}).get('longitude')

    return initial


def import_location_data():
    now = datetime.now()
    if (now - database.last_locations_update).total_seconds() > 86400:
        r = requests.get('http://data.sfgov.org/resource/w969-5mn4.json')
        if 200 <= r.status_code < 300:
            Location.delete().execute()
            for datum in r.json():
                Location.create(**munge_datum(datum))
            database.last_locations_update = now
