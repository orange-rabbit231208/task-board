# task-board

## Git運用ルール

- コードを変更したら、その都度コミットしてGitHubにプッシュすること。
- 変更を溜め込まず、小さい単位でコミット・プッシュを行う。
- コミットメッセージは変更内容が分かるように簡潔に記述する。

## デプロイ先

https://orange-rabbit231208.github.io/task-board/

`main`ブランチへのプッシュをトリガーに、GitHub Actions(`.github/workflows/deploy.yml`)が自動でビルド・デプロイする。

## 技術スタック

- React 19 + Vite
- 素のCSS(CSSフレームワークやCSS-in-JSは未使用。`src/index.css`に共通スタイル、`src/App.css`にアプリ固有スタイル)
- 状態管理はReactの`useState`/`useEffect`のみ(外部の状態管理ライブラリは未使用)
- データ永続化はブラウザの`localStorage`
- Lintは`oxlint`(`npm run lint`)
- TypeScriptは未導入(`.jsx`/`.js`)

## コンポーネントの命名規約

- コンポーネントのファイル名・関数名はPascalCase(例: `App.jsx` → `function App`)
- コンポーネント内のヘルパー関数・変数はcamelCase(例: `formatDate`, `toggleTask`)
- CSSクラス名はkebab-case(例: `task-list`, `task-body`, `important-toggle`, `delete-button`)
- 状態や真偽値を表すクラスは対象クラスに空白区切りで追加する(例: `task done`, `task important`)
