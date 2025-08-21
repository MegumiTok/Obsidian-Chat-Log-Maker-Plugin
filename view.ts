import { ItemView, WorkspaceLeaf } from "obsidian";
import { CHAT_LOG_MAKER_VIEW_TYPE, Comment } from "./src/types";
import { DataManager } from "./src/data-manager";
import { PostForm } from "./src/post-form";
import { MessageRenderer } from "./src/message-renderer";

// ItemViewを継承して、独自のビュークラスを作成します
export class ChatLogMakerView extends ItemView {
  private dataManager: DataManager;
  private postForm: PostForm | null = null;
  private messageRenderer: MessageRenderer | null = null;

  // UI要素
  private messagesContainer: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.dataManager = new DataManager();
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
    const container = this.containerEl.children[1];
    container.empty();

    // メインコンテナを作成 - 縦1カラム構成
    const mainContainer = container.createDiv("chat-log-maker-container");

    // ヘッダーエリア
    this.createHeader(mainContainer);

    // チャット表示エリア（可変高さ、スクロール可能）
    const chatArea = mainContainer.createDiv("chat-log-maker-chat-area");
    this.createChatArea(chatArea);
  }

  private createHeader(container: HTMLElement): void {
    const headerArea = container.createDiv("chat-log-maker-header");
    headerArea.createEl("h2", {
      text: "Chat Log Preview",
      cls: "chat-log-maker-header-title",
    });

    const headerButtons = headerArea.createDiv("chat-log-maker-header-buttons");
    const exportBtn = headerButtons.createEl("button", {
      text: "📋 Export",
      cls: "chat-log-maker-export-btn",
    });

    exportBtn.addEventListener("click", () => {
      const markdown = this.dataManager.generateMarkdown();
      navigator.clipboard.writeText(markdown);
      exportBtn.textContent = "📋 Copied!";
      setTimeout(() => {
        exportBtn.textContent = "📋 Export";
      }, 2000);
    });
  }

  private createChatArea(container: HTMLElement): void {
    // メッセージ表示エリア（スクロール可能）
    this.messagesContainer = container.createDiv("chat-log-maker-messages");

    // 投稿フォーム
    const postFormContainer = container.createDiv("chat-log-maker-post-form");
    this.postForm = new PostForm(
      postFormContainer,
      this.dataManager.getSpeakers(),
      (comment: Comment) => {
        this.dataManager.addComment(comment);
        this.updateDisplay();
      },
      () => {
        // 新しいスピーカーを追加する処理
        const newSpeaker = this.dataManager.addNextSpeaker();
        if (newSpeaker) {
          this.updatePostFormSpeakers();
          // 新しく追加されたスピーカーを選択状態にする
          this.postForm?.updateSpeakers(this.dataManager.getSpeakers());
          // セレクターの値を新しいスピーカーに設定
          setTimeout(() => {
            this.postForm?.setSpeakerValue(newSpeaker.id);
          }, 10);
        }
        return newSpeaker;
      }
    );

    // メッセージレンダラー初期化
    this.messageRenderer = new MessageRenderer(
      this.messagesContainer,
      this.dataManager.getComments(),
      this.dataManager.getSpeakers(),
      {
        onUpdate: () => this.updateDisplay(),
        onCommentUpdate: (index: number, updates: Partial<Comment>) => {
          this.dataManager.updateComment(index, updates);
          this.updateDisplay();
        },
        onCommentDelete: (index: number) => {
          this.dataManager.deleteComment(index);
          this.updateDisplay();
        },
        onReplySubmit: (parentIndex: number, reply: Comment) => {
          // 返信は配列の最後に追加する
          this.dataManager.addComment(reply);
          this.updateDisplay();
        },
        onNewSpeaker: () => {
          // リプライフォームでの新しいスピーカー追加処理
          const newSpeaker = this.dataManager.addNextSpeaker();
          if (newSpeaker) {
            this.updateDisplay();
            this.updatePostFormSpeakers();
          }
          return newSpeaker;
        },
      }
    );

    // 初期表示
    this.updateDisplay();
  }

  private updateDisplay(): void {
    // メッセージ更新
    if (this.messageRenderer) {
      this.messageRenderer.updateData(
        this.dataManager.getComments(),
        this.dataManager.getSpeakers()
      );
      this.messageRenderer.render();
    }
  }

  private updatePostFormSpeakers(): void {
    if (this.postForm) {
      this.postForm.updateSpeakers(this.dataManager.getSpeakers());
    }
  }

  // このビューが閉じられたときに実行される処理です
  async onClose() {
    // 必要であれば、後片付けの処理をここに書きます
  }
}

// 互換性のためにエクスポート
export { CHAT_LOG_MAKER_VIEW_TYPE };
