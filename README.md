# 医療機器管理システム - 画面モック

元の単一HTMLファイル（11,048行、397KB）を、保守性と可読性の高い複数ファイルに分割したプロジェクトです。

## 📁 プロジェクト構造

```
画面モック/
├── index.html                      # エントリーポイント（メインHTML）
├── README.md                       # このファイル
├── 画面分析レポート.md              # 画面分析の詳細レポート
├── 画面モック.html                  # 元のファイル（バックアップ）
│
├── src/
│   ├── css/                        # スタイルシート
│   │   ├── common.css              # 共通スタイル（380行）
│   │   ├── modals.css              # モーダル共通（297行）
│   │   └── screens/                # 画面固有のスタイル
│   │       ├── login.css           # ログイン画面（140行）
│   │       ├── main.css            # メイン検索画面（345行）
│   │       ├── qr.css              # QRコード管理（1,718行）
│   │       ├── survey.css          # 現有資産調査（472行）
│   │       ├── mobile.css          # モバイル画面（762行）
│   │       ├── asset-info.css      # 資産情報登録（824行）
│   │       ├── history.css         # 履歴表示（615行）
│   │       └── edit.css            # 登録内容修正（545行）
│   │
│   ├── data/                       # マスタデータ（JSON）
│   │   ├── facility-master.json    # 施設マスタ
│   │   └── asset-master.json       # 資産マスタ
│   │
│   ├── js/                         # JavaScript
│   │   ├── auth.js                 # 認証関連（4.3KB）
│   │   ├── navigation.js           # 画面遷移（8.0KB）
│   │   ├── modals.js               # モーダル制御（9.0KB）
│   │   ├── qr-management.js        # QRコード管理（4.5KB）
│   │   ├── asset-survey.js         # 資産調査（2.4KB）
│   │   ├── master-data.js          # マスタデータ（17KB）
│   │   ├── master-data-loader.js   # マスタデータ読み込み（NEW）
│   │   ├── table-edit.js           # テーブル編集（30KB）
│   │   ├── filters.js              # フィルター・検索（2.5KB）
│   │   └── init.js                 # 初期化（25KB）
│   │
│   └── screens/                    # 画面HTML（全19ファイル）
│       ├── login.html              # ログイン画面
│       ├── main.html               # メインコンテナ
│       ├── list-modal.html         # 個体管理リストモーダル
│       ├── master-modal.html       # マスター管理モーダル
│       ├── mobile-column-modal.html # カラム選択モーダル
│       ├── registration-edit.html  # 登録内容修正
│       ├── photo-modal.html        # 写真表示モーダル
│       ├── qr-page.html            # QRコード管理
│       ├── qr-detail.html          # QRコード詳細
│       ├── qr-issue.html           # QRコード新規発行
│       ├── qr-print.html           # QRコード印刷
│       ├── offline-prep.html       # オフライン準備
│       ├── survey.html             # 現有資産調査
│       ├── qr-scan.html            # QR読取
│       ├── photo-input.html        # 写真撮影・資産番号入力
│       ├── asset-info-smartphone.html # 資産情報登録（SP）
│       ├── asset-info-tablet.html  # 資産情報登録（TB）
│       ├── history-smartphone.html # 履歴表示（SP）
│       └── history-tablet.html     # 履歴表示（TB）
```

## 🚀 ローカルサーバーでの起動方法

このプロジェクトは、画面HTMLファイルを動的に読み込むため、**ローカルサーバー**で起動する必要があります。

### 方法1: Pythonの簡易サーバー（推奨）

```bash
# プロジェクトディレクトリに移動
cd "/Users/watanaberyouta/Desktop/画面モック"

# Python 3の場合
python3 -m http.server 8000

# Python 2の場合
python -m SimpleHTTPServer 8000
```

ブラウザで `http://localhost:8000` にアクセスしてください。

### 方法2: Node.jsのhttp-server

```bash
# http-serverをインストール（初回のみ）
npm install -g http-server

# サーバー起動
cd "/Users/watanaberyouta/Desktop/画面モック"
http-server -p 8000
```

ブラウザで `http://localhost:8000` にアクセスしてください。

### 方法3: VS Codeの Live Server 拡張機能

