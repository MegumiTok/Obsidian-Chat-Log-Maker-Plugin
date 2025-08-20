import { ItemView, WorkspaceLeaf } from "obsidian";
import { CHAT_LOG_MAKER_VIEW_TYPE, Comment, Speaker } from "./src/types";
import { DataManager } from "./src/data-manager";
import { PostForm } from "./src/post-form";
import { MessageRenderer } from "./src/message-renderer";

// ItemViewを継承して、独自のビュークラスを作成します
export class ChatLogMakerView extends ItemView {
  private dataManager: DataManager;
  private postForm: PostForm | null = null;
  private messageRenderer: MessageRenderer | null = null;
  
  // UI要素
  private titleDisplay: HTMLElement | null = null;
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

    // Speaker設定エリア
    this.createSpeakerSection(mainContainer);

    // チャット表示エリア（可変高さ、スクロール可能）
    const chatArea = mainContainer.createDiv("chat-log-maker-chat-area");
    this.createChatArea(chatArea);

    // リフレッシュエリア（固定高さ60px）
    const refreshArea = mainContainer.createDiv("chat-log-maker-refresh-area");
    const refreshBtn = refreshArea.createEl("button", {
      text: "Refresh",
      cls: "chat-log-maker-refresh-btn",
    });

    refreshBtn.addEventListener("click", () => {
      this.updateDisplay();
    });
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

  private createSpeakerSection(container: HTMLElement): void {
    // Speaker section全体のコンテナ
    const speakersSection = container.createDiv("chat-log-maker-speakers");
    
    speakersSection.createEl("h3", {
      text: "👥 Speakers",
      cls: "chat-log-maker-section-title",
    });

    const speakersContainer = speakersSection.createDiv("chat-log-maker-speakers-list");

    // 固定5人のSpeaker名前編集
    this.dataManager.getSpeakers().forEach((speaker, index) => {
      const speakerItem = speakersContainer.createDiv("chat-log-maker-speaker-item");

      speakerItem.createDiv({
        text: speaker.id,
        cls: "chat-log-maker-speaker-label",
      });

      const nameInput = speakerItem.createEl("input", {
        type: "text",
        placeholder: `Speaker ${speaker.id}`,
        cls: "chat-log-maker-speaker-name",
      });
      nameInput.value = speaker.name;
      
      // 名前変更時のイベント
      const handleNameChange = () => {
        this.dataManager.updateSpeakerName(index, nameInput.value);
        this.updateDisplay();
        this.updatePostFormSpeakers();
      };
      
      nameInput.addEventListener("input", handleNameChange);
      nameInput.addEventListener("blur", handleNameChange);
      
      // Enterキーでも確定
      nameInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleNameChange();
          nameInput.blur();
        }
      });
    });
  }

  private createChatArea(container: HTMLElement): void {
    // タイトル表示
    this.titleDisplay = container.createEl("h3", {
      text: this.dataManager.getThreadTitle() || "💬 No Title",
      cls: "chat-log-maker-chat-title",
    });

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
          this.dataManager.insertComment(parentIndex + 1, reply);
          this.updateDisplay();
        }
      }
    );

    // 初期表示
    this.updateDisplay();
  }

  private updateDisplay(): void {
    // タイトル更新
    if (this.titleDisplay) {
      const title = this.dataManager.getThreadTitle();
      this.titleDisplay.textContent = title ? `💬 ${title}` : "💬 No Title";
    }

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
