from app import create_app, db
from app.models import User, Book
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    print("Restoring database...")
    
    # Create admin user
    admin = User(
        email='admin@library.com',
        password=generate_password_hash('admin123', method='scrypt'),
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    
    # Create regular user
    user = User(
        email='user@test.com',
        password=generate_password_hash('userpass', method='scrypt'),
        first_name='Test',
        last_name='User',
        role='user'
    )
    
    # Create original books
    books = [
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
    
    db.session.add(admin)
    db.session.add(user)
    db.session.add_all(books)
    db.session.commit()
    
    print("Database restored successfully!")
    print(f"\nAccounts:")
    print(f"  Admin: admin@library.com / admin123")
    print(f"  User:  user@test.com / userpass")
    print(f"\nBooks: {Book.query.count()} books added")
    print(f"Users: {User.query.count()} users added")
