import { Speaker, Comment } from "./types";

// データ管理クラス：Speakerとコメントの管理を担当
export class DataManager {
  private speakers: Speaker[] = [];
  private comments: Comment[] = [];

  constructor() {
    // 最初はAのみ設定
    this.speakers = [
      { id: "A", name: "" },
    ];
  }

  // Speaker関連のメソッド
  getSpeakers(): Speaker[] {
    return this.speakers;
  }

  updateSpeakerName(index: number, name: string): void {
    if (index >= 0 && index < this.speakers.length) {
      this.speakers[index].name = name;
    }
  }

  getSpeakerById(id: string): Speaker | undefined {
    return this.speakers.find(s => s.id === id);
  }

  getSpeakerNameById(id: string): string {
    return this.getSpeakerById(id)?.name || id;
  }

  // 次のスピーカーを追加する（A→B→C...Z）
  addNextSpeaker(): Speaker | null {
    // 現在の最後のスピーカーIDから次のアルファベットを取得
    const lastSpeaker = this.speakers[this.speakers.length - 1];
    const nextCharCode = lastSpeaker.id.charCodeAt(0) + 1;
    
    // Zを超えた場合は追加しない
    if (nextCharCode > 'Z'.charCodeAt(0)) {
      return null;
    }
    
    const nextId = String.fromCharCode(nextCharCode);
    const newSpeaker: Speaker = { id: nextId, name: "" };
    
    this.speakers.push(newSpeaker);
    return newSpeaker;
  }

  // 利用可能な次のスピーカーIDを取得（まだ追加せずに確認のみ）
  getNextAvailableSpeakerId(): string | null {
    const lastSpeaker = this.speakers[this.speakers.length - 1];
    const nextCharCode = lastSpeaker.id.charCodeAt(0) + 1;
    
    if (nextCharCode > 'Z'.charCodeAt(0)) {
      return null;
    }
    
    return String.fromCharCode(nextCharCode);
  }

  // Comment関連のメソッド
  getComments(): Comment[] {
    return this.comments;
  }

  addComment(comment: Comment): void {
    this.comments.push(comment);
  }

  insertComment(index: number, comment: Comment): void {
    this.comments.splice(index, 0, comment);
  }

  updateComment(index: number, updates: Partial<Comment>): void {
    if (index >= 0 && index < this.comments.length) {
      Object.assign(this.comments[index], updates);
    }
  }

  deleteComment(index: number): void {
    if (index >= 0 && index < this.comments.length) {
      this.comments.splice(index, 1);
    }
  }

  // Markdown生成
  generateMarkdown(): string {
    let markdown = "";

    this.comments.forEach(comment => {
      const authorName = this.getSpeakerNameById(comment.author);

      // 階層レベルに応じて > の数を調整
      const quotePrefix = ">".repeat(
        Math.max(1, (comment.replyLevel || 0) + 1)
      );

      markdown += `${quotePrefix} ${authorName}: ${comment.content}\n\n`;
    });

    return markdown.trim();
  }
}
