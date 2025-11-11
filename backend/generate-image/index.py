import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Generate images with automatic fallback between services
    Args: event with httpMethod, body with prompt; context with request_id
    Returns: HTTP response with image URL
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
        prompt = body_data.get('prompt', '')
        
        if not prompt:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Prompt is required'})
            }
        
        poehali_key = os.environ.get('POEHALI_API_KEY')
        openai_key = os.environ.get('OPENAI_API_KEY')
        
        image_url = None
        used_service = None
        error_message = None
        
        if poehali_key:
            try:
                import requests
                response = requests.post(
                    'https://poehali.dev/.api/generate-image',
                    headers={'Content-Type': 'application/json'},
                    json={'prompt': prompt},
                    timeout=60
                )
                
                if response.status_code == 200:
                    data = response.json()
                    image_url = data.get('url')
                    used_service = 'Poehali'
                else:
                    error_message = f'Poehali API returned {response.status_code}'
            except Exception as e:
                error_message = f'Poehali failed: {str(e)}'
        
        if not image_url and openai_key:
            try:
                import requests
                response = requests.post(
                    'https://api.openai.com/v1/images/generations',
                    headers={
                        'Authorization': f'Bearer {openai_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'model': 'dall-e-3',
                        'prompt': prompt,
                        'n': 1,
                        'size': '1024x1024',
                        'quality': 'standard'
                    },
                    timeout=60
                )
                
                if response.status_code == 200:
                    data = response.json()
                    image_url = data['data'][0]['url']
                    used_service = 'DALL-E 3'
                else:
                    if error_message:
                        error_message += f' | OpenAI returned {response.status_code}'
                    else:
                        error_message = f'OpenAI returned {response.status_code}'
            except Exception as e:
                if error_message:
                    error_message += f' | OpenAI failed: {str(e)}'
                else:
                    error_message = f'OpenAI failed: {str(e)}'
        
        if not image_url:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'error': 'Не удалось сгенерировать изображение. Оба сервиса недоступны.',
                    'details': error_message
                })
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'url': image_url,
                'generated_by': used_service
            })
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
