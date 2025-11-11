/**
 * マスタデータ管理
 * マスタデータの取得、保存、ロード、同期などの機能を提供します。
 */

// 施設マスタデータ
const facilities = [
    { id: 1, name: '東京中央総合病院' },
    { id: 2, name: '東京第一クリニック' },
    { id: 3, name: '横浜総合医療センター' },
    { id: 4, name: '横浜南病院' },
    { id: 5, name: '大阪中央病院' },
    { id: 6, name: '大阪北部医療センター' },
    { id: 7, name: '名古屋総合病院' },
    { id: 8, name: '名古屋東クリニック' },
    { id: 9, name: '福岡中央病院' },
    { id: 10, name: '福岡西部医療センター' },
    { id: 11, name: '札幌総合病院' },
    { id: 12, name: '札幌北クリニック' },
    { id: 13, name: '仙台中央病院' },
    { id: 14, name: '仙台東部医療センター' },
    { id: 15, name: '広島総合病院' }
];

// マスタデータのストレージキー
const MASTER_DATA_KEY = 'surveyMasterData';

/**
 * サンプルマスタデータを取得（実際はサーバーから取得）
 * @returns {Object} マスタデータオブジェクト
 */
function getSampleMasterData() {
    return {
        categories: [
            { value: 'medical', label: '医療機器' },
            { value: 'furniture', label: '什器' },
            { value: 'all', label: '全現調' },
            { value: 'equipment', label: '設備機器' },
            { value: 'it', label: 'IT機器' }
        ],
        buildings: [
            { value: 'main', label: '本館' },
            { value: 'east', label: '東館' },
            { value: 'west', label: '西館' },
            { value: 'north', label: '北館' },
            { value: 'annex', label: '別館' }
        ],
        floors: [
            { value: 'b2', label: 'B2F' },
            { value: 'b1', label: 'B1F' },
            { value: '1f', label: '1F' },
            { value: '2f', label: '2F' },
            { value: '3f', label: '3F' },
            { value: '4f', label: '4F' },
            { value: '5f', label: '5F' },
            { value: '6f', label: '6F' },
            { value: '7f', label: '7F' }
        ],
        departments: [
            { value: 'examination', label: '検査部門' },
            { value: 'medical', label: '診療部門' },
            { value: 'administration', label: '管理部門' },
            { value: 'pharmacy', label: '薬剤部門' },
            { value: 'radiology', label: '放射線部門' },
            { value: 'rehabilitation', label: 'リハビリ部門' }
        ],
        sections: [
            { value: 'pathology', label: '病理検査' },
            { value: 'physiology', label: '生理検査' },
            { value: 'clinical', label: '臨床検査' },
            { value: 'general', label: '総務課' },
            { value: 'accounting', label: '経理課' },
            { value: 'internal', label: '内科' },
            { value: 'surgery', label: '外科' },
            { value: 'emergency', label: '救急科' }
        ],
        largeClasses: [
            { value: '医療機器', label: '医療機器' },
            { value: '放射線関連機器', label: '放射線関連機器' },
            { value: '検査機器', label: '検査機器' },
            { value: '治療機器', label: '治療機器' },
            { value: '手術機器', label: '手術機器' },
            { value: '生命維持管理機器', label: '生命維持管理機器' },
            { value: '滅菌・洗浄機器', label: '滅菌・洗浄機器' },
            { value: '什器備品', label: '什器備品' },
            { value: 'システム機器', label: 'システム機器' },
            { value: '事務機器', label: '事務機器' },
            { value: '家具', label: '家具' }
        ],
        mediumClasses: [
            { value: 'CT関連', label: 'CT関連' },
            { value: 'MRI関連', label: 'MRI関連' },
            { value: 'X線関連', label: 'X線関連' },
            { value: '超音波関連', label: '超音波関連' },
            { value: '内視鏡関連', label: '内視鏡関連' },
            { value: '血液検査関連', label: '血液検査関連' },
            { value: '生化学検査関連', label: '生化学検査関連' },
            { value: '人工呼吸器関連', label: '人工呼吸器関連' },
            { value: '透析関連', label: '透析関連' },
            { value: '手術台・照明', label: '手術台・照明' },
            { value: '電気メス・レーザー', label: '電気メス・レーザー' },
            { value: 'PC機器', label: 'PC機器' },
            { value: '複合機', label: '複合機' },
            { value: 'デスク', label: 'デスク' },
            { value: 'チェア', label: 'チェア' }
        ],
        items: [
            { value: 'CTスキャナ', label: 'CTスキャナ' },
            { value: 'MRI装置', label: 'MRI装置' },
            { value: '超音波診断装置', label: '超音波診断装置' },
            { value: 'X線撮影装置', label: 'X線撮影装置' },
            { value: '血管造影装置', label: '血管造影装置' },
            { value: '内視鏡システム', label: '内視鏡システム' },
            { value: '血液分析装置', label: '血液分析装置' },
            { value: '生化学分析装置', label: '生化学分析装置' },
            { value: '人工呼吸器', label: '人工呼吸器' },
            { value: '透析装置', label: '透析装置' },
            { value: '麻酔器', label: '麻酔器' },
            { value: '手術台', label: '手術台' },
            { value: '電気メス', label: '電気メス' },
            { value: 'レーザー装置', label: 'レーザー装置' },
            { value: '除細動器', label: '除細動器' },
            { value: '心電計', label: '心電計' },
            { value: '患者モニタ', label: '患者モニタ' },
            { value: '輸液ポンプ', label: '輸液ポンプ' },
            { value: 'シリンジポンプ', label: 'シリンジポンプ' },
            { value: 'ノートPC', label: 'ノートPC' },
            { value: 'デスクトップPC', label: 'デスクトップPC' },
            { value: 'タブレット端末', label: 'タブレット端末' },
            { value: '業務用複合機', label: '業務用複合機' },
            { value: 'オフィスデスク', label: 'オフィスデスク' },
            { value: 'オフィスチェア', label: 'オフィスチェア' }
        ],
        makers: [
            { value: 'GEヘルスケア', label: 'GEヘルスケア' },
            { value: 'シーメンス', label: 'シーメンス' },
            { value: 'フィリップス', label: 'フィリップス' },
            { value: '東芝メディカルシステムズ', label: '東芝メディカルシステムズ' },
            { value: '日立製作所', label: '日立製作所' },
            { value: 'オリンパス', label: 'オリンパス' },
            { value: 'テルモ', label: 'テルモ' },
            { value: '日本光電', label: '日本光電' },
            { value: 'フクダ電子', label: 'フクダ電子' },
            { value: 'キヤノンメディカル', label: 'キヤノンメディカル' },
            { value: '富士フイルム', label: '富士フイルム' },
            { value: 'HP', label: 'HP' },
            { value: 'Dell', label: 'Dell' },
            { value: 'Lenovo', label: 'Lenovo' },
            { value: 'Apple', label: 'Apple' },
            { value: 'Canon', label: 'Canon' },
            { value: 'EPSON', label: 'EPSON' },
            { value: 'RICOH', label: 'RICOH' }
        ],
        models: [
            { value: 'Revolution CT', label: 'Revolution CT' },
            { value: 'Optima CT660', label: 'Optima CT660' },
            { value: 'MAGNETOM Vida', label: 'MAGNETOM Vida' },
            { value: 'Ingenia 3.0T', label: 'Ingenia 3.0T' },
            { value: 'Aquilion ONE', label: 'Aquilion ONE' },
            { value: 'CF-HQ290ZI', label: 'CF-HQ290ZI' },
            { value: 'BW-1200', label: 'BW-1200' },
            { value: 'BNP-990', label: 'BNP-990' },
            { value: 'TE-2700', label: 'TE-2700' },
            { value: 'VS-1500', label: 'VS-1500' },
            { value: 'ProBook 450', label: 'ProBook 450' },
            { value: 'Latitude 5420', label: 'Latitude 5420' },
            { value: 'ThinkPad X1', label: 'ThinkPad X1' },
            { value: 'MacBook Pro', label: 'MacBook Pro' },
            { value: 'imageRUNNER ADVANCE', label: 'imageRUNNER ADVANCE' }
        ]
    };
}

