# 医療機器管理システム 画面モック

医療機器管理システムの画面モックアップです。

## セットアップ

### 必要な環境

- Python 3.x
- Node.js 14以上
- npm

### インストール

```bash
# Node.js依存パッケージのインストール
npm install

# Python仮想環境の作成と依存パッケージのインストール
python3 -m venv .venv
source .venv/bin/activate
pip install openpyxl pillow
```

## 使い方

### 開発サーバーの起動

```bash
npm start
# または
python3 -m http.server 8080
```

ブラウザで `http://localhost:8080` にアクセス

### スクリーンショットの撮影

全画面のスクリーンショットを3つのデバイス（デスクトップ、タブレット、モバイル）で撮影します。

```bash
npm run capture-screenshots
```

撮影されたスクリーンショットは `docs/screenshots/` ディレクトリに保存されます。

### Excel画面設計書の生成

スクリーンショットを含むExcel形式の画面設計書を生成します。

```bash
npm run generate-excel
```

生成されたExcelファイルは `docs/画面設計書.xlsx` に保存されます。

## プロジェクト構成

```
画面モック/
├── index.html                 # メインHTMLファイル
├── src/
│   ├── css/                  # CSSファイル
│   │   ├── common.css       # 共通スタイル
│   │   └── screens/         # 画面ごとのスタイル
│   ├── js/                   # JavaScriptファイル
│   │   ├── init.js          # 初期化処理
│   │   ├── navigation.js    # 画面遷移
│   │   └── ...              # 各画面の処理
│   ├── screens/              # 画面HTMLファイル
│   └── data/                 # マスタデータJSON
├── docs/
│   ├── screenshots/          # スクリーンショット
│   └── 画面設計書.xlsx       # Excel画面設計書
└── scripts/
    ├── capture-screenshots-responsive.js  # スクリーンショット撮影
    └── generate-excel-design-doc.py       # Excel生成
```

## 画面一覧

1. メイン画面（資産検索）
2. QRコード発行画面
3. QRコード印刷プレビュー画面
4. 資産検索結果画面
5. 現有資産調査画面
6. 登録履歴画面
7. 申請一覧画面
8. 見積依頼一覧画面
9. 見積DataBox画面
10. 個体管理リスト画面
11. SHIP施設マスタ画面
12. SHIP資産マスタ画面

## レスポンシブ対応

全画面が以下のデバイスサイズに対応しています：

- デスクトップ: 1920x1080
- タブレット: 768x1024
- モバイル: 375x667

## 技術スタック

- HTML5/CSS3/JavaScript
- [Choices.js](https://choices-js.github.io/Choices/) - セレクトボックスUI
- Puppeteer - スクリーンショット撮影
- openpyxl - Excel生成（Python）
