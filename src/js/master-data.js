/**
 * マスタデータ管理モジュール
 *
 * 施設マスタと資産マスタをJSONファイルから読み込み、
 * プルダウンに設定する機能を提供します。
 * マスタデータの取得、保存、ローカルストレージ管理も含みます。
 */

// =============================================================================
// キャッシュ・定数
// =============================================================================

// マスタデータのストレージキー
const MASTER_DATA_KEY = 'surveyMasterData';

// マスタデータキャッシュ
let facilityMasterCache = null;
let assetMasterCache = null;

// =============================================================================
// JSONファイル読み込み（低レベルAPI）
// =============================================================================

/**
 * 施設マスタを読み込む（キャッシュバスター付き）
 * @param {boolean} forceRefresh - 強制的に再読み込みするか
 * @returns {Promise<Object>} 施設マスタデータ
 */
async function loadFacilityMaster(forceRefresh = false) {
    if (facilityMasterCache && !forceRefresh) {
        return facilityMasterCache;
    }

    try {
        // キャッシュバスター: タイムスタンプを付与してブラウザキャッシュを回避
        const timestamp = new Date().getTime();
        const response = await fetch(`src/data/facility-master.json?v=${timestamp}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        facilityMasterCache = await response.json();
        console.log('施設マスタを読み込みました:', facilityMasterCache);
        console.log('施設データ件数:', facilityMasterCache.facilities?.length || 0);
        return facilityMasterCache;
    } catch (error) {
        console.error('施設マスタの読み込みに失敗しました:', error);
        return null;
    }
}

/**
 * 資産マスタを読み込む（キャッシュバスター付き）
 * @param {boolean} forceRefresh - 強制的に再読み込みするか
 * @returns {Promise<Object>} 資産マスタデータ
 */
async function loadAssetMaster(forceRefresh = false) {
    if (assetMasterCache && !forceRefresh) {
        return assetMasterCache;
    }

    try {
        // キャッシュバスター: タイムスタンプを付与してブラウザキャッシュを回避
        const timestamp = new Date().getTime();
        const response = await fetch(`src/data/asset-master.json?v=${timestamp}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        assetMasterCache = await response.json();
        console.log('資産マスタを読み込みました:', assetMasterCache);
        return assetMasterCache;
    } catch (error) {
        console.error('資産マスタの読み込みに失敗しました:', error);
        return null;
    }
}

// =============================================================================
// マスタデータ取得・保存（高レベルAPI）
// =============================================================================

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
    facilityMasterCache = null;
    assetMasterCache = null;

    // 最新データを読み込み
    const masterData = await getMasterDataFromJSON();

    // ローカルストレージに保存
    saveMasterDataToStorage(masterData);

    console.log('マスタデータの再読み込みが完了しました');
    return masterData;
}

// =============================================================================
// Choices.jsプルダウン初期化
// =============================================================================

/**
 * Choices.jsの共通オプションを取得
 * @param {string} searchPlaceholder - 検索プレースホルダー
 * @param {string} placeholder - プレースホルダー
 * @param {string} noResultsText - 結果がない時のテキスト
 */
function getChoicesOptions(searchPlaceholder, placeholder, noResultsText) {
    return {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: searchPlaceholder,
        placeholder: true,
        placeholderValue: placeholder,
        itemSelectText: '',
        noResultsText: noResultsText,
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    };
}

