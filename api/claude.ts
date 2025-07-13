import { VercelRequest, VercelResponse } from '@vercel/node';
import { query, type SDKMessage } from '@anthropic-ai/claude-code';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Preflightリクエストの処理
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GETリクエストの処理 - API状態確認
  if (req.method === 'GET') {
    res.status(200).json({
      status: 'success',
      message: 'Claude Code SDK API is running (TypeScript)',
      endpoint: '/api/claude',
      version: '2.0.0',
      runtime: 'Node.js',
      nodeVersion: process.version,
      methods: ['GET', 'POST']
    });
    return;
  }

  // POSTリクエストの処理 - Claude Code SDKクエリ実行
  if (req.method === 'POST') {
    try {
      // リクエストボディの検証
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'Missing required parameter: prompt',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Claude Code SDKクエリ実行
      console.log(`Processing query: ${prompt}`);
      const messages: SDKMessage[] = [];

      try {
        // 環境変数チェック
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY environment variable is not set');
        }

        // クエリ実行
        for await (const message of query({
          prompt: prompt,
          abortController: new AbortController(),
          options: {
            maxTurns: 1, // 1ターンのみ（安全性のため）
            apiKey: process.env.ANTHROPIC_API_KEY,
          }
        })) {
          messages.push(message);
        }

        // メッセージからテキストを抽出
        const responseText = messages
          .filter((msg: any) => msg.type === 'message' && msg.role === 'assistant')
          .map((msg: any) => {
            // メッセージ内容からテキストを抽出
            if (msg.content && Array.isArray(msg.content)) {
              return msg.content
                .filter((block: any) => block.type === 'text')
                .map((block: any) => block.text || '')
                .join('');
            }
            return '';
          })
          .join('');

        // 成功レスポンス
        res.status(200).json({
          status: 'success',
          prompt: prompt,
          response: responseText,
          timestamp: new Date().toISOString()
        });

      } catch (sdkError: any) {
        console.error('Claude SDK Error:', sdkError);
        res.status(500).json({
          status: 'error',
          message: `Claude SDK error: ${sdkError.message || 'Unknown error'}`,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error: any) {
      console.error('Request processing error:', error);
      res.status(500).json({
        status: 'error',
        message: `Internal server error: ${error.message || 'Unknown error'}`,
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

  // その他のメソッドは許可しない
  res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
          }
