import os
from flask import Flask
from flask_cors import CORS
from .extensions import db, jwt
from .routes.auth_routes import auth_bp
from .routes.user_routes import user_bp
from .middlewares.error_handlers import register_error_handlers

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_pyfile('config.py')
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    
    # Register error handlers
    register_error_handlers(app)
    
    # Create database tables
    with app.app_context():
        db.create_all()
        
    return app
