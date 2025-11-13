/**
 * テーブル編集機能
 * 登録内容修正画面のテーブル行編集、確定、チェックボックス制御などの機能を提供します。
 */

// 施設マスタデータ
const facilityMasterData = {
    categories: [
        { id: 'CAT01', name: '医療機器' },
        { id: 'CAT02', name: '什器備品' },
        { id: 'CAT03', name: 'システム機器' }
    ],
    buildings: [
        { id: 'BLD01', name: '本館' },
        { id: 'BLD02', name: '別館' },
        { id: 'BLD03', name: '新館' }
    ],
    floors: [
        { id: 'FLR01', name: 'B1F' },
        { id: 'FLR02', name: '1F' },
        { id: 'FLR03', name: '2F' },
        { id: 'FLR04', name: '3F' }
    ],
    departments: [
        { id: 'DEPT01', name: '手術部門' },
        { id: 'DEPT02', name: '放射線科' }
    ],
    sections: [
        { id: 'SEC01', name: '器材室' },
        { id: 'SEC02', name: 'CT室' }
    ]
};

// 資産マスタデータ
const assetMasterData = {
    largeClasses: [
        { id: 'L01', name: '医療機器' },
        { id: 'L02', name: '検査機器' },
        { id: 'L03', name: '治療機器' },
        { id: 'L04', name: '什器備品' }
    ],
    mediumClasses: {
        'L01': [
            { id: 'M01', name: '滅菌機器' },
            { id: 'M03', name: '内視鏡関連' }
        ],
        'L02': [
            { id: 'M05', name: '血液検査装置' }
        ],
        'L03': [
            { id: 'M07', name: '物理療法機器' }
        ],
        'L04': [
            { id: 'M08', name: '診察台' },
            { id: 'M09', name: 'デスク・チェア' }
        ]
    },
    items: {
        'M01': [
            { id: 'I001', name: '燻蒸滅菌装置', masterId: 'M001' }
        ],
        'M03': [
            { id: 'I005', name: '気管支ファイバースコープ', masterId: 'M003' },
            { id: 'I006', name: '上部消化管内視鏡', masterId: 'M004' },
            { id: 'I007', name: '大腸内視鏡', masterId: 'M005' }
        ],
        'M05': [
            { id: 'I010', name: '自動血球計数器', masterId: 'M010' }
        ],
        'M07': [
            { id: 'I015', name: '超音波治療器', masterId: 'M015' }
        ],
        'M08': [
            { id: 'I020', name: '電動診察台', masterId: 'M020' },
            { id: 'I021', name: '手動診察台', masterId: 'M021' }
        ],
        'M09': [
            { id: 'I025', name: '事務デスク', masterId: 'M025' }
        ]
    },
    manufacturers: {
        'I001': [
            { id: 'MF01', name: 'VENLE GO' }
        ],
        'I005': [
            { id: 'MF05', name: 'オリンパス' },
            { id: 'MF06', name: 'PENTAX' }
        ],
        'I006': [
            { id: 'MF05', name: 'オリンパス' },
            { id: 'MF07', name: '富士フイルム' }
        ],
        'I007': [
            { id: 'MF05', name: 'オリンパス' }
        ],
        'I010': [
            { id: 'MF10', name: 'シスメックス' }
        ],
        'I015': [
            { id: 'MF15', name: '伊藤超短波' }
        ],
        'I020': [
            { id: 'MF20', name: '高田ベッド製作所' },
            { id: 'MF21', name: 'タカラベルモント' }
        ],
        'I021': [
            { id: 'MF20', name: '高田ベッド製作所' }
        ],
        'I025': [
            { id: 'MF25', name: 'コクヨ' }
        ]
    },
    models: {
        'MF01': [
            { id: 'MD01', name: 'CEパルサマドライ', masterId: 'M001' }
        ],
        'MF05': [
            { id: 'MD03', name: 'LF TYPE MP60-01', masterId: 'M003' },
            { id: 'MD04', name: 'GIF-H290', masterId: 'M004' },
            { id: 'MD05', name: 'CF-H290', masterId: 'M005' }
        ],
        'MF06': [
            { id: 'MD06', name: 'EB-1970UK', masterId: 'M006' }
        ],
        'MF07': [
            { id: 'MD07', name: 'EG-6400N', masterId: 'M007' }
        ],
        'MF10': [
            { id: 'MD10', name: 'XN-3000', masterId: 'M010' }
        ],
        'MF15': [
            { id: 'MD15', name: 'US-750', masterId: 'M015' }
        ],
        'MF20': [
            { id: 'MD20', name: 'TB-1234', masterId: 'M020' },
            { id: 'MD21', name: 'TB-1000', masterId: 'M021' }
        ],
        'MF21': [
            { id: 'MD22', name: 'EX-100', masterId: 'M022' }
        ],
        'MF25': [
            { id: 'MD25', name: 'D-1200', masterId: 'M025' }
        ]
    }
};

