# 画面モック HTMLファイル抽出結果

元のHTMLファイル (`画面モック.html`) から各画面のHTMLを個別のファイルに抽出しました。

## 抽出されたファイル一覧

| No. | ファイル名 | 説明 | 行数 |
|-----|-----------|------|------|
| 1 | `login.html` | ログイン画面 | 30 |
| 2 | `main.html` | メインコンテナ（資産検索画面） | 328 |
| 3 | `list-modal.html` | 個体管理リスト作成モーダル | 56 |
| 4 | `master-modal.html` | マスター管理モーダル | 25 |
| 5 | `mobile-column-modal.html` | モバイルカラム選択モーダル | 38 |
| 6 | `registration-edit.html` | 登録内容修正画面 | 309 |
| 7 | `photo-modal.html` | 写真表示モーダル | 17 |
| 8 | `qr-page.html` | QRコード管理画面 | 223 |
| 9 | `qr-detail.html` | QRコード詳細画面 | 159 |
| 10 | `qr-issue.html` | QRコード新規発行画面 | 127 |
| 11 | `qr-print.html` | QRコード印刷画面 | 118 |
| 12 | `offline-prep.html` | オフライン準備画面 | 94 |
| 13 | `survey.html` | 現有資産調査画面 | 74 |
| 14 | `qr-scan.html` | QR読取画面 | 64 |
| 15 | `photo-input.html` | 写真撮影・資産番号入力画面 | 101 |
| 16 | `asset-info-smartphone.html` | 資産情報登録画面（スマートフォン版） | 123 |
| 17 | `asset-info-tablet.html` | 資産情報登録画面（タブレット版） | 127 |
| 18 | `history-smartphone.html` | 履歴表示画面（スマートフォン版） | 227 |
| 19 | `history-tablet.html` | 履歴表示画面（タブレット版） | 226 |

**合計**: 19ファイル、2,466行

## 抽出方法

- 元のHTMLファイルから各画面の `<div id="xxx">` から対応する閉じタグ `</div>` までを抽出
- 各ファイルの先頭に説明コメントを追加
- 元のインデントを保持

## 使用方法

これらのHTMLファイルは、元の `画面モック.html` の以下のリソースと組み合わせて使用してください：

- CSS（`<style>` タグ内）
- JavaScript（`<script>` タグ内）
- その他の依存関係

完全なページとして表示するには、これらのリソースを含む完全なHTMLドキュメントに組み込む必要があります。

## ディレクトリ構造

```
/Users/watanaberyouta/Desktop/画面モック/
├── 画面モック.html (元ファイル)
├── extract_screens.py (抽出スクリプト)
└── src/
    └── screens/
        ├── login.html
        ├── main.html
        ├── list-modal.html
        ├── master-modal.html
        ├── mobile-column-modal.html
        ├── registration-edit.html
        ├── photo-modal.html
        ├── qr-page.html
        ├── qr-detail.html
        ├── qr-issue.html
        ├── qr-print.html
        ├── offline-prep.html
        ├── survey.html
        ├── qr-scan.html
        ├── photo-input.html
        ├── asset-info-smartphone.html
        ├── asset-info-tablet.html
        ├── history-smartphone.html
        ├── history-tablet.html
        └── README.md (このファイル)
```

## 注意事項

- これらのファイルは元のHTMLの一部分のみを含んでいます
- スタンドアロンのHTMLページとして機能させるには、CSS、JavaScript、およびHTML構造（`<html>`, `<head>`, `<body>` タグなど）を追加する必要があります
- 元のファイルの機能を完全に再現するには、すべての依存関係とスクリプトを含める必要があります
