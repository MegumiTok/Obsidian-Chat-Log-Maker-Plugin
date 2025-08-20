import { Speaker } from './types';

// Speaker選択ドロップダウンを作成・管理するクラス
export class SpeakerSelector {
  private speakers: Speaker[] = [];
  private selectElement: HTMLSelectElement | null = null;

  constructor(speakers: Speaker[]) {
    this.speakers = speakers;
  }

  // Speaker選択ドロップダウンを作成
  createSelect(container: HTMLElement, className = "chat-log-maker-speaker-select"): HTMLSelectElement {
    this.selectElement = container.createEl("select", {
      cls: className,
    });

    this.updateOptions();
    return this.selectElement;
  }

  // 選択肢を更新
  updateOptions(): void {
    if (!this.selectElement) return;

    this.selectElement.empty();
    
    this.speakers.forEach(speaker => {
      const option = this.selectElement!.createEl("option");
      option.value = speaker.id;
      option.textContent = speaker.name || speaker.id;
    });
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
