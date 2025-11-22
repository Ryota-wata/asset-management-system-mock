/**
 * 資産調査機能
 * 現有資産調査に関する機能を提供します。
 */

// 履歴テーブルのセルインデックス定数
const CELL_INDEX = {
    LARGE_CLASS: 0,
    MEDIUM_CLASS: 1,
    ITEM: 2,
    MANUFACTURER: 3,
    MODEL: 4,
    SIZE: 5,
    ACTION: 6
};

// フィールド名とマスタデータキーのマッピング
const FIELD_MASTER_MAP = {
    '大分類': 'largeClasses',
    '中分類': 'mediumClasses',
    '品目': 'items',
    'メーカー': 'manufacturers',
    '型式': 'models'
};

/**
 * 現有資産調査画面にマスタデータをロード
 */
async function loadSurveyMasterData() {
    const masterData = await loadMasterDataFromStorage();
    const choicesMap = {
        surveyCategoryChoice: 'categories',
        surveyBuildingChoice: 'buildings',
        surveyFloorChoice: 'floors',
        surveyDepartmentChoice: 'departments',
        surveySectionChoice: 'sections'
    };

    Object.entries(choicesMap).forEach(([choiceName, dataKey]) => {
        const choice = window[choiceName];
        if (choice && masterData[dataKey]) {
            choice.clearStore();
            choice.setChoices(masterData[dataKey], 'value', 'label', true);
        }
    });
}

/**
 * 履歴テーブル行からセルデータを抽出
 * @param {HTMLElement} row - テーブル行要素
 * @returns {Object} セルデータ
 */
function extractCellData(row) {
    const cells = row.querySelectorAll('td');
    return {
        大分類: cells[CELL_INDEX.LARGE_CLASS].textContent,
        中分類: cells[CELL_INDEX.MEDIUM_CLASS].textContent,
        品目: cells[CELL_INDEX.ITEM].textContent,
        メーカー: cells[CELL_INDEX.MANUFACTURER].textContent,
        型式: cells[CELL_INDEX.MODEL].textContent,
        サイズ: cells[CELL_INDEX.SIZE].textContent
    };
}

/**
 * 操作ボタンのHTMLを生成
 * @returns {string} ボタンHTML
 */
function generateActionButtonsHTML() {
    return `
        <div class="history-action-buttons">
            <button class="history-use-button" onclick="selectHistoryRow(this)">
                この情報を使用
            </button>
            <button class="history-edit-button" onclick="editHistoryRow(this)">
                編集
            </button>
        </div>
    `;
}

/**
 * セルにdata-label属性を設定
 * @param {NodeList} cells - セル要素のリスト
 */
function restoreCellLabels(cells) {
    const labels = ['大分類', '中分類', '品目', 'メーカー', '型式', 'サイズ'];
    labels.forEach((label, index) => {
        cells[index].setAttribute('data-label', label);
    });
}

/**
 * 履歴テーブル行の選択処理
 * @param {HTMLElement} button - クリックされたボタン要素
 */
function selectHistoryRow(button) {
    const table = button.closest('.history-table');
    if (!table) return;

    // 全ての選択状態を解除
    table.querySelectorAll('.history-row').forEach(row => {
        row.classList.remove('selected');
    });
    table.querySelectorAll('.history-use-button').forEach(btn => {
        btn.classList.remove('selected');
        btn.innerHTML = 'この情報を使用';
    });

    // クリックされた行を選択
    const row = button.closest('.history-row');
    if (row) {
        row.classList.add('selected');
        button.classList.add('selected');
        button.innerHTML = '<span>✓</span> 選択中';

        // 選択した情報を統合画面のフォームに反映
        applyHistoryToIntegratedForm(row);

        // 統合画面に戻る
        setTimeout(() => {
            handleBackFromHistoryList();
        }, 300);
    }
}

/**
 * 履歴データを統合画面のフォームに反映
 * @param {HTMLElement} row - 選択された行要素
 */
function applyHistoryToIntegratedForm(row) {
    const data = extractCellData(row);

    // サイズを分解（例: "450×380×120" → W=450, D=380, H=120）
    const sizeMatch = data.サイズ.match(/(\d+)×(\d+)×(\d+)/);

    // 統合画面のフォームに値を設定
    const choicesMap = {
        integratedLargeClassChoice: data.大分類,
        integratedMediumClassChoice: data.中分類,
        integratedItemChoice: data.品目,
        integratedMakerChoice: data.メーカー,
        integratedModelChoice: data.型式
    };

    Object.entries(choicesMap).forEach(([choiceName, value]) => {
        const choice = window[choiceName];
        if (choice) {
            choice.setChoiceByValue(value);
        }
    });

    // サイズ情報を入力
    if (sizeMatch) {
        const inputs = {
            integratedWidth: sizeMatch[1],
            integratedDepth: sizeMatch[2],
            integratedHeight: sizeMatch[3]
        };

        Object.entries(inputs).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) input.value = value;
        });
    }
}

