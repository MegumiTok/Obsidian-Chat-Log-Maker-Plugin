import { Comment, Speaker } from './types';
import { SpeakerSelector } from './speaker-selector';

// 投稿フォームを管理するクラス
export class PostForm {
  private container: HTMLElement;
  private speakers: Speaker[];
  private onSubmit: (comment: Comment) => void;
  private onNewSpeaker?: () => void;
  private speakerSelector: SpeakerSelector;
  private messageInput: HTMLTextAreaElement | null = null;

  constructor(
    container: HTMLElement, 
    speakers: Speaker[], 
    onSubmit: (comment: Comment) => void,
    onNewSpeaker?: () => void
  ) {
    this.container = container;
    this.speakers = speakers;
    this.onSubmit = onSubmit;
    this.onNewSpeaker = onNewSpeaker;
    this.speakerSelector = new SpeakerSelector(speakers, this.handleNewSpeaker.bind(this));
    this.createForm();
  }

  private createForm(): void {
    // 話者選択
    const speakerContainer = this.container.createDiv("chat-log-maker-form-row");
    speakerContainer.createEl("label", {
      text: "Speaker:",
      cls: "chat-log-maker-form-label",
    });
    
    this.speakerSelector.createSelect(speakerContainer);

    // メッセージ入力
    const messageContainer = this.container.createDiv("chat-log-maker-form-row");
    messageContainer.createEl("label", {
      text: "Message:",
      cls: "chat-log-maker-form-label",
    });
    this.messageInput = messageContainer.createEl("textarea", {
      cls: "chat-log-maker-message-input",
      attr: { placeholder: "Enter message..." },
    });

    // ボタンエリア
    const buttonContainer = this.container.createDiv("chat-log-maker-form-buttons");
    const postBtn = buttonContainer.createEl("button", {
      text: "Post",
      cls: "chat-log-maker-post-button",
    });

    // イベントリスナー設定
    this.setupEventListeners(postBtn);
  }

  private setupEventListeners(postBtn: HTMLButtonElement): void {
    // 投稿ボタンのイベント
    postBtn.addEventListener("click", () => {
      this.handleSubmit();
    });

    // Enterキーでの投稿（Shift+Enterで改行）
    this.messageInput?.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSubmit();
      }
    });
  }

  private handleSubmit(): void {
    const selectedSpeaker = this.speakerSelector.getValue();
    const message = this.messageInput?.value.trim() || "";

    if (message && selectedSpeaker) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: selectedSpeaker,
        content: message,
        timestamp: Date.now(),
        replyLevel: 0, // 新規投稿は常にトップレベル
      };

      this.onSubmit(newComment);
      this.clearForm();
    }
  }

  private handleNewSpeaker(): void {
    if (this.onNewSpeaker) {
      this.onNewSpeaker();
    }
  }

  private clearForm(): void {
    if (this.messageInput) {
      this.messageInput.value = "";
    }
  }

  // Speakerリストを更新
  updateSpeakers(speakers: Speaker[]): void {
    this.speakers = speakers;
    this.speakerSelector.updateSpeakers(speakers);
  }

  // 選択されているスピーカーを設定
  setSpeakerValue(speakerId: string): void {
    this.speakerSelector.setValue(speakerId);
  }
}
