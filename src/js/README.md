# JavaScriptファイル構成

元のHTMLファイルから抽出したJavaScript機能を、機能別に9つのファイルに分割しました。

## ファイル一覧

### 1. auth.js (4.3KB)
**認証関連機能**
- `handleLogin()` - ログイン処理
- `handleLogout()` - ログアウト処理
- `showPasswordReset()` - パスワードリセット画面表示

### 2. navigation.js (8.0KB)
**画面遷移ロジック**
- `handleBackFromQR()` - QRコード管理画面から戻る
- `handleBackFromEdit()` - 登録内容修正画面から戻る
- `handleQRManagement()` - QRコード管理画面への遷移
- `handleStartSurvey()` - 現有資産調査画面への遷移
- `handleShowHistoryList()` - 履歴表示画面への遷移
- `handleGoToSurvey()` - 部門入力へ遷移
- その他多数の画面遷移関数

### 3. modals.js (9.0KB)
**モーダル制御**
- `showListModal()`, `closeListModal()`, `resetListModal()` - 個体管理リストモーダル
- `showMasterModal()`, `closeMasterModal()` - マスター管理モーダル
- `showPhotoModal()`, `closePhotoModal()` - 写真表示モーダル
- `toggleMobileColumn()`, `closeMobileColumn()` - モバイル用カラム選択
- `selectMenu()`, `selectMasterMenu()` - メニュー選択処理
- `initModalDrag()` - モーダルのドラッグ機能
- `openPhotoInNewWindow()` - 別ウィンドウで写真を開く

### 4. qr-management.js (4.5KB)
**QRコード管理**
- `showQRDetail()` - QRコード詳細画面表示
- `showQRIssue()` - QRコード新規発行画面表示
- `showQRPrint()` - QRコード印刷画面表示
- `switchQRIssueTab()` - 新規発行画面のタブ切り替え
- `updateQRIssueBulkPreview()` - 一括発行プレビュー更新
- `handleQRDetailPrint()` - 詳細画面から印刷
- `handleBulkPrint()` - 一括印刷
- `updateQRActionButtons()` - アクションボタンの有効化制御

### 5. asset-survey.js (2.4KB)
**資産調査**
- `loadSurveyMasterData()` - 現有資産調査画面にマスタデータをロード
- `selectHistoryCard()` - 履歴カードの選択処理
- `togglePhotoInputSwitch()` - 写真撮影画面のトグルスイッチ切り替え

### 6. master-data.js (17KB)
**マスタデータ管理**
- `facilities[]` - 施設マスタデータ配列
- `getSampleMasterData()` - サンプルマスタデータ取得
- `saveMasterDataToStorage()` - ローカルストレージに保存
- `loadMasterDataFromStorage()` - ローカルストレージから取得
- `loadSearchMasterData()` - 検索画面の分類情報にロード
- `loadAssetInfoMasterData()` - 資産情報入力画面にロード
- `handleDownloadMaster()` - マスタデータダウンロード
- `handleSyncData()` - データ送信処理

### 7. table-edit.js (30KB)
**テーブル編集機能**
- `facilityMasterData` - 施設マスタデータ
- `assetMasterData` - 資産マスタデータ
- `reverseLookup` - 逆引きマップ
- `getAllMediumClasses()`, `getAllItems()`, `getAllManufacturers()`, `getAllModels()` - 全データ取得
- `editRow()` - 行を編集モードにする
- `saveEdit()` - 編集内容を保存
- `cancelEdit()` - 編集をキャンセル
- `confirmRow()` - 行を確定
- `confirmAllRegistrations()` - 一括確定
- `toggleAllCheckboxes()` - 全チェックボックス切り替え
- `convertCellToInputByIndex()` - セルをインプットに変換
- `convertCellToSelect()` - セルをセレクトに変換
- `handleFieldChange()` - フィールド変更時のハンドラ
- `setSelectValue()` - selectの値を設定
- `updateSelectOptions()` - selectの選択肢を更新
- `moveDropdownToBody()` - Choices.jsドロップダウンの位置制御

### 8. filters.js (2.5KB)
**フィルター・検索**
- `clearForm()` - フォームをクリア
- `viewList()` - リスト閲覧
- `applyFilters()` - フィルター適用
- `clearFilters()` - フィルタークリア

### 9. init.js (25KB)
**初期化・イベントリスナー**
- `initChoices()` - Choices.jsの初期化（全ドロップダウン）
- 複数のDOMContentLoadedイベントリスナー：
  - 施設選択機能の初期化
  - マスター管理モーダルの外クリック処理
  - 保存済み検索条件の読み込み・保存
  - QRコード管理画面のチェックボックス全選択
  - QRコード管理画面の詳細・印刷リンク処理

## HTMLファイルへの組み込み方法

元のHTMLファイルの`<script>`タグ部分（6773行目以降）を削除し、以下のように置き換えてください：

```html
<!-- Choices.js Script -->
<script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>

<!-- 分割したJavaScriptファイルを読み込み -->
<!-- 依存関係を考慮した順序で読み込む -->
<script src="src/js/master-data.js"></script>      <!-- 最初：他のファイルが依存 -->
<script src="src/js/table-edit.js"></script>        <!-- master-data.jsの後 -->
<script src="src/js/auth.js"></script>
<script src="src/js/navigation.js"></script>
<script src="src/js/modals.js"></script>
<script src="src/js/qr-management.js"></script>
<script src="src/js/asset-survey.js"></script>      <!-- master-data.jsに依存 -->
<script src="src/js/filters.js"></script>
<script src="src/js/init.js"></script>              <!-- 最後：全ての関数が定義された後に実行 -->
</body>
</html>
```

## 読み込み順序の重要性

1. **master-data.js** - 最初に読み込む（他のファイルがこのデータに依存）
2. **table-edit.js** - master-data.jsの後に読み込む
3. **auth.js, navigation.js, modals.js, qr-management.js, filters.js** - 順不同
4. **asset-survey.js** - master-data.jsに依存
5. **init.js** - 最後に読み込む（全ての関数定義の後にイベントリスナーを設定）

## グローバル変数・関数

すべての関数は`window`オブジェクトに割り当てられており、HTML内のonclick属性などから直接呼び出せます。

例：
```html
<button onclick="handleLogin(event)">ログイン</button>
<button onclick="showListModal()">リスト表示</button>
```

## 注意事項

- Choices.jsライブラリは引き続き外部CDNから読み込む必要があります
- 各ファイルは独立していますが、相互に関数を呼び出す場合があります
- すべての関数はグローバルスコープで利用可能です
- ローカルストレージを使用してマスタデータを保存します（`MASTER_DATA_KEY = 'surveyMasterData'`）

## 開発時のヒント

- 特定の機能を修正する場合、対応するファイルだけを編集すればOK
- 新しい画面遷移を追加する場合は`navigation.js`に追加
- 新しいモーダルを追加する場合は`modals.js`に追加
- 新しいマスタデータを追加する場合は`master-data.js`に追加
