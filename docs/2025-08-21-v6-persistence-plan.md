# 永続化機能実装計画

## 概要

Markdown の chat コードブロックと UI 間の連携機能を実装し、データの永続化を実現する。

## 基本方針

1. **シンプルな構造を維持** - 複雑な双方向同期は避ける
2. **段階的実装** - 最低限の機能から順次拡張
3. **手動同期ベース** - ボタンクリックでの明示的な同期

## Step by Step 実装計画

### Step 1: Export Format 改善 （✅ 実装済み）

- **目標**: エクスポート時に ```chat ブロックで出力
- **実装**:
  - DataManager.generateMarkdown() を修正
  - `chat\n{content}\n` 形式に変更
- **テスト**: エクスポートボタンでフォーマット確認

### Step 2: Markdown 解析機能 （WIP → 修正中）

- **目標**: Markdownファイル内の```chatブロックからの直接解析・表示
- **実装**:
  - Step 2-1: ChatParser クラス作成 ✅
  - Step 2-2: CodeMirror拡張で```chatブロック検出
  - Step 2-3: ブロッククリック時の自動パネル表示
  - Step 2-4: フォーカスされたブロックのみ解析・表示

- **使用フロー**: 
  1. Markdownファイルを開く
  2. ````chatブロック`をクリック/フォーカス
  3. 右側にChat Log Previewパネルが自動表示
  4. フォーカスしたブロックの内容が解析され表示
  5. 複数ブロックがある場合、フォーカス部分のみ対象

- **テスト**: mockup-v2.htmlの動作を再現

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
