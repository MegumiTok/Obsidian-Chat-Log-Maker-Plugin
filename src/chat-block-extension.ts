import { Plugin } from "obsidian";
import { ViewPlugin, Decoration, DecorationSet, ViewUpdate, EditorView } from "@codemirror/view";
import { ChatLogMakerView } from "../view";
import { ChatParser } from "./chat-parser";
import { CHAT_LOG_MAKER_VIEW_TYPE } from "./types";

/**
 * CodeMirror拡張: ```chatブロックを検出してクリック可能にする
 */
export class ChatBlockExtension {
  private plugin: Plugin;
  private chatParser: ChatParser;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.chatParser = new ChatParser();
  }

  /**
   * CodeMirror拡張を作成
   */
  createExtension() {
    const self = this; // クロージャーでthisをキャプチャ
    
    return ViewPlugin.fromClass(class ChatBlockPlugin {
      decorations: DecorationSet;
      
      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        const decorations: any[] = [];
        
        for (let i = 1; i <= view.state.doc.lines; i++) {
          const line = view.state.doc.line(i);
          const lineText = line.text;
          
          // ```chatブロックの開始行を検出
          if (lineText.trim() === "```chat") {
            const decoration = Decoration.line({
              class: "chat-block-clickable",
              attributes: {
                title: "クリックしてチャットログを表示",
                style: "cursor: pointer; background-color: rgba(66, 153, 225, 0.1); border-left: 3px solid #4299e1;"
              }
            });
            
            decorations.push(decoration.range(line.from));
          }
        }
        
        return Decoration.set(decorations);
      }
    }, {
      decorations: v => v.decorations,
      eventHandlers: {
        click: (event: MouseEvent, view: EditorView) => {
          return self.handleClick(event, view);
        }
      }
    });
  }

  /**
   * クリックイベントハンドラー
   */
  private handleClick(event: MouseEvent, view: EditorView): boolean {
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (!pos) return false;

    const line = view.state.doc.lineAt(pos);
    const lineText = line.text;

    // ```chatブロックの開始行をクリックした場合
    if (lineText.trim() === "```chat") {
      const chatBlockContent = this.extractChatBlock(view, line.from);
      if (chatBlockContent) {
        this.openChatPanel(chatBlockContent);
        return true; // イベントを消費
      }
    }

    return false;
  }

  /**
   * 指定位置から```chatブロックの内容を抽出
   */
  private extractChatBlock(view: EditorView, startPos: number): string | null {
    const doc = view.state.doc;
    const startLine = doc.lineAt(startPos);
    
    let content = "";
    let lineNum = startLine.number + 1;
    
    while (lineNum <= doc.lines) {
      const line = doc.line(lineNum);
      const lineText = line.text;
      
      // 終了行を検出
      if (lineText.trim() === "```") {
        return content.trim();
      }
      
      content += lineText + "\n";
      lineNum++;
    }
    
    return null; // 終了行が見つからない場合
  }

  /**
   * チャットパネルを開く
   */
  private async openChatPanel(chatContent: string) {
    const { workspace } = this.plugin.app;

    // 既存のChat Log Makerビューを取得または作成
    let leaf = workspace.getLeavesOfType(CHAT_LOG_MAKER_VIEW_TYPE)[0];

    if (!leaf) {
      // 右サイドバーに新しいリーフを作成
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({
        type: CHAT_LOG_MAKER_VIEW_TYPE,
        active: true,
      });
    }

    // ビューをアクティブにする
    workspace.revealLeaf(leaf);

    // チャット内容を解析してビューに反映
    const view = leaf.view as ChatLogMakerView;
    if (view && view.loadChatContent) {
      view.loadChatContent(chatContent);
    }
  }
}