# マスタデータ読み込み問題の根本的解決

## 問題の原因（全体構造分析）

### 1. ローカルストレージキャッシュの優先順位問題
- `master-data.js` の `loadMasterDataFromStorage()` が **ローカルストレージを優先**していた
- 新しいJSONファイル（49件）があっても、古いキャッシュ（48件）を使い続けていた

### 2. ブラウザキャッシュの問題
- `fetch('src/data/facility-master.json')` がブラウザキャッシュを使用
- JSONファイルを更新してもブラウザが古いバージョンを返していた

### 3. データの不整合
- SHIP施設マスタ: 直接JSONを読み込むため最新（49件）
- 資産検索画面: ローカルストレージ経由で古いデータ（48件）
- 個体管理リストモーダル: ローカルストレージ経由で古いデータ（48件）

## 根本的解決策（一発修正）

### 修正1: master-data-loader.js
**変更内容**: キャッシュバスター追加

```javascript
// 修正前
const response = await fetch('src/data/facility-master.json');

// 修正後
const timestamp = new Date().getTime();
const response = await fetch(`src/data/facility-master.json?v=${timestamp}`);
```

**効果**:
- ブラウザキャッシュを完全にバイパス
- 常に最新のJSONファイルを取得

### 修正2: master-data.js
**変更内容**: JSON優先、ローカルストレージはバックアップのみ

```javascript
// 修正前
async function loadMasterDataFromStorage() {
    const data = localStorage.getItem(MASTER_DATA_KEY);
    if (data) {
        return JSON.parse(data);  // ← 古いデータを返していた
    }
    // JSONファイルは二番目の選択肢
}

// 修正後
async function loadMasterDataFromStorage() {
    // 常にJSONファイルから最新データを取得
    const masterData = await getMasterDataFromJSON();
    
    // ローカルストレージに保存（オフライン時のバックアップ用）
    saveMasterDataToStorage(masterData);
    
    return masterData;
}
```

**効果**:
- 常に最新のJSONファイルからデータを読み込む
- ローカルストレージはオフライン時のフォールバックのみ

### 修正3: キャッシュクリア機能追加

```javascript
// clearMasterDataCache(): ローカルストレージをクリア
// refreshMasterData(): 強制的に再読み込み
```

**効果**:
- 開発時に簡単にキャッシュをクリア可能
- コンソールから手動実行可能

### 修正4: データ整合性チェック追加

```javascript
const facilityCount = masterData.facilities?.length || 0;
console.log(`マスタデータ読み込み完了: 施設${facilityCount}件`);
```

**効果**:
- 読み込んだデータの件数をログ出力
- 問題の早期発見

### 修正5: 検証ツール作成
**ファイル**: `debug-master-data.html`

**機能**:
1. ローカルストレージのキャッシュ状態を確認
2. キャッシュクリアボタン
3. 施設マスタの全件表示（テーブル形式）
4. 資産マスタの全件表示
5. 統合マスタデータの確認

## 解決確認手順

### 手順1: キャッシュクリア
```
http://localhost:8080/debug-master-data.html にアクセス
↓
「ローカルストレージをクリア」ボタンをクリック
↓
ページをリロード
```

### 手順2: データ確認
```
「施設マスタを読み込む」ボタンをクリック
↓
49件のデータが表示されることを確認
（ID: 49, 施設コード: F015, 施設名: ディズニー医療センター が含まれる）
```

### 手順3: 本番画面で確認
```
http://localhost:8080 にアクセス
↓
資産検索画面の「施設名」ドロップダウンを開く
↓
16施設（F001〜F015 + F015の重複）が表示されることを確認
↓
「個体管理リスト作成」モーダルの施設選択でも同様に確認
```

## ブラウザコンソールで手動確認

### コマンド1: ローカルストレージクリア
```javascript
window.clearMasterDataCache();
location.reload();
```

### コマンド2: 最新データ強制読み込み
```javascript
await window.refreshMasterData();
location.reload();
```

### コマンド3: 施設データ件数確認
```javascript
const data = await window.loadFacilityMaster(true);
console.log('施設データ件数:', data.facilities.length);
console.log('最後の施設:', data.facilities[data.facilities.length - 1]);
```

## 今後の運用

### JSONファイル更新時
1. ファイルを保存
2. ブラウザでページをリロード（Ctrl+F5 / Cmd+Shift+R）
3. 自動的に最新データが読み込まれる

### トラブルシューティング
問題が発生した場合:
```javascript
// ブラウザコンソールで実行
localStorage.clear();
location.reload();
```

## 修正ファイル一覧

1. ✅ `src/js/master-data-loader.js`
   - キャッシュバスター追加
   - forceRefresh パラメータ追加

2. ✅ `src/js/master-data.js`
   - JSON優先読み込みに変更
   - clearMasterDataCache() 追加
   - refreshMasterData() 追加

3. ✅ `src/js/modals.js`
   - 施設選択イベントリスナー追加
   - handleFacilityChange() 追加

4. ✅ `src/js/hospital-select.js`
   - 動的データ読み込み実装
   - テーブル動的生成追加

5. ✅ `debug-master-data.html`
   - 検証ツール作成（新規）

## 検証結果の期待値

### コンソールログ
```
JSONファイルから最新のマスタデータを読み込みます
施設マスタを読み込みました: Object
施設データ件数: 49
マスタデータ読み込み完了: 施設49件, 品目XX件
```

### ドロップダウン
- 資産検索画面の施設名: 16施設（重複除く）
- 個体管理リストモーダルの施設選択: 16施設
- SHIP施設マスタ: 49レコード

すべて最新のJSONファイルから読み込まれます。
