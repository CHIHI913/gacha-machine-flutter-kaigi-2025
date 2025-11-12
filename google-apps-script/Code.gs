/**
 * ガチャマシン景品管理 - Google Apps Script Web API
 *
 * 【セットアップ手順】
 * 1. スプレッドシートで「拡張機能」→「Apps Script」を開く
 * 2. このコードを貼り付け
 * 3. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」を選択
 * 4. 「アクセスできるユーザー」を以下のいずれかに設定：
 *    - 「全員」（個人アカウント）
 *    - 「会社の全員」（企業のGoogle Workspaceアカウント）
 * 5. デプロイ後、URLをコピーしてアプリに設定
 *
 * 【スプレッドシートの列構成】
 * A列: ID
 * B列: 名前
 * C列: 画像URL
 * D列: 在庫（残数）
 * E列: 仕入れ総数（分母）
 * F列: 説明
 * G列: 順番
 * H列: 作成日時（タイムスタンプ）
 */

// 設定
const SHEET_NAME = 'シート1'; // スプレッドシートのシート名
const HEADER_ROW = 1; // ヘッダー行番号

/**
 * JSONレスポンスを生成
 * （Apps ScriptのWebアプリは自動で適切なCORSヘッダーを付与するため、ここではヘッダー操作を行わない）
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * OPTIONSリクエストハンドラ（プリフライト想定）
 * WebアプリではContentService経由で空レスポンスを返すだけで十分
 */
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GETリクエストハンドラ（全景品取得）
 */
function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createJsonResponse({ error: 'シートが見つかりません' });
    }

    const lastRow = sheet.getLastRow();

    // ヘッダーのみの場合
    if (lastRow <= HEADER_ROW) {
      return createJsonResponse({ prizes: [] });
    }

    // データ取得（ヘッダーを除く）
    const range = sheet.getRange(HEADER_ROW + 1, 1, lastRow - HEADER_ROW, 8);
    const values = range.getValues();

    const prizes = values
      .filter(row => row[0]) // ID が空でない行のみ
      .map(row => ({
        id: row[0].toString(),
        name: row[1] || '',
        imageUrl: row[2] || '',
        stock: Number(row[3]) || 0,
        totalStock: Number(row[4]) || Number(row[3]) || 0,
        description: row[5] || undefined,
        order: Number(row[6]) || 0,
        createdAt: row[7] ? new Date(row[7]).getTime() : Date.now()
      }));

    return createJsonResponse({ prizes });
  } catch (error) {
    return createJsonResponse({ error: error.message });
  }
}

/**
 * POSTリクエストハンドラ（景品の追加・更新・削除・在庫減少）
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;

    switch (action) {
      case 'add':
        return handleAdd(requestData.data);
      case 'update':
        return handleUpdate(requestData.data);
      case 'delete':
        return handleDelete(requestData.id);
      case 'decrement':
        return handleDecrement(requestData.id);
      default:
        return createJsonResponse({ error: '不明なアクションです' });
    }
  } catch (error) {
    return createJsonResponse({ error: error.message });
  }
}

/**
 * 景品を追加
 */
function handleAdd(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    return createJsonResponse({ error: 'シートが見つかりません' });
  }

  const newRow = [
    data.id,
    data.name,
    data.imageUrl,
    data.stock,
    data.totalStock !== undefined ? data.totalStock : data.stock,
    data.description || '',
    data.order !== undefined ? data.order : getNextOrder(sheet),
    new Date(data.createdAt)
  ];

  sheet.appendRow(newRow);

  return createJsonResponse({
    success: true,
    prize: {
      id: data.id,
      name: data.name,
      imageUrl: data.imageUrl,
      stock: data.stock,
      totalStock: data.totalStock !== undefined ? data.totalStock : data.stock,
      order: data.order !== undefined ? data.order : getNextOrder(sheet),
      description: data.description,
      createdAt: data.createdAt
    }
  });
}

/**
 * 景品を更新
 */
function handleUpdate(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    return createJsonResponse({ error: 'シートが見つかりません' });
  }

  const lastRow = sheet.getLastRow();
  const idColumn = sheet.getRange(HEADER_ROW + 1, 1, lastRow - HEADER_ROW, 1).getValues();

  // IDで行を検索
  let targetRow = -1;
  for (let i = 0; i < idColumn.length; i++) {
    if (idColumn[i][0].toString() === data.id) {
      targetRow = i + HEADER_ROW + 1;
      break;
    }
  }

  if (targetRow === -1) {
    return createJsonResponse({ error: '景品が見つかりません' });
  }

  // 既存データを取得
  const existingData = sheet.getRange(targetRow, 1, 1, 8).getValues()[0];

  // 更新（undefinedの場合は既存値を保持）
  sheet.getRange(targetRow, 2).setValue(data.name !== undefined ? data.name : existingData[1]);
  sheet.getRange(targetRow, 3).setValue(data.imageUrl !== undefined ? data.imageUrl : existingData[2]);
  sheet.getRange(targetRow, 4).setValue(data.stock !== undefined ? data.stock : existingData[3]);
  sheet.getRange(targetRow, 5).setValue(
    data.totalStock !== undefined ? data.totalStock : existingData[4]
  );
  sheet.getRange(targetRow, 6).setValue(
    data.description !== undefined ? data.description : existingData[5]
  );
  sheet.getRange(targetRow, 7).setValue(
    data.order !== undefined ? data.order : existingData[6]
  );

  return createJsonResponse({ success: true });
}

/**
 * 景品を削除
 */
function handleDelete(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    return createJsonResponse({ error: 'シートが見つかりません' });
  }

  const lastRow = sheet.getLastRow();
  const idColumn = sheet.getRange(HEADER_ROW + 1, 1, lastRow - HEADER_ROW, 1).getValues();

  // IDで行を検索
  let targetRow = -1;
  for (let i = 0; i < idColumn.length; i++) {
    if (idColumn[i][0].toString() === id) {
      targetRow = i + HEADER_ROW + 1;
      break;
    }
  }

  if (targetRow === -1) {
    return createJsonResponse({ error: '景品が見つかりません' });
  }

  sheet.deleteRow(targetRow);

  return createJsonResponse({ success: true });
}

/**
 * 在庫を1つ減らす
 */
function handleDecrement(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    return createJsonResponse({ error: 'シートが見つかりません' });
  }

  const lastRow = sheet.getLastRow();
  const idColumn = sheet.getRange(HEADER_ROW + 1, 1, lastRow - HEADER_ROW, 1).getValues();

  // IDで行を検索
  let targetRow = -1;
  for (let i = 0; i < idColumn.length; i++) {
    if (idColumn[i][0].toString() === id) {
      targetRow = i + HEADER_ROW + 1;
      break;
    }
  }

  if (targetRow === -1) {
    return createJsonResponse({ error: '景品が見つかりません' });
  }

  // 現在の在庫を取得
  const currentStock = sheet.getRange(targetRow, 4).getValue();
  const newStock = Math.max(0, Number(currentStock) - 1);

  // 在庫を更新
  sheet.getRange(targetRow, 4).setValue(newStock);

  return createJsonResponse({ success: true, newStock });
}

function getNextOrder(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW) {
    return 1;
  }
  const orderColumn = sheet.getRange(HEADER_ROW + 1, 7, lastRow - HEADER_ROW, 1).getValues();
  const orders = orderColumn
    .map((row) => Number(row[0]))
    .filter((value) => !isNaN(value) && value !== null);
  if (orders.length === 0) {
    return 1;
  }
  return Math.max.apply(null, orders) + 1;
}
