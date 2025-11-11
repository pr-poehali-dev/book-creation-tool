const AUTH_API = 'https://functions.poehali.dev/f51bfe11-7c48-4da3-935f-c94ac4cea7c0';
const BOOKS_API = 'https://functions.poehali.dev/b4fc3df2-e379-421e-9ffc-53e372ae00ee';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const auth = {
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, password, name })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка регистрации');
    }
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка входа');
    }
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

export const booksApi = {
  async createBook(bookData: any): Promise<{ book_id: number; message: string }> {
    const token = auth.getToken();
    if (!token) throw new Error('Требуется авторизация');

    const response = await fetch(BOOKS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token
      },
      body: JSON.stringify(bookData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка создания книги');
    }

    return response.json();
  },

  async updateBook(bookId: string, bookData: any): Promise<{ book_id: number; message: string }> {
    const token = auth.getToken();
    if (!token) throw new Error('Требуется авторизация');

    const response = await fetch(BOOKS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token
      },
      body: JSON.stringify({ ...bookData, id: bookId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка обновления книги');
    }

    return response.json();
  },

  async saveBook(bookData: any): Promise<{ book_id: number; message: string }> {
    return this.createBook(bookData);
  },

  async getBooks(): Promise<any[]> {
    const token = auth.getToken();
    if (!token) throw new Error('Требуется авторизация');

    const response = await fetch(BOOKS_API, {
      method: 'GET',
      headers: {
        'X-Auth-Token': token
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки книг');
    }

    const data = await response.json();
    return data.books;
  }
};