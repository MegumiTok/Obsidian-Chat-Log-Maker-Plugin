# Obsidian プラグイン開発のファイル構造とビルドプロセス

## ファイル構造と役割

### 📁 ソースファイル（開発者が編集）

```
main.ts          - プラグインのエントリーポイント（メインクラス）
view.ts          - カスタムビューの実装
styles.css       - プラグインのスタイル
```

### 📁 設定ファイル

```
manifest.json         - プラグインのメタデータ（ID、名前、バージョン等）
package.json         - npm設定、依存関係、ビルドスクリプト
tsconfig.json        - TypeScript設定
esbuild.config.mjs   - ビルド設定
```

### 📁 生成ファイル（自動生成、編集禁止）

```
main.js          - TypeScriptからコンパイルされたJavaScript（実行ファイル）
node_modules/    - npm依存関係
```

### 📁 その他

```
versions.json    - バージョン履歴
version-bump.mjs - バージョン管理スクリプト
docs/           - プロジェクトドキュメント
```

## ビルドプロセスの仕組み

### 1. エントリーポイント

```javascript
// esbuild.config.mjs
entryPoints: ["main.ts"],  // ←ここから開始
outfile: "main.js",        // ←ここに出力
```

### 2. ビルドフロー

```
main.ts → esbuild → main.js
  ↓
import './view.ts' も一緒にバンドル
  ↓
Obsidianが main.js を読み込み
```

### 3. 開発時の自動ビルド

```bash
npm run dev
# ↓
node esbuild.config.mjs
# ↓
ファイル変更を監視 (watch mode)
# ↓
main.ts や view.ts が変更されると自動で main.js を再生成
```

## 重要なポイント

### ❌ 間違った理解

- **main.js を手動編集** → ❌ ビルド時に上書きされる
- **main.ts だけが重要** → ❌ view.ts もバンドルに含まれる

### ✅ 正しい理解

- **main.ts がエントリーポイント** → そこから import されるファイルも全てバンドル
- **main.js は自動生成** → 編集してはいけない
- **Obsidian が読み込むのは main.js** → これが最終的な実行ファイル

## 現在のプロジェクト構造

```
main.ts
  ↓ import
view.ts (ChatLogMakerView クラス)
  ↓ esbuild でバンドル
main.js (全てが含まれた実行ファイル)
  ↓ Obsidianが読み込み
プラグイン動作
```

## styles.css について

- **別途読み込み**: CSS は main.js とは別に Obsidian が直接読み込む
- **自動適用**: プラグイン有効化時に自動でスタイルが適用される
- **ビルド対象外**: TypeScript のビルドプロセスには含まれない

## 開発ワークフロー

1. **開発開始**: `npm run dev` で watch mode 開始
2. **コード編集**: main.ts, view.ts, styles.css を編集
3. **自動ビルド**: esbuild が変更を検知して main.js を自動更新
4. **Obsidian 確認**: プラグインをリロードして動作確認

## トラブルシューティング

### ビルドは成功しているが変更が反映されない場合

1. **Obsidian キャッシュ**: プラグインの無効化 → 有効化
2. **完全再起動**: Obsidian 自体の再起動
3. **開発者ツール**: F12 でエラー確認

### ビルドエラーの場合

1. **TypeScript エラー**: main.ts, view.ts の構文確認
2. **インポートエラー**: ファイルパス、エクスポート/インポートの確認
3. **依存関係エラー**: package.json の確認
