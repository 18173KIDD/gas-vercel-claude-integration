/**
 * GAS → Vercel → Claude Code SDK → Spreadsheet 統合サンプル
 * 
 * 使用方法:
 * 1. このコードをGoogle Apps Scriptにコピー
 * 2. VERCEL_API_URLを実際のVercelデプロイURLに変更
 * 3. スプレッドシートIDを設定
 * 4. callClaudeAndWriteToSheet()関数を実行
 */

// 設定: 実際のVercelデプロイURLに変更してください
const VERCEL_API_URL = 'https://your-vercel-app.vercel.app/api/claude';

// 設定: スプレッドシートID（現在のスプレッドシートを使用する場合は空文字）
const SPREADSHEET_ID = ''; // 空の場合、現在のスプレッドシートを使用

/**
 * メイン関数: Claude Codeに質問してスプレッドシートに結果を書き込み
 */
function callClaudeAndWriteToSheet() {
  try {
    console.log('🚀 GAS → Vercel → Claude Code → Spreadsheet 統合開始');
    
    // 1. サンプル質問
    const question = '2024年の主要なAI技術トレンドを3つ教えてください。各項目は箇条書きで簡潔にお願いします。';
    
    // 2. Vercel API経由でClaude Codeに質問
    console.log('📤 Claude Codeに質問を送信中...');
    const claudeResponse = callClaudeAPI(question);
    
    // 3. スプレッドシートに結果を書き込み
    console.log('📝 スプレッドシートに結果を書き込み中...');
    writeToSpreadsheet(question, claudeResponse);
    
    console.log('✅ 処理完了！スプレッドシートを確認してください。');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    Browser.msgBox('エラー', `処理中にエラーが発生しました: ${error.message}`, Browser.Buttons.OK);
  }
}

/**
 * Vercel API経由でClaude Code SDKを呼び出し
 * @param {string} prompt - Claude Codeに送信するプロンプト
 * @returns {string} - Claude Codeからのレスポンス
 */
function callClaudeAPI(prompt) {
  try {
    // API リクエストペイロード
    const payload = {
      prompt: prompt
    };
    
    // HTTP リクエストオプション
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(payload)
    };
    
    // Vercel API にリクエスト送信
    console.log(`📡 Vercel API呼び出し: ${VERCEL_API_URL}`);
    const response = UrlFetchApp.fetch(VERCEL_API_URL, options);
    
    // レスポンス確認
    if (response.getResponseCode() !== 200) {
      throw new Error(`API エラー: ${response.getResponseCode()} - ${response.getContentText()}`);
    }
    
    // JSON解析
    const jsonResponse = JSON.parse(response.getContentText());
    
    if (jsonResponse.status !== 'success') {
      throw new Error(`Claude API エラー: ${jsonResponse.message}`);
    }
    
    console.log('✅ Claude Codeからレスポンス受信成功');
    return jsonResponse.response;
    
  } catch (error) {
    console.error('Claude API呼び出しエラー:', error);
    throw new Error(`Claude API呼び出し失敗: ${error.message}`);
  }
}

/**
 * スプレッドシートに質問と回答を書き込み
 * @param {string} question - 質問内容
 * @param {string} answer - Claude Codeからの回答
 */
function writeToSpreadsheet(question, answer) {
  try {
    // スプレッドシート取得
    const spreadsheet = SPREADSHEET_ID ? 
      SpreadsheetApp.openById(SPREADSHEET_ID) : 
      SpreadsheetApp.getActiveSpreadsheet();
    
    // シート取得（なければ作成）
    let sheet;
    try {
      sheet = spreadsheet.getSheetByName('Claude_Results');
    } catch (e) {
      sheet = spreadsheet.insertSheet('Claude_Results');
      // ヘッダー追加
      sheet.getRange(1, 1, 1, 4).setValues([['タイムスタンプ', '質問', '回答', '文字数']]);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
    
    // 新しい行に結果を追加
    const timestamp = new Date();
    const answerLength = answer.length;
    
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1, 1, 4).setValues([[
      timestamp,
      question,
      answer,
      answerLength
    ]]);
    
    // セル幅自動調整（質問と回答の列）
    sheet.autoResizeColumns(2, 2);
    
    console.log(`✅ スプレッドシート書き込み完了: 行 ${newRow}`);
    
  } catch (error) {
    console.error('スプレッドシート書き込みエラー:', error);
    throw new Error(`スプレッドシート書き込み失敗: ${error.message}`);
  }
}

/**
 * テスト関数: API接続確認
 */
function testAPIConnection() {
  try {
    console.log('🔍 API接続テスト開始');
    
    // GETリクエストでAPI状態確認
    const response = UrlFetchApp.fetch(VERCEL_API_URL.replace('/claude', '/hello'));
    
    console.log('API レスポンス:', response.getContentText());
    console.log('レスポンスコード:', response.getResponseCode());
    
    if (response.getResponseCode() === 200) {
      console.log('✅ API接続成功！');
      Browser.msgBox('成功', 'Vercel APIへの接続に成功しました！', Browser.Buttons.OK);
    } else {
      throw new Error(`API接続失敗: ${response.getResponseCode()}`);
    }
    
  } catch (error) {
    console.error('❌ API接続テスト失敗:', error);
    Browser.msgBox('エラー', `API接続テストに失敗しました: ${error.message}`, Browser.Buttons.OK);
  }
}

/**
 * カスタム質問関数
 * スプレッドシートから質問を読み取って実行
 */
function processQuestionsFromSheet() {
  try {
    const spreadsheet = SPREADSHEET_ID ? 
      SpreadsheetApp.openById(SPREADSHEET_ID) : 
      SpreadsheetApp.getActiveSpreadsheet();
    
    // Questions シート取得
    let questionsSheet;
    try {
      questionsSheet = spreadsheet.getSheetByName('Questions');
    } catch (e) {
      // Questions シートが存在しない場合は作成
      questionsSheet = spreadsheet.insertSheet('Questions');
      questionsSheet.getRange(1, 1, 3, 1).setValues([
        ['質問を入力してください（A列に1つずつ）:'],
        ['Pythonとは何ですか？'],
        ['機械学習の基本概念を教えてください。']
      ]);
      Browser.msgBox('準備完了', 'Questions シートを作成しました。A列に質問を入力してから再実行してください。', Browser.Buttons.OK);
      return;
    }
    
    // A列から質問を取得
    const questions = questionsSheet.getRange('A:A').getValues()
      .flat()
      .filter(q => q && q.toString().trim() !== '' && !q.toString().includes('質問を入力'));
    
    if (questions.length === 0) {
      Browser.msgBox('注意', 'Questions シートのA列に質問を入力してください。', Browser.Buttons.OK);
      return;
    }
    
    console.log(`📋 ${questions.length}個の質問を処理開始`);
    
    // 各質問を順番に処理
    questions.forEach((question, index) => {
      console.log(`📤 質問 ${index + 1}/${questions.length}: ${question}`);
      const answer = callClaudeAPI(question);
      writeToSpreadsheet(question, answer);
      
      // 次のリクエストまで少し待機（API制限対策）
      if (index < questions.length - 1) {
        Utilities.sleep(1000); // 1秒待機
      }
    });
    
    console.log('✅ 全ての質問の処理が完了しました！');
    Browser.msgBox('完了', `${questions.length}個の質問の処理が完了しました！Claude_Results シートを確認してください。`, Browser.Buttons.OK);
    
  } catch (error) {
    console.error('❌ 質問処理エラー:', error);
    Browser.msgBox('エラー', `質問処理中にエラーが発生しました: ${error.message}`, Browser.Buttons.OK);
  }
}