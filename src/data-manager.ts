import { Speaker, Comment } from "./types";

// データ管理クラス：Speakerとコメントの管理を担当
export class DataManager {
  private speakers: Speaker[] = [];
  private comments: Comment[] = [];

  constructor() {
    // 固定5人のSpeakerを設定
    this.speakers = [
      { id: "A", name: "" },
      { id: "B", name: "" },
      { id: "C", name: "" },
      { id: "D", name: "" },
      { id: "E", name: "" },
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
