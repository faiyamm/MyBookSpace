from app import create_app, db
from app.models import User, Book
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Delete test books (books with titles starting with "Test Book")
    print("Deleting test books...")
    test_books = Book.query.filter(Book.title.like('Test Book%')).all()
    for book in test_books:
        db.session.delete(book)
    print(f"Deleted {len(test_books)} test books")
    
    # Add admin account
    print("\nAdding admin account...")
    existing_admin = User.query.filter_by(email='admin@library.com').first()
    
    if existing_admin:
        print("Admin already exists!")
    else:
        admin = User(
            email='admin@library.com',
            password=generate_password_hash('admin123', method='scrypt'),
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        db.session.add(admin)
        print("Admin account created")
    
    db.session.commit()
    
    print("\n✅ Data restored successfully!")
    print(f"   Admin: admin@library.com / admin123")
    print(f"   Total users: {User.query.count()}")
    print(f"   Total books: {Book.query.count()}")