/**
 * 施設名プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initFacilityNameSelect(elementId) {
    const facilityMaster = await loadFacilityMaster();
    if (!facilityMaster || !facilityMaster.facilities || facilityMaster.facilities.length === 0) {
        console.error(`施設マスタの取得に失敗: ${elementId}`);
        return null;
    }

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    // ユニークな施設のみ抽出
    const uniqueFacilities = [];
    const seenCodes = new Set();

    facilityMaster.facilities.forEach(facility => {
        if (!seenCodes.has(facility.facilityCode)) {
            seenCodes.add(facility.facilityCode);
            uniqueFacilities.push({
                value: facility.facilityCode,
                label: facility.facilityName,
                customProperties: {
                    code: facility.facilityCode
                }
            });
        }
    });

    const choicesInstance = new Choices(element, getChoicesOptions(
        '施設名を検索...',
        '施設を選択してください',
        '該当する施設が見つかりません'
    ));

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueFacilities
    ], 'value', 'label', true);

    return choicesInstance;
}

/**
 * 部門プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initDepartmentSelect(elementId) {
    const facilityMaster = await loadFacilityMaster();
    if (!facilityMaster) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    // ユニークな部門のみ抽出
    const uniqueDepartments = [];
    const seenDepartments = new Set();

    facilityMaster.facilities.forEach(facility => {
        if (facility.department && !seenDepartments.has(facility.department)) {
            seenDepartments.add(facility.department);
            uniqueDepartments.push({
                value: facility.department,
                label: facility.department
            });
        }
    });

    // ソート
    uniqueDepartments.sort((a, b) => a.label.localeCompare(b.label, 'ja'));

    const choicesInstance = new Choices(element, getChoicesOptions(
        '部門を検索...',
        '部門を選択してください',
        '該当する部門が見つかりません'
    ));

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueDepartments
    ]);

    return choicesInstance;
}

/**
 * 科プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {string} department - 部門（フィルタリング用）
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initSectionSelect(elementId, department = null) {
    const facilityMaster = await loadFacilityMaster();
    if (!facilityMaster) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    // ユニークな部署のみ抽出（部門でフィルタリング可能）
    const uniqueSections = [];
    const seenSections = new Set();

    facilityMaster.facilities.forEach(facility => {
        // 部門が指定されている場合はフィルタリング
        if (department && facility.department !== department) {
            return;
        }

        if (facility.section && !seenSections.has(facility.section)) {
            seenSections.add(facility.section);
            uniqueSections.push({
                value: facility.section,
                label: facility.section,
                customProperties: {
                    department: facility.department
                }
            });
        }
    });

    // ソート
    uniqueSections.sort((a, b) => a.label.localeCompare(b.label, 'ja'));

    const choicesInstance = new Choices(element, getChoicesOptions(
        '部署を検索...',
        '部署を選択してください',
        '該当する部署が見つかりません'
    ));

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueSections
    ]);

    return choicesInstance;
}

/**
 * Categoryプルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initCategorySelect(elementId) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster || !assetMaster.assets) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    // ユニークなCategoryのみ抽出
    const uniqueCategories = [];
    const seenCategories = new Set();

    assetMaster.assets.forEach(asset => {
        if (asset.category && !seenCategories.has(asset.category)) {
            seenCategories.add(asset.category);
            uniqueCategories.push({
                value: asset.category,
                label: asset.category
            });
        }
    });

    uniqueCategories.sort((a, b) => a.label.localeCompare(b.label, 'ja'));

    const choicesInstance = new Choices(element, getChoicesOptions(
        'Categoryを検索...',
        'Categoryを選択してください',
        '該当するCategoryが見つかりません'
    ));

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueCategories
    ], 'value', 'label', true);

    return choicesInstance;
}

/**
 * 大分類プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {string} category - Category（フィルタリング用）
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initLargeClassSelect(elementId, category = null) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster || !assetMaster.assets) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    // ユニークな大分類のみ抽出
    const uniqueLargeClasses = [];
    const seenLargeClasses = new Set();

    assetMaster.assets.forEach(asset => {
        // Categoryが指定されている場合はフィルタリング
        if (category && asset.category !== category) {
            return;
        }

        if (asset.largeClass && !seenLargeClasses.has(asset.largeClass)) {
            seenLargeClasses.add(asset.largeClass);
            uniqueLargeClasses.push({
                value: asset.largeClass,
                label: asset.largeClass,
                customProperties: {
                    category: asset.category
                }
            });
        }
    });

    uniqueLargeClasses.sort((a, b) => a.label.localeCompare(b.label, 'ja'));

    const choicesInstance = new Choices(element, getChoicesOptions(
        '大分類を検索...',
        '大分類を選択してください',
        '該当する大分類が見つかりません'
    ));

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueLargeClasses
    ], 'value', 'label', true);

    return choicesInstance;
}

/**
 * 中分類プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {string} largeClass - 大分類（フィルタリング用）
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initMediumClassSelect(elementId, largeClass = null) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster || !assetMaster.assets) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    // ユニークな中分類のみ抽出
    const uniqueMediumClasses = [];
    const seenMediumClasses = new Set();

    assetMaster.assets.forEach(asset => {
        // 大分類が指定されている場合はフィルタリング
        if (largeClass && asset.largeClass !== largeClass) {
            return;
        }

        if (asset.mediumClass && !seenMediumClasses.has(asset.mediumClass)) {
            seenMediumClasses.add(asset.mediumClass);
            uniqueMediumClasses.push({
                value: asset.mediumClass,
                label: asset.mediumClass,
                customProperties: {
                    largeClass: asset.largeClass
                }
            });
        }
    });

    uniqueMediumClasses.sort((a, b) => a.label.localeCompare(b.label, 'ja'));

    const choicesInstance = new Choices(element, getChoicesOptions(
        '中分類を検索...',
        '中分類を選択してください',
        '該当する中分類が見つかりません'
    ));

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueMediumClasses
    ], 'value', 'label', true);

    return choicesInstance;
}

/**
 * 品目プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {string} mediumClass - 中分類（フィルタリング用）
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initItemSelect(elementId, mediumClass = null) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster || !assetMaster.assets) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    // ユニークな品目のみ抽出
    const uniqueItems = [];
    const seenItems = new Set();

    assetMaster.assets.forEach(asset => {
        // 中分類が指定されている場合はフィルタリング
        if (mediumClass && asset.mediumClass !== mediumClass) {
            return;
        }

        if (asset.item && !seenItems.has(asset.item)) {
            seenItems.add(asset.item);
            uniqueItems.push({
                value: asset.item,
                label: asset.item,
                customProperties: {
                    mediumClass: asset.mediumClass
                }
            });
        }
    });

    uniqueItems.sort((a, b) => a.label.localeCompare(b.label, 'ja'));

    const choicesInstance = new Choices(element, getChoicesOptions(
        '品目を検索...',
        '品目を選択してください',
        '該当する品目が見つかりません'
    ));

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueItems
    ], 'value', 'label', true);

    return choicesInstance;
}

/**
 * メーカープルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {string} item - 品目（フィルタリング用）
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initManufacturerSelect(elementId, item = null) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster || !assetMaster.assets) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    // ユニークなメーカーのみ抽出
    const uniqueManufacturers = [];
    const seenManufacturers = new Set();

    assetMaster.assets.forEach(asset => {
        // 品目が指定されている場合はフィルタリング
        if (item && asset.item !== item) {
            return;
        }

        if (asset.manufacturer && !seenManufacturers.has(asset.manufacturer)) {
            seenManufacturers.add(asset.manufacturer);
            uniqueManufacturers.push({
                value: asset.manufacturer,
                label: asset.manufacturer,
                customProperties: {
                    item: asset.item
                }
            });
        }
    });

    uniqueManufacturers.sort((a, b) => a.label.localeCompare(b.label, 'ja'));

    const choicesInstance = new Choices(element, getChoicesOptions(
        'メーカーを検索...',
        'メーカーを選択してください',
        '該当するメーカーが見つかりません'
    ));

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueManufacturers
    ], 'value', 'label', true);

    return choicesInstance;
}

/**
 * 型式プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {string} manufacturer - メーカー（フィルタリング用）
 * @param {string} item - 品目（フィルタリング用）
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initModelSelect(elementId, manufacturer = null, item = null) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster || !assetMaster.assets) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    // ユニークな型式のみ抽出
    const uniqueModels = [];
    const seenModels = new Set();

    assetMaster.assets.forEach(asset => {
        // メーカーが指定されている場合はフィルタリング
        if (manufacturer && asset.manufacturer !== manufacturer) {
            return;
        }
        // 品目が指定されている場合はフィルタリング
        if (item && asset.item !== item) {
            return;
        }

        if (asset.model && !seenModels.has(asset.model)) {
            seenModels.add(asset.model);
            uniqueModels.push({
                value: asset.model,
                label: asset.model,
                customProperties: {
                    manufacturer: asset.manufacturer,
                    item: asset.item
                }
            });
        }
    });

    uniqueModels.sort((a, b) => a.label.localeCompare(b.label, 'ja'));

    const choicesInstance = new Choices(element, getChoicesOptions(
        '型式を検索...',
        '型式を選択してください',
        '該当する型式が見つかりません'
    ));

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueModels
    ], 'value', 'label', true);

    return choicesInstance;
}

/**
 * 施設検索プルダウンを初期化（個体管理リストモーダル用）
 * @param {string} elementId - プルダウンのID
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initFacilitySearchSelect(elementId) {
    const facilityMaster = await loadFacilityMaster();
    if (!facilityMaster || !facilityMaster.facilities || facilityMaster.facilities.length === 0) {
        console.error(`施設マスタの取得に失敗: ${elementId}`);
        return null;
    }

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    // ユニークな施設のみ抽出
    const uniqueFacilities = [];
    const seenCodes = new Set();

    facilityMaster.facilities.forEach(facility => {
        if (!seenCodes.has(facility.facilityCode)) {
            seenCodes.add(facility.facilityCode);
            uniqueFacilities.push({
                value: facility.facilityCode,
                label: facility.facilityName,
                customProperties: {
                    code: facility.facilityCode
                }
            });
        }
    });

    const choicesInstance = new Choices(element, getChoicesOptions(
        '施設名を検索...',
        '施設を選択してください',
        '該当する施設が見つかりません'
    ));

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueFacilities
    ], 'value', 'label', true);

    // 施設選択時の処理
    element.addEventListener('change', function(event) {
        const selectedValue = event.target.value;
        if (selectedValue) {
            // 選択された施設コードから施設情報を取得
            const facility = facilityMaster.facilities.find(f => f.facilityCode === selectedValue);
            if (facility) {
                window.selectedFacility = {
                    facilityCode: facility.facilityCode,
                    facilityName: facility.facilityName,
                    building: facility.building,
                    floor: facility.floor,
                    department: facility.department,
                    section: facility.section
                };
            }
            // メニューボタンを有効化
            const buttons = document.querySelectorAll('#listModal .menu-btn');
            buttons.forEach(btn => btn.disabled = false);
        } else {
            window.selectedFacility = null;
            // メニューボタンを無効化
            const buttons = document.querySelectorAll('#listModal .menu-btn');
            buttons.forEach(btn => btn.disabled = true);
        }
    });

    return choicesInstance;
}

// =============================================================================
// 連動プルダウン設定
// =============================================================================

/**
 * 連動プルダウンの設定
 * Category → 大分類 → 中分類 → 品目 → メーカー → 型式の連動
 */
