# Database Restore Script

This script restores the database with test data including users, books, and loans.

## Usage

```bash
cd backend
python restore_data.py
```

Or with the virtual environment:

```bash
/Users/fai/Documents/MyBookSpace/.venv/bin/python backend/restore_data.py
```

## What it creates

### Users (3)
1. **Admin** - admin@library.com / admin123
2. **Test User** - user@test.com / userpass
3. **John Doe** - john@test.com / john123

### Books (9)
1. Dune - Frank Herbert
2. The Old Man and the Sea - Ernest Hemingway
3. Martyr! - Kaveh Akbar
4. It Ends With Us - Colleen Hoover
5. It - Stephen King
6. Diary of a Wimpy Kid - Jeff Kinney
7. No Longer Human - 太宰 治
8. I'm Glad My Mom Died - Jennette McCurdy
9. A Little Life - Hanya Yanagihara

### Test Loans (5)
Loans with different statuses to test the system:

1. **Active Loan** (Test User)
   - Book: Dune
   - Borrowed 5 days ago
   - Due in 9 days
   - Status: On Loan

2. **Overdue Loan** (Test User)
   - Book: Martyr!
   - Borrowed 20 days ago
   - 7 days overdue
   - Fine: $6.00
   - Status: Overdue

3. **Due Soon** (John Doe)
   - Book: Dune
   - Borrowed 12 days ago
   - Due in 2 days
   - Status: On Loan

4. **Recently Borrowed** (John Doe)
   - Book: It Ends With Us
   - Borrowed 2 days ago
   - Due in 12 days
   - Status: On Loan

5. **Renewed Loan** (Test User)
   - Book: Dune
   - Borrowed 18 days ago
   - Renewed once
   - Due in 10 days
   - Status: On Loan

## Note

This script will **DROP ALL TABLES** and recreate them, so any existing data will be lost.