// 逆引きマップの作成
const reverseLookup = {
    // 中分類IDから大分類IDへの逆引き
    mediumToLarge: {},
    // 品目IDから中分類IDへの逆引き
    itemToMedium: {},
    // メーカーIDから品目IDへの逆引き
    manufacturerToItem: {},
    // 型式IDからメーカーIDへの逆引き
    modelToManufacturer: {}
};

// 逆引きマップを構築
Object.keys(assetMasterData.mediumClasses).forEach(largeId => {
    assetMasterData.mediumClasses[largeId].forEach(medium => {
        reverseLookup.mediumToLarge[medium.id] = largeId;
    });
});

Object.keys(assetMasterData.items).forEach(mediumId => {
    assetMasterData.items[mediumId].forEach(item => {
        reverseLookup.itemToMedium[item.id] = mediumId;
    });
});

Object.keys(assetMasterData.manufacturers).forEach(itemId => {
    assetMasterData.manufacturers[itemId].forEach(manufacturer => {
        if (!reverseLookup.manufacturerToItem[manufacturer.id]) {
            reverseLookup.manufacturerToItem[manufacturer.id] = [];
        }
        reverseLookup.manufacturerToItem[manufacturer.id].push(itemId);
    });
});

Object.keys(assetMasterData.models).forEach(manufacturerId => {
    assetMasterData.models[manufacturerId].forEach(model => {
        reverseLookup.modelToManufacturer[model.id] = manufacturerId;
    });
});

let currentEditingRow = null;
let originalRowData = {};

/**
 * 全ての中分類を取得
 * @returns {Array} 中分類の配列
 */
function getAllMediumClasses() {
    const allMedium = [];
    Object.keys(assetMasterData.mediumClasses).forEach(largeId => {
        assetMasterData.mediumClasses[largeId].forEach(medium => {
            allMedium.push(medium);
        });
    });
    return allMedium;
}

/**
 * 全ての品目を取得
 * @returns {Array} 品目の配列
 */
function getAllItems() {
    const allItems = [];
    Object.keys(assetMasterData.items).forEach(mediumId => {
        assetMasterData.items[mediumId].forEach(item => {
            allItems.push(item);
        });
    });
    return allItems;
}

/**
 * 全てのメーカーを取得（重複排除）
 * @returns {Array} メーカーの配列
 */
function getAllManufacturers() {
    const manufacturerMap = {};
    Object.keys(assetMasterData.manufacturers).forEach(itemId => {
        assetMasterData.manufacturers[itemId].forEach(manufacturer => {
            manufacturerMap[manufacturer.id] = manufacturer;
        });
    });
    return Object.values(manufacturerMap);
}

/**
 * 全ての型式を取得
 * @returns {Array} 型式の配列
 */
function getAllModels() {
    const allModels = [];
    Object.keys(assetMasterData.models).forEach(manufacturerId => {
        assetMasterData.models[manufacturerId].forEach(model => {
            allModels.push(model);
        });
    });
    return allModels;
}

/**
 * 行を編集モードにする
 * @param {HTMLElement} button - 編集ボタン要素
 */
