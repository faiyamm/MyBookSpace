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
};

// Loans endpoints
export const loansAPI = {
    reserveBook: (bookId) => apiClient.post('/loans/reserve', { book_id: bookId }),
    getMyLoans: () => apiClient.get('/loans/my-loans'),
    renewLoan: (loanId) => apiClient.put(`/loans/renew/${loanId}`),
    returnBook: (loanId) => apiClient.put(`/loans/return/${loanId}`),
    getAllLoans: () => apiClient.get('/loans/all'), // only admin
};

export default apiClient;