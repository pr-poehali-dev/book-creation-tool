import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user books - save, list, get, update books with characters and chapters
    Args: event with httpMethod, body with book data, headers with X-Auth-Token; context with request_id
    Returns: HTTP response with book data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        headers = event.get('headers', {})
        auth_token = headers.get('x-auth-token') or headers.get('X-Auth-Token')
        
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Требуется авторизация'})
            }
        
        user_id = verify_token(auth_token)
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Неверный токен'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Database not configured'})
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            cur.execute("""
                SELECT id, title, genre, description, idea, turning_point, 
                       unique_features, pages, writing_style, text_tone, created_at
                FROM books WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))
            books = cur.fetchall()
            
            books_with_data = []
            for book in books:
                book_dict = dict(book)
                
                cur.execute("SELECT * FROM characters WHERE book_id = %s", (book['id'],))
                book_dict['characters'] = [dict(c) for c in cur.fetchall()]
                
                cur.execute("SELECT * FROM chapters WHERE book_id = %s ORDER BY chapter_order", (book['id'],))
                book_dict['chapters'] = [dict(c) for c in cur.fetchall()]
                
                cur.execute("SELECT * FROM illustrations WHERE book_id = %s ORDER BY illustration_order", (book['id'],))
                book_dict['illustrations'] = [dict(i) for i in cur.fetchall()]
                
                books_with_data.append(book_dict)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'books': books_with_data}, default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute("""
                INSERT INTO books (user_id, title, genre, description, idea, turning_point,
                                 unique_features, pages, writing_style, text_tone)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user_id,
                body_data.get('title', ''),
                body_data.get('genre', ''),
                body_data.get('description', ''),
                body_data.get('idea', ''),
                body_data.get('turningPoint', ''),
                body_data.get('uniqueFeatures', ''),
                body_data.get('pages', ''),
                body_data.get('writingStyle', ''),
                body_data.get('textTone', '')
            ))
            book_id = cur.fetchone()['id']
            
            for char in body_data.get('characters', []):
                cur.execute("""
                    INSERT INTO characters (book_id, name, age, appearance, personality, 
                                          background, motivation, role)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    book_id,
                    char.get('name', ''),
                    char.get('age', ''),
                    char.get('appearance', ''),
                    char.get('personality', ''),
                    char.get('background', ''),
                    char.get('motivation', ''),
                    char.get('role', 'main')
                ))
            
            for idx, chapter in enumerate(body_data.get('chapters', [])):
                cur.execute("""
                    INSERT INTO chapters (book_id, title, text, chapter_order)
                    VALUES (%s, %s, %s, %s)
                """, (book_id, chapter.get('title', ''), chapter.get('text', ''), idx))
            
            for idx, img_url in enumerate(body_data.get('generatedImages', [])):
                illustrations = body_data.get('illustrations', {})
                cur.execute("""
                    INSERT INTO illustrations (book_id, image_url, style, color_scheme, 
                                             mood, illustration_order)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    book_id,
                    img_url,
                    illustrations.get('style', ''),
                    illustrations.get('colorScheme', ''),
                    illustrations.get('mood', ''),
                    idx
                ))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'book_id': book_id, 'message': 'Книга сохранена'})
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }

def verify_token(token: str) -> int:
    try:
        parts = token.split(':')
        if len(parts) != 3:
            return None
        
        user_id = int(parts[0])
        return user_id
    except:
        return None
