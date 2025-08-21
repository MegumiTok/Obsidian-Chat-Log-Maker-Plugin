# Post Form 折りたたみ機能追加

## 問題点

- 入力フォームをコンパクトにしたが、ログ閲覧時は完全に隠したい場合がある
- 入力が必要な時だけフォームを表示したい

## 方針

1. **ヘッダーに折りたたみボタンを追加**：「+ Add Message」のようなボタン
2. **デフォルトで折りたたまれた状態**：初期表示時はフォーム非表示
3. **状態管理**：開閉状態を保持して UI 更新時も維持
4. **アニメーション**：スムーズな開閉アニメーション

## やったこと

1. **view.ts の機能追加**

   - フォーム開閉状態の管理フラグ `isFormExpanded` を追加
   - ヘッダーに「+ Add Message」ボタンを追加
   - `toggleFormVisibility()` メソッドでフォーム開閉を制御
   - ボタンテキストの動的更新（「+ Add Message」⇔「− Hide Form」）

2. **初期状態設定**

   - postFormContainer に `chat-log-maker-form-collapsed` クラスを初期設定
   - デフォルトでフォームが非表示状態に

3. **CSS アニメーション実装**

   - `.chat-log-maker-form-collapsed`: 高さ 0、透明、パディング削除
   - `.chat-log-maker-form-expanded`: max-height 500px、不透明
   - `transition: all 0.3s ease` でスムーズな開閉アニメーション

4. **ボタンスタイル統一**
   - Add Message ボタンを既存のアクセントボタンスタイルに追加
   - ホバー効果も統一
