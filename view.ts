import { ItemView, WorkspaceLeaf } from "obsidian";

// このビューを識別するための一意なIDを定義します
export const CHAT_LOG_MAKER_VIEW_TYPE = "chat-log-maker-view";

// ItemViewを継承して、独自のビュークラスを作成します
export class ChatLogMakerView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  // このビューのタイプを返すメソッドです
  getViewType() {
    return CHAT_LOG_MAKER_VIEW_TYPE;
  }

  // ビューのタブに表示されるテキストを返すメソッドです
  getDisplayText() {
    return "Chat Log Maker";
  }

  // このビューが開かれたときに実行されるメインの処理です
  async onOpen() {
    // containerElは、このビューのHTML要素です
    const container = this.containerEl.children[1];
    container.empty(); // 中身を一旦空にします

    // ここにUIを構築していくことになります
    container.createEl("h2", { text: "Chat Log Preview" });
    container.createEl("p", { text: "ここにコメントが表示されます。" });
  }

  // このビューが閉じられたときに実行される処理です
  async onClose() {
    // 必要であれば、後片付けの処理をここに書きます
  }
}
