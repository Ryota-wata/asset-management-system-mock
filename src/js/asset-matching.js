/**
 * 資産管理台帳と資産マスタ突き合わせ画面のJavaScript
 */

// Choices.jsインスタンスを管理（グローバルスコープ汚染を避ける）
const matchingChoicesInstances = {};

/**
 * 全選択切り替え（共通ヘルパー使用）
 */
function toggleSelectAll(checkbox) {
    if (window.TableHelper) {
        window.TableHelper.toggleSelectAll(checkbox, '.row-checkbox:not(:disabled)');
    }
}

/**
 * AI推薦を選択
 */
function selectAIRecommendation(index, recNumber) {
    const row = document.querySelector(`.data-row-flat[data-index="${index}"]`);

    // 該当行のすべてのラジオボタンを取得
    const radios = row.querySelectorAll('.ai-select-radio');

    // 選択されたラジオボタンのデータを取得
    const selectedRadio = row.querySelector(`.ai-select-radio[value="rec${recNumber}"]`);

    if (selectedRadio && selectedRadio.checked) {
        console.log(`Row ${index}: AI推薦${recNumber}が選択されました`);

        // 選択されたAI推薦のデータを固定資産台帳の該当セルに反映
        // (実際の実装では、確定時に選択されたAI推薦を使用)
    }
}

/**
 * 編集モード切り替え（Choices.js対応）
 */
