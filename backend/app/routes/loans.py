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

@loans_bp.route('/myLoans', methods=['GET'])
@jwt_required()
def my_loans():
    """ endpoint to get all loans for the current user """
    current_user_id = int(get_jwt_identity())
    loans = Loan.query.filter_by(user_id=current_user_id).all()

    return jsonify([loan.to_dict() for loan in loans]), 200

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
