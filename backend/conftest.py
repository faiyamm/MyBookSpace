import pytest
from app import create_app, db
from app.models import User, Book, Loan
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

@pytest.fixture(scope='session')
def app():
    """Create and configure a test app instance."""
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret-key',
        'WTF_CSRF_ENABLED': False
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture(scope='function')
def client(app):
    """Create a test client for the app."""
    return app.test_client()

@pytest.fixture(scope='function')
def init_database(app):
    """Initialize the database with test data."""
    with app.app_context():
        # Clear existing data
        db.session.query(Loan).delete()
        db.session.query(Book).delete()
        db.session.query(User).delete()
        
        # Create test users
        admin_user = User(
            email='admin@test.com',
            password=generate_password_hash('admin123', method='scrypt'),
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        
        regular_user = User(
            email='user@test.com',
            password=generate_password_hash('user123', method='scrypt'),
            first_name='Regular',
            last_name='User',
            role='user'
        )
        
        db.session.add(admin_user)
        db.session.add(regular_user)
        db.session.commit()
        
        # Create test books
        book1 = Book(
            isbn='978-0-14-143951-8',
            title='Test Book 1',
            author='Test Author 1',
            genre='Fiction',
            total_copies=5,
            available_copies=5
        )
        
        book2 = Book(
            isbn='978-0-13-110362-7',
            title='Test Book 2',
            author='Test Author 2',
            genre='Science Fiction',
            total_copies=3,
            available_copies=2
        )
        
        book3 = Book(
            isbn='978-0-06-112008-4',
            title='Test Book 3',
            author='Test Author 3',
            genre='Fantasy',
            total_copies=2,
            available_copies=0
        )
        
        db.session.add_all([book1, book2, book3])
        db.session.commit()
        
        # Create test loan
        loan = Loan(
            user_id=regular_user.id,
            book_id=book2.id
        )
        db.session.add(loan)
        db.session.commit()
        
        yield db
        
        # Cleanup
        db.session.query(Loan).delete()
        db.session.query(Book).delete()
        db.session.query(User).delete()
        db.session.commit()

@pytest.fixture
def auth_headers(client, init_database):
    """Get authentication headers for regular user."""
    response = client.post('/api/auth/login', json={
        'email': 'user@test.com',
        'password': 'user123'
    })
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def admin_headers(client, init_database):
    """Get authentication headers for admin user."""
    response = client.post('/api/auth/login', json={
        'email': 'admin@test.com',
        'password': 'admin123'
    })
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}
