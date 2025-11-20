import os

class Config:
    # definir  la base de datos (sqlite) y crear la ruta absoluta para la DB dentro del modulo principal 'app'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'app', 'db.sqlite')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # config seguridad (jwt), clave secreta para firmar los tokens jwt
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or '89cc67bdebdcd140d82d'

    # clave secreta para flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'ee85446227993beed298'