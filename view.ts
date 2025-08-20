import { ItemView, WorkspaceLeaf } from "obsidian";

// このビューを識別するための一意なIDを定義します
export const CHAT_LOG_MAKER_VIEW_TYPE = "chat-log-maker-view";

// 登場人物の型定義
interface Character {
  id: string;
  name: string;
}

// コメントの型定義
interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

// ItemViewを継承して、独自のビュークラスを作成します
export class ChatLogMakerView extends ItemView {
  private characters: Character[] = [];
  private comments: Comment[] = [];
  private threadTitle = "";

  // チャット表示更新関数
  private updateChatDisplay: () => void = () => {};

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    // デフォルトの登場人物を設定
    this.characters = [
      { id: "A", name: "" },
      { id: "B", name: "" },
    ];
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
    const headerArea = mainContainer.createDiv("chat-log-maker-header");
    headerArea.createEl("h2", {
      text: "Chat Log Preview",
      cls: "chat-log-maker-header-title",
    });

    const headerButtons = headerArea.createDiv("chat-log-maker-header-buttons");
    const exportBtn = headerButtons.createEl("button", {
      text: "📋 エクスポート",
      cls: "chat-log-maker-export-btn",
    });

    // 登場人物セクション（固定高さ150px）
    const participantsSection = mainContainer.createDiv(
      "chat-log-maker-participants"
    );
    this.createParticipantsSection(participantsSection);

    // チャット表示エリア（可変高さ、スクロール可能）
    const chatArea = mainContainer.createDiv("chat-log-maker-chat-area");
    this.createChatArea(chatArea);

    // リフレッシュエリア（固定高さ60px）
    const refreshArea = mainContainer.createDiv("chat-log-maker-refresh-area");
    const refreshBtn = refreshArea.createEl("button", {
      text: "リフレッシュ",
      cls: "chat-log-maker-refresh-btn",
    });

    // イベントハンドラー設定
    exportBtn.addEventListener("click", () => {
      const markdown = this.generateMarkdown();
      navigator.clipboard.writeText(markdown);
      exportBtn.textContent = "📋 コピーしました！";
      setTimeout(() => {
        exportBtn.textContent = "📋 エクスポート";
      }, 2000);
    });

    refreshBtn.addEventListener("click", () => {
      this.updateChatDisplay();
    });
  }

  // 登場人物セクションの作成（固定高さ150px）
  private createParticipantsSection(container: HTMLElement) {
    container.createEl("h3", {
      text: "👥 登場人物",
      cls: "chat-log-maker-section-title",
    });

    const participantsContainer = container.createDiv(
      "chat-log-maker-participants-list"
    );

    // 登場人物リストを表示する関数
    const updateParticipantsList = () => {
      participantsContainer.empty();
      this.characters.forEach((character, index) => {
        const participantItem = participantsContainer.createDiv(
          "chat-log-maker-participant-item"
        );

        participantItem.createDiv({
          text: character.id,
          cls: "chat-log-maker-participant-label",
        });

        const nameInput = participantItem.createEl("input", {
          type: "text",
          placeholder: character.name || character.id,
          cls: "chat-log-maker-participant-name",
        });
        nameInput.value = character.name;
        nameInput.addEventListener("input", e => {
          this.characters[index].name = (e.target as HTMLInputElement).value;
          this.updateChatDisplay();
        });

        const deleteBtn = participantItem.createEl("button", {
          text: "削除",
          cls: "chat-log-maker-participant-delete",
        });
        deleteBtn.addEventListener("click", () => {
          if (this.characters.length > 1) {
            this.characters.splice(index, 1);
            updateParticipantsList();
            this.updateChatDisplay();
          }
        });
      });
    };

    updateParticipantsList();

    // 登場人物追加ボタン
    const addBtn = container.createEl("button", {
      text: "+ 登場人物を追加",
      cls: "chat-log-maker-add-participant",
    });
    addBtn.addEventListener("click", () => {
      const nextId = String.fromCharCode(65 + this.characters.length); // A, B, C...
      this.characters.push({ id: nextId, name: "" });
      updateParticipantsList();
    });
  }

  // チャット表示エリアの作成
  private createChatArea(container: HTMLElement) {
    // タイトル表示
    const titleDisplay = container.createEl("h3", {
      text: this.threadTitle || "💬 タイトルなし",
      cls: "chat-log-maker-chat-title",
    });

    // メッセージ表示エリア（スクロール可能）
    const messagesContainer = container.createDiv("chat-log-maker-messages");

    // 初期メッセージ
    if (this.comments.length === 0) {
      const welcomeMessage = messagesContainer.createDiv(
        "chat-log-maker-message"
      );
      welcomeMessage.createDiv({
        text: "A",
        cls: "chat-log-maker-message-author",
      });
      welcomeMessage.createDiv({
        text: "チャットログが表示されます。登場人物を編集してメッセージを追加してください。",
        cls: "chat-log-maker-message-content",
      });
    }

    // チャット表示更新関数を設定
    this.updateChatDisplay = () => {
      // タイトル更新
      titleDisplay.textContent = this.threadTitle
        ? `💬 ${this.threadTitle}`
        : "💬 タイトルなし";

      // メッセージ更新
      messagesContainer.empty();
      if (this.comments.length === 0) {
        const welcomeMessage = messagesContainer.createDiv(
          "chat-log-maker-message"
        );
        welcomeMessage.createDiv({
          text: "A",
          cls: "chat-log-maker-message-author",
        });
        welcomeMessage.createDiv({
          text: "チャットログが表示されます。登場人物を編集してメッセージを追加してください。",
          cls: "chat-log-maker-message-content",
        });
      } else {
        this.comments.forEach(comment => {
          const messageDiv = messagesContainer.createDiv(
            "chat-log-maker-message"
          );

          const authorName =
            this.characters.find(c => c.id === comment.author)?.name ||
            comment.author;
          messageDiv.createDiv({
            text: authorName,
            cls: "chat-log-maker-message-author",
          });

          messageDiv.createDiv({
            text: comment.content,
            cls: "chat-log-maker-message-content",
          });
        });
      }
    };
  }

  // Markdown生成
  private generateMarkdown(): string {
    let markdown = "";

    if (this.threadTitle) {
      markdown += `# ${this.threadTitle}\n\n`;
    }

    this.comments.forEach(comment => {
      const authorName =
        this.characters.find(c => c.id === comment.author)?.name ||
        comment.author;
      markdown += `> ${authorName}: ${comment.content}\n\n`;
    });

    return markdown.trim();
  }

  // このビューが閉じられたときに実行される処理です
  async onClose() {
    // 必要であれば、後片付けの処理をここに書きます
  }
}