1. VS Codeで「Live Server」拡張機能をインストール
2. `index.html` を右クリック → 「Open with Live Server」を選択
3. 自動的にブラウザが開きます

## 📱 画面一覧と機能

### 主要画面（11画面）

1. **ログイン画面** - システムへのログイン
2. **メインコンテナ（資産検索）** - 資産の検索・絞り込み
3. **登録内容修正画面** - 現有品調査内容の修正
4. **QRコード管理画面** - QRコード一覧・管理
5. **QRコード詳細画面** - 個別QRコードの詳細情報
6. **QRコード新規発行画面** - QRコードの新規発行
7. **QRコード印刷画面** - QRコードの印刷プレビュー
8. **オフライン準備画面** - オフライン調査の準備
9. **現有資産調査画面** - 現有資産の調査設定
10. **QR読取画面** - QRコードのスキャン
11. **写真撮影・資産番号入力画面** - 写真撮影と番号入力

### レスポンシブ画面（4画面）

12. **資産情報登録（スマートフォン版）** - モバイル向けUI
13. **資産情報登録（タブレット版）** - タブレット向けUI
14. **履歴表示（スマートフォン版）** - 履歴一覧（モバイル）
15. **履歴表示（タブレット版）** - 履歴一覧（タブレット）

### モーダル（4つ）

16. **個体管理リスト作成モーダル** - 施設・メニュー選択
17. **マスター管理モーダル** - マスター管理メニュー
18. **モバイルカラム選択モーダル** - 表示カラム選択
19. **写真表示モーダル** - 写真プレビュー

## 🎯 画面遷移フロー

### ログインからメイン画面
```
ログイン画面 → メインコンテナ（資産検索）
```

### QRコード管理フロー
```
メインコンテナ → 個体管理リストモーダル → QRコード管理画面
                                          ├─ QRコード詳細 → 印刷
                                          ├─ QRコード新規発行
                                          └─ 一括印刷
```

### 現有資産調査フロー
```
メインコンテナ → 個体管理リストモーダル → オフライン準備
                                          ↓
                                      現有資産調査
                                          ↓
                                      QR読取
                                          ↓
                                  写真撮影・資産番号入力
                                          ↓
                              資産情報登録（SP/TB）
                                          ↓
                                  履歴表示（SP/TB）
                                          ↓
                              （現有資産調査に戻る）
```

### 登録内容修正フロー
```
メインコンテナ → 個体管理リストモーダル → 登録内容修正画面
```

## 🗂️ マスタデータ仕様

### 施設マスタ（facility-master.json）

施設、部門、科の情報を管理します。

**施設情報（facilities）:**
- id: 施設ID
- name: 施設名
- code: 施設コード
- region: 地域
- type: 施設種別（総合病院、クリニック、医療センター）

**部門情報（departments）:**
- id: 部門ID
- name: 部門名
- code: 部門コード
- category: カテゴリ（診療部門、検査部門など）

**科情報（sections）:**
- id: 科ID
- name: 科名
- code: 科コード
- departmentId: 所属部門ID

### 資産マスタ（asset-master.json）

医療機器・資産の分類情報を管理します。

**大分類（largeClasses）:**
- id: 大分類ID
- name: 大分類名（医療機器、放射線関連機器など）
- code: 大分類コード

**中分類（mediumClasses）:**
- id: 中分類ID
- name: 中分類名（CT関連、MRI関連など）
- code: 中分類コード
- largeClassId: 所属大分類ID

**品目（items）:**
- id: 品目ID
- name: 品目名（CTスキャナ、MRI装置など）
- code: 品目コード
- mediumClassId: 所属中分類ID

**メーカー（manufacturers）:**
- id: メーカーID
- name: メーカー名
- code: メーカーコード
- country: 国

**型式（models）:**
- id: 型式ID
- name: 型式名
- code: 型式コード
- manufacturerId: メーカーID
- itemId: 品目ID

### マスタデータの連動

プルダウンは階層構造で連動します：

**施設情報:**
```
部門選択 → 科が絞り込まれる
```

**資産情報:**
```
大分類選択 → 中分類が絞り込まれる → 品目が絞り込まれる
```

### マスタデータの編集方法

1. `src/data/facility-master.json` または `src/data/asset-master.json` を開く
2. JSON形式でデータを追加・編集
3. ブラウザをリロードすると、変更が反映されます