function editRow(button) {
    const row = button.closest('tr');
    const rowId = row.getAttribute('data-row-id');

    if (currentEditingRow && currentEditingRow !== row) {
        cancelEdit(currentEditingRow.querySelector('.cancel-btn'));
    }

    // 編集対象の全フィールドを保存
    const assetNumberText = row.cells[10].textContent.trim();
    const assetNumberValue = assetNumberText.includes('マスタに登録なし') ? '' : assetNumberText;

    originalRowData[rowId] = {
        category: row.querySelector('[data-field="category"]').textContent,
        building: row.querySelector('[data-field="building"]').textContent,
        floor: row.querySelector('[data-field="floor"]').textContent,
        department: row.querySelector('[data-field="department"]').textContent,
        section: row.querySelector('[data-field="section"]').textContent,
        sealNo: row.cells[8].textContent,
        roomName: row.cells[9].textContent,
        assetNumber: assetNumberValue,
        equipmentNumber: row.cells[11].textContent,
        purchaseDate: row.cells[12].textContent,
        lease: row.cells[13].textContent,
        rental: row.cells[14].textContent,
        largeClass: row.querySelector('[data-field="largeClass"]').textContent,
        mediumClass: row.querySelector('[data-field="mediumClass"]').textContent,
        item: row.querySelector('[data-field="item"]').textContent,
        manufacturer: row.querySelector('[data-field="manufacturer"]').textContent,
        model: row.querySelector('[data-field="model"]').textContent,
        widthSize: row.cells[21].textContent,
        depthSize: row.cells[22].textContent,
        heightSize: row.cells[23].textContent,
        remarks: row.cells[24].textContent
    };

    row.classList.add('editing-row');
    currentEditingRow = row;

    // プルダウンフィールド（元々プルダウンだったもの）
    convertCellToSelect(row, 'category', facilityMasterData.categories);
    convertCellToSelect(row, 'building', facilityMasterData.buildings);
    convertCellToSelect(row, 'floor', facilityMasterData.floors);
    convertCellToSelect(row, 'department', facilityMasterData.departments);
    convertCellToSelect(row, 'section', facilityMasterData.sections);

    // 大分類、中分類、品目、メーカー、型式は全て全選択肢を表示
    convertCellToSelect(row, 'largeClass', assetMasterData.largeClasses);

    // 中分類：全選択肢を表示
    const allMediumClasses = getAllMediumClasses();
    convertCellToSelect(row, 'mediumClass', allMediumClasses);

    // 品目：全選択肢を表示
    const allItems = getAllItems();
    convertCellToSelect(row, 'item', allItems);

    // メーカー：全選択肢を表示
    const allManufacturers = getAllManufacturers();
    convertCellToSelect(row, 'manufacturer', allManufacturers);

    // 型式：全選択肢を表示
    const allModels = getAllModels();
    convertCellToSelect(row, 'model', allModels);

    // フリー入力フィールド
    convertCellToInputByIndex(row, 8, 'sealNo');
    convertCellToInputByIndex(row, 9, 'roomName');
    convertCellToInputByIndex(row, 10, 'assetNumber');
    convertCellToInputByIndex(row, 11, 'equipmentNumber');
    convertCellToInputByIndex(row, 12, 'purchaseDate');
    convertCellToInputByIndex(row, 13, 'lease');
    convertCellToInputByIndex(row, 14, 'rental');
    convertCellToInputByIndex(row, 21, 'widthSize');
    convertCellToInputByIndex(row, 22, 'depthSize');
    convertCellToInputByIndex(row, 23, 'heightSize');
    convertCellToInputByIndex(row, 24, 'remarks');

    const actionCell = button.parentElement;
    actionCell.innerHTML = `
        <button class="save-btn" onclick="saveEdit(this)">保存</button>
        <button class="cancel-btn" onclick="cancelEdit(this)">キャンセル</button>
    `;
}

/**
 * セルをインプットフィールドに変換（インデックス指定）
 * @param {HTMLElement} row - 行要素
 * @param {number} cellIndex - セルのインデックス
 * @param {string} fieldName - フィールド名
 */
function convertCellToInputByIndex(row, cellIndex, fieldName) {
    const cell = row.cells[cellIndex];
    const currentValue = cell.textContent.includes('マスタに登録なし') ? '' : cell.textContent;
    cell.innerHTML = `<input type="text" class="cell-input" value="${currentValue}" data-field="${fieldName}">`;
}

