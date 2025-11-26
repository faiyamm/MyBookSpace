import requests 

def fetch_book_by_isbn(isbn):
    """ Fetch book details from an openLibrary API using ISBN 
        returns with title, author, cover_url
    """
    try:
        clean_isbn = isbn.replace('-', '').replace(' ', '')
        url = f'https://openlibrary.org/isbn/{clean_isbn}.json'
        response = requests.get(url, timeout=15)

        if response.status_code != 200:
            print(f"OpenLibrary API error: {response.status_code}")
            return None
        
        data = response.json()

        book_info = {
            'title': data.get('title'),
            'description': None,
            'cover_url': None,
            'author': None
        }

        if 'description' in data:
            if isinstance(data['description'], dict):
                book_info['description'] = data['description'].get('value', '')
            else:
                book_info['description'] = data['description']
        
        # Try to get cover URL - try multiple approaches
        if 'covers' in data and data['covers']:
            cover_id = data['covers'][0]
            book_info['cover_url'] = f'https://covers.openlibrary.org/b/id/{cover_id}-L.jpg'
        
        # Always also try ISBN-based cover as fallback (might work even if covers array is empty)
        if not book_info['cover_url']:
            book_info['cover_url'] = f'https://covers.openlibrary.org/b/isbn/{clean_isbn}-L.jpg'

        if 'authors' in data and data['authors']:
            author_key = data['authors'][0].get('key', '')
            if author_key:
                author_url = f'https://openlibrary.org{author_key}.json'
                author_response = requests.get(author_url, timeout=15)
                if author_response.status_code == 200:
                    author_data = author_response.json()
                    book_info['author'] = author_data.get('name', 'Unknown Author')
        
        # Fallback if author not found
        if not book_info['author'] and 'works' in data and data['works']:
            work_key = data['works'][0].get('key', '')
            if work_key:
                work_url = f'https://openlibrary.org{work_key}.json'
                work_response = requests.get(work_url, timeout=15)
                if work_response.status_code == 200:
                    work_data = work_response.json()
                    if 'authors' in work_data and work_data['authors']:
                        author_key = work_data['authors'][0].get('author', {}).get('key', '')
                        if author_key:
                            author_url = f'https://openlibrary.org{author_key}.json'
                            author_response = requests.get(author_url, timeout=15)
                            if author_response.status_code == 200:
                                author_data = author_response.json()
                                book_info['author'] = author_data.get('name', 'Unknown Author')
        return book_info
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching book from OpenLibrary: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error in fetch_book_by_isbn: {e}")
        return None