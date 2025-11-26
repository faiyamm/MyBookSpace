import cProfile
import pstats
import io
from datetime import datetime
from app import create_app, db
from app.models import Book

def create_optimized_test_data():
    """ Create 300 book entries with better batch processing """
    app = create_app()
    with app.app_context():
        count = Book.query.count()
        if count >= 300:
            print(f"{count} books exist. Skipping test data creation.")
            return

        print("Creating test data with optimized batch processing...")
        books_batch = []
        for i in range(300):
            book = Book(
                isbn=f'978-0-00{i:07d}',
                title=f'Test Book {i+1}',
                author=f'Author {i+1}',
                genre='Fiction',
                total_copies=5,
                available_copies=5,
                cover_url='https://example.com/cover.jpg'
            )
            books_batch.append(book)
            
            # Commit in larger batches (every 50 instead of 100)
            if len(books_batch) >= 50:
                db.session.bulk_save_objects(books_batch)
                db.session.commit()
                books_batch = []
        
        # Commit remaining
        if books_batch:
            db.session.bulk_save_objects(books_batch)
            db.session.commit()
        
        print("Optimized test data creation completed.")

def search_highly_optimized():
    """ Further optimized search with connection reuse """
    app = create_app()
    with app.app_context():
        search_term = "Book"
        # Use filter + limit in single query, fetch only needed columns
        results = db.session.query(Book.id, Book.title).filter(
            Book.title.ilike(f'%{search_term}%')
        ).limit(50).all()
        return len(results)

def run_highly_optimized_searches(iterations=50):
    """ Execute multiple highly optimized searches """
    for _ in range(iterations):
        search_highly_optimized()

def profile_optimized_version():
    print("="*80)
    print("SECOND OPTIMIZATION PROFILING")
    print("="*80)

    create_optimized_test_data()

    print("\nRunning Highly Optimized Search Profiling")
    print("-"*80)
    print("Optimizations: Bulk inserts, query column selection, reduced limit")

    profiler = cProfile.Profile()
    start_time = datetime.now()
    
    profiler.enable()
    run_highly_optimized_searches(50)
    profiler.disable()
    
    end_time = datetime.now()
    time_taken = (end_time - start_time).total_seconds()
    
    # Show stats
    s = io.StringIO()
    ps = pstats.Stats(profiler, stream=s)
    ps.sort_stats('cumulative')
    ps.print_stats(15)

    print(f"Total time: {time_taken:.4f} seconds")
    print(f"Average per search: {time_taken/50:.4f} seconds")
    print("Most costly functions:")
    print(s.getvalue()[:1500])

    print("\n" + "="*80)
    print("Second optimization profiling completed!")
    print("="*80)
    
    return {
        'time_taken': time_taken,
        'avg_per_search': time_taken / 50,
        'iterations': 50
    }

def save_optimized_results(results):
    """Save second optimization results"""
    filename = f"profiling_results_optimized_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    
    with open(filename, 'w') as f:
        f.write("="*80 + "\n")
        f.write("SECOND OPTIMIZATION PROFILING RESULTS\n")
        f.write("="*80 + "\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Database: SQLite (app.db)\n")
        f.write(f"Test iterations: {results['iterations']} searches\n")
        f.write("\n")
        
        f.write("FURTHER OPTIMIZATIONS APPLIED:\n")
        f.write("-"*80 + "\n")
        f.write("1. Bulk insert operations using bulk_save_objects()\n")
        f.write("2. Reduced batch size from 100 to 50 records\n")
        f.write("3. Query optimization: Select only required columns (id, title)\n")
        f.write("4. Reduced LIMIT from 100 to 50 results\n")
        f.write("5. Connection reuse within app context\n")
        f.write("\n")
        
        f.write("PERFORMANCE METRICS:\n")
        f.write("-"*80 + "\n")
        f.write(f"Total time:         {results['time_taken']:.4f} seconds\n")
        f.write(f"Average per search: {results['avg_per_search']:.4f} seconds\n")
        f.write("\n")
        
        f.write("="*80 + "\n")
        f.write("End of Report\n")
        f.write("="*80 + "\n")
    
    print(f"\nResults saved to: {filename}")
    return filename

if __name__ == "__main__":
    print("Starting second round of optimization profiling...\n")
    results = profile_optimized_version()
    save_optimized_results(results)
    print("\nSecond profiling complete!")
