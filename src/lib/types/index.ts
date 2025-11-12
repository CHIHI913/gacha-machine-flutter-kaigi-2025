/**
 * ガチャアプリケーションの型定義
 */

/**
 * 景品エンティティ
 */
export interface Prize {
  /** 一意識別子 */
  id: string;

  /** 景品名（1-100文字） */
  name: string;

  /** 景品画像URL */
  imageUrl: string;

  /** 在庫数（0以上の整数） */
  stock: number;

  /** 仕入れ総数（分母） */
  totalStock?: number;

  /** 表示順（小さいほど左側） */
  order?: number;

  /** 作成日時（UNIXタイムスタンプ） */
  createdAt: number;

  /** 景品の説明テキスト（オプション、最大500文字） */
  description?: string;
}

/**
 * ガチャ実行状態
 */
export type GachaState = 'idle' | 'spinning' | 'revealing' | 'result' | 'complete';

/**
 * 画面種別
 */
export type Screen = 'gacha' | 'settings';

/**
 * 効果音の種類
 */
export type SoundEffect = 'spin' | 'reveal' | 'result';

/**
 * 景品追加リクエスト
 */
export interface AddPrizeRequest {
  name: string;
  imageUrl: string;
  stock: number;
  totalStock?: number;
  order?: number;
  description?: string;
}

/**
 * 景品更新リクエスト
 */
export interface UpdatePrizeRequest {
  id: string;
  name?: string;
  imageUrl?: string;
  stock?: number;
  totalStock?: number;
  order?: number;
  description?: string;
}

/**
 * ガチャ結果
 */
export interface GachaResult {
  prize: Prize;
  timestamp: number;
}

/**
 * ガチャ結果ログ
 */
export interface GachaResultLogEntry {
  /** 当選した景品名 */
  prizeName: string;

  /** ガチャを引いたタイムスタンプ（UNIXミリ秒） */
  drawnAt: number;

  /** 該当景品の残り個数 */
  remainingStock: number;
}

/**
 * アニメーション設定
 */
export interface AnimationConfig {
  duration: number;
  easing?: (t: number) => number;
}

/**
 * レアリティレベル
 */
export type RarityLevel = 'Normal' | 'Rare' | 'SuperRare';

/**
 * 景品表示情報(Value Object)
 */
export interface PrizeDisplayInfo {
  /** 景品エンティティ */
  prize: Prize;

  /** 当選確率(0-100) */
  probability: number;

  /** レアリティレベル */
  rarity: RarityLevel;

  /** 在庫が少ないかどうか（残数が分母の10%以下） */
  isLowStock: boolean;
}

/**
 * 景品統計情報(Value Object)
 */
export interface PrizeStats {
  /** 登録景品総数 */
  totalCount: number;

  /** 在庫がある景品数 */
  availableCount: number;

  /** 在庫切れ景品数 */
  outOfStockCount: number;

  /** 総在庫数（残） */
  remainingStock: number;

  /** 仕入れ総数 */
  totalStockCapacity: number;

  /** @deprecated 互換用: remainingStock と同値 */
  totalStock?: number;
}