/**
 * 履歴テーブル行の編集処理
 * @param {HTMLElement} button - クリックされた編集ボタン要素
 */
async function editHistoryRow(button) {
    const row = button.closest('.history-row');
    if (!row || row.classList.contains('editing')) return;

    // 既に編集中の行があればキャンセル
    document.querySelectorAll('.history-row.editing').forEach(r => cancelEditHistoryRow(r));

    const cells = row.querySelectorAll('td');
    const data = extractCellData(row);

    // 元のデータを保存
    row.dataset.originalData = JSON.stringify(data);

    // 編集モードに設定
    row.classList.add('editing');

    // 各セルを編集可能にする
    const fields = ['大分類', '中分類', '品目', 'メーカー', '型式'];
    fields.forEach((field, index) => {
        cells[index].innerHTML = `<select class="history-edit-select" data-field="${field}"><option value="">${data[field]}</option></select>`;
    });

    // サイズは入力フィールド
    cells[CELL_INDEX.SIZE].innerHTML = `<input type="text" class="history-edit-input" value="${data.サイズ}" placeholder="W×D×H">`;

    // Choices.jsを初期化
    await initializeEditChoices(row);

    // 操作ボタンを変更
    cells[CELL_INDEX.ACTION].innerHTML = `
        <div class="history-action-buttons">
            <button class="history-save-button" onclick="saveEditHistoryRow(this)">
                保存
            </button>
            <button class="history-cancel-button" onclick="cancelEditHistoryRowBtn(this)">
                キャンセル
            </button>
        </div>
    `;
}

/**
 * 編集モードのChoices.jsを初期化
 * @param {HTMLElement} row - 行要素
 */
async function initializeEditChoices(row) {
    const masterData = await loadMasterDataFromStorage();
    const selects = row.querySelectorAll('.history-edit-select');

    selects.forEach(select => {
        const field = select.dataset.field;
        const choices = new Choices(select, {
            searchEnabled: true,
            searchPlaceholderValue: '検索...',
            noResultsText: '該当なし',
            itemSelectText: '選択',
            shouldSort: false
        });

        const masterKey = FIELD_MASTER_MAP[field];
        const options = masterData[masterKey] || [];

        if (options.length > 0) {
            choices.setChoices(options, 'value', 'label', true);
        }

        // Choices.jsインスタンスを要素に保存
        select._choices = choices;
    });
}

/**
 * 編集モードのChoices.jsインスタンスを破棄
 * @param {HTMLElement} row - 行要素
 */
function destroyEditChoices(row) {
    row.querySelectorAll('.history-edit-select').forEach(select => {
        if (select._choices) {
            select._choices.destroy();
        }
    });
}

/**
 * セルの内容を復元
 * @param {NodeList} cells - セル要素のリスト
 * @param {Object} data - 復元するデータ
 */
function restoreCellContents(cells, data) {
    cells[CELL_INDEX.LARGE_CLASS].innerHTML = data.大分類;
    cells[CELL_INDEX.MEDIUM_CLASS].innerHTML = data.中分類;
    cells[CELL_INDEX.ITEM].innerHTML = data.品目;
    cells[CELL_INDEX.MANUFACTURER].innerHTML = data.メーカー;
    cells[CELL_INDEX.MODEL].innerHTML = data.型式;
    cells[CELL_INDEX.SIZE].innerHTML = data.サイズ;

    restoreCellLabels(cells);
    cells[CELL_INDEX.ACTION].innerHTML = generateActionButtonsHTML();
}

/**
 * 履歴編集を保存
 * @param {HTMLElement} button - 保存ボタン要素
 */
function saveEditHistoryRow(button) {
    const row = button.closest('.history-row');
    if (!row) return;

    const cells = row.querySelectorAll('td');
    const selects = row.querySelectorAll('.history-edit-select');
    const sizeInput = row.querySelector('.history-edit-input');

    const newData = {
        大分類: selects[0]._choices.getValue(true) || cells[CELL_INDEX.LARGE_CLASS].querySelector('option').textContent,
        中分類: selects[1]._choices.getValue(true) || cells[CELL_INDEX.MEDIUM_CLASS].querySelector('option').textContent,
        品目: selects[2]._choices.getValue(true) || cells[CELL_INDEX.ITEM].querySelector('option').textContent,
        メーカー: selects[3]._choices.getValue(true) || cells[CELL_INDEX.MANUFACTURER].querySelector('option').textContent,
        型式: selects[4]._choices.getValue(true) || cells[CELL_INDEX.MODEL].querySelector('option').textContent,
        サイズ: sizeInput.value
    };

    destroyEditChoices(row);
    restoreCellContents(cells, newData);

    // 編集モードを解除
    row.classList.remove('editing');
    delete row.dataset.originalData;
}

