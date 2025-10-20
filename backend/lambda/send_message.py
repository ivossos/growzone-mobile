"""
AWS Lambda: WebSocket Message Handler
Handles real-time messages via WebSocket
"""

import json
import boto3
import os
from datetime import datetime
from typing import List, Dict, Any
import uuid

dynamodb = boto3.resource('dynamodb')
connections_table = dynamodb.Table(os.environ.get('CONNECTIONS_TABLE', 'chat_connections'))

# API Gateway Management API (for sending messages to clients)
apigateway_management_api = None  # Initialize in handler


def get_user_connections(user_id: int) -> List[Dict[str, Any]]:
    """Get all active connections for a user"""
    try:
        response = connections_table.query(
            IndexName='UserIdIndex',  # Need to create this GSI in DynamoDB
            KeyConditionExpression='userId = :uid',
            ExpressionAttributeValues={':uid': user_id}
        )
        return response.get('Items', [])
    except Exception as e:
        print(f"Error querying connections: {e}")
        return []


def send_to_connection(connection_id: str, data: dict, apigw_client):
    """Send data to a specific WebSocket connection"""
    try:
        apigw_client.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(data).encode('utf-8')
        )
        print(f"Sent to connection {connection_id}")
        return True
    except apigw_client.exceptions.GoneException:
        print(f"Connection {connection_id} is gone, removing from DB")
        # Connection is stale, remove it
        connections_table.delete_item(Key={'connectionId': connection_id})
        return False
    except Exception as e:
        print(f"Error sending to connection {connection_id}: {e}")
        return False


def handler(event, context):
    """
    Handle WebSocket messages

    Event format:
    {
        "requestContext": {
            "connectionId": "abc123",
            "domainName": "xxx.execute-api.us-east-1.amazonaws.com",
            "stage": "production"
        },
        "body": "{\"action\": \"sendMessage\", \"data\": {...}}"
    }
    """
    print(f"Message event: {json.dumps(event)}")

    # Initialize API Gateway Management API client
    global apigateway_management_api
    if not apigateway_management_api:
        domain_name = event['requestContext']['domainName']
        stage = event['requestContext']['stage']
        endpoint_url = f"https://{domain_name}/{stage}"
        apigateway_management_api = boto3.client(
            'apigatewaymanagementapi',
            endpoint_url=endpoint_url
        )

    connection_id = event['requestContext']['connectionId']

    # Get connection data
    try:
        response = connections_table.get_item(Key={'connectionId': connection_id})
        connection_data = response.get('Item')

        if not connection_data:
            print(f"Connection {connection_id} not found in DB")
            return {'statusCode': 404, 'body': 'Connection not found'}

        user_id = connection_data.get('userId')
    except Exception as e:
        print(f"Error getting connection: {e}")
        return {'statusCode': 500, 'body': 'Internal error'}

    # Parse message body
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        data = body.get('data', {})
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: {e}")
        return {'statusCode': 400, 'body': 'Invalid JSON'}

    print(f"Action: {action}, Data: {data}")

    # Handle different actions
    if action == 'sendMessage':
        return handle_send_message(user_id, data, apigateway_management_api)

    elif action == 'typing':
        return handle_typing_indicator(user_id, data, apigateway_management_api)

    elif action == 'markRead':
        return handle_mark_read(user_id, data, apigateway_management_api)

    elif action == 'ping':
        # Update last ping time
        connections_table.update_item(
            Key={'connectionId': connection_id},
            UpdateExpression='SET lastPingAt = :now',
            ExpressionAttributeValues={':now': datetime.utcnow().isoformat()}
        )
        # Send pong
        send_to_connection(connection_id, {'type': 'pong'}, apigateway_management_api)
        return {'statusCode': 200, 'body': 'Pong sent'}

    else:
        print(f"Unknown action: {action}")
        return {'statusCode': 400, 'body': f'Unknown action: {action}'}


def handle_send_message(sender_id: int, data: dict, apigw_client) -> dict:
    """
    Handle sending a message

    Data format:
    {
        "conversationId": "uuid",
        "recipientId": 123,
        "contentType": "text",
        "textContent": "Hello!",
        "mediaUrl": "...",
        "replyToId": "uuid" (optional)
    }
    """
    print(f"Sending message from {sender_id}: {data}")

    recipient_id = data.get('recipientId')
    if not recipient_id:
        return {'statusCode': 400, 'body': 'recipientId required'}

    # TODO: Save message to PostgreSQL via REST API or direct DB connection
    # For now, just broadcast to recipient

    # Build message payload
    message_payload = {
        'type': 'newMessage',
        'data': {
            'id': str(uuid.uuid4()),
            'conversationId': data.get('conversationId'),
            'senderId': sender_id,
            'recipientId': recipient_id,
            'contentType': data.get('contentType', 'text'),
            'textContent': data.get('textContent'),
            'mediaUrl': data.get('mediaUrl'),
            'replyToId': data.get('replyToId'),
            'createdAt': datetime.utcnow().isoformat(),
            'read': False
        }
    }

    # Send to all recipient's connections
    recipient_connections = get_user_connections(recipient_id)
    success_count = 0

    for conn in recipient_connections:
        if send_to_connection(conn['connectionId'], message_payload, apigw_client):
            success_count += 1

    print(f"Message sent to {success_count}/{len(recipient_connections)} connections")

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Message sent',
            'deliveredTo': success_count
        })
    }


def handle_typing_indicator(user_id: int, data: dict, apigw_client) -> dict:
    """
    Handle typing indicator

    Data format:
    {
        "conversationId": "uuid",
        "recipientId": 123,
        "isTyping": true
    }
    """
    recipient_id = data.get('recipientId')
    if not recipient_id:
        return {'statusCode': 400, 'body': 'recipientId required'}

    # Build typing payload
    typing_payload = {
        'type': 'typing',
        'data': {
            'conversationId': data.get('conversationId'),
            'userId': user_id,
            'isTyping': data.get('isTyping', False)
        }
    }

    # Send to recipient
    recipient_connections = get_user_connections(recipient_id)
    for conn in recipient_connections:
        send_to_connection(conn['connectionId'], typing_payload, apigw_client)

    return {'statusCode': 200, 'body': 'Typing indicator sent'}


def handle_mark_read(user_id: int, data: dict, apigw_client) -> dict:
    """
    Handle marking messages as read

    Data format:
    {
        "messageIds": ["uuid1", "uuid2"],
        "senderId": 123
    }
    """
    message_ids = data.get('messageIds', [])
    sender_id = data.get('senderId')

    if not message_ids or not sender_id:
        return {'statusCode': 400, 'body': 'messageIds and senderId required'}

    # TODO: Update messages in PostgreSQL

    # Notify sender that messages were read
    read_payload = {
        'type': 'messageStatus',
        'data': {
            'messageIds': message_ids,
            'status': 'read',
            'readBy': user_id,
            'readAt': datetime.utcnow().isoformat()
        }
    }

    # Send to sender's connections
    sender_connections = get_user_connections(sender_id)
    for conn in sender_connections:
        send_to_connection(conn['connectionId'], read_payload, apigw_client)

    return {'statusCode': 200, 'body': 'Read status sent'}
