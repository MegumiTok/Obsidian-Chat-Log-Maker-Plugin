# Reply 時のメッセージ順序バグ修正

## 問題点

- 通常の Post ボタンでの新規メッセージ：正常に下に追加される
- Reply ボタンでの新規メッセージ：逆順になり上に表示される（親より上に表示される）

## 仮説

1. DataManager の`insertComment`メソッドで親メッセージの次（index + 1）に挿入しているが、これが原因？
2. 返信フォームで追加された新しいメッセージが、親メッセージより上に表示されてしまう
3. `render`メソッドでの配列の処理順序に問題がある？

## やったこと

1. デバッグ用 console.log を追加して状況を分析（後で削除）
2. view.ts の onReplySubmit 処理を確認
   - 問題発見：`insertComment(parentIndex + 1, reply)` で親の直後に挿入していた
3. **根本原因の修正**：
   - 返信は通常のチャットのように配列の最後に追加されるべき
   - `insertComment(parentIndex + 1, reply)` → `addComment(reply)` に変更
4. デバッグログを削除してコードをクリーンアップ
