# Step 1: Export Format 改善 - ```chat ブロック対応

## 実装内容

### 目標

エクスポート時に ```chat ブロック形式で出力する

### やったこと

1. **DataManager.generateMarkdown() を修正**

   - 空のチャットの場合: `chat\n\n` を出力
   - 通常の場合: ```chat ブロックで囲んで出力
   - 行末の余分な改行を削除（`\n\n` → `\n`）

2. **出力フォーマット例**

````
\```chat
> A: １
>> A: ２
>>> B: ３
\```
````

### 技術的変更点

- `markdown` 変数を `chatContent` に変更
- 最終出力を `` `\`\`\`chat\n${chatContent.trim()}\n\`\`\`` に変更
- 各メッセージ行末の改行を単一に統一

## TODO

- Step 2: Markdown 解析機能（ChatParser 作成）
- Step 3: Load 機能追加