/**
 * セルをセレクトボックスに変換
 * @param {HTMLElement} row - 行要素
 * @param {string} fieldName - フィールド名
 * @param {Array} options - 選択肢の配列
 */
function convertCellToSelect(row, fieldName, options) {
    const cell = row.querySelector(`[data-field="${fieldName}"]`);
    const currentValue = cell.textContent;
    const selectId = `select-${row.getAttribute('data-row-id')}-${fieldName}`;

    // 現在値参考表示を含むHTMLを生成
    let html = '<div class="select-wrapper">';

    // 現在値が空でない場合は参考表示を追加
    if (currentValue && currentValue.trim() !== '') {
        html += `<div class="current-value-reference">
            <span class="current-value-label">現在値:</span>
            <span class="current-value-text">${currentValue}</span>
        </div>`;
    }

    html += `<select class="cell-select" id="${selectId}" data-field="${fieldName}" onchange="handleFieldChange(this, '${fieldName}')">`;
    html += `<option value="">選択してください</option>`;

    options.forEach(option => {
        const selected = option.name === currentValue ? 'selected' : '';
        html += `<option value="${option.id}" ${selected}>${option.name}</option>`;
    });

    html += `</select></div>`;
    cell.innerHTML = html;

    setTimeout(() => {
        const selectElement = document.getElementById(selectId);
        if (selectElement && window.Choices && window.ChoicesHelper) {
            // 共通ヘルパーを使用してChoices.jsを初期化（body移動版）
            const choicesInstance = window.ChoicesHelper.initChoicesForTableEditWithBodyMove(
                selectElement,
                {
                    searchPlaceholderValue: '検索',
                    placeholder: false,
                    allowHTML: false
                }
            );
        }
    }, 10);
}

/**
 * Choices.jsのドロップダウンをbody直下に移動し、位置を動的に計算する関数
 * @deprecated この関数はchoices-helper.jsに移動済み。後方互換性のため残存。
 * @param {HTMLElement} selectElement - select要素
 * @param {Object} choicesInstance - Choices.jsのインスタンス
 */
function moveDropdownToBody(selectElement, choicesInstance) {
    const choicesContainer = selectElement.parentElement.querySelector('.choices');
    if (!choicesContainer) return;

    // ドロップダウンメニューを取得
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
    dropdown.style.display = 'none'; // 初期状態では非表示

    // Choicesが開閉される時の処理
    selectElement.addEventListener('showDropdown', function(e) {
        const rect = choicesContainer.getBoundingClientRect();
        dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
        dropdown.style.left = (rect.left + window.scrollX) + 'px';
        dropdown.style.width = rect.width + 'px';
        dropdown.style.display = 'block';
    });

    selectElement.addEventListener('hideDropdown', function(e) {
        dropdown.style.display = 'none';
    });

    // Choicesのis-openクラスを監視してドロップダウン位置を更新
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                if (choicesContainer.classList.contains('is-open')) {
                    const rect = choicesContainer.getBoundingClientRect();
                    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
                    dropdown.style.left = (rect.left + window.scrollX) + 'px';
                    dropdown.style.width = rect.width + 'px';
                    dropdown.style.display = 'block';
                } else {
                    dropdown.style.display = 'none';
                }
            }
        });
    });

    observer.observe(choicesContainer, { attributes: true });

    // スクロール時に位置を更新
    const updatePosition = () => {
        if (choicesContainer.classList.contains('is-open')) {
            const rect = choicesContainer.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
            dropdown.style.left = (rect.left + window.scrollX) + 'px';
        }
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
}

/**
 * フィールド変更時のハンドラ
 * @param {HTMLElement} select - select要素
 * @param {string} fieldName - フィールド名
 */