**例：施設を追加する場合**
```json
{
  "id": 16,
  "name": "京都総合病院",
  "code": "F016",
  "region": "京都",
  "type": "総合病院"
}
```

## 🔧 技術仕様

### 使用ライブラリ

- **Choices.js** - セレクトボックスの拡張機能（検索、複数選択、曖昧検索）
  - CDN: `https://cdn.jsdelivr.net/npm/choices.js/`
  - 機能: キーワード検索、部分一致検索、候補の絞り込み

### 画面表示制御

画面の表示/非表示は、主に以下の方法で制御されます：

1. **クラスベース（推奨）**
   ```javascript
   element.classList.add('active');    // 表示
   element.classList.remove('active'); // 非表示
   ```

2. **hiddenクラス（ログイン画面のみ）**
   ```javascript
   element.classList.add('hidden');    // 非表示
   element.classList.remove('hidden'); // 表示
   ```

### データ管理

- **ローカルストレージ** - マスタデータの保存・読み込み
- **グローバル変数** - 画面間のデータ共有

## 🐛 トラブルシューティング

### 画面が表示されない

**原因**: ファイルを直接開いている（`file://`プロトコル）
**解決策**: ローカルサーバーを使用してください（上記「起動方法」参照）

### JavaScript エラーが発生する

**原因**: スクリプトの読み込み順序が正しくない
**解決策**: `index.html`で以下の順序でスクリプトを読み込んでください：

```html
<script src="src/js/master-data.js"></script>
<script src="src/js/table-edit.js"></script>
<script src="src/js/auth.js"></script>
<script src="src/js/navigation.js"></script>
<script src="src/js/modals.js"></script>
<script src="src/js/qr-management.js"></script>
<script src="src/js/asset-survey.js"></script>
<script src="src/js/filters.js"></script>
<script src="src/js/init.js"></script>
```

### Choices.js が動作しない

**原因**: Choices.jsのCDNが読み込まれていない
**解決策**: `index.html`の`<head>`内で以下を確認：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css">
<script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
```

### 画面遷移が動作しない

**原因**: 画面HTMLファイルが正しく読み込まれていない
**解決策**: ブラウザの開発者ツール（F12）でコンソールエラーを確認してください

## 📝 ログイン方法

### テスト用アカウント

- **医療コンサルユーザー**: `@hospital`を**含まない**メールアドレス
  - 例: `consultant@example.com`
  - 権限: すべての機能にアクセス可能

- **病院ユーザー**: `@hospital`を**含む**メールアドレス
  - 例: `user@hospital.com`
  - 権限: 一部の機能が制限される

パスワードは任意の文字列を入力してください（検証なし）。

## 📚 開発メモ

### ファイル分割の利点

1. **保守性の向上**
   - 各画面・機能が独立したファイルになり、修正箇所が明確
   - チーム開発でのコンフリクトを軽減

2. **可読性の向上**
   - 1ファイル11,048行 → 最大でも数百行のファイルに分割
   - 機能ごとにファイルが分かれ、コードの把握が容易

3. **再利用性**
   - CSS、JavaScriptモジュールを他のプロジェクトで再利用可能
   - 画面HTMLを他のシステムに移植しやすい

### 今後の改善案

1. **モジュールバンドラーの導入**
   - WebpackやViteを使ったビルドシステム
   - ES Modulesでのインポート/エクスポート

2. **フレームワークへの移行**
   - React、Vue.js、Angularなどへの段階的移行
   - コンポーネント化によるさらなる保守性向上

3. **型安全性の追加**
   - TypeScriptへの移行
   - 型チェックによるバグの早期発見

4. **テストの追加**
   - ユニットテスト（Jest、Vitest）
   - E2Eテスト（Playwright、Cypress）

## 📄 ライセンス

このプロジェクトは医療機器管理システムのプロトタイプ（モックアップ）です。

## 🙋 サポート

質問や問題がある場合は、プロジェクト管理者に連絡してください。

---

**作成日**: 2025-11-11
**元ファイル**: 画面モック.html (11,048行、397KB)
**分割後**: 48ファイル（HTML: 20, CSS: 11, JS: 9, その他: 8）
