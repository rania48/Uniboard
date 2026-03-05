from flask_jwt_extended import create_access_token
from ..models.user import User
from ..repositories.user_repo import UserRepository

class AuthService:
    @staticmethod
    def register_user(data):
        if UserRepository.get_by_username(data['username']):
            return {'error': 'Username already exists'}, 400
        if UserRepository.get_by_email(data['email']):
            return {'error': 'Email already exists'}, 400
            
        new_user = User(
            username=data['username'],
            full_name=data.get('username'), # Using the submitted username (full name)
            email=data['email'],
            role=data.get('role', 'student'),
            is_approved=False
        )
        new_user.set_password(data['password'])
        
        UserRepository.save(new_user)
        
        return {'message': 'User registered successfully. Waiting for admin approval.'}, 201

    @staticmethod
    def login_user(data):
        identifier = data.get('username') # This matches the key sent by frontend
        
        # Look for user by username OR email
        user = UserRepository.get_by_username(identifier)
        if not user:
            user = UserRepository.get_by_email(identifier)
        
        if not user or not user.check_password(data['password']):
            return {'error': 'Identifiants invalides'}, 401
            
        if not user.is_approved:
            return {'error': 'Account not yet approved by administrator'}, 403
            
        access_token = create_access_token(identity={'id': user.id, 'role': user.role})
        return {
            'access_token': access_token,
            'user': user.to_dict()
        }, 200