async function setupAssetClassCascade() {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster) return;

    const categorySelect = document.getElementById('categorySelect');
    const largeClassSelect = document.getElementById('largeClassSelect');
    const mediumClassSelect = document.getElementById('mediumClassSelect');
    const itemSelect = document.getElementById('itemSelect');

    // Category → 大分類の連動
    if (categorySelect && largeClassSelect) {
        categorySelect.addEventListener('change', async function(e) {
            const category = e.target.value;

            // 大分類を更新
            if (window.largeClassChoice) {
                window.largeClassChoice.destroy();
            }
            window.largeClassChoice = await initLargeClassSelect('largeClassSelect', category);

            // 中分類、品目をクリア
            if (window.mediumClassChoice) {
                window.mediumClassChoice.clearStore();
                window.mediumClassChoice.setChoices([
                    { value: '', label: '選択してください', selected: true }
                ], 'value', 'label', true);
            }
            if (window.itemChoice) {
                window.itemChoice.clearStore();
                window.itemChoice.setChoices([
                    { value: '', label: '選択してください', selected: true }
                ], 'value', 'label', true);
            }
        });
    }

    // 大分類 → 中分類の連動
    if (largeClassSelect && mediumClassSelect) {
        largeClassSelect.addEventListener('change', async function(e) {
            const largeClass = e.target.value;

            // 中分類を更新
            if (window.mediumClassChoice) {
                window.mediumClassChoice.destroy();
            }
            window.mediumClassChoice = await initMediumClassSelect('mediumClassSelect', largeClass);

            // 品目をクリア
            if (window.itemChoice) {
                window.itemChoice.clearStore();
                window.itemChoice.setChoices([
                    { value: '', label: '選択してください', selected: true }
                ], 'value', 'label', true);
            }
        });
    }

    // 中分類 → 品目の連動
    if (mediumClassSelect && itemSelect) {
        mediumClassSelect.addEventListener('change', async function(e) {
            const mediumClass = e.target.value;

            // 品目を更新
            if (window.itemChoice) {
                window.itemChoice.destroy();
            }
            window.itemChoice = await initItemSelect('itemSelect', mediumClass);
        });
    }

    // 現有資産調査統合画面の連動設定
    const integratedCategorySelect = document.getElementById('integratedCategorySelect');
    const integratedLargeClassSelect = document.getElementById('integratedLargeClassSelect');
    const integratedMediumClassSelect = document.getElementById('integratedMediumClassSelect');
    const integratedItemSelect = document.getElementById('integratedItemSelect');

    // Category → 大分類の連動（統合画面）
    if (integratedCategorySelect && integratedLargeClassSelect) {
        integratedCategorySelect.addEventListener('change', async function(e) {
            const category = e.target.value;

            // 大分類を更新
            if (window.integratedLargeClassChoice) {
                window.integratedLargeClassChoice.destroy();
            }
            window.integratedLargeClassChoice = await initLargeClassSelect('integratedLargeClassSelect', category);

            // 中分類、品目をクリア
            if (window.integratedMediumClassChoice) {
                window.integratedMediumClassChoice.clearStore();
                window.integratedMediumClassChoice.setChoices([
                    { value: '', label: '選択してください', selected: true }
                ], 'value', 'label', true);
            }
            if (window.integratedItemChoice) {
                window.integratedItemChoice.clearStore();
                window.integratedItemChoice.setChoices([
                    { value: '', label: '選択してください', selected: true }
                ], 'value', 'label', true);
            }
        });
    }

    // 大分類 → 中分類の連動（統合画面）
    if (integratedLargeClassSelect && integratedMediumClassSelect) {
        integratedLargeClassSelect.addEventListener('change', async function(e) {
            const largeClass = e.target.value;

            // 中分類を更新
            if (window.integratedMediumClassChoice) {
                window.integratedMediumClassChoice.destroy();
            }
            window.integratedMediumClassChoice = await initMediumClassSelect('integratedMediumClassSelect', largeClass);

            // 品目をクリア
            if (window.integratedItemChoice) {
                window.integratedItemChoice.clearStore();
                window.integratedItemChoice.setChoices([
                    { value: '', label: '選択してください', selected: true }
                ], 'value', 'label', true);
            }
        });
    }

    // 中分類 → 品目の連動（統合画面）
    if (integratedMediumClassSelect && integratedItemSelect) {
        integratedMediumClassSelect.addEventListener('change', async function(e) {
            const mediumClass = e.target.value;

            // 品目を更新
            if (window.integratedItemChoice) {
                window.integratedItemChoice.destroy();
            }
            window.integratedItemChoice = await initItemSelect('integratedItemSelect', mediumClass);
        });
    }
}