/**
 * マスタデータをローカルストレージに保存
 * @param {Object} masterData - 保存するマスタデータ
 */
function saveMasterDataToStorage(masterData) {
    localStorage.setItem(MASTER_DATA_KEY, JSON.stringify(masterData));
}

/**
 * マスタデータをローカルストレージから取得
 * @returns {Object} マスタデータ
 */
function loadMasterDataFromStorage() {
    const data = localStorage.getItem(MASTER_DATA_KEY);
    if (data) {
        return JSON.parse(data);
    }
    // データがない場合はサンプルデータを返す
    return getSampleMasterData();
}

/**
 * 検索画面の分類情報にマスタデータをロード
 */
function loadSearchMasterData() {
    const masterData = loadMasterDataFromStorage();

    // Choices.jsインスタンスが初期化されているか確認
    if (window.largeClassChoice) {
        window.largeClassChoice.clearStore();
        window.largeClassChoice.setChoices(masterData.largeClasses, 'value', 'label', true);
    }

    if (window.mediumClassChoice) {
        window.mediumClassChoice.clearStore();
        window.mediumClassChoice.setChoices(masterData.mediumClasses, 'value', 'label', true);
    }

    if (window.itemChoice) {
        window.itemChoice.clearStore();
        window.itemChoice.setChoices(masterData.items, 'value', 'label', true);
    }
}