function handleFieldChange(select, fieldName) {
    const row = select.closest('tr');
    let selectedId;
    if (select.choices) {
        selectedId = select.choices.getValue(true);
    } else {
        selectedId = select.value;
    }

    if (!selectedId) return;

    // 選択されたフィールドに応じて親階層を自動選択
    if (fieldName === 'mediumClass') {
        // 中分類が選択された場合、大分類を自動選択
        const largeId = reverseLookup.mediumToLarge[selectedId];
        if (largeId) {
            setSelectValue(row, 'largeClass', largeId);
        }
        // 品目の選択肢を更新（選択された中分類の品目のみ表示）
        const itemOptions = assetMasterData.items[selectedId] || [];
        updateSelectOptions(row, 'item', itemOptions);

    } else if (fieldName === 'item') {
        // 品目が選択された場合、中分類と大分類を自動選択
        const mediumId = reverseLookup.itemToMedium[selectedId];
        if (mediumId) {
            setSelectValue(row, 'mediumClass', mediumId);
            const largeId = reverseLookup.mediumToLarge[mediumId];
            if (largeId) {
                setSelectValue(row, 'largeClass', largeId);
            }
        }
        // メーカーの選択肢を更新（選択された品目のメーカーのみ表示）
        const manufacturerOptions = assetMasterData.manufacturers[selectedId] || [];
        updateSelectOptions(row, 'manufacturer', manufacturerOptions);

    } else if (fieldName === 'manufacturer') {
        // メーカーが選択された場合、品目、中分類、大分類を自動選択
        const itemIds = reverseLookup.manufacturerToItem[selectedId];
        if (itemIds && itemIds.length > 0) {
            // 複数の品目に紐づく場合は最初の品目を選択
            const itemId = itemIds[0];
            setSelectValue(row, 'item', itemId);
            const mediumId = reverseLookup.itemToMedium[itemId];
            if (mediumId) {
                setSelectValue(row, 'mediumClass', mediumId);
                const largeId = reverseLookup.mediumToLarge[mediumId];
                if (largeId) {
                    setSelectValue(row, 'largeClass', largeId);
                }
            }
        }
        // 型式の選択肢を更新（選択されたメーカーの型式のみ表示）
        const modelOptions = assetMasterData.models[selectedId] || [];
        updateSelectOptions(row, 'model', modelOptions);

    } else if (fieldName === 'model') {
        // 型式が選択された場合、メーカー、品目、中分類、大分類を自動選択
        const manufacturerId = reverseLookup.modelToManufacturer[selectedId];
        if (manufacturerId) {
            setSelectValue(row, 'manufacturer', manufacturerId);
            const itemIds = reverseLookup.manufacturerToItem[manufacturerId];
            if (itemIds && itemIds.length > 0) {
                const itemId = itemIds[0];
                setSelectValue(row, 'item', itemId);
                const mediumId = reverseLookup.itemToMedium[itemId];
                if (mediumId) {
                    setSelectValue(row, 'mediumClass', mediumId);
                    const largeId = reverseLookup.mediumToLarge[mediumId];
                    if (largeId) {
                        setSelectValue(row, 'largeClass', largeId);
                    }
                }
            }
        }

    } else if (fieldName === 'largeClass') {
        // 大分類が選択された場合、中分類の選択肢をフィルタリング
        const mediumOptions = selectedId ? assetMasterData.mediumClasses[selectedId] || [] : [];
        updateSelectOptions(row, 'mediumClass', mediumOptions);
    }
}

/**
 * selectの値をプログラムで設定する関数
 * @param {HTMLElement} row - 行要素
 * @param {string} fieldName - フィールド名
 * @param {string} valueId - 設定する値のID
 */
function setSelectValue(row, fieldName, valueId) {
    const cell = row.querySelector(`[data-field="${fieldName}"]`);
    const select = cell.querySelector('select');
    if (select) {
        if (select.choices) {
            select.choices.setChoiceByValue(valueId);
        } else {
            select.value = valueId;
        }
    }
}

/**
 * selectの選択肢を更新する関数
 * @param {HTMLElement} row - 行要素
 * @param {string} fieldName - フィールド名
 * @param {Array} options - 新しい選択肢の配列
 */
function updateSelectOptions(row, fieldName, options) {
    const cell = row.querySelector(`[data-field="${fieldName}"]`);
    const select = cell.querySelector('select');
    if (select && select.choices) {
        const currentValue = select.choices.getValue(true);
        select.choices.clearChoices();
        select.choices.setChoices([
            { value: '', label: '選択してください', selected: false, disabled: false },
            ...options.map(opt => ({
                value: opt.id,
                label: opt.name,
                selected: opt.id === currentValue
            }))
        ], 'value', 'label', false);
    }
}

