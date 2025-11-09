-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create books table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    genre VARCHAR(100),
    description TEXT,
    idea TEXT,
    turning_point TEXT,
    unique_features TEXT,
    pages VARCHAR(50),
    writing_style VARCHAR(100),
    text_tone VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create characters table
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    age VARCHAR(50),
    appearance TEXT,
    personality TEXT,
    background TEXT,
    motivation TEXT,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chapters table
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    text TEXT,
    chapter_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create illustrations table
CREATE TABLE illustrations (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    style VARCHAR(100),
    color_scheme VARCHAR(100),
    mood VARCHAR(100),
    illustration_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_characters_book_id ON characters(book_id);
CREATE INDEX idx_chapters_book_id ON chapters(book_id);
CREATE INDEX idx_illustrations_book_id ON illustrations(book_id);
