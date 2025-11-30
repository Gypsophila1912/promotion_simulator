### 2. 依存関係のインストール

```bash
npm install
```

### 4. 環境変数の設定

`.env.example`を`.env.local`にコピーして、Supabase の認証情報を設定

### 6. 開発サーバーの起動

```bash
npm run dev
```

## 使い方

1. `/signup` で新規登録
2. メール確認が有効な場合は、メールのリンクをクリック
3. `/login` でログイン
4. `/dashboard` にアクセス

## ディレクトリ構造

```
app/
├── auth/          # 認証関連のルート
├── dashboard/     # 保護されたページ
├── login/         # ログインページ
├── signup/        # サインアップページ
lib/
├── auth/          # 認証ヘルパー
└── supabase/      # Supabaseクライアント
```
