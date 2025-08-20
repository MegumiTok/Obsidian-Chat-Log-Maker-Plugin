# Chat Log Maker Plugin 開発 - Step 4-3: Speaker 概念への統一とシンプル化

## 概要

Character 管理機能を削除し、Speaker 概念で統一する。デフォルト 5 人（A, B, C, D, E）の固定設定にして、UI をシンプルに再設計する。

## 問題点

- Add Character ボタンが動作しない（複雑なスコープ問題）
- Character 管理の UI が複雑すぎる
- Character と Speaker の概念が重複している
- デフォルト 5 人設定があるのに、わざわざ管理機能が必要ない

## 仮説

- 固定 5 人（A, B, C, D, E）で十分
- Speaker 選択時に名前を動的に設定できれば管理不要
- UI はチャットログ表示に集中すべき

## やりたいこと

1. Character 管理セクションを完全削除
2. Character 概念を Speaker に統一
3. 固定 5 人の Speaker（A, B, C, D, E）に設定
4. Speaker 選択時に名前をカスタマイズ可能にする機能を検討

## やったこと

- Character 管理機能（追加・削除ボタン）を完全削除
- createParticipantsSection → createSpeakerSection に名称変更
- 固定 5 人の Speaker（A, B, C, D, E）設定を確実に実装
- すべての this.characters 参照を this.speakers に統一
- 複雑な使用実績ソート機能を削除し、シンプルな全 Speaker 表示に変更
- UI 表示を"Characters"から"Speakers"に変更
