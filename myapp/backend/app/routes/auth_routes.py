from flask import Blueprint, request, jsonify
from ..services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    result, status = AuthService.register_user(data)
    return jsonify(result), status

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    result, status = AuthService.login_user(data)
    return jsonify(result), status
