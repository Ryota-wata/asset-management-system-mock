/**
 * マスタデータ管理
 * マスタデータの取得、保存、ロード、同期などの機能を提供します。
 * JSONファイルから動的に読み込みます。
 */

// マスタデータのストレージキー
const MASTER_DATA_KEY = 'surveyMasterData';

/**
 * マスタデータをJSONファイルから取得
 * @returns {Promise<Object>} マスタデータオブジェクト
 */
async function getMasterDataFromJSON() {
    try {
        // 施設マスタと資産マスタを並行して読み込み
        const [facilityMaster, assetMaster] = await Promise.all([
            loadFacilityMaster(),
            loadAssetMaster()
        ]);

        if (!facilityMaster || !assetMaster) {
            throw new Error('マスタデータの読み込みに失敗しました');
        }

        // Choices.js用のフォーマットに変換（value, labelの形式）
        const toChoicesFormat = (items) => {
            if (!items || !Array.isArray(items)) return [];
            return items.map(item => ({
                value: item.id || item.value || item.code || item.facilityCode || '',
                label: item.name || item.label || item.facilityName || '',
                ...item
            }));
        };

        // フラット構造からユニークな部門・部署を抽出
        const getUniqueDepartments = (facilities) => {
            const uniqueDepts = new Map();
            facilities.forEach(f => {
                if (f.department && !uniqueDepts.has(f.department)) {
                    uniqueDepts.set(f.department, {
                        value: f.department,
                        label: f.department
                    });
                }
            });
            return Array.from(uniqueDepts.values());
        };

        const getUniqueSections = (facilities) => {
            const uniqueSects = new Map();
            facilities.forEach(f => {
                if (f.section && !uniqueSects.has(f.section)) {
                    uniqueSects.set(f.section, {
                        value: f.section,
                        label: f.section,
                        department: f.department
                    });
                }
            });
            return Array.from(uniqueSects.values());
        };

        const facilities = facilityMaster.facilities || facilityMaster.data || [];
        const assets = assetMaster.assets || [];

        // フラット構造からユニークな資産分類を抽出
        const getUniqueAssetField = (fieldName) => {
            const uniqueValues = new Map();
            assets.forEach(asset => {
                const value = asset[fieldName];
                if (value && !uniqueValues.has(value)) {
                    uniqueValues.set(value, {
                        value: value,
                        label: value
                    });
                }
            });
            return Array.from(uniqueValues.values());
        };

        return {
            // 施設関連（フラット構造対応）
            facilities: toChoicesFormat(facilities),
            departments: getUniqueDepartments(facilities),
            sections: getUniqueSections(facilities),

            // 資産関連（フラット構造対応）
            categories: getUniqueAssetField('category'),
            buildings: toChoicesFormat(assetMaster.buildings || []),
            floors: toChoicesFormat(assetMaster.floors || []),
            largeClasses: getUniqueAssetField('largeClass'),
            mediumClasses: getUniqueAssetField('mediumClass'),
            items: getUniqueAssetField('item'),
            manufacturers: getUniqueAssetField('manufacturer'),
            makers: getUniqueAssetField('manufacturer'),
            models: getUniqueAssetField('model')
        };
    } catch (error) {
        console.error('JSONファイルからのマスタデータ取得に失敗:', error);
        // フォールバック: 空のデータを返す
        return {
            facilities: [],
            departments: [],
            sections: [],
            categories: [],
            buildings: [],
            floors: [],
            largeClasses: [],
            mediumClasses: [],
            items: [],
            makers: [],
            models: []
        };
    }
}

/**
 * マスタデータをローカルストレージに保存
 * @param {Object} masterData - 保存するマスタデータ
 */
function saveMasterDataToStorage(masterData) {
    try {
        localStorage.setItem(MASTER_DATA_KEY, JSON.stringify(masterData));
        console.log('マスタデータをローカルストレージに保存しました');
    } catch (error) {
        console.error('ローカルストレージへの保存に失敗:', error);
    }
}

/**
 * マスタデータをローカルストレージから取得
 * 常にJSONファイルを優先し、ローカルストレージはバックアップとして使用
 * @returns {Promise<Object>} マスタデータ
 */
