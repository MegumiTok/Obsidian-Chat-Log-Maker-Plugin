# UI 改善: Reply ボタンの配置最適化

## 解決したいこと

現在の Reply ボタンがメッセージの下に単独で表示されているため、以下の問題が発生している：

- チャットメッセージ一つ一つが縦に長くなり表示量が減少
- Reply ボタンのためだけのスペースが確保されて無駄が多い
- 全体的にチャットの見た目が見にくい

## 方針

- Reply ボタンを現在の Edit/Delete ボタンと同じ行（メッセージヘッダー）に移動
- ボタンの並び順を「Reply | Edit | Delete」にして Reply を最も使いやすい位置に配置
- 各メッセージをよりコンパクトに表示

## やったこと

1. 現在の message-renderer の構造を確認
2. renderMessage メソッドでの Reply ボタン配置箇所を特定
3. Reply ボタンを message-footer から message-actions に移動
4. ボタンの順序とスタイリングを調整
   - Reply ボタンを message-actions の最初に配置（Reply | Edit | Delete の順）
   - message-footer と replyBtn の作成処理を削除
   - コメントをより正確に修正

## TODO

- 実装完了、テストが必要
- 必要に応じて CSS の調整
