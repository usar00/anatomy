"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: "🗺️",
    title: "ステップバイステップ学習",
    description:
      "基礎から積み上げる学習パス。ユニット→セクション→5〜7問の短いレッスンで、無理なく進められる。",
  },
  {
    icon: "🔄",
    title: "多彩な問題形式",
    description:
      "選択肢、穴埋め、ペアマッチ、自由入力。同じ知識を違う形式で繰り返し学ぶことで定着を促す。",
  },
  {
    icon: "🧠",
    title: "スペースドリペティション",
    description:
      "忘れかけた頃に自動で復習を提案。科学的な間隔反復で長期記憶に定着させる。",
  },
  {
    icon: "👤",
    title: "リンがサポート",
    description:
      "マスコットキャラ「リン」が学習に寄り添う。正解も不正解も、自然なリアクションで応援。",
  },
  {
    icon: "🖼️",
    title: "画像付き問題",
    description:
      "解剖図やイラストを使った視覚的な問題で、実践的な知識を身につけられる。",
  },
  {
    icon: "🏆",
    title: "無料で始められる",
    description:
      "Gray's Anatomyに基づく問題に全アクセス可能。登録なしですぐに始められる。",
  },
];

const sampleQuestion = {
  question: "上腕二頭筋の起始として正しいものはどれか？",
  choices: [
    "肩甲骨の関節上結節と烏口突起",
    "鎖骨の外側端",
    "上腕骨の大結節",
    "肩甲骨の肩峰",
  ],
  correctIndex: 0,
};

export default function LandingPage() {
  const router = useRouter();

  const [sampleSelected, setSampleSelected] = useState<number | null>(null);
  const [sampleAnswered, setSampleAnswered] = useState(false);

  const handleStartQuiz = () => {
    router.push("/learn");
  };

  const handleSampleAnswer = (index: number) => {
    if (sampleAnswered) return;
    setSampleSelected(index);
    setSampleAnswered(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-5xl mb-6">🦴</div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              解剖学を、
              <span className="text-primary">もっと楽しく</span>
              学ぼう
            </h1>
            <p className="text-lg sm:text-xl text-secondary mb-10 leading-relaxed">
              基礎から積み上げる学習パスで、
              <br className="hidden sm:block" />
              解剖学の知識を着実に身につける。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleStartQuiz}
                
              >
                学習を始める（無料）
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
                Google でログイン
              </Button>
            </div>
            <p className="text-xs text-secondary mt-4">
              ゲスト利用：全問題アクセス可 / ログインで学習記録を保存
            </p>
          </div>
        </div>
      </section>

      {/* Sample Question Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          こんな問題が出題されます
        </h2>
        <Card className="max-w-xl mx-auto">
          <p className="text-sm text-secondary mb-2">サンプル問題</p>
          <p className="text-lg font-medium mb-6">
            {sampleQuestion.question}
          </p>
          <div className="flex flex-col gap-3">
            {sampleQuestion.choices.map((choice, index) => {
              let choiceStyle =
                "border border-card-border bg-background hover:border-primary/50 hover:bg-primary-light/30";

              if (sampleAnswered) {
                if (index === sampleQuestion.correctIndex) {
                  choiceStyle =
                    "border-2 border-success bg-success-light text-success";
                } else if (
                  index === sampleSelected &&
                  index !== sampleQuestion.correctIndex
                ) {
                  choiceStyle =
                    "border-2 border-danger bg-danger-light text-danger";
                } else {
                  choiceStyle =
                    "border border-card-border bg-background opacity-50";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSampleAnswer(index)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${choiceStyle}`}
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {choice}
                </button>
              );
            })}
          </div>
          {sampleAnswered && (
            <div className="mt-4 p-4 bg-muted rounded-xl">
              <p className="text-sm font-medium mb-1">
                {sampleSelected === sampleQuestion.correctIndex
                  ? "✅ 正解！"
                  : "❌ 不正解"}
              </p>
              <p className="text-sm text-secondary">
                上腕二頭筋の長頭は肩甲骨の関節上結節から、短頭は烏口突起から起始します。
              </p>
            </div>
          )}
        </Card>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">特徴</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Tiers Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">利用プラン</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <p className="text-sm text-secondary mb-1">ゲスト</p>
              <p className="text-3xl font-bold mb-4">無料</p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  全カテゴリ・全問題にアクセス
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  正誤フィードバック + 解説
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">-</span>
                  <span className="text-secondary">
                    記録はセッション中のみ
                  </span>
                </li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleStartQuiz}
              >
                今すぐ始める
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-sm text-secondary mb-1">無料会員</p>
              <p className="text-3xl font-bold mb-4">無料</p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  ゲストの全機能
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  学習記録の永続保存
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  復習モード・進捗表示
                </li>
              </ul>
              <Button
                size="sm"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Google で登録
              </Button>
            </div>
          </Card>

          <Card className="ring-2 ring-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                おすすめ
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm text-secondary mb-1">プレミアム</p>
              <p className="text-3xl font-bold mb-4">
                ¥300<span className="text-sm font-normal text-secondary">/月〜</span>
              </p>
              <ul className="text-sm text-left space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  無料会員の全機能
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  詳細な学習分析
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  ランキング・データエクスポート
                </li>
              </ul>
              <Button size="sm" className="w-full" disabled>
                近日公開
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-secondary">
            問題の出典：OpenStax Anatomy and Physiology（CC BY 4.0）
          </p>
          <p className="text-xs text-secondary mt-2">
            &copy; {new Date().getFullYear()} Anatomy Quiz
          </p>
        </div>
      </footer>
    </div>
  );
}
