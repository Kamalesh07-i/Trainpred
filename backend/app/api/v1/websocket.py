from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.telemetry_connections: List[WebSocket] = []
        self.alert_connections: List[WebSocket] = []

    async def connect_telemetry(self, websocket: WebSocket):
        await websocket.accept()
        self.telemetry_connections.append(websocket)

    def disconnect_telemetry(self, websocket: WebSocket):
        if websocket in self.telemetry_connections:
            self.telemetry_connections.remove(websocket)

    async def connect_alerts(self, websocket: WebSocket):
        await websocket.accept()
        self.alert_connections.append(websocket)

    def disconnect_alerts(self, websocket: WebSocket):
        if websocket in self.alert_connections:
            self.alert_connections.remove(websocket)

    async def broadcast_telemetry(self, data: dict):
        disconnected = []
        for connection in self.telemetry_connections:
            try:
                await connection.send_json(data)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect_telemetry(conn)

    async def broadcast_alert(self, data: dict):
        disconnected = []
        for connection in self.alert_connections:
            try:
                await connection.send_json(data)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect_alerts(conn)

manager = ConnectionManager()

@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await manager.connect_telemetry(websocket)
    try:
        while True:
            # Keep-alive receive
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_telemetry(websocket)
    except Exception:
        manager.disconnect_telemetry(websocket)

@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await manager.connect_alerts(websocket)
    try:
        while True:
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_alerts(websocket)
    except Exception:
        manager.disconnect_alerts(websocket)
