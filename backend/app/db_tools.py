from flask import Flask
from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import User, Book
import os

app = create_app()

def seed_db():
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("Database restarted.")
        
        admin = User(
            email='admin@mybookspace.com',
            password='adminpass',
            role='admin'
        )
        user = User(
            email='user@test.com',
            password='userpass',
            role='user'
        )

        Books_test = [
            Book(
                isbn='978-0143039126', 
                title='Dune', 
                author='Frank Herbert', 
                genre='Fiction', 
                total_copies=10, 
                available_copies=2,
                cover_url='https://m.media-amazon.com/images/I/71oO1E-XPuL._AC_UF1000,1000_QL80_.jpg'
            ),
            Book(
                isbn='978-0684801223', 
                title='The Old Man and the Sea', 
                author='Ernest Hemingway', 
                genre='Fiction', 
                total_copies=5, 
                available_copies=3,
                cover_url='https://m.media-amazon.com/images/I/81uaGXiRF4L._AC_UF1000,1000_QL80_.jpg'
            ),
            Book(
                isbn='978-0593490729', 
                title='Martyr!', 
                author='Kaveh Akbar', 
                genre='Fiction', 
                total_copies=8, 
                available_copies=8,
                cover_url='https://m.media-amazon.com/images/I/71QOp6F4cPL._AC_UF1000,1000_QL80_.jpg'
            ),
        ]

        db.session.add_all([admin, user] + Books_test)
        db.session.commit()
        print("Database seeded with initial data.")
        print(f"Admin credentials - Email: {admin.email}, Password: adminpass")
        print(f"User credentials - Email: {user.email}, Password: userpass")

if __name__ == '__main__':
    seed_db()