/**
 * 資産情報入力画面の分類情報にマスタデータをロード
 */
function loadAssetInfoMasterData() {
    const masterData = loadMasterDataFromStorage();

    // スマホ版
    if (window.assetLargeClassChoice) {
        window.assetLargeClassChoice.clearStore();
        window.assetLargeClassChoice.setChoices(masterData.largeClasses, 'value', 'label', true);
    }

    if (window.assetMediumClassChoice) {
        window.assetMediumClassChoice.clearStore();
        window.assetMediumClassChoice.setChoices(masterData.mediumClasses, 'value', 'label', true);
    }

    if (window.assetItemChoice) {
        window.assetItemChoice.clearStore();
        window.assetItemChoice.setChoices(masterData.items, 'value', 'label', true);
    }

    if (window.assetMakerChoice) {
        window.assetMakerChoice.clearStore();
        window.assetMakerChoice.setChoices(masterData.makers, 'value', 'label', true);
    }

    if (window.assetModelChoice) {
        window.assetModelChoice.clearStore();
        window.assetModelChoice.setChoices(masterData.models, 'value', 'label', true);
    }

    // タブレット版
    if (window.assetLargeClassChoiceTb) {
        window.assetLargeClassChoiceTb.clearStore();
        window.assetLargeClassChoiceTb.setChoices(masterData.largeClasses, 'value', 'label', true);
    }

    if (window.assetMediumClassChoiceTb) {
        window.assetMediumClassChoiceTb.clearStore();
        window.assetMediumClassChoiceTb.setChoices(masterData.mediumClasses, 'value', 'label', true);
    }

    if (window.assetItemChoiceTb) {
        window.assetItemChoiceTb.clearStore();
        window.assetItemChoiceTb.setChoices(masterData.items, 'value', 'label', true);
    }

    if (window.assetMakerChoiceTb) {
        window.assetMakerChoiceTb.clearStore();
        window.assetMakerChoiceTb.setChoices(masterData.makers, 'value', 'label', true);
    }

    if (window.assetModelChoiceTb) {
        window.assetModelChoiceTb.clearStore();
        window.assetModelChoiceTb.setChoices(masterData.models, 'value', 'label', true);
    }
}

