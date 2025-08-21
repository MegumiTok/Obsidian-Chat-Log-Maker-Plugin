# Step 2: Markdown 解析機能実装作業ログ

## 問題点

- Markdown の```chat ブロックを解析して Comment の配列に変換する機能が未実装
- 既存のエクスポート機能に対応する逆変換（ロード）機能が必要

## 仮説

- ChatParser クラスで```chat ブロック内の > 記法を解析可能
- DataManager に loadFromMarkdown メソッドを追加することで統合可能

## やったこと

- ChatParser クラスを新規作成（src/chat-parser.ts）
  - extractChatBlocks: ```chat ブロックの抽出
  - parseChatContent: chat ブロック内容の解析
  - parseLine: 各行の > 記法解析
  - Speaker 自動検出（A, B, C...順）
- DataManager に統合
  - import 追加（ChatParser）
  - loadFromMarkdown メソッド実装
- テスト用サンプルファイル作成（test-sample.md、test-parser.ts）

## 📝 実装についての重要な指摘

### 現在の実装の問題点

実装した ChatParser は**独立したパーサー機能**であり、実際の Obsidian での使用フローとは異なる：

- **現在**: Chat Log Maker ビューで Markdown テキストを手動入力して解析
- **期待される動作**: Markdown ファイルの```chat ブロックにフォーカスした時に自動で専用パネルが開く

### 正しい使用フロー（mockup-v2.html 参照）

1. Markdown ファイルを開く
2. ````chatブロック`をクリック（フォーカス）
3. 右側に Chat Log Preview パネルが自動で開く
4. フォーカスされた```chat ブロックの内容が解析・表示される
5. 複数の```chat ブロックがある場合は、フォーカスした部分のみが対象
