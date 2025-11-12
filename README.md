# ガチャマシンアプリ（Flutter Kaigi 2025）

Flutter Kaigi 2025のASSIGNブース用ガチャアプリケーションです。景品管理とガチャ抽選機能を提供します。

## 主な機能

- 🎰 **ガチャ抽選機能**: アニメーション付きで景品を抽選
- 📦 **景品管理**: 景品の追加・編集・削除
- 📊 **在庫管理**: リアルタイムの在庫数表示
- 💾 **データ永続化**: LocalStorageまたはGoogleスプレッドシートに対応
- 🌐 **オフライン対応**: ハイブリッドモードでオフライン時も動作

## Googleスプレッドシート連携

このアプリは、景品データをGoogleスプレッドシートで管理できます。

**メリット:**
- 複数デバイス・ブラウザ間でデータを共有
- スプレッドシート上で直接データを編集可能
- データのバックアップが容易
- チームでの協業が可能

**セットアップ方法:**
詳細は [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) をご覧ください。

## クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

### 3. ビルド

```bash
npm run build
```

### 4. ビルドのプレビュー

```bash
npm run preview
```

## データソース設定

### LocalStorageのみ使用（デフォルト）

環境変数の設定は不要です。ブラウザのLocalStorageにデータが保存されます。

### Googleスプレッドシートを使用

1. `.env.example` をコピーして `.env` を作成
2. スプレッドシートのセットアップ（[GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) 参照）
   - 列構成は `ID / 名前 / 画像URL / 在庫 / 仕入れ総数 / 説明 / 順番 / 作成日時`。`順番`列が小さいほどアプリ内で左側に表示されます。
3. `.env` に以下を設定：

```env
VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/XXX/exec
```

4. 開発サーバーを再起動
5. 設定画面（⚙️）でデータソーストグルを切り替え

**データソースの切り替え：**
- 設定画面に常にトグルスイッチが表示されます
- トグルをクリックすると、ローカルストレージ⇔スプレッドシートを即座に切り替えられます
- 切り替え時にページが自動的にリロードされ、新しいデータソースからデータが読み込まれます
- スプレッドシートモードを使用する場合は、事前に`.env`ファイルにGoogle Sheets APIのURLを設定してください

## プロジェクト構成

```
src/
├── lib/
│   ├── components/      # Svelteコンポーネント
│   │   ├── GachaScreen.svelte
│   │   ├── SettingsScreen.svelte
│   │   └── ...
│   ├── services/        # ビジネスロジック
│   │   ├── prizeService.ts
│   │   ├── googleSheetsService.ts
│   │   └── ...
│   ├── stores/          # Svelteストア
│   │   └── prizes.svelte.ts
│   ├── types/           # TypeScript型定義
│   │   └── index.ts
│   └── config.ts        # アプリケーション設定
├── App.svelte           # ルートコンポーネント
└── main.ts              # エントリーポイント

google-apps-script/
server/
└── Code.gs              # Google Apps Scriptコード
```

## テスト

```bash
npm test
```

## GitHub Pages へのデプロイ

リポジトリ `CHIHI913/gacha-machine-flutter-kaigi-2025` の GitHub Pages でホストできます。

1. **Viteのベースパス**: `vite.config.ts` で `base: '/gacha-machine-flutter-kaigi-2025/'` が指定されています。別リポジトリ名で公開する場合は書き換えてください。
2. **環境変数**: `.env.production.example` を参考に、Apps Script の `/exec` URL を GitHub Secrets `VITE_GOOGLE_SHEETS_API_URL` に登録します。
3. **デプロイフロー**: `.github/workflows/deploy.yml` が `main` ブランチの push をトリガーにビルドし、GitHub Pages（Source: GitHub Actions）へ自動デプロイします。Settings → Pages → Source を「GitHub Actions」に変更してください。
4. 公開URL: `https://CHIHI913.github.io/gacha-machine-flutter-kaigi-2025/`