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
