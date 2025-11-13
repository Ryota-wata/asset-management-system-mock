/**
 * 資産管理台帳と資産マスタ突き合わせ画面のJavaScript
 */

/**
 * 全選択切り替え
 */
function toggleSelectAll(checkbox) {
    const checkboxes = document.querySelectorAll('.row-checkbox:not(:disabled)');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
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
 * 編集モード切り替え（修正版）
 */
function toggleEditMode(index) {
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
        // 編集モード終了：inputをspanに戻す
        row.querySelectorAll('.td-data-matching').forEach(td => {
            const input = td.querySelector('.cell-input-flat');
            if (input) {
                const span = document.createElement('span');
                span.className = 'cell-value';
                span.textContent = input.value;
                span.setAttribute('data-field', input.getAttribute('data-field'));
                td.replaceChild(span, input);
            }
        });

        row.classList.remove('editing');
        editBtn.textContent = '編集';
        editBtn.classList.remove('editing');
    } else {
        // 編集モード開始：編集可能なフィールドのみspanをinputに変換
        row.querySelectorAll('.td-data-matching').forEach(td => {
            const span = td.querySelector('.cell-value');
            if (span) {
                const field = span.getAttribute('data-field');

                // 編集可能なフィールドのみinputに変換
                if (editableFields.includes(field)) {
                    const currentValue = span.textContent;

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'cell-input-flat';
                    input.value = currentValue;
                    input.setAttribute('data-field', field);

                    td.replaceChild(input, span);
                }
            }
        });

        row.classList.add('editing');
        editBtn.textContent = '保存';
        editBtn.classList.add('editing');

        // 最初の編集可能フィールドにフォーカス
        const firstInput = row.querySelector('.cell-input-flat');
        if (firstInput) {
            firstInput.focus();
        }
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

    // 選択されたAI推薦を取得
    const selectedRadio = row.querySelector('.ai-select-radio:checked');
    if (selectedRadio) {
        const recNumber = selectedRadio.value.replace('rec', '');
        console.log(`Row ${index}: AI推薦${recNumber}で確定しました`);

        // 選択されたAI推薦のデータを固定資産台帳エリアに反映
        // (実装時にサーバーに送信するロジックを追加)
    }

    // 確定済みマークを追加
    row.setAttribute('data-status', 'completed');

    // ボタンを無効化
    const editBtn = row.querySelector('.edit-btn-flat');
    const confirmBtn = row.querySelector('.confirm-btn-flat');
    if (editBtn) {
        editBtn.disabled = true;
    }
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = '確定済';
    }

    // ラジオボタンを無効化
    row.querySelectorAll('.ai-select-radio').forEach(radio => {
        radio.disabled = true;
    });

    // チェックボックスを無効化
    const checkbox = row.querySelector('.row-checkbox');
    if (checkbox) {
        checkbox.disabled = true;
        checkbox.checked = false;
    }

    // 進捗カウント更新
    updateProgressCount();
}

/**
 * 選択項目を一括確定
 */
function bulkConfirmSelected() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked:not(:disabled)');

    if (selectedCheckboxes.length === 0) {
        alert('確定する項目を選択してください。');
        return;
    }

    if (confirm(`選択した${selectedCheckboxes.length}件を一括確定しますか？`)) {
        selectedCheckboxes.forEach(checkbox => {
            const index = checkbox.getAttribute('data-index');
            confirmRowFlat(parseInt(index));
        });

        // 全選択チェックボックスを解除
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
    }
}

/**
 * フィルター適用
 */
