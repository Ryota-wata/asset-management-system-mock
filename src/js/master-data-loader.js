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
 * 施設マスタを読み込む
 * @returns {Promise<Object>} 施設マスタデータ
 */
async function loadFacilityMaster() {
    if (facilityMasterCache) {
        return facilityMasterCache;
    }

    try {
        const response = await fetch('src/data/facility-master.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        facilityMasterCache = await response.json();
        console.log('施設マスタを読み込みました:', facilityMasterCache);
        return facilityMasterCache;
    } catch (error) {
        console.error('施設マスタの読み込みに失敗しました:', error);
        return null;
    }
}

/**
 * 資産マスタを読み込む
 * @returns {Promise<Object>} 資産マスタデータ
 */
async function loadAssetMaster() {
    if (assetMasterCache) {
        return assetMasterCache;
    }

    try {
        const response = await fetch('src/data/asset-master.json');
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
    if (!facilityMaster) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    const choices = facilityMaster.facilities.map(facility => ({
        value: facility.id,
        label: facility.name,
        customProperties: {
            code: facility.code,
            region: facility.region
        }
    }));

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
        ...choices
    ]);

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

    const choices = facilityMaster.departments.map(dept => ({
        value: dept.id,
        label: dept.name,
        customProperties: {
            code: dept.code,
            category: dept.category
        }
    }));

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
        ...choices
    ]);

    return choicesInstance;
}

/**
 * 科プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {number} departmentId - 部門ID（フィルタリング用）
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initSectionSelect(elementId, departmentId = null) {
    const facilityMaster = await loadFacilityMaster();
    if (!facilityMaster) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    let sections = facilityMaster.sections;
    if (departmentId) {
        sections = sections.filter(section => section.departmentId === departmentId);
    }

    const choices = sections.map(section => ({
        value: section.id,
        label: section.name,
        customProperties: {
            code: section.code,
            departmentId: section.departmentId
        }
    }));

    const choicesInstance = new Choices(element, {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: '科を検索...',
        placeholder: true,
        placeholderValue: '科を選択してください',
        itemSelectText: '',
        noResultsText: '該当する科が見つかりません',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        fuseOptions: {
            threshold: 0.3,
            distance: 100
        }
    });

    choicesInstance.setChoices([
        { value: '', label: '選択してください', selected: true },
        ...choices
    ]);

    return choicesInstance;
}

/**
 * 大分類プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initLargeClassSelect(elementId) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    const choices = assetMaster.largeClasses.map(largeClass => ({
        value: largeClass.id,
        label: largeClass.name,
        customProperties: {
            code: largeClass.code
        }
    }));

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
        ...choices
    ]);

    return choicesInstance;
}

/**
 * 中分類プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {number} largeClassId - 大分類ID（フィルタリング用）
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initMediumClassSelect(elementId, largeClassId = null) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    let mediumClasses = assetMaster.mediumClasses;
    if (largeClassId) {
        mediumClasses = mediumClasses.filter(mc => mc.largeClassId === largeClassId);
    }

    const choices = mediumClasses.map(mediumClass => ({
        value: mediumClass.id,
        label: mediumClass.name,
        customProperties: {
            code: mediumClass.code,
            largeClassId: mediumClass.largeClassId
        }
    }));

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
        ...choices
    ]);

    return choicesInstance;
}

/**
 * 品目プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {number} mediumClassId - 中分類ID（フィルタリング用）
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initItemSelect(elementId, mediumClassId = null) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    let items = assetMaster.items;
    if (mediumClassId) {
        items = items.filter(item => item.mediumClassId === mediumClassId);
    }

    const choices = items.map(item => ({
        value: item.id,
        label: item.name,
        customProperties: {
            code: item.code,
            mediumClassId: item.mediumClassId
        }
    }));

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
        ...choices
    ]);

    return choicesInstance;
}

/**
 * メーカープルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initManufacturerSelect(elementId) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    const choices = assetMaster.manufacturers.map(manufacturer => ({
        value: manufacturer.id,
        label: manufacturer.name,
        customProperties: {
            code: manufacturer.code,
            country: manufacturer.country
        }
    }));

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
        ...choices
    ]);

    return choicesInstance;
}

/**
 * 型式プルダウンを初期化
 * @param {string} elementId - プルダウンのID
 * @param {number} manufacturerId - メーカーID（フィルタリング用）
 * @param {number} itemId - 品目ID（フィルタリング用）
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initModelSelect(elementId, manufacturerId = null, itemId = null) {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    let models = assetMaster.models;
    if (manufacturerId) {
        models = models.filter(model => model.manufacturerId === manufacturerId);
    }
    if (itemId) {
        models = models.filter(model => model.itemId === itemId);
    }

    const choices = models.map(model => ({
        value: model.id,
        label: model.name,
        customProperties: {
            code: model.code,
            manufacturerId: model.manufacturerId,
            itemId: model.itemId
        }
    }));

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
        ...choices
    ]);

    return choicesInstance;
}

/**
 * 連動プルダウンの設定
 * 大分類 → 中分類 → 品目の連動
 */
