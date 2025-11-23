from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from .. import db
from .. models import User

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role = data.get('role', 'user')

    # Validation
    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400
    
    if not first_name or not last_name:
        return jsonify({'message': 'First name and last name are required'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = generate_password_hash(password, method='scrypt')
    new_user = User(
        email=email, 
        password=hashed_password, 
        first_name=first_name,
        last_name=last_name,
        role=role
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'User registered successfully',
        'user': new_user.to_dict()
    }), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        # identity must be a string for PyJWT; cast user.id to str
        access_token = create_access_token(
            identity=str(user.id), 
            additional_claims={
                'role': user.role,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        )
        return jsonify({
            "msg": "Login successful",
            "access_token": access_token,
            "role": user.role,
            "user": user.to_dict()
        }), 200
    return jsonify({"msg": "Bad email or password"}), 401