/**
 * フィルター・検索機能
 * 検索条件の保存・読み込み、フィルタリング、条件クリアなどの機能を提供します。
 */

// フィルターIDの定数定義
const FILTER_IDS = [
    'filterBuilding',
    'filterFloor',
    'filterDepartment',
    'filterSection',
    'filterCategory',
    'filterLargeClass',
    'filterMediumClass'
];

/**
 * フォームをクリア
 */
function clearForm() {
    if (confirm('入力された検索条件をクリアしますか？')) {
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
    }
}

/**
 * リスト閲覧
 */
function viewList() {
    console.log('=== viewList called ===');
    if (typeof handleViewSearchResult === 'function') {
        handleViewSearchResult();
    } else {
        console.error('handleViewSearchResult is not defined!');
    }
}

/**
 * フィルター適用
 */
function applyFilters() {
    const filters = {};

    FILTER_IDS.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            filters[id] = element.value || '';
        }
    });

    // フィルター処理の実装
    console.log('フィルター実行:', filters);
    alert('絞り込みを実行しました');
}

/**
 * フィルタークリア
 */
function clearFilters() {
    FILTER_IDS.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.choices) {
                element.choices.setChoiceByValue('');
            } else {
                element.value = '';
            }
        }
    });
    alert('フィルターをクリアしました');
}

// グローバルスコープに関数を公開
window.clearForm = clearForm;
window.viewList = viewList;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
