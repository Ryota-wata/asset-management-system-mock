/**
 * Choices.js 共通ヘルパー関数
 *
 * Choices.jsの初期化、スタイル適用、位置調整を統合管理する
 * 複数画面での重複コードを削減し、一貫した挙動を提供する
 */

/**
 * Choices.js 基本オプション設定
 * @param {Object} customOptions - カスタムオプション
 * @returns {Object} Choices.jsオプション
 */
function getChoicesBaseOptions(customOptions = {}) {
    const defaults = {
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 50,
        searchPlaceholderValue: '検索...',
        itemSelectText: '',
        noResultsText: '該当なし',
        noChoicesText: '選択肢がありません',
        shouldSort: false,
        removeItemButton: false,
        position: 'auto'
    };

    return Object.assign({}, defaults, customOptions);
}

/**
 * Choices.js フリー入力対応オプション設定
 * @param {Object} customOptions - カスタムオプション
 * @returns {Object} Choices.jsオプション
 */
function getChoicesFreeInputOptions(customOptions = {}) {
    const baseOptions = getChoicesBaseOptions({
        searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
        noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
        placeholder: true,
        placeholderValue: '選択してください',
        addItems: true,
        addItemFilter: (value) => {
            if (!value || value.trim() === '') return false;
            return true;
        }
    });

    return Object.assign({}, baseOptions, customOptions);
}

/**
 * Choices.js テーブル内編集用オプション設定（ドロップダウンスタイル強制適用付き）
 * @param {Object} customOptions - カスタムオプション
 * @returns {Object} Choices.jsオプション
 */
function getChoicesTableEditOptions(customOptions = {}) {
    return getChoicesBaseOptions(customOptions);
}

/**
 * ドロップダウンのスタイルと位置を設定（統合版）
 * asset-matching.jsの実装をベース
 * @param {HTMLElement} selectElement - select要素
 * @param {Object} options - オプション設定
 */
function setupDropdownStyleAndPosition(selectElement, options = {}) {
    const {
        minHeight = '150px',
        maxHeight = '300px',
        itemMinHeight = '30px',
        itemPadding = '10px 12px',
        autoPosition = true,
        zIndex = 10000
    } = options;

    const setupDropdown = () => {
        const choicesContainer = selectElement.closest('.choices');
        if (!choicesContainer) return;

        const dropdown = choicesContainer.querySelector('.choices__list--dropdown');
        if (!dropdown) return;

        const listbox = dropdown.querySelector('.choices__list[role="listbox"]');
        const items = dropdown.querySelectorAll('.choices__item');

        // リストボックスのスタイル
        if (listbox) {
            listbox.style.setProperty('display', 'block', 'important');
            listbox.style.setProperty('height', 'auto', 'important');
            listbox.style.setProperty('min-height', minHeight, 'important');
            listbox.style.setProperty('max-height', maxHeight, 'important');
            listbox.style.setProperty('overflow-y', 'auto', 'important');
        }

        // アイテムのスタイル
        items.forEach(item => {
            item.style.setProperty('display', 'block', 'important');
            item.style.setProperty('height', 'auto', 'important');
            item.style.setProperty('min-height', itemMinHeight, 'important');
            item.style.setProperty('padding', itemPadding, 'important');
            item.style.setProperty('color', '#333333', 'important');
            item.style.setProperty('font-size', '14px', 'important');
            item.style.setProperty('line-height', '1.5', 'important');
            item.style.setProperty('background-color', 'white', 'important');
        });

        // ドロップダウンのz-index設定
        dropdown.style.setProperty('z-index', zIndex.toString(), 'important');

        // 位置自動調整（下にスペースがない場合は上に表示）
        if (autoPosition) {
            const rect = choicesContainer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            const dropdownHeightNum = parseInt(maxHeight);

            if (spaceBelow < dropdownHeightNum && spaceAbove > spaceBelow) {
                dropdown.style.top = 'auto';
                dropdown.style.bottom = '100%';
                dropdown.style.marginTop = '0';
                dropdown.style.marginBottom = '2px';
            } else {
                dropdown.style.top = '100%';
                dropdown.style.bottom = 'auto';
                dropdown.style.marginTop = '2px';
                dropdown.style.marginBottom = '0';
            }
        }
    };

    // 初期化後にスタイルと位置を設定
    setTimeout(setupDropdown, 500);

    // ドロップダウンが開かれた時にも位置調整
    selectElement.addEventListener('showDropdown', () => {
        setTimeout(setupDropdown, 10);
    });

    return setupDropdown;
}

