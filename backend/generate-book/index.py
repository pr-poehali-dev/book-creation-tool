import json
import os
from typing import Dict, Any, List
from openai import OpenAI

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Generate full book text using OpenAI GPT-4 based on book data
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
        genre = body_data.get('genre', '')
        description = body_data.get('description', '')
        idea = body_data.get('idea', '')
        characters = body_data.get('characters', [])
        turning_point = body_data.get('turningPoint', '')
        unique_features = body_data.get('uniqueFeatures', '')
        pages = body_data.get('pages', '100-200')
        writing_style = body_data.get('writingStyle', 'literary')
        text_tone = body_data.get('textTone', 'serious')
        
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'OpenAI API key not configured'})
            }
        
        client = OpenAI(api_key=api_key)
        
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

        response = client.chat.completions.create(
            model='gpt-4o',
            messages=[
                {'role': 'system', 'content': 'Ты талантливый писатель, создающий захватывающие книги на русском языке.'},
                {'role': 'user', 'content': prompt}
            ],
            max_tokens=16000,
            temperature=0.9
        )
        
        book_text = response.choices[0].message.content
        
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
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'chapters': chapters,
                'total_chapters': len(chapters)
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
