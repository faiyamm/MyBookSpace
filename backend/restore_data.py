from app import create_app, db
from app.models import User, Book, Loan
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    print("Restoring database...")
    
    # Drop all tables and recreate them
    db.drop_all()
    db.create_all()
    
    # Create admin user
    admin = User(
        email='admin@library.com',
        password=generate_password_hash('admin123', method='scrypt'),
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    
    # Create regular users
    user1 = User(
        email='user@test.com',
        password=generate_password_hash('userpass', method='scrypt'),
        first_name='Test',
        last_name='User',
        role='user'
    )
    
    user2 = User(
        email='john@test.com',
        password=generate_password_hash('john123', method='scrypt'),
        first_name='John',
        last_name='Doe',
        role='user'
    )
    
    # Add users first
    db.session.add(admin)
    db.session.add(user1)
    db.session.add(user2)
    db.session.commit()
    
    # Create all books from current database
    books = [
        Book(
            isbn='978-0143039126', 
            title='Dune', 
            author='Frank Herbert', 
            genre='Fiction', 
            total_copies=10, 
            available_copies=6,  # 3 on loan, 1 overdue
            cover_url='https://m.media-amazon.com/images/I/71oO1E-XPuL._AC_UF1000,1000_QL80_.jpg'
        ),
        Book(
            isbn='978-0684801223', 
            title='The Old Man and the Sea', 
            author='Ernest Hemingway', 
            genre='Fiction', 
            total_copies=5, 
            available_copies=4,  # 1 overdue
            cover_url='https://m.media-amazon.com/images/I/81uaGXiRF4L._AC_UF1000,1000_QL80_.jpg'
        ),
        Book(
            isbn='978-0593490729', 
            title='Martyr!', 
            author='Kaveh Akbar', 
            genre='Fiction', 
            total_copies=8, 
            available_copies=7,
            cover_url='https://m.media-amazon.com/images/I/71QOp6F4cPL._AC_UF1000,1000_QL80_.jpg'
        ),
        Book(
            isbn='9781471156267',
            title='It Ends With Us',
            author='Colleen Hoover',
            genre='Romance',
            total_copies=5,
            available_copies=4,
            cover_url='https://covers.openlibrary.org/b/id/15123232-L.jpg',
            description="Lily hasn't always had it easy, but that's never stopped her from working hard for the life she wants."
        ),
        Book(
            isbn='9780451159274',
            title='It',
            author='Stephen King',
            genre='Mystery',
            total_copies=4,
            available_copies=3,  # 1 overdue
            cover_url='https://covers.openlibrary.org/b/id/15140681-L.jpg',
            description="Derry: A small city in Maine, place as hauntingly familiar as your own hometown, only in Derry the haunting is real."
        ),
        Book(
            isbn='9780810993136',
            title='Diary of a Wimpy Kid',
            author='Jeff Kinney',
            genre='Fiction',
            total_copies=4,
            available_copies=3,  # 1 overdue
            cover_url='https://covers.openlibrary.org/b/id/14376136-L.jpg',
            description="Greg Heffley finds thrust into middle school, where undersized weaklings like him share the hallways with kids who are taller, meaner, and already shaving."
        ),
        Book(
            isbn='9780811204811',
            title='No Longer Human',
            author='太宰 治',
            genre='Mystery',
            total_copies=3,
            available_copies=2,  # 1 overdue
            cover_url='https://covers.openlibrary.org/b/id/15142271-L.jpg',
            description="Osamu Dazai's No Longer Human, this leading postwar Japanese writer's second novel, tells the poignant and fascinating story of a young man who is caught between the breakup of the traditions of a northern Japanese aristocratic family and the impact of Western ideas."
        ),
        Book(
            isbn='9781668035924',
            title="I'm Glad My Mom Died",
            author='Jennette McCurdy',
            genre='Biography',
            total_copies=5,
            available_copies=5,
            cover_url='https://covers.openlibrary.org/b/id/14562205-L.jpg',
            description="A heartbreaking and hilarious memoir by iCarly and Sam & Cat star Jennette McCurdy about her struggles as a former child actor."
        ),
        Book(
            isbn='9780385539258',
            title='A Little Life',
            author='Hanya Yanagihara',
            genre='Fiction',
            total_copies=3,
            available_copies=3,
            cover_url='https://covers.openlibrary.org/b/id/14841606-L.jpg',
            description="When four classmates from a small Massachusetts college move to New York to make their way, they're broke, adrift, and buoyed only by their friendship and ambition."
        ),
    ]
    
    db.session.add_all(books)
    db.session.commit()
    
    # Create test loans with different statuses
    # Note: We need to get the book IDs after commit
    dune = Book.query.filter_by(isbn='978-0143039126').first()
    martyr = Book.query.filter_by(isbn='978-0593490729').first()
    it_ends = Book.query.filter_by(isbn='9781471156267').first()
    old_man = Book.query.filter_by(isbn='978-0684801223').first()
    it_book = Book.query.filter_by(isbn='9780451159274').first()
    wimpy_kid = Book.query.filter_by(isbn='9780810993136').first()
    no_longer_human = Book.query.filter_by(isbn='9780811204811').first()
    
    # Loan 1: Active loan (user1) - borrowed 5 days ago
    loan1 = Loan(user_id=user1.id, book_id=dune.id)
    loan1.loan_date = datetime.utcnow() - timedelta(days=5)
    loan1.expiration_date = loan1.loan_date + timedelta(days=14)
    loan1.status = 'On Loan'
    
    # Loan 2: Overdue loan (user1) - borrowed 20 days ago, 6 days overdue
    loan2 = Loan(user_id=user1.id, book_id=martyr.id)
    loan2.loan_date = datetime.utcnow() - timedelta(days=20)
    loan2.expiration_date = loan2.loan_date + timedelta(days=14)
    loan2.status = 'Overdue'
    loan2.fine_amount = 6.0  # 6 days overdue
    
    # Loan 3: Due soon (user2) - borrowed 12 days ago, expires in 2 days
    loan3 = Loan(user_id=user2.id, book_id=dune.id)
    loan3.loan_date = datetime.utcnow() - timedelta(days=12)
    loan3.expiration_date = loan3.loan_date + timedelta(days=14)
    loan3.status = 'On Loan'
    
    # Loan 4: Recently borrowed (user2) - borrowed 2 days ago
    loan4 = Loan(user_id=user2.id, book_id=it_ends.id)
    loan4.loan_date = datetime.utcnow() - timedelta(days=2)
    loan4.expiration_date = loan4.loan_date + timedelta(days=14)
    loan4.status = 'On Loan'
    
    # Loan 5: Renewed once (user1) - borrowed 18 days ago, renewed 4 days ago
    loan5 = Loan(user_id=user1.id, book_id=dune.id)
    loan5.loan_date = datetime.utcnow() - timedelta(days=18)
    loan5.expiration_date = datetime.utcnow() + timedelta(days=10)  # Extended
    loan5.status = 'On Loan'
    loan5.renewals = 1
    
    # Loan 6: Severely overdue (user1) - borrowed 35 days ago, 21 days overdue
    loan6 = Loan(user_id=user1.id, book_id=old_man.id)
    loan6.loan_date = datetime.utcnow() - timedelta(days=35)
    loan6.expiration_date = loan6.loan_date + timedelta(days=14)
    loan6.status = 'Overdue'
    loan6.fine_amount = 21.0  # 21 days overdue
    
    # Loan 7: Moderately overdue (user2) - borrowed 25 days ago, 11 days overdue
    loan7 = Loan(user_id=user2.id, book_id=it_book.id)
    loan7.loan_date = datetime.utcnow() - timedelta(days=25)
    loan7.expiration_date = loan7.loan_date + timedelta(days=14)
    loan7.status = 'Overdue'
    loan7.fine_amount = 11.0  # 11 days overdue
    
    # Loan 8: Recently overdue (user2) - borrowed 16 days ago, 2 days overdue
    loan8 = Loan(user_id=user2.id, book_id=wimpy_kid.id)
    loan8.loan_date = datetime.utcnow() - timedelta(days=16)
    loan8.expiration_date = loan8.loan_date + timedelta(days=14)
    loan8.status = 'Overdue'
    loan8.fine_amount = 2.0  # 2 days overdue
    
    # Loan 9: Slightly overdue (user1) - borrowed 18 days ago, 4 days overdue
    loan9 = Loan(user_id=user1.id, book_id=no_longer_human.id)
    loan9.loan_date = datetime.utcnow() - timedelta(days=18)
    loan9.expiration_date = loan9.loan_date + timedelta(days=14)
    loan9.status = 'Overdue'
    loan9.fine_amount = 4.0  # 4 days overdue
    
    db.session.add_all([loan1, loan2, loan3, loan4, loan5, loan6, loan7, loan8, loan9])
    db.session.commit()
    
    print("Database restored successfully!")
    print(f"\n{'='*50}")
    print(f"ACCOUNTS:")
    print(f"{'='*50}")
    print(f"  Admin: admin@library.com / admin123")
    print(f"  User1: user@test.com / userpass")
    print(f"  User2: john@test.com / john123")
    print(f"\n{'='*50}")
    print(f"STATISTICS:")
    print(f"{'='*50}")
    print(f"  Books: {Book.query.count()} books added")
    print(f"  Users: {User.query.count()} users created")
    print(f"  Loans: {Loan.query.count()} test loans created")
    print(f"\n{'='*50}")
    print(f"LOAN STATUS BREAKDOWN:")
    print(f"{'='*50}")
    print(f"  Active loans: {Loan.query.filter_by(status='On Loan').count()}")
    print(f"  Overdue loans: {Loan.query.filter_by(status='Overdue').count()}")
    print(f"\n{'='*50}")