/**
 * 履歴編集をキャンセル（ボタン経由）
 * @param {HTMLElement} button - キャンセルボタン要素
 */
function cancelEditHistoryRowBtn(button) {
    const row = button.closest('.history-row');
    cancelEditHistoryRow(row);
}

/**
 * 履歴編集をキャンセル
 * @param {HTMLElement} row - 行要素
 */
function cancelEditHistoryRow(row) {
    if (!row || !row.dataset.originalData) return;

    const originalData = JSON.parse(row.dataset.originalData);
    const cells = row.querySelectorAll('td');

    destroyEditChoices(row);
    restoreCellContents(cells, originalData);

    // 編集モードを解除
    row.classList.remove('editing');
    delete row.dataset.originalData;
}

/**
 * 写真撮影画面のトグルスイッチの切り替え
 * @param {HTMLElement} element - トグルスイッチ要素
 */
function togglePhotoInputSwitch(element) {
    element.classList.toggle('active');
    const label = element.nextElementSibling;
    if (label) {
        label.textContent = element.classList.contains('active') ? 'オン' : 'オフ';
    }
}

// ========================================
// 履歴カード関連の関数（カード形式UI用）
// ========================================

// 現在選択中のカード要素
let selectedHistoryCard = null;
// 現在編集中のカード要素
let editingHistoryCard = null;

/**
 * 履歴カードの選択処理
 * @param {HTMLElement} card - クリックされたカード要素
 */
function selectHistoryCard(card) {
    // 編集中は選択を変更しない
    if (editingHistoryCard) return;

    // 既存の選択を解除
    document.querySelectorAll('.history-card.selected').forEach(c => {
        c.classList.remove('selected');
    });

    // 新しいカードを選択
    card.classList.add('selected');
    selectedHistoryCard = card;
}

/**
 * 履歴カードの修正ボタン処理
 */
function handleHistoryEdit() {
    if (!selectedHistoryCard) {
        alert('カードを選択してください');
        return;
    }

    // 既に編集中なら保存処理
    if (editingHistoryCard) {
        saveHistoryCardEdit();
        return;
    }

    // 編集モードを開始
    startHistoryCardEdit(selectedHistoryCard);
}

/**
 * 履歴カードの編集モード開始
 * @param {HTMLElement} card - 編集対象のカード
 */
function startHistoryCardEdit(card) {
    editingHistoryCard = card;
    card.classList.add('editing');
    card.classList.remove('selected');

    // 元のデータを保存
    const originalData = {};
    card.querySelectorAll('.history-card-value').forEach(span => {
        const field = span.dataset.field;
        originalData[field] = span.textContent;
    });
    card.dataset.originalData = JSON.stringify(originalData);

    // 値表示をinputに切り替え
    card.querySelectorAll('.history-card-field').forEach(field => {
        const span = field.querySelector('.history-card-value');
        const input = field.querySelector('.history-card-input');
        if (span && input) {
            input.value = span.textContent;
            span.style.display = 'none';
            input.style.display = 'block';
        }
    });

    // フッターボタンを編集モードに変更
    updateHistoryFooterForEdit(true);
}

/**
 * 履歴カードの編集を保存
 */
function saveHistoryCardEdit() {
    if (!editingHistoryCard) return;

    // inputの値をspanに反映
    editingHistoryCard.querySelectorAll('.history-card-field').forEach(field => {
        const span = field.querySelector('.history-card-value');
        const input = field.querySelector('.history-card-input');
        if (span && input) {
            span.textContent = input.value;
            span.style.display = 'block';
            input.style.display = 'none';
        }
    });

    // 編集モードを終了
    editingHistoryCard.classList.remove('editing');
    editingHistoryCard = null;
    selectedHistoryCard = null;

    // フッターボタンを通常モードに戻す
    updateHistoryFooterForEdit(false);

    alert('変更を保存しました');
}

/**
 * 履歴カードの編集をキャンセル
 */
function cancelHistoryCardEdit() {
    if (!editingHistoryCard) return;

    // 元のデータを復元
    const originalData = JSON.parse(editingHistoryCard.dataset.originalData || '{}');
    editingHistoryCard.querySelectorAll('.history-card-field').forEach(field => {
        const span = field.querySelector('.history-card-value');
        const input = field.querySelector('.history-card-input');
        if (span && input) {
            const fieldName = span.dataset.field;
            if (originalData[fieldName]) {
                span.textContent = originalData[fieldName];
            }
            span.style.display = 'block';
            input.style.display = 'none';
        }
    });

    // 編集モードを終了
    editingHistoryCard.classList.remove('editing');
    editingHistoryCard = null;
    selectedHistoryCard = null;

    // フッターボタンを通常モードに戻す
    updateHistoryFooterForEdit(false);
}

