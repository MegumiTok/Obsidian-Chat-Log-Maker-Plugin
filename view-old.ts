import { ItemView, WorkspaceLeaf } from "obsidian";

// このビューを識別するための一意なIDを定義します
export const CHAT_LOG_MAKER_VIEW_TYPE = "chat-log-maker-view";

// Speakerの型定義
interface Speaker {
  id: string;
  name: string;
}

// コメントの型定義
interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  replyLevel: number; // 0=トップレベル, 1=返信, 2=返信の返信...
  parentId?: string; // 返信先メッセージのID
}

// ItemViewを継承して、独自のビュークラスを作成します
export class ChatLogMakerView extends ItemView {
  private speakers: Speaker[] = [];
  private comments: Comment[] = [];
  private threadTitle = "";

  // チャット表示更新関数
  private updateChatDisplay: () => void = () => {};

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    // 固定5人のSpeakerを設定
    this.speakers = [
      { id: "A", name: "" },
      { id: "B", name: "" },
      { id: "C", name: "" },
      { id: "D", name: "" },
      { id: "E", name: "" },
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
      text: "📋 Export",
      cls: "chat-log-maker-export-btn",
    });

    // チャット表示エリア（可変高さ、スクロール可能）
    const chatArea = mainContainer.createDiv("chat-log-maker-chat-area");
    this.createChatArea(chatArea);

    // リフレッシュエリア（固定高さ60px）
    const refreshArea = mainContainer.createDiv("chat-log-maker-refresh-area");
    const refreshBtn = refreshArea.createEl("button", {
      text: "Refresh",
      cls: "chat-log-maker-refresh-btn",
    });

    // イベントハンドラー設定
    exportBtn.addEventListener("click", () => {
      const markdown = this.generateMarkdown();
      navigator.clipboard.writeText(markdown);
      exportBtn.textContent = "📋 Copied!";
      setTimeout(() => {
        exportBtn.textContent = "📋 Export";
      }, 2000);
    });

    refreshBtn.addEventListener("click", () => {
      this.updateChatDisplay();
    });
  }

  // Speaker設定セクションの作成（固定5人の名前編集のみ）
  private createSpeakerSection(container: HTMLElement) {
    container.createEl("h3", {
      text: "👥 Speakers",
      cls: "chat-log-maker-section-title",
    });

    const speakersContainer = container.createDiv(
      "chat-log-maker-speakers-list"
    );

    // 固定5人のSpeaker名前編集
    this.speakers.forEach((speaker, index) => {
      const speakerItem = speakersContainer.createDiv(
        "chat-log-maker-speaker-item"
      );

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
        this.speakers[index].name = nameInput.value;
        this.updateChatDisplay();
        this.updateSpeakerSelect(); // 話者選択も更新
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

  // チャット表示エリアの作成
  private createChatArea(container: HTMLElement) {
    // タイトル表示
    const titleDisplay = container.createEl("h3", {
      text: this.threadTitle || "💬 No Title",
      cls: "chat-log-maker-chat-title",
    });

    // メッセージ表示エリア（スクロール可能）
    const messagesContainer = container.createDiv("chat-log-maker-messages");

    // 投稿フォーム
    const postForm = container.createDiv("chat-log-maker-post-form");
    this.createPostForm(postForm);

    // 初期メッセージ
    this.renderMessages(messagesContainer);

    // チャット表示更新関数を設定
    this.updateChatDisplay = () => {
      // タイトル更新
      titleDisplay.textContent = this.threadTitle
        ? `💬 ${this.threadTitle}`
        : "💬 No Title";

      // メッセージ更新
      this.renderMessages(messagesContainer);
    };
  }

  // メッセージ表示の共通処理
  private renderMessages(messagesContainer: HTMLElement) {
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
        text: "Chat logs will be displayed here. Please post a message using the form below.",
        cls: "chat-log-maker-message-content",
      });
    } else {
      this.comments.forEach((comment, index) => {
        const messageDiv = messagesContainer.createDiv(
          "chat-log-maker-message"
        );

        // ネストレベルに応じてインデントを設定
        const indentLevel = comment.replyLevel || 0;
        messageDiv.style.marginLeft = `${indentLevel * 20}px`;
        if (indentLevel > 0) {
          messageDiv.classList.add(
            `chat-log-maker-reply-level-${Math.min(indentLevel, 3)}`
          );
        }

        // メッセージヘッダー（話者名と編集・削除ボタン）
        const messageHeader = messageDiv.createDiv(
          "chat-log-maker-message-header"
        );

        const authorName =
          this.speakers.find(s => s.id === comment.author)?.name ||
          comment.author;
        messageHeader.createDiv({
          text: authorName,
          cls: "chat-log-maker-message-author",
        });

        // 編集・削除ボタン（ヘッダー内）
        const messageActions = messageHeader.createDiv(
          "chat-log-maker-message-actions"
        );
        const editBtn = messageActions.createEl("button", {
          text: "Edit",
          cls: "chat-log-maker-edit-btn",
        });
        const deleteBtn = messageActions.createEl("button", {
          text: "Delete",
          cls: "chat-log-maker-delete-btn",
        });

        // メッセージ内容
        const contentDiv = messageDiv.createDiv({
          text: comment.content,
          cls: "chat-log-maker-message-content",
        });

        // 返信ボタン（メッセージの下）
        const messageFooter = messageDiv.createDiv("chat-log-maker-message-footer");
        const replyBtn = messageFooter.createEl("button", {
          text: "Reply",
          cls: "chat-log-maker-reply-btn",
        });

        // 返信ボタンのイベント
        replyBtn.addEventListener("click", () => {
          this.showReplyForm(messageDiv, comment, index);
        });

        // 編集ボタンのイベント
        editBtn.addEventListener("click", () => {
          this.enableEditMode(messageDiv, comment, index);
        });

        // 削除ボタンのイベント
        deleteBtn.addEventListener("click", () => {
          const authorName = this.speakers.find(s => s.id === comment.author)?.name || comment.author;
          const confirmDelete = confirm(
            `Are you sure you want to delete this message from ${authorName}?`
          );
          if (confirmDelete) {
            this.comments.splice(index, 1);
            this.updateChatDisplay();
          }
        });
      });
    }
  }

  // 返信フォームの表示
  private showReplyForm(
    messageDiv: HTMLElement,
    parentComment: Comment,
    parentIndex: number
  ) {
    // 既存の返信フォームがあれば削除
    const existingReplyForm = messageDiv.querySelector(
      ".chat-log-maker-reply-form"
    );
    if (existingReplyForm) {
      existingReplyForm.remove();
      return;
    }

    // 他のメッセージの返信フォームも削除
    const allReplyForms = document.querySelectorAll(
      ".chat-log-maker-reply-form"
    );
    allReplyForms.forEach(form => form.remove());

    // 返信フォームを作成
    const replyForm = messageDiv.createDiv("chat-log-maker-reply-form");

    // 返信先表示
    const replyTo = replyForm.createDiv("chat-log-maker-reply-to");
    const parentAuthorName =
      this.speakers.find(s => s.id === parentComment.author)?.name ||
      parentComment.author;
    replyTo.textContent = `Replying to ${parentAuthorName}:`;

    // 話者選択
    const speakerContainer = replyForm.createDiv("chat-log-maker-form-row");
    speakerContainer.createEl("label", {
      text: "Speaker:",
      cls: "chat-log-maker-form-label",
    });
    const speakerSelect = speakerContainer.createEl("select", {
      cls: "chat-log-maker-speaker-select",
    });

    // 全てのSpeakerを表示
    this.speakers.forEach(speaker => {
      const option = speakerSelect.createEl("option");
      option.value = speaker.id;
      option.textContent = speaker.name || speaker.id;
    });

    // メッセージ入力
    const messageContainer = replyForm.createDiv("chat-log-maker-form-row");
    messageContainer.createEl("label", {
      text: "Reply:",
      cls: "chat-log-maker-form-label",
    });
    const textarea = messageContainer.createEl("textarea", {
      cls: "chat-log-maker-message-input",
      attr: { placeholder: "Enter reply content..." },
    });

    // ボタンエリア
    const buttonContainer = replyForm.createDiv("chat-log-maker-reply-buttons");
    const replySubmitBtn = buttonContainer.createEl("button", {
      text: "Post Reply",
      cls: "chat-log-maker-reply-submit-btn",
    });
    const cancelBtn = buttonContainer.createEl("button", {
      text: "Cancel",
      cls: "chat-log-maker-cancel-btn",
    });

    // 返信投稿ボタンのイベント
    replySubmitBtn.addEventListener("click", () => {
      const selectedSpeaker = speakerSelect.value;
      const message = textarea.value.trim();

      if (!message) {
        textarea.focus();
        return;
      }

      if (!selectedSpeaker) {
        speakerSelect.focus();
        return;
      }

      const newReply: Comment = {
        id: Date.now().toString(),
        author: selectedSpeaker,
        content: message,
        timestamp: Date.now(),
        replyLevel: Math.min((parentComment.replyLevel || 0) + 1, 3), // 最大3レベル
        parentId: parentComment.id,
      };

      // 親コメントの直後に挿入
      this.comments.splice(parentIndex + 1, 0, newReply);
      this.updateChatDisplay();
    });

    // キャンセルボタンのイベント
    cancelBtn.addEventListener("click", () => {
      replyForm.remove();
    });

    // Enterキーでの投稿（Shift+Enterで改行）
    textarea.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        replySubmitBtn.click();
      }
    });

    // テキストエリアにフォーカス
    textarea.focus();
  }

  // 編集モードの有効化
  private enableEditMode(
    messageDiv: HTMLElement,
    comment: Comment,
    index: number
  ) {
    // 既存のコンテンツを取得
    const contentDiv = messageDiv.querySelector(
      ".chat-log-maker-message-content"
    ) as HTMLElement;
    const originalContent = comment.content;

    // 編集フォームを作成
    const editForm = messageDiv.createDiv("chat-log-maker-edit-form");

    // 話者選択
    const speakerContainer = editForm.createDiv("chat-log-maker-edit-row");
    speakerContainer.createEl("label", {
      text: "Speaker:",
      cls: "chat-log-maker-form-label",
    });
    const speakerSelect = speakerContainer.createEl("select", {
      cls: "chat-log-maker-speaker-select",
    });

    // 話者選択の初期化
    this.speakers.forEach(speaker => {
      const option = speakerSelect.createEl("option");
      option.value = speaker.id;
      option.textContent = speaker.name || speaker.id;
      if (speaker.id === comment.author) {
        option.selected = true;
      }
    });

    // メッセージ編集
    const messageContainer = editForm.createDiv("chat-log-maker-edit-row");
    messageContainer.createEl("label", {
      text: "Message:",
      cls: "chat-log-maker-form-label",
    });
    const textarea = messageContainer.createEl("textarea", {
      cls: "chat-log-maker-message-input",
      text: originalContent,
    });

    // ボタンエリア
    const buttonContainer = editForm.createDiv("chat-log-maker-edit-buttons");
    const saveBtn = buttonContainer.createEl("button", {
      text: "Save",
      cls: "chat-log-maker-save-btn",
    });
    const cancelBtn = buttonContainer.createEl("button", {
      text: "Cancel",
      cls: "chat-log-maker-cancel-btn",
    });

    // 元のコンテンツを隠す
    contentDiv.style.display = "none";

    // 保存ボタンのイベント
    saveBtn.addEventListener("click", () => {
      const newContent = textarea.value.trim();
      const newAuthor = speakerSelect.value;

      if (newContent) {
        this.comments[index].content = newContent;
        this.comments[index].author = newAuthor;
        this.updateChatDisplay();
      }
    });

    // キャンセルボタンのイベント
    cancelBtn.addEventListener("click", () => {
      this.updateChatDisplay();
    });

    // テキストエリアにフォーカス
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }

  // 投稿フォームの作成
  private createPostForm(container: HTMLElement) {
    // 話者選択
    const speakerContainer = container.createDiv("chat-log-maker-form-row");
    speakerContainer.createEl("label", {
      text: "Speaker:",
      cls: "chat-log-maker-form-label",
    });
    const speakerSelect = speakerContainer.createEl("select", {
      cls: "chat-log-maker-speaker-select",
    });

    // メッセージ入力
    const messageContainer = container.createDiv("chat-log-maker-form-row");
    messageContainer.createEl("label", {
      text: "Message:",
      cls: "chat-log-maker-form-label",
    });
    const messageInput = messageContainer.createEl("textarea", {
      cls: "chat-log-maker-message-input",
      attr: { placeholder: "Enter message..." },
    });

    // ボタンエリア
    const buttonContainer = container.createDiv("chat-log-maker-form-buttons");
    const postBtn = buttonContainer.createEl("button", {
      text: "Post",
      cls: "chat-log-maker-post-button",
    });

    // 話者選択の更新関数
    const updateSpeakerSelect = () => {
      speakerSelect.empty();
      
      // 全てのSpeakerを表示
      this.speakers.forEach(speaker => {
        const option = speakerSelect.createEl("option");
        option.value = speaker.id;
        option.textContent = speaker.name || speaker.id;
      });
    };

    // 初期化
    updateSpeakerSelect();

    // 投稿ボタンのイベント
    postBtn.addEventListener("click", () => {
      const selectedSpeaker = speakerSelect.value;
      const message = messageInput.value.trim();

      if (message) {
        const newComment: Comment = {
          id: Date.now().toString(),
          author: selectedSpeaker,
          content: message,
          timestamp: Date.now(),
          replyLevel: 0, // 新規投稿は常にトップレベル
        };

        this.comments.push(newComment);
        this.updateChatDisplay();
        messageInput.value = "";
      }
    });

    // Enterキーでの投稿（Shift+Enterで改行）
    messageInput.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        postBtn.click();
      }
    });

    // 話者選択更新関数を設定（現在は不要だが、一貫性のため）
    this.updateSpeakerSelect = updateSpeakerSelect;
  }

  // 話者選択更新関数（現在は不要だが、一貫性のため残す）
  private updateSpeakerSelect: () => void = () => {};

  // Markdown生成
  private generateMarkdown(): string {
    let markdown = "";

    if (this.threadTitle) {
      markdown += `# ${this.threadTitle}\n\n`;
    }

    this.comments.forEach(comment => {
      const authorName =
        this.speakers.find(s => s.id === comment.author)?.name ||
        comment.author;
      
      // 階層レベルに応じて > の数を調整
      const quotePrefix = ">".repeat(Math.max(1, (comment.replyLevel || 0) + 1));
      
      markdown += `${quotePrefix} ${authorName}: ${comment.content}\n\n`;
    });

    return markdown.trim();
  }

  // このビューが閉じられたときに実行される処理です
  async onClose() {
    // 必要であれば、後片付けの処理をここに書きます
  }
}ージの返信フォームも削除
    const allReplyForms = document.querySelectorAll(
      ".chat-log-maker-reply-form"
    );
    allReplyForms.forEach(form => form.remove());

    // 返信フォームを作成
    const replyForm = messageDiv.createDiv("chat-log-maker-reply-form");

    // 返信先表示
    const replyTo = replyForm.createDiv("chat-log-maker-reply-to");
    const parentAuthorName =
      this.speakers.find(s => s.id === parentComment.author)?.name ||
      parentComment.author;
    replyTo.textContent = `Replying to ${parentAuthorName}:`;

    // 話者選択
    const speakerContainer = replyForm.createDiv("chat-log-maker-form-row");
    speakerContainer.createEl("label", {
      text: "Speaker:",
      cls: "chat-log-maker-form-label",
    });
    const speakerSelect = speakerContainer.createEl("select", {
      cls: "chat-log-maker-speaker-select",
    });

    // 全てのSpeakerを表示
    this.speakers.forEach(speaker => {
      const option = speakerSelect.createEl("option");
      option.value = speaker.id;
      option.textContent = speaker.name || speaker.id;
    });

    // メッセージ入力
    const messageContainer = replyForm.createDiv("chat-log-maker-form-row");
    messageContainer.createEl("label", {
      text: "Reply:",
      cls: "chat-log-maker-form-label",
    });
    const textarea = messageContainer.createEl("textarea", {
      cls: "chat-log-maker-message-input",
      attr: { placeholder: "Enter reply content..." },
    });

    // ボタンエリア
    const buttonContainer = replyForm.createDiv("chat-log-maker-reply-buttons");
    const replySubmitBtn = buttonContainer.createEl("button", {
      text: "Post Reply",
      cls: "chat-log-maker-reply-submit-btn",
    });
    const cancelBtn = buttonContainer.createEl("button", {
      text: "Cancel",
      cls: "chat-log-maker-cancel-btn",
    });

    // 返信投稿ボタンのイベント
    replySubmitBtn.addEventListener("click", () => {
      const selectedSpeaker = speakerSelect.value;
      const message = textarea.value.trim();

      if (!message) {
        textarea.focus();
        return;
      }

      if (!selectedSpeaker) {
        speakerSelect.focus();
        return;
      }

      const newReply: Comment = {
        id: Date.now().toString(),
        author: selectedSpeaker,
        content: message,
        timestamp: Date.now(),
        replyLevel: Math.min((parentComment.replyLevel || 0) + 1, 3), // 最大3レベル
        parentId: parentComment.id,
      };

      // 親コメントの直後に挿入
      this.comments.splice(parentIndex + 1, 0, newReply);
      this.updateChatDisplay();
    });

    // キャンセルボタンのイベント
    cancelBtn.addEventListener("click", () => {
      replyForm.remove();
    });

    // Enterキーでの投稿（Shift+Enterで改行）
    textarea.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        replySubmitBtn.click();
      }
    });

    // テキストエリアにフォーカス
    textarea.focus();
  }

  // 編集モードの有効化
  private enableEditMode(
    messageDiv: HTMLElement,
    comment: Comment,
    index: number
  ) {
    // 既存のコンテンツを取得
    const contentDiv = messageDiv.querySelector(
      ".chat-log-maker-message-content"
    ) as HTMLElement;
    const originalContent = comment.content;

    // 編集フォームを作成
    const editForm = messageDiv.createDiv("chat-log-maker-edit-form");

    // 話者選択
    const speakerContainer = editForm.createDiv("chat-log-maker-edit-row");
    speakerContainer.createEl("label", {
      text: "Speaker:",
      cls: "chat-log-maker-form-label",
    });
    const speakerSelect = speakerContainer.createEl("select", {
      cls: "chat-log-maker-speaker-select",
    });

    // 話者選択の初期化
    this.speakers.forEach(speaker => {
      const option = speakerSelect.createEl("option");
      option.value = speaker.id;
      option.textContent = speaker.name || speaker.id;
      if (speaker.id === comment.author) {
        option.selected = true;
      }
    });

    // メッセージ編集
    const messageContainer = editForm.createDiv("chat-log-maker-edit-row");
    messageContainer.createEl("label", {
      text: "Message:",
      cls: "chat-log-maker-form-label",
    });
    const textarea = messageContainer.createEl("textarea", {
      cls: "chat-log-maker-message-input",
      text: originalContent,
    });

    // ボタンエリア
    const buttonContainer = editForm.createDiv("chat-log-maker-edit-buttons");
    const saveBtn = buttonContainer.createEl("button", {
      text: "Save",
      cls: "chat-log-maker-save-btn",
    });
    const cancelBtn = buttonContainer.createEl("button", {
      text: "Cancel",
      cls: "chat-log-maker-cancel-btn",
    });

    // 元のコンテンツを隠す
    contentDiv.style.display = "none";

    // 保存ボタンのイベント
    saveBtn.addEventListener("click", () => {
      const newContent = textarea.value.trim();
      const newAuthor = speakerSelect.value;

      if (newContent) {
        this.comments[index].content = newContent;
        this.comments[index].author = newAuthor;
        this.updateChatDisplay();
      }
    });

    // キャンセルボタンのイベント
    cancelBtn.addEventListener("click", () => {
      this.updateChatDisplay();
    });

    // テキストエリアにフォーカス
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }

  // 投稿フォームの作成
  private createPostForm(container: HTMLElement) {
    // 話者選択
    const speakerContainer = container.createDiv("chat-log-maker-form-row");
    speakerContainer.createEl("label", {
      text: "Speaker:",
      cls: "chat-log-maker-form-label",
    });
    const speakerSelect = speakerContainer.createEl("select", {
      cls: "chat-log-maker-speaker-select",
    });

    // メッセージ入力
    const messageContainer = container.createDiv("chat-log-maker-form-row");
    messageContainer.createEl("label", {
      text: "Message:",
      cls: "chat-log-maker-form-label",
    });
    const messageInput = messageContainer.createEl("textarea", {
      cls: "chat-log-maker-message-input",
      attr: { placeholder: "Enter message..." },
    });

    // ボタンエリア
    const buttonContainer = container.createDiv("chat-log-maker-form-buttons");
    const postBtn = buttonContainer.createEl("button", {
      text: "Post",
      cls: "chat-log-maker-post-button",
    });

    // 話者選択の更新関数
    const updateSpeakerSelect = () => {
      speakerSelect.empty();
      
      // 全てのSpeakerを表示
      this.speakers.forEach(speaker => {
        const option = speakerSelect.createEl("option");
        option.value = speaker.id;
        option.textContent = speaker.name || speaker.id;
      });
    };

    // 初期化
    updateSpeakerSelect();

    // 投稿ボタンのイベント
    postBtn.addEventListener("click", () => {
      const selectedSpeaker = speakerSelect.value;
      const message = messageInput.value.trim();

      if (message) {
        const newComment: Comment = {
          id: Date.now().toString(),
          author: selectedSpeaker,
          content: message,
          timestamp: Date.now(),
          replyLevel: 0, // 新規投稿は常にトップレベル
        };

        this.comments.push(newComment);
        this.updateChatDisplay();
        this.updateSpeakerSelect(); // 投稿後に話者選択を更新
        messageInput.value = "";
      }
    });

    // Enterキーでの投稿（Shift+Enterで改行）
    messageInput.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        postBtn.click();
      }
    });

    // 登場人物が変更されたときに話者選択も更新
    this.updateSpeakerSelect = updateSpeakerSelect;
  }

  // 話者選択更新関数
  private updateSpeakerSelect: () => void = () => {};

  // Markdown生成
  private generateMarkdown(): string {
    let markdown = "";

    if (this.threadTitle) {
      markdown += `# ${this.threadTitle}\n\n`;
    }

    this.comments.forEach(comment => {
      const authorName =
        this.speakers.find(s => s.id === comment.author)?.name ||
        comment.author;
      
      // 階層レベルに応じて > の数を調整
      const quotePrefix = ">".repeat(Math.max(1, (comment.replyLevel || 0) + 1));
      
      markdown += `${quotePrefix} ${authorName}: ${comment.content}\n\n`;
    });

    return markdown.trim();
  }

  // このビューが閉じられたときに実行される処理です
  async onClose() {
    // 必要であれば、後片付けの処理をここに書きます
  }
}
