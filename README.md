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

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## Need an official Svelte framework?

Check out [SvelteKit](https://github.com/sveltejs/kit#readme), which is also powered by Vite. Deploy anywhere with its serverless-first approach and adapt to various platforms, with out of the box support for TypeScript, SCSS, and Less, and easily-added support for mdsvex, GraphQL, PostCSS, Tailwind CSS, and more.

## Technical considerations

**Why use this over SvelteKit?**

- It brings its own routing solution which might not be preferable for some users.
- It is first and foremost a framework that just happens to use Vite under the hood, not a Vite app.

This template contains as little as possible to get started with Vite + TypeScript + Svelte, while taking into account the developer experience with regards to HMR and intellisense. It demonstrates capabilities on par with the other `create-vite` templates and is a good starting point for beginners dipping their toes into a Vite + Svelte project.

Should you later need the extended capabilities and extensibility provided by SvelteKit, the template has been structured similarly to SvelteKit so that it is easy to migrate.

**Why `global.d.ts` instead of `compilerOptions.types` inside `jsconfig.json` or `tsconfig.json`?**

Setting `compilerOptions.types` shuts out all other types not explicitly listed in the configuration. Using triple-slash references keeps the default TypeScript setting of accepting type information from the entire workspace, while also adding `svelte` and `vite/client` type information.

**Why include `.vscode/extensions.json`?**

Other templates indirectly recommend extensions via the README, but this file allows VS Code to prompt the user to install the recommended extension upon opening the project.

**Why enable `allowJs` in the TS template?**

While `allowJs: false` would indeed prevent the use of `.js` files in the project, it does not prevent the use of JavaScript syntax in `.svelte` files. In addition, it would force `checkJs: false`, bringing the worst of both worlds: not being able to guarantee the entire codebase is TypeScript, and also having worse typechecking for the existing JavaScript. In addition, there are valid use cases in which a mixed codebase may be relevant.

**Why is HMR not preserving my local component state?**

HMR state preservation comes with a number of gotchas! It has been disabled by default in both `svelte-hmr` and `@sveltejs/vite-plugin-svelte` due to its often surprising behavior. You can read the details [here](https://github.com/rixo/svelte-hmr#svelte-hmr).

If you have state that's important to retain within a component, consider creating an external store which would not be replaced by HMR.

```ts
// store.ts
// An extremely simple external store
import { writable } from 'svelte/store'
export default writable(0)
```
