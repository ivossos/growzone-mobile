"""
AWS Lambda: WebSocket Connect Handler
Triggered when a client connects to the WebSocket API
"""

import json
import boto3
import os
from datetime import datetime, timedelta
import jwt
from typing import Optional

dynamodb = boto3.resource('dynamodb')
connections_table = dynamodb.Table(os.environ.get('CONNECTIONS_TABLE', 'chat_connections'))

# JWT configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = 'HS256'


def verify_jwt_token(token: str) -> Optional[dict]:
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        print("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None


def handler(event, context):
    """
    Handle WebSocket connection

    Event format:
    {
        "requestContext": {
            "connectionId": "abc123",
            "eventType": "CONNECT"
        },
        "queryStringParameters": {
            "token": "jwt-token-here"
        }
    }
    """
    print(f"Connect event: {json.dumps(event)}")

    connection_id = event['requestContext']['connectionId']
    query_params = event.get('queryStringParameters') or {}
    token = query_params.get('token')

    # Validate token
    if not token:
        print("No token provided")
        return {
            'statusCode': 401,
            'body': json.dumps({'message': 'Unauthorized: No token provided'})
        }

    user_data = verify_jwt_token(token)
    if not user_data:
        print("Invalid or expired token")
        return {
            'statusCode': 401,
            'body': json.dumps({'message': 'Unauthorized: Invalid token'})
        }

    user_id = user_data.get('sub') or user_data.get('user_id')
    if not user_id:
        print("No user_id in token")
        return {
            'statusCode': 401,
            'body': json.dumps({'message': 'Unauthorized: Invalid token format'})
        }

    # Store connection in DynamoDB
    try:
        connections_table.put_item(
            Item={
                'connectionId': connection_id,
                'userId': int(user_id),
                'connectedAt': datetime.utcnow().isoformat(),
                'expiresAt': int((datetime.utcnow() + timedelta(hours=2)).timestamp()),
                'lastPingAt': datetime.utcnow().isoformat()
            }
        )

        print(f"Connection stored: {connection_id} for user {user_id}")

        # TODO: Broadcast user online status to friends
        # await broadcast_user_status(user_id, online=True)

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Connected successfully'})
        }

    except Exception as e:
        print(f"Error storing connection: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error'})
        }