async function toggleEditMode(index) {
    const row = document.querySelector(`.data-row-flat[data-index="${index}"]`);
    if (!row) {
        console.error(`Row with index ${index} not found`);
        return;
    }

    const editBtn = row.querySelector('.edit-btn-flat');
    const isEditing = row.classList.contains('editing');

    // 編集可能なフィールド（固定資産台帳の大分類、中分類、個体管理品目のみ）
    const editableFields = ['majorCategory', 'middleCategory', 'itemManagement'];

    if (isEditing) {
        // 編集モード終了：selectをspanに戻す & Choices.jsインスタンスを破棄
        row.querySelectorAll('.td-data-matching').forEach(td => {
            const choicesContainer = td.querySelector('.choices');
            if (choicesContainer) {
                const select = choicesContainer.querySelector('select.cell-select-flat');
                if (select) {
                    const field = select.getAttribute('data-field');

                    // Choices.jsインスタンスを破棄
                    const instanceKey = `${index}-${field}`;
                    if (matchingChoicesInstances[instanceKey]) {
                        matchingChoicesInstances[instanceKey].destroy();
                        delete matchingChoicesInstances[instanceKey];
                    }

                    const span = document.createElement('span');
                    span.className = 'cell-value';
                    span.textContent = select.value || '';
                    span.setAttribute('data-field', field);
                    td.innerHTML = '';
                    td.appendChild(span);
                }
            }
        });

        row.classList.remove('editing');
        editBtn.textContent = '編集';
        editBtn.classList.remove('editing');
    } else {
        // 資産マスタをロード（既存のグローバル関数を使用）
        if (typeof window.loadAssetMaster !== 'function') {
            alert('資産マスタの読み込み関数が見つかりません');
            return;
        }

        const masterData = await window.loadAssetMaster();
        if (!masterData) {
            alert('資産マスタの読み込みに失敗しました');
            return;
        }

        console.log('Asset master loaded for editing:', masterData);

        // 編集モード開始：編集可能なフィールドのみspanをselectに変換
        row.querySelectorAll('.td-data-matching').forEach(td => {
            const span = td.querySelector('.cell-value');
            if (span) {
                const field = span.getAttribute('data-field');

                // 編集可能なフィールドのみselectに変換
                if (editableFields.includes(field)) {
                    const currentValue = span.textContent.trim();

                    // フィールドに応じた選択肢を作成
                    let choices = [];
                    if (field === 'majorCategory') {
                        choices = masterData.largeClasses.map(item => ({
                            value: item.name,
                            label: item.name
                        }));
                    } else if (field === 'middleCategory') {
                        choices = masterData.mediumClasses.map(item => ({
                            value: item.name,
                            label: item.name
                        }));
                    } else if (field === 'itemManagement') {
                        choices = masterData.items.map(item => ({
                            value: item.name,
                            label: item.name
                        }));
                    }

                    const select = document.createElement('select');
                    select.className = 'cell-select-flat';
                    select.setAttribute('data-field', field);

                    // optionを直接HTMLに追加（Choices.js初期化前）
                    select.innerHTML = '<option value="">選択してください</option>';
                    choices.forEach(choice => {
                        const option = document.createElement('option');
                        option.value = choice.value;
                        option.textContent = choice.label;
                        if (choice.value === currentValue) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });

                    td.innerHTML = '';
                    td.appendChild(select);

                    // Choices.jsを適用（共通ヘルパー使用）
                    const instanceKey = `${index}-${field}`;
                    try {
                        // フィールドごとの設定
                        let customOptions = {
                            searchPlaceholderValue: '検索...',
                            noResultsText: '該当なし'
                        };

                        if (field === 'majorCategory') {
                            customOptions.searchPlaceholderValue = '大分類を検索...';
                            customOptions.noResultsText = '該当する大分類が見つかりません';
                        } else if (field === 'middleCategory') {
                            customOptions.searchPlaceholderValue = '中分類を検索...';
                            customOptions.noResultsText = '該当する中分類が見つかりません';
                        } else if (field === 'itemManagement') {
                            customOptions.searchPlaceholderValue = '品目を検索...';
                            customOptions.noResultsText = '該当する品目が見つかりません';
                        }

                        // 共通ヘルパーを使用してChoices.jsを初期化
                        const choicesInstance = window.ChoicesHelper.initChoicesForTableEdit(
                            select,
                            customOptions,
                            { zIndex: 10000 }
                        );

                        matchingChoicesInstances[instanceKey] = choicesInstance;
                    } catch (error) {
                        console.error(`Failed to initialize Choices.js for ${field}:`, error);
                    }
                }
            }
        });

        row.classList.add('editing');
        editBtn.textContent = '保存';
        editBtn.classList.add('editing');

        // 最初のフィールド（大分類）にフォーカスしてドロップダウンを開く
        setTimeout(() => {
            const firstInstanceKey = `${index}-majorCategory`;
            const firstInstance = matchingChoicesInstances[firstInstanceKey];
            if (firstInstance) {
                firstInstance.showDropdown();
            }
        }, 600); // スタイル適用後に実行
    }
}

/**
 * 行を確定
 */
function confirmRowFlat(index) {
    const row = document.querySelector(`.data-row-flat[data-index="${index}"]`);
    if (!row) {
        console.error(`Row with index ${index} not found`);
        return;
    }

    // 編集モードの場合は保存
    if (row.classList.contains('editing')) {
        toggleEditMode(index);
    }

    // 行を確定状態に変更
    row.setAttribute('data-status', 'completed');
    row.style.backgroundColor = '#e8f5e9';

    // チェックボックスを無効化
    const checkbox = row.querySelector('.row-checkbox');
    if (checkbox) {
        checkbox.disabled = true;
        checkbox.checked = false;
    }

    // 編集ボタンを無効化
    const editBtn = row.querySelector('.edit-btn-flat');
    if (editBtn) {
        editBtn.disabled = true;
    }

    // 確定ボタンを無効化
    const confirmBtn = row.querySelector('.confirm-btn-flat');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = '確定済';
    }

    // カウントを更新
    updateMatchingCounts();

    console.log(`Row ${index} confirmed`);
}

/**
 * 選択項目を一括確定
 */