/**
 * 編集内容を保存
 * @param {HTMLElement} button - 保存ボタン要素
 */
function saveEdit(button) {
    const row = button.closest('tr');
    const selectFields = ['category', 'building', 'floor', 'department', 'section',
                         'largeClass', 'mediumClass', 'item', 'manufacturer', 'model'];
    const inputFields = ['sealNo', 'roomName', 'assetNumber', 'equipmentNumber',
                        'purchaseDate', 'lease', 'rental', 'widthSize', 'depthSize',
                        'heightSize', 'remarks'];
    let allSelected = true;
    let masterId = null;

    // プルダウンフィールドの処理
    selectFields.forEach(field => {
        const cell = row.querySelector(`[data-field="${field}"]`);
        const select = cell.querySelector('select');

        if (select) {
            let selectedValue, selectedId;
            if (select.choices) {
                selectedId = select.choices.getValue(true);
                const items = select.choices._currentState.items;
                const selectedItem = items.find(item => item.value === selectedId);
                selectedValue = selectedItem ? selectedItem.label : '';
            } else {
                selectedId = select.value;
                selectedValue = select.options[select.selectedIndex].text;
            }

            if (!selectedId) allSelected = false;

            if (field === 'model' && selectedId) {
                const modelData = Object.values(assetMasterData.models).flat().find(m => m.id === selectedId);
                if (modelData) masterId = modelData.masterId;
            }

            cell.textContent = selectedValue;
            // data-master-id属性を設定（フリー入力判定用）
            cell.setAttribute('data-master-id', selectedId || '');
        }
    });

    // フリー入力フィールドの処理
    const cellIndexMap = {
        'sealNo': 8, 'roomName': 9, 'assetNumber': 10, 'equipmentNumber': 11,
        'purchaseDate': 12, 'lease': 13, 'rental': 14, 'widthSize': 21,
        'depthSize': 22, 'heightSize': 23, 'remarks': 24
    };

    inputFields.forEach(field => {
        const input = row.querySelector(`input[data-field="${field}"]`);
        if (input) {
            const value = input.value.trim();
            const cellIndex = cellIndexMap[field];
            if (cellIndex !== undefined) {
                row.cells[cellIndex].textContent = value;
            }
        }
    });

    if (!allSelected) {
        alert('全ての項目を選択してください');
        return;
    }

    if (masterId) {
        row.setAttribute('data-master-id', masterId);
        const confirmBtn = row.querySelector('.confirm-btn');
        if (confirmBtn) confirmBtn.disabled = false;
    }

    row.classList.remove('editing-row');
    currentEditingRow = null;

    const actionCell = button.parentElement;
    const hasMasterId = row.getAttribute('data-master-id');
    const confirmDisabled = !hasMasterId ? 'disabled' : '';
    actionCell.innerHTML = `
        <button class="edit-btn" onclick="editRow(this)">編集</button>
        <button class="confirm-btn" onclick="confirmRow(this)" ${confirmDisabled}>確定</button>
    `;

    alert('保存しました');
}

/**
 * 編集をキャンセル
 * @param {HTMLElement} button - キャンセルボタン要素
 */
function cancelEdit(button) {
    const row = button.closest('tr');
    const rowId = row.getAttribute('data-row-id');

    if (originalRowData[rowId]) {
        const data = originalRowData[rowId];

        // data-fieldを持つセル（プルダウンフィールド）を元に戻す
        ['category', 'building', 'floor', 'department', 'section',
         'largeClass', 'mediumClass', 'item', 'manufacturer', 'model'].forEach(field => {
            if (data[field] !== undefined) {
                const cell = row.querySelector(`[data-field="${field}"]`);
                if (cell) cell.textContent = data[field];
            }
        });

        // cellIndexで指定するセル（フリー入力フィールド）を元に戻す
        const cellIndexMap = {
            'sealNo': 8, 'roomName': 9, 'assetNumber': 10, 'equipmentNumber': 11,
            'purchaseDate': 12, 'lease': 13, 'rental': 14, 'widthSize': 21,
            'depthSize': 22, 'heightSize': 23, 'remarks': 24
        };

        Object.keys(cellIndexMap).forEach(field => {
            if (data[field] !== undefined) {
                const cellIndex = cellIndexMap[field];
                row.cells[cellIndex].textContent = data[field];
            }
        });

        delete originalRowData[rowId];
    }

    row.classList.remove('editing-row');
    currentEditingRow = null;

    const actionCell = button.parentElement;
    const hasMasterId = row.getAttribute('data-master-id');
    const confirmDisabled = !hasMasterId ? 'disabled' : '';
    actionCell.innerHTML = `
        <button class="edit-btn" onclick="editRow(this)">編集</button>
        <button class="confirm-btn" onclick="confirmRow(this)" ${confirmDisabled}>確定</button>
    `;
}

