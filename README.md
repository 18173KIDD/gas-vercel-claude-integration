# GAS → Vercel → Claude Code SDK → Spreadsheet Integration

## 概要

Google Apps Script (GAS) から Vercel 上の Claude Code SDK API を経由して、Claude Code で処理を行い、結果を Google Spreadsheet に書き込む統合システムです。

## システム構成

```
[Google Apps Script] 
     ↓ HTTP Request
[Vercel API Endpoint (Python)] 
     ↓ Claude Code SDK
[Claude Code 処理] 
     ↓ レスポンス
[Google Spreadsheet への書き込み]
```

## 技術スタック

- **API**: Python 3.12 + Vercel Serverless Functions
- **SDK**: Claude Code SDK (Python)
- **フロントエンド**: Google Apps Script
- **データ**: Google Spreadsheet

## API エンドポイント

### `/api/hello` - テスト用 Hello World API

**GET** リクエストで基本的な動作確認が可能です。

```bash
curl https://your-vercel-app.vercel.app/api/hello
```

## デプロイ

1. このリポジトリを Vercel にインポート
2. 自動的にデプロイが開始されます
3. Claude Code 認証設定（環境変数）

## 開発環境

```bash
# 仮想環境作成
python3 -m venv venv
source venv/bin/activate

# 依存関係インストール
pip install -r requirements.txt

# ローカルテスト
python test_sdk.py
```

## 次のステップ

- [ ] Claude Code SDK 統合 API エンドポイント作成
- [ ] GAS サンプルコード作成
- [ ] エンドツーエンドテスト
- [ ] エラーハンドリング強化

---

**作成日**: 2025年7月13日  
**目標**: GAS → Vercel → Claude Code SDK → Spreadsheet 統合システム完成