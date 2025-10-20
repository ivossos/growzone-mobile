"""
AWS Lambda: WebSocket Disconnect Handler
Triggered when a client disconnects from the WebSocket API
"""

import json
import boto3
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
connections_table = dynamodb.Table(os.environ.get('CONNECTIONS_TABLE', 'chat_connections'))


def handler(event, context):
    """
    Handle WebSocket disconnection

    Event format:
    {
        "requestContext": {
            "connectionId": "abc123",
            "eventType": "DISCONNECT"
        }
    }
    """
    print(f"Disconnect event: {json.dumps(event)}")

    connection_id = event['requestContext']['connectionId']

    try:
        # Get connection data before deleting
        response = connections_table.get_item(Key={'connectionId': connection_id})
        connection_data = response.get('Item')

        if connection_data:
            user_id = connection_data.get('userId')
            print(f"User {user_id} disconnecting")

            # Delete connection from DynamoDB
            connections_table.delete_item(Key={'connectionId': connection_id})

            # TODO: Check if user has other active connections
            # If not, broadcast user offline status
            # remaining_connections = get_user_connections(user_id)
            # if not remaining_connections:
            #     await broadcast_user_status(user_id, online=False)

            print(f"Connection removed: {connection_id}")

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Disconnected successfully'})
        }

    except Exception as e:
        print(f"Error handling disconnect: {e}")
        # Return 200 anyway to acknowledge disconnect
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Disconnect acknowledged'})
        }
