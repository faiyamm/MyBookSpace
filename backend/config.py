import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # definir  la base de datos (sqlite) y crear la ruta absoluta para la DB dentro del modulo principal 'app'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # config seguridad (jwt), clave secreta para firmar los tokens jwt
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or '89cc67bdebdcd140d82d'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    # clave secreta para flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'ee85446227993beed298'