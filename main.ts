import { Plugin } from "obsidian";
import { ChatLogMakerView, CHAT_LOG_MAKER_VIEW_TYPE } from "./view";

// メインのプラグインクラス
export default class ChatLogMakerPlugin extends Plugin {
  async onload() {
    // ビューを登録します
    this.registerView(
      CHAT_LOG_MAKER_VIEW_TYPE,
      leaf => new ChatLogMakerView(leaf)
    );

    // コマンドパレットに表示されるコマンドを追加
    this.addCommand({
      id: "open-chat-log-maker",
      name: "Open Chat Log Maker",
      callback: () => {
        this.activateView();
      },
    });

    // リボンにアイコンを追加
    this.addRibbonIcon("message-square", "Chat Log Maker", () => {
      this.activateView();
    });
  }

  async onunload() {
    // プラグインがアンロードされる時の処理
  }

  async activateView() {
    // ビューを開く処理
    const { workspace } = this.app;

    let leaf = workspace.getLeavesOfType(CHAT_LOG_MAKER_VIEW_TYPE)[0];

    if (!leaf) {
      // 新しいリーフを作成してビューを開く
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({
        type: CHAT_LOG_MAKER_VIEW_TYPE,
        active: true,
      });
    }

    // ビューをアクティブにする
    workspace.revealLeaf(leaf);
  }
}
