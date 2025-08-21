import { Comment, Speaker } from './types';
import { SpeakerSelector } from './speaker-selector';

// メッセージの表示・編集・返信を管理するクラス
export class MessageRenderer {
  private container: HTMLElement;
  private comments: Comment[];
  private speakers: Speaker[];
  private onUpdate: () => void;
  private onCommentUpdate: (index: number, updates: Partial<Comment>) => void;
  private onCommentDelete: (index: number) => void;
  private onReplySubmit: (parentIndex: number, reply: Comment) => void;
  private onNewSpeaker?: () => Speaker | null;
  
  // リプライフォームの状態を保持
  private activeReplyForm: {
    parentIndex: number;
    parentComment: Comment;
    messageValue: string;
  } | null = null;

  constructor(
    container: HTMLElement,
    comments: Comment[],
    speakers: Speaker[],
    callbacks: {
      onUpdate: () => void;
      onCommentUpdate: (index: number, updates: Partial<Comment>) => void;
      onCommentDelete: (index: number) => void;
      onReplySubmit: (parentIndex: number, reply: Comment) => void;
      onNewSpeaker?: () => Speaker | null;
    }
  ) {
    this.container = container;
    this.comments = comments;
    this.speakers = speakers;
    this.onUpdate = callbacks.onUpdate;
    this.onCommentUpdate = callbacks.onCommentUpdate;
    this.onCommentDelete = callbacks.onCommentDelete;
    this.onReplySubmit = callbacks.onReplySubmit;
    this.onNewSpeaker = callbacks.onNewSpeaker;
  }

  // メッセージ一覧を描画
  render(): void {
    this.container.empty();
    
    if (this.comments.length === 0) {
      this.renderWelcomeMessage();
      return;
    }

    this.comments.forEach((comment, index) => {
      this.renderMessage(comment, index);
      
      // アクティブなリプライフォームがある場合は再表示
      if (this.activeReplyForm && 
          this.activeReplyForm.parentIndex === index &&
          this.activeReplyForm.parentComment.id === comment.id) {
        setTimeout(() => {
          const messageDiv = this.container.children[index] as HTMLElement;
          if (messageDiv) {
            this.recreateReplyForm(messageDiv, comment, index);
          }
        }, 10);
      }
    });
  }

  private renderWelcomeMessage(): void {
    const welcomeMessage = this.container.createDiv("chat-log-maker-message");
    welcomeMessage.createDiv({
      text: "A",
      cls: "chat-log-maker-message-author",
    });
    welcomeMessage.createDiv({
      text: "Chat logs will be displayed here. Please post a message using the form below.",
      cls: "chat-log-maker-message-content",
    });
  }

  private renderMessage(comment: Comment, index: number): void {
    const messageDiv = this.container.createDiv("chat-log-maker-message");

    // ネストレベルに応じてインデントを設定
    const indentLevel = comment.replyLevel || 0;
    messageDiv.style.marginLeft = `${indentLevel * 20}px`;
    if (indentLevel > 0) {
      messageDiv.classList.add(
        `chat-log-maker-reply-level-${Math.min(indentLevel, 3)}`
      );
    }

    // メッセージヘッダー（話者名と編集・削除ボタン）
    const messageHeader = messageDiv.createDiv("chat-log-maker-message-header");
    
    const authorName = this.getSpeakerNameById(comment.author);
    messageHeader.createDiv({
      text: authorName,
      cls: "chat-log-maker-message-author",
    });

    // 編集・削除ボタン（ヘッダー内）
    const messageActions = messageHeader.createDiv("chat-log-maker-message-actions");
    const editBtn = messageActions.createEl("button", {
      text: "Edit",
      cls: "chat-log-maker-edit-btn",
    });
    const deleteBtn = messageActions.createEl("button", {
      text: "Delete",
      cls: "chat-log-maker-delete-btn",
    });

    // メッセージ内容
    messageDiv.createDiv({
      text: comment.content,
      cls: "chat-log-maker-message-content",
    });

    // 返信ボタン（メッセージの下）
    const messageFooter = messageDiv.createDiv("chat-log-maker-message-footer");
    const replyBtn = messageFooter.createEl("button", {
      text: "Reply",
      cls: "chat-log-maker-reply-btn",
    });

    // イベントリスナー設定
    this.setupMessageEventListeners(messageDiv, comment, index, editBtn, deleteBtn, replyBtn);
  }

