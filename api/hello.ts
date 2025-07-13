import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Preflightリクエストの処理
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GETリクエストの処理
  if (req.method === 'GET') {
    res.status(200).json({
      status: 'success',
      message: 'Hello from Vercel TypeScript API!',
      endpoint: '/api/hello',
      version: '2.0.0',
      runtime: 'Node.js'
    });
    return;
  }

  // その他のメソッドは許可しない
  res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
}