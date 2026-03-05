from ..models.user import User
from ..extensions import db

class UserRepository:
    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username).first()
        
    @staticmethod
    def get_by_email(email):
        return User.query.filter_by(email=email).first()
        
    @staticmethod
    def get_by_id(user_id):
        return User.query.get(user_id)
        
    @staticmethod
    def get_pending():
        return User.query.filter_by(is_approved=False).all()
        
    @staticmethod
    def approve(user_id):
        user = User.query.get(user_id)
        if user:
            user.is_approved = True
            db.session.commit()
        return user

    @staticmethod
    def get_all():
        return User.query.all()

    @staticmethod
    def save(user):
        db.session.add(user)
        db.session.commit()
        return user
