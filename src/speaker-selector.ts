import { Speaker } from './types';

// Speaker選択ドロップダウンを作成・管理するクラス
export class SpeakerSelector {
  private speakers: Speaker[] = [];
  private selectElement: HTMLSelectElement | null = null;
  private onNewSpeaker?: () => void;

  constructor(speakers: Speaker[], onNewSpeaker?: () => void) {
    this.speakers = speakers;
    this.onNewSpeaker = onNewSpeaker;
  }

  // Speaker選択ドロップダウンを作成
  createSelect(container: HTMLElement, className = "chat-log-maker-speaker-select"): HTMLSelectElement {
    this.selectElement = container.createEl("select", {
      cls: className,
    });

    // 選択変更時のイベントリスナーを追加
    this.selectElement.addEventListener("change", (e) => {
      const target = e.target as HTMLSelectElement;
      if (target.value === "NEW_SPEAKER" && this.onNewSpeaker) {
        this.onNewSpeaker();
      }
    });

    this.updateOptions();
    return this.selectElement;
  }

  // 選択肢を更新
  updateOptions(): void {
    if (!this.selectElement) return;

    this.selectElement.empty();
    
    // 既存のスピーカーを追加
    this.speakers.forEach(speaker => {
      const option = this.selectElement!.createEl("option");
      option.value = speaker.id;
      option.textContent = speaker.name || speaker.id;
    });

    // "New Speaker" オプションを追加（Zまで行っていない場合のみ）
    const lastSpeaker = this.speakers[this.speakers.length - 1];
    if (lastSpeaker && lastSpeaker.id !== 'Z') {
      const newOption = this.selectElement.createEl("option");
      newOption.value = "NEW_SPEAKER";
      newOption.textContent = "New Speaker";
    }
  }

  // 選択された値を取得
  getValue(): string {
    return this.selectElement?.value || "";
  }

  // 値を設定
  setValue(value: string): void {
    if (this.selectElement) {
      this.selectElement.value = value;
    }
  }

  // フォーカスを設定
  focus(): void {
    this.selectElement?.focus();
  }

  // Speakerリストを更新
  updateSpeakers(speakers: Speaker[]): void {
    this.speakers = speakers;
    this.updateOptions();
  }
}