async function loadMasterDataFromStorage() {
    try {
        // 常にJSONファイルから最新データを取得（ローカルストレージは使用しない）
        console.log('JSONファイルから最新のマスタデータを読み込みます');
        const masterData = await getMasterDataFromJSON();

        // データ整合性チェック
        const facilityCount = masterData.facilities?.length || 0;
        const itemCount = masterData.items?.length || 0;
        console.log(`マスタデータ読み込み完了: 施設${facilityCount}件, 品目${itemCount}件`);

        // ローカルストレージに保存（オフライン時のバックアップ用）
        saveMasterDataToStorage(masterData);

        return masterData;
    } catch (error) {
        console.error('JSONファイルからの読み込みに失敗、ローカルストレージから復元を試みます:', error);

        // JSONファイル読み込み失敗時のみ、ローカルストレージからフォールバック
        try {
            const data = localStorage.getItem(MASTER_DATA_KEY);
            if (data) {
                console.log('ローカルストレージからマスタデータを復元しました（フォールバック）');
                return JSON.parse(data);
            }
        } catch (storageError) {
            console.error('ローカルストレージからの復元も失敗:', storageError);
        }

        // 両方失敗した場合は空データを返す
        console.error('マスタデータの読み込みに完全に失敗しました');
        return {
            facilities: [],
            departments: [],
            sections: [],
            categories: [],
            buildings: [],
            floors: [],
            largeClasses: [],
            mediumClasses: [],
            items: [],
            makers: [],
            models: []
        };
    }
}

/**
 * 検索画面の分類情報にマスタデータをロード
 */
async function loadSearchMasterData() {
    const masterData = await loadMasterDataFromStorage();

    // Choices.jsインスタンスが初期化されているか確認
    if (window.largeClassChoice && masterData.largeClasses) {
        window.largeClassChoice.clearStore();
        window.largeClassChoice.setChoices(masterData.largeClasses, 'value', 'label', true);
    }

    if (window.mediumClassChoice && masterData.mediumClasses) {
        window.mediumClassChoice.clearStore();
        window.mediumClassChoice.setChoices(masterData.mediumClasses, 'value', 'label', true);
    }

    if (window.itemChoice && masterData.items) {
        window.itemChoice.clearStore();
        window.itemChoice.setChoices(masterData.items, 'value', 'label', true);
    }
}

/**
 * 資産情報入力画面の分類情報にマスタデータをロード
 */
async function loadAssetInfoMasterData() {
    const masterData = await loadMasterDataFromStorage();

    // スマホ版
    if (window.assetLargeClassChoice && masterData.largeClasses) {
        window.assetLargeClassChoice.clearStore();
        window.assetLargeClassChoice.setChoices(masterData.largeClasses, 'value', 'label', true);
    }

    if (window.assetMediumClassChoice && masterData.mediumClasses) {
        window.assetMediumClassChoice.clearStore();
        window.assetMediumClassChoice.setChoices(masterData.mediumClasses, 'value', 'label', true);
    }

    if (window.assetItemChoice && masterData.items) {
        window.assetItemChoice.clearStore();
        window.assetItemChoice.setChoices(masterData.items, 'value', 'label', true);
    }

    if (window.assetMakerChoice && masterData.makers) {
        window.assetMakerChoice.clearStore();
        window.assetMakerChoice.setChoices(masterData.makers, 'value', 'label', true);
    }

    if (window.assetModelChoice && masterData.models) {
        window.assetModelChoice.clearStore();
        window.assetModelChoice.setChoices(masterData.models, 'value', 'label', true);
    }

    // タブレット版
    if (window.assetLargeClassChoiceTb && masterData.largeClasses) {
        window.assetLargeClassChoiceTb.clearStore();
        window.assetLargeClassChoiceTb.setChoices(masterData.largeClasses, 'value', 'label', true);
    }

    if (window.assetMediumClassChoiceTb && masterData.mediumClasses) {
        window.assetMediumClassChoiceTb.clearStore();
        window.assetMediumClassChoiceTb.setChoices(masterData.mediumClasses, 'value', 'label', true);
    }

    if (window.assetItemChoiceTb && masterData.items) {
        window.assetItemChoiceTb.clearStore();
        window.assetItemChoiceTb.setChoices(masterData.items, 'value', 'label', true);
    }

    if (window.assetMakerChoiceTb && masterData.makers) {
        window.assetMakerChoiceTb.clearStore();
        window.assetMakerChoiceTb.setChoices(masterData.makers, 'value', 'label', true);
    }

    if (window.assetModelChoiceTb && masterData.models) {
        window.assetModelChoiceTb.clearStore();
        window.assetModelChoiceTb.setChoices(masterData.models, 'value', 'label', true);
    }
}

