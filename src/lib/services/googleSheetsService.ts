import type { Prize, GachaResultLogEntry } from '../types';
import { GoogleSheetsError, toGoogleSheetsErrorCategory } from '../errors/googleSheetsError';

/**
 * Google Sheets API レスポンス型
 */
interface GoogleSheetsResponse {
  prizes?: Prize[];
  success?: boolean;
  prize?: Prize;
  newStock?: number;
  error?: string;
}

/**
 * Google Sheets連携サービス
 * Apps Script Web APIを通じてスプレッドシートとデータを同期
 */
export class GoogleSheetsService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * 全景品を取得
   * @returns 景品リスト
   * @throws {Error} API呼び出しに失敗した場合
   */
  async getPrizes(): Promise<Prize[]> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        const statusText = response.statusText || 'Unknown error';
        throw new GoogleSheetsError(
          `HTTPエラー (ステータスコード: ${response.status})`,
          {
            status: response.status,
            statusText,
            category: toGoogleSheetsErrorCategory(response.status),
            details: statusText,
          }
        );
      }

      const data: GoogleSheetsResponse = await response.json();

      if (data.error) {
        throw new GoogleSheetsError(`Apps Scriptエラー: ${data.error}`, {
          category: 'script',
          details: data.error,
        });
      }

      return data.prizes || [];
    } catch (error) {
      console.error('Failed to get prizes from Google Sheets:', error);

      if (error instanceof GoogleSheetsError) {
        throw error;
      }

      if (error instanceof TypeError) {
        throw new GoogleSheetsError(`ネットワークエラー: ${error.message}`, {
          category: 'network',
          originalError: error,
        });
      }

      throw new GoogleSheetsError(error instanceof Error ? error.message : String(error), {
        category: 'unknown',
        originalError: error,
      });
    }
  }

  /**
   * 景品を追加
   * @param prize 追加する景品データ
   * @returns 追加された景品
   * @throws {Error} API呼び出しに失敗した場合
   */
  async addPrize(prize: Prize): Promise<Prize> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          action: 'add',
          data: prize,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GoogleSheetsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success || !data.prize) {
        throw new Error('景品の追加に失敗しました');
      }

      return data.prize;
    } catch (error) {
      console.error('Failed to add prize to Google Sheets:', error);
      throw new Error('スプレッドシートへの景品追加に失敗しました');
    }
  }

  /**
   * 景品を更新
   * @param prize 更新する景品データ
   * @throws {Error} API呼び出しに失敗した場合
   */
  async updatePrize(prize: Partial<Prize> & { id: string }): Promise<void> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          action: 'update',
          data: prize,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GoogleSheetsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success) {
        throw new Error('景品の更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to update prize in Google Sheets:', error);
      throw new Error('スプレッドシートの景品更新に失敗しました');
    }
  }

  /**
   * 景品を削除
   * @param id 削除する景品のID
   * @throws {Error} API呼び出しに失敗した場合
   */
  async deletePrize(id: string): Promise<void> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          action: 'delete',
          id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GoogleSheetsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success) {
        throw new Error('景品の削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to delete prize from Google Sheets:', error);
      throw new Error('スプレッドシートからの景品削除に失敗しました');
    }
  }

  /**
   * 在庫を1つ減らす
   * @param id 景品のID
   * @returns 新しい在庫数
   * @throws {Error} API呼び出しに失敗した場合
   */
  async decrementStock(id: string): Promise<number> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          action: 'decrement',
          id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GoogleSheetsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success || data.newStock === undefined) {
        throw new Error('在庫の減少に失敗しました');
      }

      return data.newStock;
    } catch (error) {
      console.error('Failed to decrement stock in Google Sheets:', error);
      throw new Error('スプレッドシートの在庫減少に失敗しました');
    }
  }

  /**
   * ガチャ結果を「ガチャ結果」シートに記録
   */
  async logGachaResult(entry: GachaResultLogEntry): Promise<void> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          action: 'logResult',
          data: entry,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GoogleSheetsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success) {
        throw new Error('ガチャ結果の記録に失敗しました');
      }
    } catch (error) {
      console.error('Failed to log gacha result to Google Sheets:', error);
      throw new Error('スプレッドシートへのガチャ結果記録に失敗しました');
    }
  }

}
