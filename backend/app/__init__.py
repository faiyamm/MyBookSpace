
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    db.init_app(app)
    jwt.init_app(app)

    from .routes.auth import auth as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from .routes.catalog import catalog as catalog_bp
    app.register_blueprint(catalog_bp, url_prefix='/api/catalog')

    with app.app_context():
        db.create_all()
    
    return app