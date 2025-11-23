from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, supports_credentials=True)

    from .routes.auth import auth as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from .routes.catalog import catalog as catalog_bp
    app.register_blueprint(catalog_bp, url_prefix='/api/catalog')

    from .routes.loans import loans_bp
    app.register_blueprint(loans_bp, url_prefix='/api/loans')

    @app.route('/')
    def index():
        return {'message': 'MyBookSpace API is running!', 'status': 'success'}

    with app.app_context():
        db.create_all()
    
    return app

from app import models  