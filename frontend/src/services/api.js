import apiClient from '../api/apiClient';

// Authentication endpoints
export const authAPI = {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
};

// Books/Catalog endpoints
export const catalogAPI = {
    getBooks: (params) => apiClient.get('/catalog/books', { params }),
    getBook: (id) => apiClient.get(`/catalog/books/${id}`),
    createBook: (data) => apiClient.post('/catalog/books', data),
    updateBook: (id, data) => apiClient.put(`/catalog/books/${id}`, data),
    deleteBook: (id) => apiClient.delete(`/catalog/books/${id}`),
    previewByISBN: (isbn) => apiClient.get(`/catalog/books/preview/${isbn}`),
    getStats: () => apiClient.get('/catalog/stats'), // admin only
};

// Loans endpoints
export const loansAPI = {
    reserveBook: (bookId) => apiClient.post('/loans/reserve', { book_id: bookId }),
    getMyLoans: () => apiClient.get('/loans/myLoans'),
    renewLoan: (loanId) => apiClient.post(`/loans/loans/${loanId}/renew`),
    returnBook: (loanId) => apiClient.post(`/loans/loans/${loanId}/return`),
    getAllLoans: () => apiClient.get('/loans/all'), // admin only
    getStats: () => apiClient.get('/loans/stats'), // admin only
};

export default apiClient;