async function setupAssetClassCascade() {
    const assetMaster = await loadAssetMaster();
    if (!assetMaster) return;

    const largeClassSelect = document.getElementById('largeClassSelect');
    const mediumClassSelect = document.getElementById('mediumClassSelect');
    const itemSelect = document.getElementById('itemSelect');

    if (!largeClassSelect || !mediumClassSelect || !itemSelect) {
        console.warn('資産分類のプルダウンが見つかりません');
        return;
    }

    // 大分類が変更されたら中分類を更新
    largeClassSelect.addEventListener('change', async function(e) {
        const largeClassId = parseInt(e.target.value);

        // 中分類を更新
        if (window.mediumClassChoice) {
            window.mediumClassChoice.destroy();
        }
        window.mediumClassChoice = await initMediumClassSelect('mediumClassSelect', largeClassId);

        // 品目をクリア
        if (window.itemChoice) {
            window.itemChoice.clearStore();
            window.itemChoice.setChoices([
                { value: '', label: '選択してください', selected: true }
            ]);
        }
    });

    // 中分類が変更されたら品目を更新
    mediumClassSelect.addEventListener('change', async function(e) {
        const mediumClassId = parseInt(e.target.value);

        // 品目を更新
        if (window.itemChoice) {
            window.itemChoice.destroy();
        }
        window.itemChoice = await initItemSelect('itemSelect', mediumClassId);
    });
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

    // 部門が変更されたら科を更新
    departmentSelect.addEventListener('change', async function(e) {
        const departmentId = parseInt(e.target.value);

        // 科を更新
        if (window.sectionChoice) {
            window.sectionChoice.destroy();
        }
        window.sectionChoice = await initSectionSelect('sectionSelect', departmentId);
    });
}

/**
 * 施設検索プルダウンを初期化（個体管理リストモーダル用）
 * @param {string} elementId - プルダウンのID
 * @returns {Promise<Choices>} Choices.jsインスタンス
 */
async function initFacilitySearchSelect(elementId) {
    const facilityMaster = await loadFacilityMaster();
    if (!facilityMaster) return null;

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element not found: ${elementId}`);
        return null;
    }

    const choices = facilityMaster.facilities.map(facility => ({
        value: facility.id,
        label: facility.name,
        customProperties: {
            code: facility.code,
            region: facility.region
        }
    }));

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
        ...choices
    ]);

    // 施設選択時の処理
    element.addEventListener('change', function(event) {
        const selectedValue = event.target.value;
        if (selectedValue) {
            // 選択された施設のIDから施設情報を取得
            const facilityId = parseInt(selectedValue);
            const facility = facilityMaster.facilities.find(f => f.id === facilityId);
            if (facility) {
                window.selectedFacility = facility;
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
window.initLargeClassSelect = initLargeClassSelect;
window.initMediumClassSelect = initMediumClassSelect;
window.initItemSelect = initItemSelect;
window.initManufacturerSelect = initManufacturerSelect;
window.initModelSelect = initModelSelect;
window.initFacilitySearchSelect = initFacilitySearchSelect;
window.setupAssetClassCascade = setupAssetClassCascade;
window.setupFacilityCascade = setupFacilityCascade;
