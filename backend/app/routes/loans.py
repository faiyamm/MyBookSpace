from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Loan, User, Book
from datetime import datetime

loans_bp = Blueprint('loans', __name__)

@loans_bp.route('/reserve', methods=['POST'])
@jwt_required()
def book_reservation():
    """ Endpoint to reserve/borrow a book """
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    book_id = data.get('book_id')
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    if book.available_copies <= 0:
        return jsonify({"error": "No available copies for reservation"}), 400

    loan = Loan(user_id=current_user_id, book_id=book_id)
    book.available_copies -= 1

    db.session.add(loan)
    db.session.commit()

    return jsonify({
        'message': 'Book reserved successfully',
        'loan': loan.to_dict()
    }), 201

@loans_bp.route('/reserve/<int:book_id>', methods=['POST'])
@jwt_required()
def reserve_book_by_id(book_id):
    """ Endpoint to reserve/borrow a book by ID in URL """
    current_user_id = int(get_jwt_identity())

    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    if book.available_copies <= 0:
        return jsonify({"error": "Book not available for reservation"}), 400

    loan = Loan(user_id=current_user_id, book_id=book_id)
    book.available_copies -= 1

    db.session.add(loan)
    db.session.commit()

    return jsonify({
        'message': 'Book reserved successfully',
        'loan': loan.to_dict()
    }), 201

@loans_bp.route('/myLoans', methods=['GET'])
@jwt_required()
def my_loans():
    """ endpoint to get all loans for the current user """
    current_user_id = int(get_jwt_identity())
    loans = Loan.query.filter_by(user_id=current_user_id).all()

    return jsonify({'loans': [loan.to_dict() for loan in loans]}), 200

@loans_bp.route('/my-loans', methods=['GET'])
@jwt_required()
def my_loans_alias():
    """ endpoint to get all loans for the current user (kebab-case alias) """
    current_user_id = int(get_jwt_identity())
    loans = Loan.query.filter_by(user_id=current_user_id).all()

    return jsonify({'loans': [loan.to_dict() for loan in loans]}), 200

@loans_bp.route('/loans/<int:loan_id>/renew', methods=['POST'])
@jwt_required()
def renew_loan(loan_id):
    """ endpoint to renew a loan if eligible """
    current_user_id = int(get_jwt_identity())
    loan = Loan.query.get(loan_id)

    if not loan or loan.user_id != current_user_id:
        return jsonify({"error": "Loan not found"}), 404
    
    if loan.renewal():
        db.session.commit()
        return jsonify({
            'message': 'Loan renewed successfully',
            'loan': loan.to_dict()
        }), 200
    else:
        return jsonify({"error": "Loan cannot be renewed"}), 400

@loans_bp.route('/loans/<int:loan_id>/return', methods=['POST'])
@jwt_required()
def return_loan(loan_id):
    """ endpoint to return a loaned book """
    current_user_id = int(get_jwt_identity())
    loan = Loan.query.get(loan_id)

    if not loan or loan.user_id != current_user_id:
        return jsonify({"error": "Loan not found"}), 404

    loan.return_date = datetime.utcnow()
    loan.status = 'Returned'
    loan.book.available_copies += 1

    db.session.commit()

    return jsonify({
        'message': 'Book returned successfully',
        'final_fine_amount': loan.fine_amount,
    }), 200

@loans_bp.route('/return/<int:loan_id>', methods=['POST'])
@jwt_required()
def return_loan_alias(loan_id):
    """ endpoint to return a loaned book (shorter route) """
    current_user_id = int(get_jwt_identity())
    loan = Loan.query.get(loan_id)

    if not loan or loan.user_id != current_user_id:
        return jsonify({"error": "Loan not found"}), 404

    loan.return_date = datetime.utcnow()
    loan.status = 'Returned'
    loan.book.available_copies += 1

    db.session.commit()

    return jsonify({
        'message': 'Book returned successfully',
        'final_fine_amount': loan.fine_amount,
    }), 200

@loans_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_loans():
    """ endpoint to get all loans -> only for admin users """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    
    loans = Loan.query.all()
    return jsonify([loan.to_dict() for loan in loans]), 200

@loans_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_loan_stats():
    """ endpoint to get loan statistics -> only for admin users """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    from datetime import datetime, timedelta
    active = Loan.query.filter(Loan.status == 'On Loan').count()
    overdue = Loan.query.filter(
        Loan.status == 'On Loan',
        Loan.expiration_date < datetime.utcnow()
    ).count()
    returned = Loan.query.filter(Loan.status == 'Returned').count()

    total_fines = db.session.query(db.func.sum(Loan.fine_amount)).scalar() or 0.0
    
    return jsonify({
        'active_loans': active,
        'overdue_loans': overdue,
        'returned_loans': returned,
        'total_fines': float(total_fines)
    }), 200