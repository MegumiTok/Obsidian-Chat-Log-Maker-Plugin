# 永続化機能実装計画

## 概要

Markdown の chat コードブロックと UI 間の連携機能を実装し、データの永続化を実現する。

## 基本方針

1. **シンプルな構造を維持** - 複雑な双方向同期は避ける
2. **段階的実装** - 最低限の機能から順次拡張
3. **手動同期ベース** - ボタンクリックでの明示的な同期

## Step by Step 実装計画

### Step 1: Export Format 改善

- **目標**: エクスポート時に ```chat ブロックで出力
- **実装**:
  - DataManager.generateMarkdown() を修正
  - `chat\n{content}\n` 形式に変更
- **テスト**: エクスポートボタンでフォーマット確認

### Step 2: Markdown 解析機能

- **目標**: chat コードブロックの認識・パース
- **実装**:

  - ChatParser クラス作成
  - `chat` ブロック内の `>` 記法を Comment 配列に変換
  - Speaker 自動検出（A, B, C...順）

- **テスト**: サンプル Markdown の解析確認

### Step 3: Load 機能追加

- **目標**: Markdown から UI への読み込み
- **実装**:
  - ヘッダーに「Load from Markdown」ボタン追加
  - テキストエリアで Markdown 入力 →Load
  - DataManager に loadFromMarkdown()メソッド追加
- **テスト**: 手動で Markdown を貼り付けて読み込み

## 技術仕様

### Export Format

````
\```chat
> A: １
>> A: ２
>>> B: ３
\```
````

### 解析ルール（Step 2 用）

- `>` の数 = replyLevel + 1
- `> 名前:` で Speaker 検出
- 初出 Speaker を順番に A, B, C...に割り当て
