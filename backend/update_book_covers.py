from app import create_app, db
from app.models import Book

app = create_app()

with app.app_context():
    books = Book.query.all()
    updated_count = 0
    
    for book in books:
        if book.isbn and not book.cover_url:
            # Generate cover URL from ISBN
            clean_isbn = book.isbn.replace('-', '').replace(' ', '')
            book.cover_url = f'https://covers.openlibrary.org/b/isbn/{clean_isbn}-L.jpg'
            updated_count += 1
            print(f'Updated cover for: {book.title} - ISBN: {clean_isbn}')
    
    if updated_count > 0:
        db.session.commit()
        print(f'\n✓ Successfully updated {updated_count} book(s) with cover URLs')
    else:
        print('No books needed cover URL updates')