function filterMatchingData(filterType) {
    // フィルターボタンのアクティブ状態を更新
    document.querySelectorAll('.filter-btn-matching').forEach(btn => {
        btn.classList.remove('active');
    });
    const targetBtn = document.querySelector(`[data-filter="${filterType}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }

    // データ行をフィルタリング
    document.querySelectorAll('.data-row-flat').forEach(row => {
        const status = row.getAttribute('data-status');

        if (filterType === 'all') {
            row.style.display = '';
        } else if (filterType === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 検索
 */
function searchImportData(searchTerm) {
    const term = searchTerm.toLowerCase();
    document.querySelectorAll('.data-row-flat').forEach(row => {
        const cells = row.querySelectorAll('.td-data-matching');
        let found = false;

        cells.forEach(cell => {
            const text = cell.textContent.toLowerCase();
            if (text.includes(term)) {
                found = true;
            }
        });

        if (found || term === '') {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 進捗カウント更新
 */
function updateProgressCount() {
    const completedRows = document.querySelectorAll('.data-row-flat[data-status="completed"]').length;
    const totalRows = document.querySelectorAll('.data-row-flat').length;

    const progressCountEl = document.getElementById('progressCount');
    const completedCountEl = document.getElementById('completedCount');

    if (progressCountEl) {
        progressCountEl.textContent = `${completedRows} / ${totalRows}`;
    }
    if (completedCountEl) {
        completedCountEl.textContent = `${completedRows}件`;
    }

    // フィルターカウント更新
    const pendingCount = document.querySelectorAll('.data-row-flat[data-status="pending"]').length;

    const allFilter = document.querySelector('[data-filter="all"] .filter-count-matching');
    const pendingFilter = document.querySelector('[data-filter="pending"] .filter-count-matching');
    const completedFilter = document.querySelector('[data-filter="completed"] .filter-count-matching');

    if (allFilter) allFilter.textContent = `(${totalRows})`;
    if (pendingFilter) pendingFilter.textContent = `(${pendingCount})`;
    if (completedFilter) completedFilter.textContent = `(${completedRows})`;
}

/**
 * 資産マスタを新しいウィンドウで開く
 */
function openAssetMasterWindow() {
    const width = 1200;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    window.open(
        'about:blank',
        'assetMasterWindow',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    alert('資産マスタを新しいウィンドウで開きます（実装時はデータを表示）');
}

/**
 * ページネーション
 */
function goToPreviousPage() {
    console.log('Go to previous page');
}

function goToNextPage() {
    console.log('Go to next page');
}

/**
 * 突き合わせ完了
 */
function completeMatching() {
    const pendingCount = document.querySelectorAll('.data-row-flat[data-status="pending"]').length;

    if (pendingCount > 0) {
        if (!confirm(`未処理のデータが${pendingCount}件あります。このまま完了しますか？`)) {
            return;
        }
    }

    if (confirm('突き合わせを完了してマスタに登録しますか？')) {
        console.log('Completing matching process...');
        alert('突き合わせが完了しました。');
    }
}

// グローバルスコープに関数を公開
window.toggleSelectAll = toggleSelectAll;
window.selectAIRecommendation = selectAIRecommendation;
window.toggleEditMode = toggleEditMode;
window.confirmRowFlat = confirmRowFlat;
window.bulkConfirmSelected = bulkConfirmSelected;
window.filterMatchingData = filterMatchingData;
window.searchImportData = searchImportData;
window.updateProgressCount = updateProgressCount;
window.openAssetMasterWindow = openAssetMasterWindow;
window.goToPreviousPage = goToPreviousPage;
window.goToNextPage = goToNextPage;
window.completeMatching = completeMatching;

// 初期化（DOMContentLoadedまたはページ表示時）
document.addEventListener('DOMContentLoaded', function() {
    const matchingPage = document.getElementById('assetMatchingPage');
    if (matchingPage) {
        updateProgressCount();
    }
});

// 画面が動的に読み込まれた場合の初期化
// MutationObserverで監視し、画面が表示されたら初期化
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const matchingPage = document.getElementById('assetMatchingPage');
            if (matchingPage && matchingPage.classList.contains('active')) {
                updateProgressCount();
            }
        }
    });
});

// assetMatchingPageが存在する場合、監視を開始
setTimeout(() => {
    const matchingPage = document.getElementById('assetMatchingPage');
    if (matchingPage) {
        observer.observe(matchingPage, { attributes: true });
    }
}, 1000);
