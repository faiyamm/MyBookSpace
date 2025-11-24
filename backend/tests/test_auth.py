import pytest
from app.models import User

class TestAuthentication:
    """Test suite for authentication endpoints."""
    
    def test_user_registration_success(self, client):
        """Test successful user registration."""
        response = client.post('/api/auth/register', json={
            'email': 'newuser@test.com',
            'password': 'password123',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'user'
        })
        
        assert response.status_code == 201
        assert response.json['message'] == 'User registered successfully'
        assert 'user' in response.json
        assert response.json['user']['email'] == 'newuser@test.com'
        assert response.json['user']['first_name'] == 'New'
        assert response.json['user']['last_name'] == 'User'
    
    def test_user_registration_duplicate_email(self, client, init_database):
        """Test registration with existing email fails."""
        response = client.post('/api/auth/register', json={
            'email': 'user@test.com',  # Already exists in init_database
            'password': 'password123',
            'first_name': 'Duplicate',
            'last_name': 'User',
            'role': 'user'
        })
        
        assert response.status_code == 400
        assert response.json['message'] == 'User already exists'
    
    def test_user_registration_missing_fields(self, client):
        """Test registration fails when required fields are missing."""
        response = client.post('/api/auth/register', json={
            'email': 'incomplete@test.com',
            'password': 'password123'
            # Missing first_name and last_name
        })
        
        assert response.status_code == 400
        assert 'First name and last name are required' in response.json['message']
    
    def test_user_login_success(self, client, init_database):
        """Test successful user login."""
        response = client.post('/api/auth/login', json={
            'email': 'user@test.com',
            'password': 'user123'
        })
        
        assert response.status_code == 200
        assert 'access_token' in response.json
        assert response.json['role'] == 'user'
        assert 'user' in response.json
        assert response.json['user']['email'] == 'user@test.com'
    
    def test_user_login_invalid_credentials(self, client, init_database):
        """Test login fails with incorrect credentials."""
        response = client.post('/api/auth/login', json={
            'email': 'user@test.com',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        assert response.json['msg'] == 'Bad email or password'
    
    def test_admin_login_returns_admin_role(self, client, init_database):
        """Test admin user login returns correct role."""
        response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': 'admin123'
        })
        
        assert response.status_code == 200
        assert response.json['role'] == 'admin'
        assert 'access_token' in response.json
