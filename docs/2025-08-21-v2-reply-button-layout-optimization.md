# UI改善: Replyボタンの配置最適化

## 解決したいこと

現在のReplyボタンがメッセージの下に単独で表示されているため、以下の問題が発生している：
- チャットメッセージ一つ一つが縦に長くなり表示量が減少
- Replyボタンのためだけのスペースが確保されて無駄が多い
- 全体的にチャットの見た目が見にくい

## 方針

- Replyボタンを現在の Edit/Delete ボタンと同じ行（メッセージヘッダー）に移動
- ボタンの並び順を「Reply | Edit | Delete」にしてReplyを最も使いやすい位置に配置
- 各メッセージをよりコンパクトに表示

## やったこと

1. 現在のmessage-rendererの構造を確認
2. renderMessage メソッドでのReplyボタン配置箇所を特定
3. Replyボタンをmessage-footerからmessage-actionsに移動
4. ボタンの順序とスタイリングを調整
   - Replyボタンをmessage-actionsの最初に配置（Reply | Edit | Delete の順）
   - message-footerとreplyBtnの作成処理を削除
   - コメントをより正確に修正

## TODO

- 実装完了、テストが必要
- 必要に応じてCSSの調整
