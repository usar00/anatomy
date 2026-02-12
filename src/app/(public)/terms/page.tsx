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
          <p className="text-secondary text-sm">最終更新日: 2025年2月12日</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. はじめに</h2>
            <p className="text-secondary leading-relaxed">
              本利用規約（以下「本規約」）は、Anatomy Quiz（以下「本サービス」）の利用条件を定めるものです。本サービスを利用することにより、本規約に同意したものとみなされます。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. サービスの内容</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは、人体解剖学の学習を支援するためのクイズアプリケーションです。ユーザーは、インタラクティブなクイズを通じて解剖学の知識を学ぶことができます。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. アカウント</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは、Googleアカウントによるログインまたはゲストとしての利用が可能です。Googleアカウントでログインすることで、学習記録がデバイス間で同期されます。ゲスト利用の場合、ブラウザを閉じると学習記録が失われる場合があります。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. 禁止事項</h2>
            <p className="text-secondary leading-relaxed">
              ユーザーは、以下の行為を行ってはなりません。
            </p>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>本サービスの正常な運営を妨げる行為</li>
              <li>不正アクセスやシステムへの攻撃</li>
              <li>他のユーザーに迷惑をかける行為</li>
              <li>本サービスのコンテンツを無断で転載・複製する行為</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. 免責事項</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは教育目的で提供されるものであり、医学的なアドバイスを構成するものではありません。本サービスのコンテンツの正確性について最善を尽くしますが、完全性を保証するものではありません。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. サービスの変更・中断</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは、予告なくサービス内容の変更や中断を行う場合があります。これによりユーザーに生じた損害について、一切の責任を負わないものとします。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. 規約の変更</h2>
            <p className="text-secondary leading-relaxed">
              本規約は、必要に応じて変更することがあります。変更後の規約は、本ページに掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. お問い合わせ</h2>
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
