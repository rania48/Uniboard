from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..repositories.user_repo import UserRepository

user_bp = Blueprint('user', __name__)

@user_bp.route('/pending', methods=['GET'])
@jwt_required()
def get_pending():
    current_user = get_jwt_identity()
    if current_user.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    pending = UserRepository.get_pending()
    return jsonify([u.to_dict() for u in pending]), 200

@user_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user = get_jwt_identity()
    if current_user.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    users = UserRepository.get_all()
    return jsonify([u.to_dict() for u in users]), 200

@user_bp.route('/create', methods=['POST'])
@jwt_required()
def create_user():
    current_user = get_jwt_identity()
    if current_user.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json()
    
    # Simple validation
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Veuillez remplir tous les champs obligatoires'}), 400
        
    if UserRepository.get_by_username(data['username']):
        return jsonify({'error': 'Le nom d\'utilisateur existe déjà'}), 400
    if UserRepository.get_by_email(data['email']):
        return jsonify({'error': 'L\'email existe déjà'}), 400
        
    from ..models.user import User
    from ..extensions import db
    
    new_user = User(
        username=data['username'],
        full_name=data.get('full_name', data['username']),
        email=data['email'],
        role=data.get('role', 'student'),
        is_approved=True  # Admin created users are approved by default
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': f'Utilisateur {new_user.username} créé avec succès'}), 201

@user_bp.route('/approve/<int:user_id>', methods=['POST'])
@jwt_required()
def approve_user(user_id):
    current_user = get_jwt_identity()
    if current_user.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    user = UserRepository.approve(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({'message': f'User {user.username} approved'}), 200

@user_bp.route('/reject/<int:user_id>', methods=['DELETE'])
@jwt_required()
def reject_user(user_id):
    current_user = get_jwt_identity()
    if current_user.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    # Logic to delete or mark as rejected
    from ..extensions import db
    from ..models.user import User
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Registration rejected'}), 200
    
    return jsonify({'error': 'User not found'}), 404
