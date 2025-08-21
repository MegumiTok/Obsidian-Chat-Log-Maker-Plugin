import { Speaker, Comment } from "./types";

/**
 * Markdownの```chatブロックを解析してCommentの配列に変換するクラス
 */
export class ChatParser {
  /**
   * Markdownテキストから```chatブロックを抽出・解析してコメント配列を返す
   */
  parseMarkdown(markdown: string): { comments: Comment[], speakers: Speaker[] } {
    const chatBlocks = this.extractChatBlocks(markdown);
    
    if (chatBlocks.length === 0) {
      return { comments: [], speakers: [] };
    }
    
    // 最初のchatブロックを解析（複数ある場合は最初のもののみ）
    const chatContent = chatBlocks[0];
    return this.parseChatContent(chatContent);
  }

  /**
   * Markdownから```chatブロックを抽出
   */
  private extractChatBlocks(markdown: string): string[] {
    const blocks: string[] = [];
    const lines = markdown.split('\n');
    let inChatBlock = false;
    let currentBlock = '';

    for (const line of lines) {
      if (line.trim() === '```chat') {
        inChatBlock = true;
        currentBlock = '';
      } else if (line.trim() === '```' && inChatBlock) {
        inChatBlock = false;
        if (currentBlock.trim()) {
          blocks.push(currentBlock.trim());
        }
      } else if (inChatBlock) {
        currentBlock += line + '\n';
      }
    }

    return blocks;
  }

  /**
   * chatブロック内のコンテンツを解析
   */
  private parseChatContent(content: string): { comments: Comment[], speakers: Speaker[] } {
    const lines = content.split('\n').filter(line => line.trim());
    const comments: Comment[] = [];
    const speakerMap = new Map<string, string>(); // 実名 → ID のマッピング
    const speakers: Speaker[] = [];
    let nextSpeakerId = 'A';

    for (const line of lines) {
      const parsed = this.parseLine(line);
      if (!parsed) continue;

      const { replyLevel, speakerName, content: messageContent } = parsed;

      // スピーカーIDの決定
      let speakerId = speakerMap.get(speakerName);
      if (!speakerId) {
        speakerId = nextSpeakerId;
        speakerMap.set(speakerName, speakerId);
        speakers.push({ id: speakerId, name: speakerName });
        
        // 次のIDを準備（A→B→C...）
        nextSpeakerId = this.getNextSpeakerId(nextSpeakerId);
      }

      // コメントを作成
      const comment: Comment = {
        id: this.generateId(),
        author: speakerId,
        content: messageContent,
        timestamp: Date.now(),
        replyLevel: replyLevel
      };

      comments.push(comment);
    }

    return { comments, speakers };
  }

  /**
   * 1行を解析して、replyLevel、speakerName、contentを抽出
   */
  private parseLine(line: string): { replyLevel: number, speakerName: string, content: string } | null {
    const trimmed = line.trim();
    if (!trimmed.startsWith('>')) return null;

    // >の数を数える
    let quoteCount = 0;
    for (const char of trimmed) {
      if (char === '>') {
        quoteCount++;
      } else {
        break;
      }
    }

    // >の後の部分を取得
    const afterQuotes = trimmed.substring(quoteCount).trim();
    
    // "名前: 内容" の形式を解析
    const colonIndex = afterQuotes.indexOf(':');
    if (colonIndex === -1) return null;

    const speakerName = afterQuotes.substring(0, colonIndex).trim();
    const content = afterQuotes.substring(colonIndex + 1).trim();

    if (!speakerName || !content) return null;

    return {
      replyLevel: Math.max(0, quoteCount - 1), // >の数から1を引いてreplyLevelとする
      speakerName,
      content
    };
  }

  /**
   * 次のスピーカーIDを取得（A→B→C...→Z）
   */
  private getNextSpeakerId(currentId: string): string {
    const charCode = currentId.charCodeAt(0);
    if (charCode >= 'Z'.charCodeAt(0)) {
      return 'A'; // Zを超えたらAに戻る（本来は制限すべきだが、ここでは簡単な実装）
    }
    return String.fromCharCode(charCode + 1);
  }

  /**
   * 一意なIDを生成
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}