/**
 * 連動プルダウンの設定
 * 部門 → 科の連動
 */
async function setupFacilityCascade() {
    const facilityMaster = await loadFacilityMaster();
    if (!facilityMaster) return;

    const departmentSelect = document.getElementById('departmentSelect');
    const sectionSelect = document.getElementById('sectionSelect');

    if (!departmentSelect || !sectionSelect) {
        console.warn('施設情報のプルダウンが見つかりません');
        return;
    }

    // 部門が変更されたら部署を更新
    departmentSelect.addEventListener('change', async function(e) {
        const department = e.target.value;

        // 部署を更新
        if (window.sectionChoice) {
            window.sectionChoice.destroy();
        }
        window.sectionChoice = await initSectionSelect('sectionSelect', department);
    });
}

// =============================================================================
// 画面別マスタデータロード
// =============================================================================

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

// =============================================================================
// オフライン準備画面用
// =============================================================================

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

// =============================================================================
// グローバルスコープに公開
// =============================================================================

// JSONファイル読み込み（低レベルAPI）
window.loadFacilityMaster = loadFacilityMaster;
window.loadAssetMaster = loadAssetMaster;

// マスタデータ取得・保存（高レベルAPI）
window.getMasterDataFromJSON = getMasterDataFromJSON;
window.saveMasterDataToStorage = saveMasterDataToStorage;
window.loadMasterDataFromStorage = loadMasterDataFromStorage;
window.clearMasterDataCache = clearMasterDataCache;
window.refreshMasterData = refreshMasterData;

// Choices.jsプルダウン初期化
window.initFacilityNameSelect = initFacilityNameSelect;
window.initDepartmentSelect = initDepartmentSelect;
window.initSectionSelect = initSectionSelect;
window.initCategorySelect = initCategorySelect;
window.initLargeClassSelect = initLargeClassSelect;
window.initMediumClassSelect = initMediumClassSelect;
window.initItemSelect = initItemSelect;
window.initManufacturerSelect = initManufacturerSelect;
window.initModelSelect = initModelSelect;
window.initFacilitySearchSelect = initFacilitySearchSelect;

// 連動プルダウン設定
window.setupAssetClassCascade = setupAssetClassCascade;
window.setupFacilityCascade = setupFacilityCascade;

// 画面別マスタデータロード
window.loadSearchMasterData = loadSearchMasterData;
window.loadAssetInfoMasterData = loadAssetInfoMasterData;

// オフライン準備画面用
window.handleDownloadMaster = handleDownloadMaster;
window.handleSyncData = handleSyncData;

// 選択された施設
window.selectedFacility = null;
