import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | Anatomy Quiz",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          利用規約
        </h1>

        <div className="prose text-foreground space-y-6">
          <p className="text-secondary text-sm">最終更新日: 2026年2月12日</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. はじめに</h2>
            <p className="text-secondary leading-relaxed">
              本利用規約（以下「本規約」）は、Anatomy Quiz（以下「本サービス」）の利用条件を定めるものです。本サービスを利用することにより、本規約に同意したものとみなされます。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. サービスの内容</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは、人体解剖学の学習を支援するための無料クイズアプリケーションです。ユーザーは、インタラクティブなクイズを通じて解剖学の知識を学ぶことができます。本サービスは個人の学習支援を目的としており、商用利用を想定していません。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. アカウント</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは、Googleアカウントによるログインまたはゲストとしての利用が可能です。Googleアカウントでログインすることで、学習記録がデバイス間で同期されます。ゲスト利用の場合、ブラウザを閉じると学習記録が失われる場合があります。
            </p>
            <p className="text-secondary leading-relaxed">
              ユーザーは、自身のアカウントの管理について責任を負うものとします。アカウントの不正利用を発見した場合は、速やかにお問い合わせ先までご連絡ください。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. コンテンツと知的財産権</h2>
            <p className="text-secondary leading-relaxed">
              本サービスで使用されるクイズ問題、テキスト、ソフトウェアの著作権は、本サービスの運営者に帰属します。
            </p>
            <p className="text-secondary leading-relaxed">
              本サービスで使用される解剖学の画像は、主にWikimedia Commons等から取得したパブリックドメインまたはCreative Commonsライセンスの画像を使用しています。各画像のライセンス情報は、出典元に準拠します。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. 禁止事項</h2>
            <p className="text-secondary leading-relaxed">
              ユーザーは、以下の行為を行ってはなりません。
            </p>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>本サービスの正常な運営を妨げる行為</li>
              <li>不正アクセスやシステムへの攻撃</li>
              <li>他のユーザーに迷惑をかける行為</li>
              <li>本サービスのコンテンツを無断で商用利用・転載・複製する行為</li>
              <li>自動化ツール等による大量のリクエスト送信</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. 免責事項</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは教育目的で提供されるものであり、医学的なアドバイスを構成するものではありません。医療上の判断は、必ず医療専門家にご相談ください。
            </p>
            <p className="text-secondary leading-relaxed">
              本サービスのコンテンツの正確性について最善を尽くしますが、完全性・正確性を保証するものではありません。本サービスの利用によりユーザーに生じた損害について、運営者は故意または重大な過失がある場合を除き、一切の責任を負わないものとします。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. サービスの変更・中断</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは無料で提供されており、予告なくサービス内容の変更、中断、または終了を行う場合があります。これによりユーザーに生じた損害について、運営者は責任を負わないものとします。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. アカウントの停止</h2>
            <p className="text-secondary leading-relaxed">
              運営者は、ユーザーが本規約に違反した場合、事前の通知なくアカウントを停止または削除する権利を有します。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. 準拠法と管轄</h2>
            <p className="text-secondary leading-relaxed">
              本規約は日本法に準拠し、日本法に従って解釈されるものとします。本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. 規約の変更</h2>
            <p className="text-secondary leading-relaxed">
              本規約は、必要に応じて変更することがあります。変更後の規約は、本ページに掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">11. お問い合わせ</h2>
            <p className="text-secondary leading-relaxed">
              本規約に関するお問い合わせは、以下までご連絡ください。
            </p>
            <p className="text-secondary">
              メール: abcdx96@gmail.com
            </p>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href="/"
            className="text-sm text-secondary hover:text-foreground transition-colors"
          >
            ← トップに戻る
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-secondary hover:text-foreground transition-colors"
          >
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </div>
  );
}