/**
 * 行を確定
 * @param {HTMLElement} button - 確定ボタン要素
 */
function confirmRow(button) {
    const row = button.closest('tr');
    const masterId = row.getAttribute('data-master-id');

    if (!masterId) {
        alert('この行はマスタに紐づいていないため確定できません');
        return;
    }

    if (confirm('この行を確定してよろしいですか？')) {
        row.style.opacity = '0.5';
        button.disabled = true;
        button.textContent = '確定済';
        button.style.background = '#95a5a6';
        const editBtn = row.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.disabled = true;
            editBtn.style.background = '#95a5a6';
        }
        alert('確定しました');
    }
}

/**
 * 一括確定処理
 */
function confirmAllRegistrations() {
    const checkedRows = document.querySelectorAll('.row-checkbox:checked');
    if (checkedRows.length === 0) {
        alert('確定する行を選択してください');
        return;
    }

    let unlinkedCount = 0;
    checkedRows.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (!row.getAttribute('data-master-id')) unlinkedCount++;
    });

    if (unlinkedCount > 0) {
        if (checkedRows.length === unlinkedCount) {
            alert('選択された行は全てマスタに紐づいていないため確定できません');
            return;
        }
        if (!confirm(`${unlinkedCount}件がマスタ未紐付けです。紐付き済み${checkedRows.length - unlinkedCount}件のみ確定しますか？`)) {
            return;
        }
    } else {
        if (!confirm(`${checkedRows.length}件を確定しますか？`)) return;
    }

    checkedRows.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row.getAttribute('data-master-id')) {
            const confirmBtn = row.querySelector('.confirm-btn');
            if (confirmBtn && !confirmBtn.disabled) {
                row.style.opacity = '0.5';
                confirmBtn.disabled = true;
                confirmBtn.textContent = '確定済';
                confirmBtn.style.background = '#95a5a6';
                const editBtn = row.querySelector('.edit-btn');
                if (editBtn) {
                    editBtn.disabled = true;
                    editBtn.style.background = '#95a5a6';
                }
            }
        }
    });

    alert(`${checkedRows.length - unlinkedCount}件を確定しました`);
}

/**
 * 全チェックボックスの切り替え（共通ヘルパー使用）
 * @param {HTMLElement} checkbox - チェックボックス要素
 */
function toggleAllCheckboxes(checkbox) {
    if (window.TableHelper) {
        window.TableHelper.toggleSelectAll(checkbox, '.row-checkbox');
    }
}

// グローバルスコープに関数とデータを公開
window.facilityMasterData = facilityMasterData;
window.assetMasterData = assetMasterData;
window.reverseLookup = reverseLookup;
window.currentEditingRow = currentEditingRow;
window.originalRowData = originalRowData;
window.getAllMediumClasses = getAllMediumClasses;
window.getAllItems = getAllItems;
window.getAllManufacturers = getAllManufacturers;
window.getAllModels = getAllModels;
window.editRow = editRow;
window.saveEdit = saveEdit;
window.cancelEdit = cancelEdit;
window.confirmRow = confirmRow;
window.confirmAllRegistrations = confirmAllRegistrations;
window.toggleAllCheckboxes = toggleAllCheckboxes;
window.convertCellToInputByIndex = convertCellToInputByIndex;
window.convertCellToSelect = convertCellToSelect;
window.handleFieldChange = handleFieldChange;
window.setSelectValue = setSelectValue;
window.updateSelectOptions = updateSelectOptions;
window.moveDropdownToBody = moveDropdownToBody;
