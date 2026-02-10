import type { CharacterState } from "@/types/quiz";

interface Message {
  text: string;
  state: CharacterState;
}

// リン: シンプルでややニヒルなトーン。テンション上げすぎず、淡々と。
// レッスン開始
export const lessonStartMessages: Message[] = [
  { text: "じゃあ、いくよ", state: "idle" },
  { text: "このセクションやっとく？", state: "idle" },
  { text: "準備できたら始めて", state: "idle" },
  { text: "一緒にやろう", state: "encouraging" },
  { text: "ここ、大事なとこ", state: "thinking" },
];

// 正解
export const correctMessages: Message[] = [
  { text: "うん、合ってる", state: "happy" },
  { text: "正解", state: "idle" },
  { text: "そう", state: "idle" },
  { text: "ちゃんとわかってるね", state: "happy" },
  { text: "その通り", state: "idle" },
];

// 連続正解（2問以上）
export const streakCorrectMessages: Message[] = [
  { text: "調子いいね", state: "happy" },
  { text: "この流れでいこう", state: "encouraging" },
  { text: "身についてきてる", state: "happy" },
];

// 不正解
export const incorrectMessages: Message[] = [
  { text: "惜しい。ここ、コツがあるんだよね", state: "comforting" },
  { text: "これ、みんな間違えやすい", state: "comforting" },
  { text: "大丈夫。覚えとこう", state: "comforting" },
  { text: "次に出たら取れる", state: "encouraging" },
  { text: "気にしなくていいよ", state: "comforting" },
];

// セクション完了（星別）
export const sectionCompleteMessages: Record<number, Message[]> = {
  3: [
    { text: "おつ。完璧だった", state: "celebrating" },
    { text: "全問正解。えらい", state: "celebrating" },
  ],
  2: [
    { text: "おつ。ちゃんと身についてる", state: "happy" },
    { text: "いい結果。この調子", state: "happy" },
  ],
  1: [
    { text: "おつ。もう一回やると伸びるよ", state: "encouraging" },
    { text: "復習すると定着する。またやって", state: "encouraging" },
  ],
  0: [
    { text: "最初はこんなもん。繰り返しでいこう", state: "comforting" },
    { text: "始めたばかりだから、焦らなくていい", state: "comforting" },
  ],
};

// ストリーク
export const streakMessages: Message[] = [
  { text: "続けてるの、いいね", state: "happy" },
  { text: "コツコツいこう", state: "encouraging" },
];

// ランダムにメッセージを取得
export function getRandomMessage(messages: Message[]): Message {
  return messages[Math.floor(Math.random() * messages.length)];
}

// 正解時のメッセージ（連続正解数に応じて）
export function getCorrectMessage(consecutiveCorrect: number): Message {
  if (consecutiveCorrect >= 3) {
    return getRandomMessage(streakCorrectMessages);
  }
  return getRandomMessage(correctMessages);
}

// セクション完了時のメッセージ（星の数に応じて）
export function getSectionCompleteMessage(stars: number): Message {
  const clamped = Math.min(3, Math.max(0, stars));
  return getRandomMessage(sectionCompleteMessages[clamped]);
}
