from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE Books ADD COLUMN description TEXT'))
            conn.commit()
        print('Description column added successfully!')
    except Exception as e:
        print(f'Error: {e}')