/**
 * ドロップダウンをbody直下に移動（テーブル内編集用）
 * table-edit.jsの実装をベース
 * @param {HTMLElement} selectElement - select要素
 * @param {Object} choicesInstance - Choices.jsインスタンス
 */
function moveDropdownToBody(selectElement, choicesInstance) {
    const choicesContainer = selectElement.parentElement?.querySelector('.choices');
    if (!choicesContainer) return;

    const dropdown = choicesContainer.querySelector('.choices__list--dropdown');
    if (!dropdown) return;

    // ドロップダウンをbody直下に移動
    document.body.appendChild(dropdown);

    // ドロップダウンにスタイルを追加
    dropdown.style.position = 'fixed';
    dropdown.style.zIndex = '10000';
    dropdown.style.minWidth = '250px';
    dropdown.style.maxHeight = '300px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.display = 'none';

    // 位置更新関数
    const updatePosition = () => {
        if (choicesContainer.classList.contains('is-open')) {
            const rect = choicesContainer.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
            dropdown.style.left = (rect.left + window.scrollX) + 'px';
            dropdown.style.width = rect.width + 'px';
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    };

    // Choicesが開閉される時の処理
    selectElement.addEventListener('showDropdown', () => {
        updatePosition();
    });

    selectElement.addEventListener('hideDropdown', () => {
        dropdown.style.display = 'none';
    });

    // Choicesのis-openクラスを監視
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                updatePosition();
            }
        });
    });

    observer.observe(choicesContainer, { attributes: true });

    // スクロール・リサイズ時に位置を更新
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
}

/**
 * Choices.jsインスタンスを初期化（基本パターン）
 * @param {string|HTMLElement} element - セレクタまたはDOM要素
 * @param {Object} customOptions - カスタムオプション
 * @returns {Object} Choices.jsインスタンス
 */
function initChoices(element, customOptions = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) {
        console.error('Element not found:', element);
        return null;
    }

    const options = getChoicesBaseOptions(customOptions);
    return new Choices(el, options);
}

/**
 * Choices.jsインスタンスを初期化（フリー入力対応）
 * @param {string|HTMLElement} element - セレクタまたはDOM要素
 * @param {Object} customOptions - カスタムオプション
 * @returns {Object} Choices.jsインスタンス
 */
function initChoicesWithFreeInput(element, customOptions = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) {
        console.error('Element not found:', element);
        return null;
    }

    const options = getChoicesFreeInputOptions(customOptions);
    return new Choices(el, options);
}

/**
 * Choices.jsインスタンスを初期化（テーブル内編集用・スタイル強制適用付き）
 * @param {HTMLElement} selectElement - select要素
 * @param {Object} customOptions - カスタムオプション
 * @param {Object} styleOptions - スタイルオプション
 * @returns {Object} Choices.jsインスタンス
 */
function initChoicesForTableEdit(selectElement, customOptions = {}, styleOptions = {}) {
    if (!selectElement) {
        console.error('Element not found');
        return null;
    }

    const options = getChoicesTableEditOptions(customOptions);
    const choicesInstance = new Choices(selectElement, options);

    // スタイルと位置を設定
    setupDropdownStyleAndPosition(selectElement, styleOptions);

    return choicesInstance;
}

/**
 * Choices.jsインスタンスを初期化（テーブル内編集用・body移動版）
 * @param {HTMLElement} selectElement - select要素
 * @param {Object} customOptions - カスタムオプション
 * @returns {Object} Choices.jsインスタンス
 */
function initChoicesForTableEditWithBodyMove(selectElement, customOptions = {}) {
    if (!selectElement) {
        console.error('Element not found');
        return null;
    }

    const options = getChoicesTableEditOptions(customOptions);
    const choicesInstance = new Choices(selectElement, options);

    // ドロップダウンをbody直下に移動
    setTimeout(() => {
        moveDropdownToBody(selectElement, choicesInstance);
    }, 10);

    return choicesInstance;
}

// グローバルに公開
window.ChoicesHelper = {
    getChoicesBaseOptions,
    getChoicesFreeInputOptions,
    getChoicesTableEditOptions,
    setupDropdownStyleAndPosition,
    moveDropdownToBody,
    initChoices,
    initChoicesWithFreeInput,
    initChoicesForTableEdit,
    initChoicesForTableEditWithBodyMove
};