/**
 * フッターボタンを編集モード用に更新
 * @param {boolean} isEditMode - 編集モードかどうか
 */
function updateHistoryFooterForEdit(isEditMode) {
    const editBtn = document.getElementById('historyEditBtn');
    const reuseBtn = document.getElementById('historyReuseBtn');

    if (isEditMode) {
        // 修正ボタン → 保存ボタン
        if (editBtn) {
            editBtn.classList.remove('edit');
            editBtn.classList.add('save');
            editBtn.querySelector('.history-icon-circle').innerHTML = '<span style="font-size: 18px;">✓</span>';
            editBtn.querySelector('.history-button-text').textContent = '保存';
            editBtn.onclick = saveHistoryCardEdit;
        }
        // 再利用ボタン → キャンセルボタン
        if (reuseBtn) {
            reuseBtn.classList.remove('reuse');
            reuseBtn.classList.add('cancel');
            reuseBtn.querySelector('.history-icon-circle').innerHTML = '<span style="font-size: 18px;">✕</span>';
            reuseBtn.querySelector('.history-button-text').textContent = 'キャンセル';
            reuseBtn.onclick = cancelHistoryCardEdit;
        }
    } else {
        // 保存ボタン → 修正ボタン
        if (editBtn) {
            editBtn.classList.remove('save');
            editBtn.classList.add('edit');
            editBtn.querySelector('.history-icon-circle').innerHTML = '<span style="font-size: 18px;">✏️</span>';
            editBtn.querySelector('.history-button-text').textContent = '修正';
            editBtn.onclick = handleHistoryEdit;
        }
        // キャンセルボタン → 再利用ボタン
        if (reuseBtn) {
            reuseBtn.classList.remove('cancel');
            reuseBtn.classList.add('reuse');
            reuseBtn.querySelector('.history-icon-circle').innerHTML = '<span style="font-size: 18px;">↩️</span>';
            reuseBtn.querySelector('.history-button-text').textContent = '再利用';
            reuseBtn.onclick = handleHistoryReuse;
        }
    }
}

/**
 * 履歴カードの再利用ボタン処理
 */
function handleHistoryReuse() {
    if (!selectedHistoryCard) {
        alert('カードを選択してください');
        return;
    }

    // カードからデータを取得
    const data = {};
    selectedHistoryCard.querySelectorAll('.history-card-value').forEach(span => {
        const field = span.dataset.field;
        data[field] = span.textContent;
    });

    // サイズを分解（例: "450×380×120" → W=450, D=380, H=120）
    const sizeMatch = data.size ? data.size.match(/(\d+)×(\d+)×(\d+)/) : null;

    // 統合画面のフォームに値を設定
    const choicesMap = {
        integratedLargeClassChoice: data.largeClass,
        integratedMediumClassChoice: data.mediumClass,
        integratedItemChoice: data.item,
        integratedMakerChoice: data.maker,
        integratedModelChoice: data.model
    };

    Object.entries(choicesMap).forEach(([choiceName, value]) => {
        const choice = window[choiceName];
        if (choice && value) {
            choice.setChoiceByValue(value);
        }
    });

    // サイズ情報を入力
    if (sizeMatch) {
        const inputs = {
            integratedWidth: sizeMatch[1],
            integratedDepth: sizeMatch[2],
            integratedHeight: sizeMatch[3]
        };

        Object.entries(inputs).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) input.value = value;
        });
    }

    // 選択解除
    selectedHistoryCard.classList.remove('selected');
    selectedHistoryCard = null;

    // 統合画面に戻る
    handleBackFromHistoryList();
}

// グローバルスコープに関数を公開
window.loadSurveyMasterData = loadSurveyMasterData;
window.selectHistoryRow = selectHistoryRow;
window.applyHistoryToIntegratedForm = applyHistoryToIntegratedForm;
window.editHistoryRow = editHistoryRow;
window.saveEditHistoryRow = saveEditHistoryRow;
window.cancelEditHistoryRowBtn = cancelEditHistoryRowBtn;
window.cancelEditHistoryRow = cancelEditHistoryRow;
window.togglePhotoInputSwitch = togglePhotoInputSwitch;

// カード形式の履歴機能
window.selectHistoryCard = selectHistoryCard;
window.handleHistoryEdit = handleHistoryEdit;
window.handleHistoryReuse = handleHistoryReuse;
window.saveHistoryCardEdit = saveHistoryCardEdit;
window.cancelHistoryCardEdit = cancelHistoryCardEdit;
