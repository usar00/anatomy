import type { CharacterState } from "@/types/quiz";

interface Message {
  text: string;
  state: CharacterState;
}

// レッスン開始
export const lessonStartMessages: Message[] = [
  { text: "さて、やってみよっか", state: "idle" },
  { text: "このセクション、面白いよ", state: "encouraging" },
  { text: "準備はいい？", state: "idle" },
  { text: "一緒に進めていこう", state: "encouraging" },
  { text: "ここ、大事なところだよ", state: "thinking" },
];

// 正解
export const correctMessages: Message[] = [
  { text: "うん、合ってる", state: "happy" },
  { text: "お、いい感じ", state: "happy" },
  { text: "そうそう", state: "idle" },
  { text: "正解。ちゃんとわかってるね", state: "happy" },
  { text: "その通り", state: "idle" },
];

// 連続正解（2問以上）
export const streakCorrectMessages: Message[] = [
  { text: "調子いいね", state: "happy" },
  { text: "この流れ、いいよ", state: "encouraging" },
  { text: "しっかり身についてきてる", state: "happy" },
];

// 不正解
export const incorrectMessages: Message[] = [
  { text: "惜しいね。ここ、ちょっとコツがあって...", state: "comforting" },
  { text: "これ間違えやすいんだよね", state: "comforting" },
  { text: "大丈夫、覚えていこう", state: "comforting" },
  { text: "ここは次に出たら取れるよ", state: "encouraging" },
  { text: "よくある間違いだから気にしないで", state: "comforting" },
];

// セクション完了（星別）
export const sectionCompleteMessages: Record<number, Message[]> = {
  3: [
    { text: "お疲れさま。完璧だったね", state: "celebrating" },
    { text: "全問正解、さすがだね", state: "celebrating" },
  ],
  2: [
    { text: "お疲れさま。ちゃんと身についてきてるよ", state: "happy" },
    { text: "いい結果だね。この調子で", state: "happy" },
  ],
  1: [
    { text: "お疲れさま。もう一回やるともっとよくなるよ", state: "encouraging" },
    { text: "復習すると定着するから、またやってみて", state: "encouraging" },
  ],
  0: [
    { text: "最初はこんなものだよ。繰り返しが大事", state: "comforting" },
    { text: "まだ始めたばかりだから、焦らなくていいよ", state: "comforting" },
  ],
};

// ストリーク
export const streakMessages: Message[] = [
  { text: "続けてるの、えらいね", state: "happy" },
  { text: "コツコツが一番大事", state: "encouraging" },
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
