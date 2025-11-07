import { prizesStore } from '../stores/prizes.svelte';
import { errorStore } from '../stores/error.svelte';
import { StorageService } from './storage';
import { PrizeService } from './prizeService';
import { config } from '../config';
import type { Prize } from '../types';
import { GoogleSheetsError } from '../errors/googleSheetsError';

/**
 * データ初期化サービス
 * アプリケーション起動時のデータロードと整合性チェックを担当
 */
export class DataInitializer {
  private storageService: StorageService<Prize[]>;
  private prizeService: PrizeService;

  constructor() {
    this.storageService = new StorageService<Prize[]>('prizes');
    this.prizeService = new PrizeService();
  }

  /**
   * アプリケーション起動時のデータ初期化
   * LocalStorageまたはGoogle Sheetsから景品データを読み込み、整合性をチェックする
   */
  async initialize(): Promise<void> {
    try {
      // PrizeServiceを使用してデータを読み込む
      await this.prizeService.loadPrizes();

      // 読み込まれたデータの整合性チェック
      const loadedPrizes = prizesStore.prizes;
      if (loadedPrizes.length > 0 && !this.checkDataIntegrity(loadedPrizes)) {
        console.error('Data integrity check failed. Initializing with empty data.');
        this.clearData();
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);

      prizesStore.setPrizes([]);

      const { message, details } = this.buildErrorPayload(error);

      errorStore.setError('データ読み込みエラー', message, details);
    }
  }

  /**
   * データ整合性チェック
   * 読み込んだデータが正しい形式かどうかを検証する
   * @param prizes チェックする景品データ
   * @returns データが有効な場合true、無効な場合false
   */
  checkDataIntegrity(prizes: Prize[]): boolean {
    // 配列でない場合はfalse
    if (!Array.isArray(prizes)) {
      return false;
    }

    // 空配列の場合はtrue
    if (prizes.length === 0) {
      return true;
    }

    // 各景品のデータをチェック
    for (const prize of prizes) {
      // 必須フィールドの存在チェック
      if (!prize.id || typeof prize.id !== 'string') {
        return false;
      }

      if (!prize.name || typeof prize.name !== 'string') {
        return false;
      }

      if (typeof prize.imageUrl !== 'string') {
        return false;
      }

      if (typeof prize.stock !== 'number' || prize.stock < 0) {
        return false;
      }

      if (typeof prize.createdAt !== 'number') {
        return false;
      }
    }

    return true;
  }

  /**
   * データをクリア
   * LocalStorageとstoreの両方からデータを削除する
   */
  clearData(): void {
    try {
      localStorage.removeItem('prizes');
      prizesStore.setPrizes([]);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  private buildErrorPayload(error: unknown): { message: string; details: string } {
    const dataSource = config.isGoogleSheetsEnabled ? 'Googleスプレッドシート' : 'ローカルストレージ';

    if (!config.isGoogleSheetsEnabled) {
      const message = `${dataSource}からデータを読み込めませんでした。`;
      const detailMessage = error instanceof Error ? error.message : String(error);
      return {
        message,
        details: [
          `内部メッセージ: ${detailMessage}`,
          `データソース: ${dataSource}`,
          `タイムスタンプ: ${new Date().toLocaleString()}`,
        ].join('\n'),
      };
    }

    return {
      message: this.buildUserFacingMessage(error),
      details: this.buildErrorDetails(error),
    };
  }

  private buildUserFacingMessage(error: unknown): string {
    if (!(error instanceof GoogleSheetsError)) {
      return 'Googleスプレッドシートからデータを取得できませんでした。詳細は「詳細」をご確認ください。';
    }

    switch (error.category) {
      case 'network':
        return 'ネットワークまたはCORSの問題でGoogleスプレッドシートに接続できません。ブラウザの開発者ツールでリクエストがブロックされていないか確認してください。';
      case 'unauthorized':
        return '認証が必要です。ブラウザで会社のGoogleアカウントにログインしてから再読み込みしてください。';
      case 'forbidden':
        return 'Apps Scriptの公開設定でアクセスが拒否されています。「会社の全員」または「全員」に再デプロイしてください。';
      case 'not_found':
        return 'Apps ScriptのURLまたはシート名が見つかりません。`.env`に最新のURLが設定されているか確認してください。';
      case 'rate_limit':
        return 'Apps Scriptの実行回数制限に達しました。数分待ってから再度お試しください。';
      case 'server':
        return 'Google側で一時的な障害が発生しています。時間を置いて再試行するかApps Scriptログを確認してください。';
      case 'script':
        return 'Apps Script内部で例外が発生しました。`Code.gs`とログを確認してください。';
      default:
        return 'Googleスプレッドシートからデータを取得できませんでした。詳細は「詳細」をご確認ください。';
    }
  }

  private buildErrorDetails(error: unknown): string {
    const lines: string[] = [];

    if (error instanceof GoogleSheetsError) {
      lines.push(`内部メッセージ: ${error.message}`);
      lines.push(`検出された原因カテゴリ: ${this.describeCategory(error.category)}`);
      if (error.status) {
        const statusText = error.statusText ? ` ${error.statusText}` : '';
        lines.push(`HTTPステータス: ${error.status}${statusText}`);
      }
      if (error.details) {
        lines.push(`Apps Script詳細: ${error.details}`);
      }
    } else if (error instanceof Error) {
      lines.push(`内部メッセージ: ${error.message}`);
    } else if (error) {
      lines.push(`内部メッセージ: ${String(error)}`);
    }

    lines.push(`データソース: Googleスプレッドシート`);
    lines.push(`API URL: ${config.googleSheetsApiUrl || '(未設定)'}`);
    lines.push(`タイムスタンプ: ${new Date().toLocaleString()}`);
    lines.push('チェックポイント:');
    lines.push('- Apps Scriptの最新デプロイURLを `.env` に設定したか');
    lines.push('- ブラウザで会社のGoogleアカウントにログインしているか');
    lines.push('- ネットワーク/セキュリティソフトが `script.google.com` をブロックしていないか');

    return lines.join('\n');
  }

  private describeCategory(category: GoogleSheetsError['category']): string {
    switch (category) {
      case 'network':
        return 'ネットワーク/CORS問題';
      case 'unauthorized':
        return '認証エラー (401)';
      case 'forbidden':
        return '権限不足 (403)';
      case 'not_found':
        return 'URL/リソース未検出 (404)';
      case 'rate_limit':
        return '実行回数制限 (429)';
      case 'server':
        return 'Google側障害 (5xx)';
      case 'script':
        return 'Apps Script内部エラー';
      default:
        return '不明';
    }
  }
}
