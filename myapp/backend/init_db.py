import os
import sys

# Add backend and its parent to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from app import create_app, db
from app.models.user import User

app = create_app()

def init_db():
    with app.app_context():
        # Tables are created in create_app() via db.create_all()
        # Create a default admin if none exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            print("Creating default admin user...")
            admin = User(
                username='admin',
                full_name='Administrateur UniBoard',
                email='admin@universite.ma',
                role='admin',
                is_approved=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Admin created: user=admin, pass=admin123")
        else:
            print("Admin already exists.")

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
