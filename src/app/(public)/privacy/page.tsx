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
          <p className="text-secondary text-sm">最終更新日: 2025年2月12日</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. はじめに</h2>
            <p className="text-secondary leading-relaxed">
              Anatomy Quiz（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーでは、本サービスが収集する情報とその利用方法について説明します。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. 収集する情報</h2>
            <p className="text-secondary leading-relaxed">
              本サービスでは、以下の情報を収集する場合があります。
            </p>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>Googleアカウント情報（メールアドレス、表示名、プロフィール画像）</li>
              <li>学習進捗データ（クイズの回答履歴、正答率、学習記録）</li>
              <li>サービス利用に関するログデータ</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. 情報の利用目的</h2>
            <p className="text-secondary leading-relaxed">
              収集した情報は、以下の目的で利用します。
            </p>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>ユーザー認証およびアカウント管理</li>
              <li>学習進捗の保存と復元</li>
              <li>サービスの改善と品質向上</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. 情報の第三者提供</h2>
            <p className="text-secondary leading-relaxed">
              本サービスは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. データの保管</h2>
            <p className="text-secondary leading-relaxed">
              ユーザーデータは、Supabase（クラウドデータベースサービス）上に安全に保管されます。適切なセキュリティ対策を講じ、不正アクセスや漏洩の防止に努めます。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. ユーザーの権利</h2>
            <p className="text-secondary leading-relaxed">
              ユーザーは、自身の個人情報について以下の権利を有します。
            </p>
            <ul className="list-disc pl-6 text-secondary space-y-1">
              <li>個人情報の開示・訂正・削除の請求</li>
              <li>アカウントの削除（サポートメールにてご連絡ください）</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. ポリシーの変更</h2>
            <p className="text-secondary leading-relaxed">
              本ポリシーは、必要に応じて変更することがあります。重要な変更がある場合は、本ページにて通知します。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. お問い合わせ</h2>
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
