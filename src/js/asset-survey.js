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
function loadSurveyMasterData() {
    const masterData = loadMasterDataFromStorage();
    const choicesMap = {
        surveyCategoryChoice: 'categories',
        surveyBuildingChoice: 'buildings',
        surveyFloorChoice: 'floors',
        surveyDepartmentChoice: 'departments',
        surveySectionChoice: 'sections'
    };

    Object.entries(choicesMap).forEach(([choiceName, dataKey]) => {
        const choice = window[choiceName];
        if (choice) {
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
function editHistoryRow(button) {
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
    initializeEditChoices(row);

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
function initializeEditChoices(row) {
    const masterData = loadMasterDataFromStorage();
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

// グローバルスコープに関数を公開
window.loadSurveyMasterData = loadSurveyMasterData;
window.selectHistoryRow = selectHistoryRow;
window.applyHistoryToIntegratedForm = applyHistoryToIntegratedForm;
window.editHistoryRow = editHistoryRow;
window.saveEditHistoryRow = saveEditHistoryRow;
window.cancelEditHistoryRowBtn = cancelEditHistoryRowBtn;
window.cancelEditHistoryRow = cancelEditHistoryRow;
window.togglePhotoInputSwitch = togglePhotoInputSwitch;
