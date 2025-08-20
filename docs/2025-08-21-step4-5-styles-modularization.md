# Chat Log Maker Plugin 開発 - Step 4-5: スタイルのモジュール化

-> [CSS @import 検証テスト](./css-import-test.md) の結果、スタイルのモジュール化は今回できないことが判明

## 概要

現在の styles.css が 484 行の巨大ファイルになっており、保守が困難。機能別・コンポーネント別に CSS ファイルを分割し、保守性を向上させる。

## 問題点

- styles.css が 484 行の巨大ファイル
- レイアウト、コンポーネント、ボタン、フォームなどが混在
- 特定の機能のスタイル修正時に影響範囲が分からない
- スタイルの重複や不要なコードが残っている可能性

## 仮説

- 機能別に CSS ファイルを分割することで可読性向上
- コンポーネント毎のスタイル管理により保守性向上
- 変数定義の統一により一貫性確保

## やること

1. CSS 変数・基本設定の分離 (src/styles/variables.css)
2. レイアウト関連の分離 (src/styles/layout.css)
3. コンポーネント別スタイルの分離
   - Speaker 管理 (src/styles/speakers.css)
   - メッセージ表示 (src/styles/messages.css)
   - フォーム関連 (src/styles/forms.css)
   - ボタン関連 (src/styles/buttons.css)
4. レスポンシブ対応 (src/styles/responsive.css)
5. メイン styles.css で統合

## ファイル構成

```text
styles.css (21行 - メインインポート)
├── src/styles/variables.css (変数定義)
├── src/styles/layout.css (レイアウト構造)
├── src/styles/speakers.css (Speaker管理)
├── src/styles/messages.css (メッセージ表示)
├── src/styles/forms.css (フォーム関連)
├── src/styles/buttons.css (ボタン関連)
└── src/styles/responsive.css (レスポンシブ)
```