  private setupMessageEventListeners(
    messageDiv: HTMLElement,
    comment: Comment,
    index: number,
    editBtn: HTMLButtonElement,
    deleteBtn: HTMLButtonElement,
    replyBtn: HTMLButtonElement
  ): void {
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
      const authorName = this.getSpeakerNameById(comment.author);
      const confirmDelete = confirm(
        `Are you sure you want to delete this message from ${authorName}?`
      );
      if (confirmDelete) {
        this.onCommentDelete(index);
      }
    });
  }

  private showReplyForm(messageDiv: HTMLElement, parentComment: Comment, parentIndex: number): void {
    // 既存の返信フォームがあれば削除
    const existingReplyForm = messageDiv.querySelector(".chat-log-maker-reply-form");
    if (existingReplyForm) {
      this.activeReplyForm = null;
      existingReplyForm.remove();
      return;
    }

    // 他のメッセージの返信フォームも削除
    const allReplyForms = document.querySelectorAll(".chat-log-maker-reply-form");
    allReplyForms.forEach(form => form.remove());

    // アクティブなリプライフォーム状態を保存
    this.activeReplyForm = {
      parentIndex,
      parentComment,
      messageValue: ""
    };

    this.createReplyForm(messageDiv, parentComment, parentIndex);
  }

  private createReplyForm(messageDiv: HTMLElement, parentComment: Comment, parentIndex: number): void {
    // 返信フォームを作成
    const replyForm = messageDiv.createDiv("chat-log-maker-reply-form");

    // 返信先表示
    const replyTo = replyForm.createDiv("chat-log-maker-reply-to");
    const parentAuthorName = this.getSpeakerNameById(parentComment.author);
    replyTo.textContent = `Replying to ${parentAuthorName}:`;

    // 話者選択
    const speakerContainer = replyForm.createDiv("chat-log-maker-form-row");
    speakerContainer.createEl("label", {
      text: "Speaker:",
      cls: "chat-log-maker-form-label",
    });
    
    const speakerSelector = new SpeakerSelector(this.speakers, () => {
      if (this.onNewSpeaker) {
        // 現在のメッセージ値を保存
        if (this.activeReplyForm) {
          this.activeReplyForm.messageValue = textarea.value;
        }
        const newSpeaker = this.onNewSpeaker();
        return newSpeaker;
      }
      return null;
    });
    speakerSelector.createSelect(speakerContainer);

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

    // 保存されたメッセージ値があれば復元
    if (this.activeReplyForm && this.activeReplyForm.messageValue) {
      textarea.value = this.activeReplyForm.messageValue;
    }

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

    this.setupReplyFormEventListeners(
      speakerSelector, textarea, replySubmitBtn, cancelBtn, 
      replyForm, parentComment, parentIndex
    );

    textarea.focus();
    // フォーカス時にカーソルを末尾に移動
    setTimeout(() => {
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }, 10);
  }

  private recreateReplyForm(messageDiv: HTMLElement, parentComment: Comment, parentIndex: number): void {
    this.createReplyForm(messageDiv, parentComment, parentIndex);
  }

  private setupReplyFormEventListeners(
    speakerSelector: SpeakerSelector,
    textarea: HTMLTextAreaElement,
    replySubmitBtn: HTMLButtonElement,
    cancelBtn: HTMLButtonElement,
    replyForm: HTMLElement,
    parentComment: Comment,
    parentIndex: number
  ): void {
    // メッセージ値の変更を監視
    textarea.addEventListener("input", () => {
      if (this.activeReplyForm) {
        this.activeReplyForm.messageValue = textarea.value;
      }
    });

    // 返信投稿ボタンのイベント
    replySubmitBtn.addEventListener("click", () => {
      const selectedSpeaker = speakerSelector.getValue();
      const message = textarea.value.trim();

      if (!message) {
        textarea.focus();
        return;
      }

      if (!selectedSpeaker) {
        speakerSelector.focus();
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

      // リプライフォーム状態をクリア
      this.activeReplyForm = null;
      this.onReplySubmit(parentIndex, newReply);
    });

    // キャンセルボタンのイベント
    cancelBtn.addEventListener("click", () => {
      this.activeReplyForm = null;
      replyForm.remove();
    });

    // Enterキーでの投稿（Shift+Enterで改行）
    textarea.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        replySubmitBtn.click();
      }
    });
  }

  private enableEditMode(messageDiv: HTMLElement, comment: Comment, index: number): void {
    // 既存のコンテンツを取得
    const contentDiv = messageDiv.querySelector(".chat-log-maker-message-content") as HTMLElement;
    const originalContent = comment.content;

    // 編集フォームを作成
    const editForm = messageDiv.createDiv("chat-log-maker-edit-form");

    // 話者選択
    const speakerContainer = editForm.createDiv("chat-log-maker-edit-row");
    speakerContainer.createEl("label", {
      text: "Speaker:",
      cls: "chat-log-maker-form-label",
    });
    
    const speakerSelector = new SpeakerSelector(this.speakers, this.onNewSpeaker);
    const selectElement = speakerSelector.createSelect(speakerContainer);
    speakerSelector.setValue(comment.author);

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

    this.setupEditFormEventListeners(
      speakerSelector, textarea, saveBtn, cancelBtn, 
      index, contentDiv
    );

    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }

  private setupEditFormEventListeners(
    speakerSelector: SpeakerSelector,
    textarea: HTMLTextAreaElement,
    saveBtn: HTMLButtonElement,
    cancelBtn: HTMLButtonElement,
    index: number,
    contentDiv: HTMLElement
  ): void {
    // 保存ボタンのイベント
    saveBtn.addEventListener("click", () => {
      const newContent = textarea.value.trim();
      const newAuthor = speakerSelector.getValue();

      if (newContent) {
        this.onCommentUpdate(index, {
          content: newContent,
          author: newAuthor
        });
      }
    });

    // キャンセルボタンのイベント
    cancelBtn.addEventListener("click", () => {
      this.onUpdate();
    });
  }

  private getSpeakerNameById(id: string): string {
    return this.speakers.find(s => s.id === id)?.name || id;
  }

  // データを更新
  updateData(comments: Comment[], speakers: Speaker[]): void {
    this.comments = comments;
    this.speakers = speakers;
  }
}
