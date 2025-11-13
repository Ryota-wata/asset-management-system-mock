/**
 * 資産調査機能
 * 現有資産調査に関する機能を提供します。
 */

/**
 * 現有資産調査画面にマスタデータをロード
 */
function loadSurveyMasterData() {
    const masterData = loadMasterDataFromStorage();

    // Choices.jsインスタンスが初期化されているか確認
    if (window.surveyCategoryChoice) {
        window.surveyCategoryChoice.clearStore();
        window.surveyCategoryChoice.setChoices(masterData.categories, 'value', 'label', true);
    }

    if (window.surveyBuildingChoice) {
        window.surveyBuildingChoice.clearStore();
        window.surveyBuildingChoice.setChoices(masterData.buildings, 'value', 'label', true);
    }

    if (window.surveyFloorChoice) {
        window.surveyFloorChoice.clearStore();
        window.surveyFloorChoice.setChoices(masterData.floors, 'value', 'label', true);
    }

    if (window.surveyDepartmentChoice) {
        window.surveyDepartmentChoice.clearStore();
        window.surveyDepartmentChoice.setChoices(masterData.departments, 'value', 'label', true);
    }

    if (window.surveySectionChoice) {
        window.surveySectionChoice.clearStore();
        window.surveySectionChoice.setChoices(masterData.sections, 'value', 'label', true);
    }
}

/**
 * 履歴カードの選択処理
 * @param {HTMLElement} card - クリックされたカード要素
 */
function selectHistoryCard(card) {
    // 全てのカードから選択状態を解除
    const parentPage = card.closest('.history-list-smartphone-page, .history-list-tablet-page');
    if (parentPage) {
        parentPage.querySelectorAll('.history-card-hl, .history-card-hlt').forEach(c => {
            c.classList.remove('selected');
        });
    }

    // クリックされたカードを選択状態にする
    card.classList.add('selected');
}

/**
 * 履歴テーブル行の選択処理
 * @param {HTMLElement} button - クリックされたボタン要素
 */
