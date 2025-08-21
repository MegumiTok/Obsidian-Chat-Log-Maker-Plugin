# Step 2-2: CodeMirror 拡張による```chat ブロック検出実装

## 問題点

- 現在の実装は独立したパーサーのみで、実際の Markdown ファイルでの動作に対応していない
- ````chatブロック`のクリック/フォーカス検出が未実装
- mockup-v2.html のような使用フローが実現されていない

## 仮説

- Obsidian の CodeMirror 拡張で Markdown 内の```chat ブロックを検出可能
- クリックイベントハンドラーでフォーカスしたブロックの内容を取得可能
- 既存の ChatParser クラスと連携してパネル表示が実現可能

## やったこと

- 実装計画の修正（docs/2025-08-21-v6-persistence-plan.md）
- Step 2 を Step 2-1〜2-4 に細分化
- ChatBlockExtension クラス作成（src/chat-block-extension.ts）
  - ViewPlugin ベースの CodeMirror 拡張実装
  - ````chatブロック`の視覚的ハイライト表示
  - クリックイベントハンドラー
  - ブロック内容抽出機能
  - 自動パネル表示機能
- ChatLogMakerView に loadChatContent メソッド追加
- main.ts に CodeMirror 拡張統合
