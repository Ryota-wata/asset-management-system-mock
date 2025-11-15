/**
 * マスタデータ読み込みモジュール
 *
 * 施設マスタと資産マスタをJSONファイルから読み込み、
 * プルダウンに設定する機能を提供します。
 */

// マスタデータキャッシュ
let facilityMasterCache = null;
let assetMasterCache = null;

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

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: '施設名を検索...',
        placeholder: true,
        placeholderValue: '施設を選択してください',
        itemSelectText: '',
        noResultsText: '該当する施設が見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

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

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: '部門を検索...',
        placeholder: true,
        placeholderValue: '部門を選択してください',
        itemSelectText: '',
        noResultsText: '該当する部門が見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueDepartments
    ]);

    return choicesInstance;
}

/**
 * 科プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {number} departmentId - 部門ID（フィルタリング用）
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

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: '部署を検索...',
        placeholder: true,
        placeholderValue: '部署を選択してください',
        itemSelectText: '',
        noResultsText: '該当する部署が見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

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

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: 'Categoryを検索...',
        placeholder: true,
        placeholderValue: 'Categoryを選択してください',
        itemSelectText: '',
        noResultsText: '該当するCategoryが見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

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

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: '大分類を検索...',
        placeholder: true,
        placeholderValue: '大分類を選択してください',
        itemSelectText: '',
        noResultsText: '該当する大分類が見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

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

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: '中分類を検索...',
        placeholder: true,
        placeholderValue: '中分類を選択してください',
        itemSelectText: '',
        noResultsText: '該当する中分類が見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

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

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: '品目を検索...',
        placeholder: true,
        placeholderValue: '品目を選択してください',
        itemSelectText: '',
        noResultsText: '該当する品目が見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

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

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: 'メーカーを検索...',
        placeholder: true,
        placeholderValue: 'メーカーを選択してください',
        itemSelectText: '',
        noResultsText: '該当するメーカーが見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

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

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: '型式を検索...',
        placeholder: true,
        placeholderValue: '型式を選択してください',
        itemSelectText: '',
        noResultsText: '該当する型式が見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...uniqueModels
    ], 'value', 'label', true);

    return choicesInstance;
}

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

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: '施設名を検索...',
        placeholder: true,
        placeholderValue: '施設を選択してください',
        itemSelectText: '',
        noResultsText: '該当する施設が見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

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

// グローバルに公開
window.loadFacilityMaster = loadFacilityMaster;
window.loadAssetMaster = loadAssetMaster;
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
window.setupAssetClassCascade = setupAssetClassCascade;
window.setupFacilityCascade = setupFacilityCascade;
