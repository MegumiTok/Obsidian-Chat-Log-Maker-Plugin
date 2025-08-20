// 共通の型定義ファイル

// Speakerの型定義
export interface Speaker {
  id: string;
  name: string;
}

// コメントの型定義
export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  replyLevel: number; // 0=トップレベル, 1=返信, 2=返信の返信...
  parentId?: string; // 返信先メッセージのID
}

// このビューを識別するための一意なIDを定義
export const CHAT_LOG_MAKER_VIEW_TYPE = "chat-log-maker-view";
