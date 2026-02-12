import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Anatomy Quiz",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          プライバシーポリシー
        </h1>

        <div className="prose text-foreground space-y-6">
          <p className="text-secondary text-sm">最終更新日: 2026年2月12日</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. はじめに</h2>
            <p className="text-secondary leading-relaxed">
              Anatomy Quiz（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーでは、本サービスが収集する情報とその利用方法について説明します。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. 収集する情報</h2>
            <p className="text-secondary leading-relaxed">
              本サービスでは、利用方法に応じて以下の情報を収集する場合があります。
            </p>
            <h3 className="text-lg font-medium mt-2">
              Googleアカウントでログインした場合
            </h3>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>Googleアカウント情報（メールアドレス、表示名、プロフィール画像）</li>
              <li>学習進捗データ（クイズの回答履歴、正答率、学習記録）</li>
            </ul>
            <h3 className="text-lg font-medium mt-2">
              ゲストとして利用した場合
            </h3>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>匿名の識別子（ブラウザセッションに紐づく一時的なID）</li>
              <li>学習進捗データ（セッション中のみ保持）</li>
            </ul>
            <h3 className="text-lg font-medium mt-2">
              すべてのユーザー
            </h3>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>Cookie（認証セッションの維持に使用）</li>
              <li>サービス利用に関するログデータ</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. 情報の利用目的</h2>
            <p className="text-secondary leading-relaxed">
              収集した情報は、以下の目的のみに利用します。
            </p>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>ユーザー認証およびアカウント管理</li>
              <li>学習進捗の保存・復元・デバイス間同期</li>
              <li>サービスの改善と品質向上</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. 外部サービスの利用</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは、以下の外部サービスを利用しています。これらのサービスは、本サービスの運営に必要な範囲でユーザーデータを処理します。
            </p>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>
                <strong>Google</strong>（認証）— OAuth 2.0
                によるログイン認証に使用。メールアドレスとプロフィール情報を取得します。
              </li>
              <li>
                <strong>Supabase</strong>（データベース・認証基盤）—
                ユーザーデータおよび学習記録の保管に使用。サーバーは海外に所在します。
              </li>
              <li>
                <strong>Vercel</strong>（ホスティング）—
                Webアプリケーションの配信に使用。
              </li>
            </ul>
            <p className="text-secondary leading-relaxed">
              上記以外の第三者に対し、法令に基づく場合を除き、ユーザーの同意なく個人情報を提供することはありません。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Cookieの使用</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは、認証セッションの維持のためにCookieを使用します。これらは本サービスの正常な動作に必要なものであり、広告やトラッキングの目的では使用しません。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. データの保管と安全性</h2>
            <p className="text-secondary leading-relaxed">
              ユーザーデータは、Supabase のクラウドサーバー上に保管されます。通信はすべてSSL/TLSで暗号化され、データベースへのアクセスはRow Level Security（行レベルセキュリティ）により、各ユーザーが自身のデータのみアクセスできるよう制限されています。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. ユーザーの権利</h2>
            <p className="text-secondary leading-relaxed">
              ユーザーは、自身の個人情報について以下の権利を有します。
            </p>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>個人情報の開示・訂正・削除の請求</li>
              <li>アカウントの削除（下記お問い合わせ先にご連絡ください）</li>
              <li>サービス利用の停止</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. ポリシーの変更</h2>
            <p className="text-secondary leading-relaxed">
              本ポリシーは、必要に応じて変更することがあります。重要な変更がある場合は、本ページにて通知します。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. お問い合わせ</h2>
            <p className="text-secondary leading-relaxed">
              プライバシーに関するお問い合わせは、以下までご連絡ください。
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
            href="/terms"
            className="text-sm text-secondary hover:text-foreground transition-colors"
          >
            利用規約
          </Link>
        </div>
      </div>
    </div>
  );
}
