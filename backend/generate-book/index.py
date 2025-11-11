import json
import os
from typing import Dict, Any, List, Optional
from gigachat import GigaChat

def generate_with_gigachat(prompt: str, api_key: str) -> str:
    '''Generate text using GigaChat API'''
    with GigaChat(credentials=api_key, scope='GIGACHAT_API_PERS', verify_ssl_certs=False) as giga:
        response = giga.chat(prompt)
        return response.choices[0].message.content

def generate_with_openai(prompt: str, api_key: str) -> str:
    '''Generate text using OpenAI API as fallback'''
    import requests
    
    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'gpt-4',
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': 0.8,
            'max_tokens': 4000
        },
        timeout=60
    )
    
    if response.status_code != 200:
        raise Exception(f'OpenAI API error: {response.text}')
    
    return response.json()['choices'][0]['message']['content']

def parse_chapters(book_text: str) -> List[Dict[str, str]]:
    '''Parse book text into chapters'''
    chapters = []
    current_chapter = None
    current_text = []
    
    for line in book_text.split('\n'):
        if line.strip().startswith('#'):
            if current_chapter:
                chapters.append({
                    'title': current_chapter,
                    'text': '\n'.join(current_text).strip()
                })
            current_chapter = line.strip('#').strip()
            current_text = []
        else:
            current_text.append(line)
    
    if current_chapter:
        chapters.append({
            'title': current_chapter,
            'text': '\n'.join(current_text).strip()
        })
    
    return chapters

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Generate full book text using AI with automatic fallback
    Args: event with httpMethod, body containing book data; context with request_id
    Returns: HTTP response with generated book chapters
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        title = body_data.get('title', '')
        
        genre_data = body_data.get('genre', '')
        if isinstance(genre_data, list):
            genre = ', '.join(genre_data)
        else:
            genre = genre_data
            
        description = body_data.get('description', '')
        idea = body_data.get('idea', '')
        characters = body_data.get('characters', [])
        turning_point = body_data.get('turningPoint', '')
        unique_features = body_data.get('uniqueFeatures', '')
        pages = body_data.get('pages', '100-200')
        
        style_data = body_data.get('writingStyle', 'literary')
        if isinstance(style_data, list):
            writing_style = ', '.join(style_data)
        else:
            writing_style = style_data
            
        tone_data = body_data.get('textTone', 'serious')
        if isinstance(tone_data, list):
            text_tone = ', '.join(tone_data)
        else:
            text_tone = tone_data
        
        characters_text = '\n'.join([
            f"- {char['name']} ({char['role']}): {char.get('personality', '')} | Мотивация: {char.get('motivation', '')}"
            for char in characters
        ])
        
        prompt = f"""Ты профессиональный писатель. Напиши полноценную книгу со следующими параметрами:

НАЗВАНИЕ: {title}
ЖАНР: {genre}
ОПИСАНИЕ: {description}
ГЛАВНАЯ ИДЕЯ: {idea}

ПЕРСОНАЖИ:
{characters_text}

ПОВОРОТНЫЙ МОМЕНТ: {turning_point}
УНИКАЛЬНЫЕ ФИШКИ: {unique_features}

ОБЪЁМ: {pages} страниц
СТИЛЬ: {writing_style}
ТОН: {text_tone}

Напиши ПОЛНЫЙ ТЕКСТ книги с:
- Прологом (если уместно)
- 10-15 главами с названиями
- Развитием сюжета и персонажей
- Диалогами и описаниями
- Кульминацией и развязкой
- Эпилогом (если уместно)

Каждая глава должна быть полноценной (1000-2000 слов). Используй литературный язык, создавай атмосферу, раскрывай персонажей через действия и диалоги.

Формат ответа:
# НАЗВАНИЕ ГЛАВЫ 1
[текст главы]

# НАЗВАНИЕ ГЛАВЫ 2
[текст главы]

И так далее."""

        gigachat_key = os.environ.get('GIGACHAT_API_KEY')
        openai_key = os.environ.get('OPENAI_API_KEY')
        
        book_text = None
        used_service = None
        error_message = None
        
        if gigachat_key:
            try:
                book_text = generate_with_gigachat(prompt, gigachat_key)
                used_service = 'GigaChat'
            except Exception as e:
                error_message = f'GigaChat failed: {str(e)}'
                
        if not book_text and openai_key:
            try:
                book_text = generate_with_openai(prompt, openai_key)
                used_service = 'OpenAI'
            except Exception as e:
                if error_message:
                    error_message += f' | OpenAI failed: {str(e)}'
                else:
                    error_message = f'OpenAI failed: {str(e)}'
        
        if not book_text:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'error': 'Не удалось сгенерировать книгу. Оба сервиса недоступны.',
                    'details': error_message
                })
            }
        
        chapters = parse_chapters(book_text)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'chapters': chapters,
                'total_chapters': len(chapters),
                'generated_by': used_service
            }, ensure_ascii=False)
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
