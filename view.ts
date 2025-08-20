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
  private threadTitle: string = "";
  
  // 更新関数の参照を保持
  private updateMarkdownOutput: () => void = () => {};
  private updateSpeakerSelect: () => void = () => {};
  private updateCommentsDisplay: (container: HTMLElement) => void = () => {};
  private updatePreviewTitle: () => void = () => {};

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    // デフォルトの登場人物を設定
    this.characters = [
      { id: "A", name: "" },
      { id: "B", name: "" }
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

    // メインコンテナを作成
    const mainContainer = container.createDiv("chat-log-maker-container");

    // コントロールパネル（左側）
    const controlPanel = mainContainer.createDiv("chat-log-maker-control-panel");
    this.createControlPanel(controlPanel);

    // プレビューパネル（右側）
    const previewPanel = mainContainer.createDiv("chat-log-maker-preview-panel");
    this.createPreviewPanel(previewPanel);
  }

  // コントロールパネルの作成
  private createControlPanel(container: HTMLElement) {
    // スレッドタイトルセクション
    const titleSection = container.createDiv("chat-log-maker-section");
    titleSection.createEl("h3", { text: "スレッドタイトル" });
    const titleInput = titleSection.createEl("input", {
      type: "text",
      placeholder: "会話のタイトルを入力...",
      cls: "chat-log-maker-title-input"
    });
    titleInput.addEventListener("input", (e) => {
      this.threadTitle = (e.target as HTMLInputElement).value;
      this.updateMarkdownOutput();
      this.updatePreviewTitle();
    });

    // 登場人物セクション
    const charactersSection = container.createDiv("chat-log-maker-section");
    charactersSection.createEl("h3", { text: "登場人物" });
    const charactersContainer = charactersSection.createDiv("chat-log-maker-characters");
    
    // 登場人物リストを表示する関数
    const updateCharactersList = () => {
      charactersContainer.empty();
      this.characters.forEach((character, index) => {
        const characterItem = charactersContainer.createDiv("chat-log-maker-character-item");
        
        characterItem.createDiv({
          text: character.id,
          cls: "chat-log-maker-character-id"
        });

        const nameInput = characterItem.createEl("input", {
          type: "text",
          placeholder: `話者${character.id}の名前`,
          cls: "chat-log-maker-character-name"
        });
        nameInput.value = character.name;
        nameInput.addEventListener("input", (e) => {
          this.characters[index].name = (e.target as HTMLInputElement).value;
          this.updateSpeakerSelect();
          this.updateMarkdownOutput();
        });

        const deleteBtn = characterItem.createEl("button", {
          text: "削除",
          cls: "chat-log-maker-character-delete"
        });
        deleteBtn.addEventListener("click", () => {
          if (this.characters.length > 1) {
            this.characters.splice(index, 1);
            updateCharactersList();
            this.updateSpeakerSelect();
            this.updateMarkdownOutput();
          }
        });
      });
    };

    updateCharactersList();

    // 登場人物追加ボタン
    const addCharacterBtn = charactersSection.createEl("button", {
      text: "+ 登場人物を追加",
      cls: "chat-log-maker-add-character"
    });
    addCharacterBtn.addEventListener("click", () => {
      const nextId = String.fromCharCode(65 + this.characters.length); // A, B, C...
      this.characters.push({ id: nextId, name: "" });
      updateCharactersList();
      this.updateSpeakerSelect();
    });

    // Markdown出力セクション
    const markdownSection = container.createDiv("chat-log-maker-section");
    markdownSection.createEl("h3", { text: "Markdown出力" });
    const markdownOutput = markdownSection.createEl("textarea", {
      cls: "chat-log-maker-markdown-output",
      attr: { readonly: "true" }
    });

    const copyBtn = markdownSection.createEl("button", {
      text: "Markdownをコピー",
      cls: "chat-log-maker-copy-button"
    });
    copyBtn.addEventListener("click", () => {
      markdownOutput.select();
      document.execCommand("copy");
      // 簡単なフィードバック
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "コピーしました！";
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    });

    // Markdown出力を更新する関数を設定
    this.updateMarkdownOutput = () => {
      const markdown = this.generateMarkdown();
      markdownOutput.value = markdown;
    };
  }

  // プレビューパネルの作成
  private createPreviewPanel(container: HTMLElement) {
    // タイトル表示
    const titleDisplay = container.createEl("h2", {
      text: this.threadTitle || "タイトルなし",
      cls: "chat-log-maker-preview-title"
    });

    // コメント表示エリア
    const commentsArea = container.createDiv("chat-log-maker-comments");

    // サンプルコメントを表示
    if (this.comments.length === 0) {
      const sampleComment = commentsArea.createDiv("chat-log-maker-comment");
      sampleComment.createDiv({
        text: "A",
        cls: "chat-log-maker-comment-author"
      });
      sampleComment.createDiv({
        text: "ここにコメントが表示されます。下のフォームから新しいコメントを投稿してみてください。",
        cls: "chat-log-maker-comment-content"
      });
    }

    // 投稿フォーム
    const postForm = container.createDiv("chat-log-maker-post-form");
    
    const speakerSelect = postForm.createEl("select", {
      cls: "chat-log-maker-speaker-select"
    });
    
    const messageInput = postForm.createEl("textarea", {
      cls: "chat-log-maker-message-input",
      attr: { placeholder: "メッセージを入力..." }
    });

    const postBtn = postForm.createEl("button", {
      text: "投稿",
      cls: "chat-log-maker-post-button"
    });

    // 話者選択の更新関数を設定
    this.updateSpeakerSelect = () => {
      speakerSelect.empty();
      this.characters.forEach(character => {
        const option = speakerSelect.createEl("option");
        option.value = character.id;
        option.textContent = character.name || character.id;
      });
    };

    // コメント表示更新関数を設定
    this.updateCommentsDisplay = (commentsContainer: HTMLElement) => {
      commentsContainer.empty();
      this.comments.forEach(comment => {
        const commentDiv = commentsContainer.createDiv("chat-log-maker-comment");
        
        const authorName = this.characters.find(c => c.id === comment.author)?.name || comment.author;
        commentDiv.createDiv({
          text: authorName,
          cls: "chat-log-maker-comment-author"
        });
        
        commentDiv.createDiv({
          text: comment.content,
          cls: "chat-log-maker-comment-content"
        });
      });
    };

    // タイトル更新関数を設定
    this.updatePreviewTitle = () => {
      titleDisplay.textContent = this.threadTitle || "タイトルなし";
    };

    // 初期化
    this.updateSpeakerSelect();

    // 投稿ボタンのイベント
    postBtn.addEventListener("click", () => {
      const selectedSpeaker = speakerSelect.value;
      const message = messageInput.value.trim();
      
      if (message) {
        const newComment: Comment = {
          id: Date.now().toString(),
          author: selectedSpeaker,
          content: message,
          timestamp: Date.now()
        };
        
        this.comments.push(newComment);
        this.updateCommentsDisplay(commentsArea);
        this.updateMarkdownOutput();
        messageInput.value = "";
      }
    });
  }

  // Markdown生成
  private generateMarkdown(): string {
    let markdown = "";
    
    if (this.threadTitle) {
      markdown += `# ${this.threadTitle}\n\n`;
    }

    this.comments.forEach(comment => {
      const authorName = this.characters.find(c => c.id === comment.author)?.name || comment.author;
      markdown += `> ${authorName}: ${comment.content}\n\n`;
    });

    return markdown.trim();
  }

  // このビューが閉じられたときに実行される処理です
  async onClose() {
    // 必要であれば、後片付けの処理をここに書きます
  }
}
