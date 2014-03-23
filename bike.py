#!/usr/bin/env python
import sys
import os
from os.path import join, abspath, exists, expanduser, basename
import argparse
import logging
from models import database_connect, import_location_data


LOG = logging.getLogger('bike')
LOG.addHandler(logging.NullHandler())

BIKE_VERSION = '0.1.0'

def get_arg_parser():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '-D', '--debug',
        dest='debug',
        default=False,
        action='store_true',
        help='Debug mode.',
        )
    parser.add_argument(
        '-i', '--import',
        dest='run_import',
        action='store_true',
        default=False,
        help='Perform an import of relevant data.'
        )
    parser.add_argument(
        '-d', '--db_dir',
        dest='db_dir',
        default=os.environ.get('BIKE_ROOT', abspath(join(expanduser('~'), '.bike'))),
        help='Specify the folder where the root DB will be stored.',
        )
    parser.add_argument(
        '-S', '--server',
        dest='run_server',
        action='store_true',
        default=False,
        help='Run the server.',
        )
    return parser


def system(cmd):
    LOG.debug(basename(__file__) + ' : system : ' + cmd)
    ret = os.system(cmd)
    LOG.debug(basename(__file__) + ' : system : result ' + str(ret))
    return ret



def main(argv=None):
    if argv is None:
        argv = sys.argv[1:]

    parser = get_arg_parser()
    opts = parser.parse_args(argv)

    if opts.debug:
        LOG.setLevel(logging.DEBUG)
        LOG.addHandler(logging.StreamHandler())
        # db_logger = logging.getLogger('peewee')
        # db_logger.setLevel(logging.DEBUG)
        # db_logger.addHandler(logging.StreamHandler())
    
    if not exists(opts.db_dir):
        system("mkdir -p '{}'".format(opts.db_dir))

    database_connect(opts.db_dir)

    if opts.run_import:
        import_location_data()

    if opts.run_server:
        from server import runserver
        return runserver(opts=opts)


if __name__ == '__main__':
    main()