/**
 * マスタデータダウンロード処理
 */
function handleDownloadMaster() {
    const button = document.getElementById('downloadMasterButton');
    const statusElement = document.getElementById('downloadStatus');
    const timeElement = document.getElementById('lastDownloadTime');
    const dataCountElement = document.getElementById('dataCount');

    // ボタンを無効化
    button.disabled = true;
    button.innerHTML = '<span class="offline-prep-button-icon">⏳</span><span>ダウンロード中...</span>';

    // ダウンロード処理をシミュレート（実際はサーバーからfetchで取得）
    setTimeout(() => {
        // サンプルマスタデータを取得
        const masterData = getSampleMasterData();

        // ローカルストレージに保存
        saveMasterDataToStorage(masterData);

        // データ件数を計算
        const totalCount =
            masterData.categories.length +
            masterData.buildings.length +
            masterData.floors.length +
            masterData.departments.length +
            masterData.sections.length +
            masterData.largeClasses.length +
            masterData.mediumClasses.length +
            masterData.items.length +
            masterData.makers.length +
            masterData.models.length;

        // 現在時刻を取得
        const now = new Date();
        const timeString = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // ステータスを更新
        statusElement.textContent = '✓ 最新';
        statusElement.className = 'offline-prep-status-value success';
        timeElement.textContent = timeString;
        dataCountElement.textContent = `マスタ項目:${totalCount}件`;

        // ボタンを元に戻す
        button.disabled = false;
        button.innerHTML = '<span class="offline-prep-button-icon">📥</span><span>マスタデータをダウンロード</span>';

        // 検索画面の分類情報もロード
        loadSearchMasterData();
        // 資産情報入力画面の分類情報もロード
        loadAssetInfoMasterData();

        alert('マスタデータのダウンロードが完了しました。\nオフライン環境でも調査が可能です。');
    }, 2000);
}

/**
 * データ送信処理
 */
function handleSyncData() {
    const button = document.getElementById('syncDataButton');
    const unsyncedElement = document.getElementById('unsyncedCount');
    const syncTimeElement = document.getElementById('lastSyncTime');
    const connectionElement = document.getElementById('connectionStatus');

    // 接続状態を確認
    if (connectionElement.textContent.indexOf('オフライン') !== -1) {
        alert('オンライン環境に接続してください。');
        return;
    }

    const unsyncedCount = parseInt(unsyncedElement.textContent);
    if (unsyncedCount === 0) {
        alert('送信するデータがありません。');
        return;
    }

    if (!confirm(`未送信データ ${unsyncedCount}件 を送信します。\nよろしいですか?`)) {
        return;
    }

    // ボタンを無効化
    button.disabled = true;
    button.innerHTML = '<span class="offline-prep-button-icon">⏳</span><span>送信中...</span>';

    // 送信処理をシミュレート
    setTimeout(() => {
        // 現在時刻を取得
        const now = new Date();
        const timeString = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // ステータスを更新
        unsyncedElement.textContent = '0件';
        unsyncedElement.className = 'offline-prep-status-value success';
        syncTimeElement.textContent = timeString;

        // ボタンを元に戻す
        button.disabled = false;
        button.innerHTML = '<span class="offline-prep-button-icon">📤</span><span>データを送信</span>';

        alert(`データの送信が完了しました。\n成功: ${unsyncedCount}件\nエラー: 0件`);
    }, 3000);
}

// グローバルスコープに関数とデータを公開
window.facilities = facilities;
window.getSampleMasterData = getSampleMasterData;
window.saveMasterDataToStorage = saveMasterDataToStorage;
window.loadMasterDataFromStorage = loadMasterDataFromStorage;
window.loadSearchMasterData = loadSearchMasterData;
window.loadAssetInfoMasterData = loadAssetInfoMasterData;
window.handleDownloadMaster = handleDownloadMaster;
window.handleSyncData = handleSyncData;
window.selectedFacility = null;