function selectHistoryRow(button) {
    // 全ての行とボタンから選択状態を解除
    const table = button.closest('.history-table');
    if (table) {
        table.querySelectorAll('.history-row').forEach(row => {
            row.classList.remove('selected');
        });
        table.querySelectorAll('.history-use-button').forEach(btn => {
            btn.classList.remove('selected');
            btn.innerHTML = 'この情報を使用';
        });
    }

    // クリックされた行とボタンを選択状態にする
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
    const cells = row.querySelectorAll('td');
    const data = {
        大分類: cells[0].textContent,
        中分類: cells[1].textContent,
        品目: cells[2].textContent,
        メーカー: cells[3].textContent,
        型式: cells[4].textContent,
        サイズ: cells[5].textContent
    };

    // サイズを分解（例: "450×380×120" → W=450, D=380, H=120）
    const sizeMatch = data.サイズ.match(/(\d+)×(\d+)×(\d+)/);

    // 統合画面のフォームに値を設定
    if (window.integratedLargeClassChoice) {
        window.integratedLargeClassChoice.setChoiceByValue(data.大分類);
    }
    if (window.integratedMediumClassChoice) {
        window.integratedMediumClassChoice.setChoiceByValue(data.中分類);
    }
    if (window.integratedItemChoice) {
        window.integratedItemChoice.setChoiceByValue(data.品目);
    }
    if (window.integratedMakerChoice) {
        window.integratedMakerChoice.setChoiceByValue(data.メーカー);
    }
    if (window.integratedModelChoice) {
        window.integratedModelChoice.setChoiceByValue(data.型式);
    }

    // サイズ情報を入力
    if (sizeMatch) {
        const widthInput = document.getElementById('integratedWidth');
        const depthInput = document.getElementById('integratedDepth');
        const heightInput = document.getElementById('integratedHeight');

        if (widthInput) widthInput.value = sizeMatch[1];
        if (depthInput) depthInput.value = sizeMatch[2];
        if (heightInput) heightInput.value = sizeMatch[3];
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
    const editingRows = document.querySelectorAll('.history-row.editing');
    editingRows.forEach(r => cancelEditHistoryRow(r));

    const cells = row.querySelectorAll('td');

    // 元のデータを保存
    row.dataset.originalData = JSON.stringify({
        大分類: cells[0].textContent,
        中分類: cells[1].textContent,
        品目: cells[2].textContent,
        メーカー: cells[3].textContent,
        型式: cells[4].textContent,
        サイズ: cells[5].textContent
    });

    // 編集モードに設定
    row.classList.add('editing');

    // 各セルを編集可能にする
    // 大分類
    cells[0].innerHTML = `<select class="history-edit-select" data-field="大分類"><option value="">${cells[0].textContent}</option></select>`;
    // 中分類
    cells[1].innerHTML = `<select class="history-edit-select" data-field="中分類"><option value="">${cells[1].textContent}</option></select>`;
    // 品目
    cells[2].innerHTML = `<select class="history-edit-select" data-field="品目"><option value="">${cells[2].textContent}</option></select>`;
    // メーカー
    cells[3].innerHTML = `<select class="history-edit-select" data-field="メーカー"><option value="">${cells[3].textContent}</option></select>`;
    // 型式
    cells[4].innerHTML = `<select class="history-edit-select" data-field="型式"><option value="">${cells[4].textContent}</option></select>`;
    // サイズ
    cells[5].innerHTML = `<input type="text" class="history-edit-input" value="${cells[5].textContent}" placeholder="W×D×H">`;

    // Choices.jsを初期化
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

        // マスタデータをロード
        const masterData = loadMasterDataFromStorage();
        let options = [];

        if (field === '大分類') {
            options = masterData.largeClasses || [];
        } else if (field === '中分類') {
            options = masterData.mediumClasses || [];
        } else if (field === '品目') {
            options = masterData.items || [];
        } else if (field === 'メーカー') {
            options = masterData.manufacturers || [];
        } else if (field === '型式') {
            options = masterData.models || [];
        }

        if (options.length > 0) {
            choices.setChoices(options, 'value', 'label', true);
        }

        // Choices.jsインスタンスを要素に保存
        select._choices = choices;
    });

    // 操作ボタンを変更
    cells[6].innerHTML = `
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
 * 履歴編集を保存
 * @param {HTMLElement} button - 保存ボタン要素
 */
function saveEditHistoryRow(button) {
    const row = button.closest('.history-row');
    if (!row) return;

    const cells = row.querySelectorAll('td');

    // 編集された値を取得
    const selects = row.querySelectorAll('.history-edit-select');
    const sizeInput = row.querySelector('.history-edit-input');

    const newData = {
        大分類: selects[0]._choices.getValue(true) || cells[0].querySelector('option').textContent,
        中分類: selects[1]._choices.getValue(true) || cells[1].querySelector('option').textContent,
        品目: selects[2]._choices.getValue(true) || cells[2].querySelector('option').textContent,
        メーカー: selects[3]._choices.getValue(true) || cells[3].querySelector('option').textContent,
        型式: selects[4]._choices.getValue(true) || cells[4].querySelector('option').textContent,
        サイズ: sizeInput.value
    };

    // Choices.jsインスタンスを破棄
    selects.forEach(select => {
        if (select._choices) {
            select._choices.destroy();
        }
    });

    // セルを通常表示に戻す
    cells[0].innerHTML = newData.大分類;
    cells[1].innerHTML = newData.中分類;
    cells[2].innerHTML = newData.品目;
    cells[3].innerHTML = newData.メーカー;
    cells[4].innerHTML = newData.型式;
    cells[5].innerHTML = newData.サイズ;

    // data-label属性を復元
    cells[0].setAttribute('data-label', '大分類');
    cells[1].setAttribute('data-label', '中分類');
    cells[2].setAttribute('data-label', '品目');
    cells[3].setAttribute('data-label', 'メーカー');
    cells[4].setAttribute('data-label', '型式');
    cells[5].setAttribute('data-label', 'サイズ');

    // 操作ボタンを元に戻す
    cells[6].innerHTML = `
        <div class="history-action-buttons">
            <button class="history-use-button" onclick="selectHistoryRow(this)">
                この情報を使用
            </button>
            <button class="history-edit-button" onclick="editHistoryRow(this)">
                編集
            </button>
        </div>
    `;

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

    // Choices.jsインスタンスを破棄
    const selects = row.querySelectorAll('.history-edit-select');
    selects.forEach(select => {
        if (select._choices) {
            select._choices.destroy();
        }
    });

    // 元のデータに戻す
    cells[0].innerHTML = originalData.大分類;
    cells[1].innerHTML = originalData.中分類;
    cells[2].innerHTML = originalData.品目;
    cells[3].innerHTML = originalData.メーカー;
    cells[4].innerHTML = originalData.型式;
    cells[5].innerHTML = originalData.サイズ;

    // data-label属性を復元
    cells[0].setAttribute('data-label', '大分類');
    cells[1].setAttribute('data-label', '中分類');
    cells[2].setAttribute('data-label', '品目');
    cells[3].setAttribute('data-label', 'メーカー');
    cells[4].setAttribute('data-label', '型式');
    cells[5].setAttribute('data-label', 'サイズ');

    // 操作ボタンを元に戻す
    cells[6].innerHTML = `
        <div class="history-action-buttons">
            <button class="history-use-button" onclick="selectHistoryRow(this)">
                この情報を使用
            </button>
            <button class="history-edit-button" onclick="editHistoryRow(this)">
                編集
            </button>
        </div>
    `;

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
    if (element.classList.contains('active')) {
        label.textContent = 'オン';
    } else {
        label.textContent = 'オフ';
    }
}

// グローバルスコープに関数を公開
window.loadSurveyMasterData = loadSurveyMasterData;
window.selectHistoryCard = selectHistoryCard;
window.selectHistoryRow = selectHistoryRow;
window.applyHistoryToIntegratedForm = applyHistoryToIntegratedForm;
window.editHistoryRow = editHistoryRow;
window.saveEditHistoryRow = saveEditHistoryRow;
window.cancelEditHistoryRowBtn = cancelEditHistoryRowBtn;
window.cancelEditHistoryRow = cancelEditHistoryRow;
window.togglePhotoInputSwitch = togglePhotoInputSwitch;
