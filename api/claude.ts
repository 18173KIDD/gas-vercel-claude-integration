import { VercelRequest, VercelResponse } from '@vercel/node';

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
      status: 'info',
      message: 'Claude Code SDK requires subscription authentication',
      explanation: 'Claude Code SDKは定額制（Claude Pro/Team）で使用するものですが、Vercelのようなサーバーレス環境では直接使用できません。',
      alternatives: [
        'Anthropic API (APIキーが必要)',
        'ローカル環境でClaude Code CLIを使用',
        '別のアーキテクチャの検討'
      ],
      endpoint: '/api/claude',
      version: '2.0.0',
      runtime: 'Node.js',
      nodeVersion: process.version
    });
    return;
  }

  // POSTリクエストの処理
  if (req.method === 'POST') {
    res.status(501).json({
      status: 'error',
      message: 'Claude Code SDK cannot be used in serverless environment',
      explanation: 'Claude Code SDKの定額制認証（claude auth login）は、ローカル開発環境でのみ使用可能です。Vercelのようなサーバーレス環境では認証情報を保持できません。',
      alternatives: [
        {
          option: 'Anthropic API',
          description: 'APIキーを使用してAnthropicのAPIを直接呼び出す方法',
          requirement: 'APIキーの取得が必要'
        },
        {
          option: 'ローカルプロキシ',
          description: 'ローカル環境でClaude Code CLIを実行し、そこにリクエストを転送する方法',
          requirement: '常時稼働するサーバーが必要'
        }
      ],
      timestamp: new Date().toISOString()
    });
    return;
  }

  // その他のメソッドは許可しない
  res.status(405).json({
    status: 'error',
    message: 'Method not allowed'
  });
}