function bulkConfirmSelected() {
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked:not(:disabled)');
    if (checkedBoxes.length === 0) {
        alert('確定する行を選択してください');
        return;
    }

    if (!confirm(`${checkedBoxes.length}件を一括確定しますか？`)) {
        return;
    }

    checkedBoxes.forEach(checkbox => {
        const row = checkbox.closest('.data-row-flat');
        const index = parseInt(row.getAttribute('data-index'));
        confirmRowFlat(index);
    });
}

/**
 * 進捗カウントを更新
 */
function updateMatchingCounts() {
    const allRows = document.querySelectorAll('.data-row-flat');
    const completedRows = document.querySelectorAll('.data-row-flat[data-status="completed"]');

    const progressCount = document.getElementById('progressCount');
    const completedCount = document.getElementById('completedCount');

    if (progressCount) {
        progressCount.textContent = `${completedRows.length} / ${allRows.length}`;
    }
    if (completedCount) {
        completedCount.textContent = `${completedRows.length}件`;
    }

    // フィルターボタンのカウントも更新
    updateFilterCounts();
}

/**
 * フィルターボタンのカウントを更新（共通ヘルパー使用）
 */
function updateFilterCounts() {
    if (window.TableHelper) {
        window.TableHelper.updateFilterCounts([
            { buttonSelector: '[data-filter="all"] .filter-count-matching', rowSelector: '.data-row-flat', statusValue: null },
            { buttonSelector: '[data-filter="pending"] .filter-count-matching', rowSelector: '.data-row-flat', statusValue: 'pending' },
            { buttonSelector: '[data-filter="completed"] .filter-count-matching', rowSelector: '.data-row-flat', statusValue: 'completed' }
        ]);
    }
}

/**
 * データをフィルタリング（共通ヘルパー使用）
 */
function filterMatchingData(filterType) {
    if (window.TableHelper) {
        window.TableHelper.filterRows('.data-row-flat', filterType, 'data-status', '.filter-btn-matching');
    }
}

/**
 * 検索機能（共通ヘルパー使用）
 */
function searchImportData(query) {
    if (window.TableHelper) {
        window.TableHelper.searchRows('.data-row-flat', query, '.cell-value');
    }
}

/**
 * 資産マスタを別ウィンドウで開く
 */
function openAssetMasterWindow() {
    // 資産マスタ画面を新しいウィンドウで開く
    window.open('asset-master.html', 'AssetMaster', 'width=1200,height=800');
}

/**
 * 突き合わせ完了
 */
function completeMatching() {
    const pendingRows = document.querySelectorAll('.data-row-flat[data-status="pending"]');

    if (pendingRows.length > 0) {
        if (!confirm(`未処理の項目が${pendingRows.length}件あります。完了してよろしいですか？`)) {
            return;
        }
    }

    alert('突き合わせが完了しました');
    // 実際の実装では次の画面に遷移
}

/**
 * 前のページへ
 */
function goToPreviousPage() {
    console.log('前のページへ');
    // ページネーション処理
}

/**
 * 次のページへ
 */
function goToNextPage() {
    console.log('次のページへ');
    // ページネーション処理
}

/**
 * 戻るボタン（navigation.jsの関数を使用）
 * この関数は削除してnavigation.jsの関数を使用
 */

// グローバルに公開
window.toggleSelectAll = toggleSelectAll;
window.selectAIRecommendation = selectAIRecommendation;
window.toggleEditMode = toggleEditMode;
window.confirmRowFlat = confirmRowFlat;
window.bulkConfirmSelected = bulkConfirmSelected;
window.updateMatchingCounts = updateMatchingCounts;
window.updateFilterCounts = updateFilterCounts;
window.filterMatchingData = filterMatchingData;
window.searchImportData = searchImportData;
window.openAssetMasterWindow = openAssetMasterWindow;
window.completeMatching = completeMatching;
window.goToPreviousPage = goToPreviousPage;
window.goToNextPage = goToNextPage;
// handleBackFromMatchingはnavigation.jsで定義