/**
 * マスタデータダウンロード処理
 */
async function handleDownloadMaster() {
    const button = document.getElementById('downloadMasterButton');
    const statusElement = document.getElementById('downloadStatus');
    const timeElement = document.getElementById('lastDownloadTime');
    const dataCountElement = document.getElementById('dataCount');

    // ボタンを無効化
    button.disabled = true;
    button.innerHTML = '<span class="offline-prep-button-icon">⏳</span><span>ダウンロード中...</span>';

    try {
        // JSONファイルからマスタデータを取得
        const masterData = await getMasterDataFromJSON();

        // ローカルストレージに保存
        saveMasterDataToStorage(masterData);

        // データ件数を計算
        const totalCount =
            (masterData.categories?.length || 0) +
            (masterData.buildings?.length || 0) +
            (masterData.floors?.length || 0) +
            (masterData.departments?.length || 0) +
            (masterData.sections?.length || 0) +
            (masterData.largeClasses?.length || 0) +
            (masterData.mediumClasses?.length || 0) +
            (masterData.items?.length || 0) +
            (masterData.makers?.length || 0) +
            (masterData.models?.length || 0) +
            (masterData.facilities?.length || 0);

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
        await loadSearchMasterData();
        // 資産情報入力画面の分類情報もロード
        await loadAssetInfoMasterData();

        alert('マスタデータのダウンロードが完了しました。\nオフライン環境でも調査が可能です。');
    } catch (error) {
        console.error('マスタデータのダウンロードに失敗:', error);

        // エラー時のステータス更新
        statusElement.textContent = '✗ エラー';
        statusElement.className = 'offline-prep-status-value error';

        // ボタンを元に戻す
        button.disabled = false;
        button.innerHTML = '<span class="offline-prep-button-icon">📥</span><span>マスタデータをダウンロード</span>';

        alert('マスタデータのダウンロードに失敗しました。\n' + error.message);
    }
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

/**
 * ローカルストレージのマスタデータをクリア
 * 開発時やデータ更新時に使用
 */
function clearMasterDataCache() {
    try {
        localStorage.removeItem(MASTER_DATA_KEY);
        console.log('ローカルストレージのマスタデータをクリアしました');
        return true;
    } catch (error) {
        console.error('ローカルストレージのクリアに失敗:', error);
        return false;
    }
}

/**
 * マスタデータを強制的に再読み込み
 * キャッシュをクリアして最新データを取得
 */
async function refreshMasterData() {
    console.log('マスタデータを強制再読み込みします...');

    // ローカルストレージをクリア
    clearMasterDataCache();

    // メモリキャッシュもクリア
    if (typeof window.loadFacilityMaster === 'function') {
        window.facilityMasterCache = null;
    }
    if (typeof window.loadAssetMaster === 'function') {
        window.assetMasterCache = null;
    }

    // 最新データを読み込み
    const masterData = await getMasterDataFromJSON();

    // ローカルストレージに保存
    saveMasterDataToStorage(masterData);

    console.log('マスタデータの再読み込みが完了しました');
    return masterData;
}

// グローバルスコープに関数を公開
window.getMasterDataFromJSON = getMasterDataFromJSON;
window.saveMasterDataToStorage = saveMasterDataToStorage;
window.loadMasterDataFromStorage = loadMasterDataFromStorage;
window.loadSearchMasterData = loadSearchMasterData;
window.loadAssetInfoMasterData = loadAssetInfoMasterData;
window.handleDownloadMaster = handleDownloadMaster;
window.handleSyncData = handleSyncData;
window.clearMasterDataCache = clearMasterDataCache;
window.refreshMasterData = refreshMasterData;
window.selectedFacility = null;
