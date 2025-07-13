from http.server import BaseHTTPRequestHandler
import json
import sys
import traceback
import anyio
from claude_code_sdk import query, ClaudeCodeOptions, AssistantMessage, TextBlock

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """GET リクエスト処理 - API 状態確認"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        
        response = {
            "status": "success",
            "message": "Claude Code SDK API is running",
            "endpoint": "/api/claude",
            "version": "1.0.0",
            "python_version": sys.version,
            "methods": ["GET", "POST"]
        }
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
    
    def do_POST(self):
        """POST リクエスト処理 - Claude Code SDK クエリ実行"""
        try:
            # リクエストボディ読み取り
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            request_data = json.loads(post_data)
            
            # 必須パラメータチェック
            if 'prompt' not in request_data:
                self._send_error_response(400, "Missing required parameter: prompt")
                return
            
            prompt = request_data['prompt']
            
            # Claude Code SDK クエリ実行
            response_text = anyio.run(self._query_claude, prompt)
            
            # 成功レスポンス
            self._send_success_response({
                "status": "success",
                "prompt": prompt,
                "response": response_text,
                "timestamp": self._get_timestamp()
            })
            
        except json.JSONDecodeError:
            self._send_error_response(400, "Invalid JSON in request body")
        except Exception as e:
            self._send_error_response(500, f"Internal server error: {str(e)}")
    
    async def _query_claude(self, prompt):
        """Claude Code SDK クエリ実行（非同期）"""
        try:
            response_parts = []
            
            # Claude Code SDK クエリ実行
            async for message in query(prompt=prompt):
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            response_parts.append(block.text)
            
            return "".join(response_parts)
            
        except Exception as e:
            print(f"Claude SDK Error: {e}")
            traceback.print_exc()
            raise e
    
    def do_OPTIONS(self):
        """CORS preflight リクエスト処理"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
    
    def _send_success_response(self, data):
        """成功レスポンス送信"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def _send_error_response(self, status_code, message):
        """エラーレスポンス送信"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        
        error_response = {
            "status": "error",
            "message": message,
            "timestamp": self._get_timestamp()
        }
        
        self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))
    
    def _get_timestamp(self):
        """現在のタイムスタンプ取得"""
        from datetime import datetime
        return datetime.now().isoformat()