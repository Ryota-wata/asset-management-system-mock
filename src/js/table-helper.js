/**
 * テーブル操作共通ヘルパー関数
 *
 * チェックボックス操作、フィルタリング、検索など
 * テーブル関連の共通処理を統合管理
 */

/**
 * チェックボックス全選択切り替え
 * @param {HTMLElement} selectAllCheckbox - 全選択チェックボックス要素
 * @param {string} targetSelector - 対象チェックボックスのセレクタ
 * @param {Function} callback - チェック状態変更後のコールバック (optional)
 */
function toggleSelectAll(selectAllCheckbox, targetSelector, callback) {
    const checkboxes = document.querySelectorAll(targetSelector);
    const isChecked = selectAllCheckbox.checked;

    checkboxes.forEach(cb => {
        if (!cb.disabled) {
            cb.checked = isChecked;
        }
    });

    if (callback && typeof callback === 'function') {
        callback(checkboxes, isChecked);
    }
}

/**
 * 選択された行を取得
 * @param {string} checkboxSelector - チェックボックスのセレクタ
 * @param {string} dataAttribute - データ属性名 (default: 'data-no')
 * @returns {Set} 選択された値のSet
 */
function getSelectedRows(checkboxSelector, dataAttribute = 'data-no') {
    const selected = new Set();
    const checkboxes = document.querySelectorAll(`${checkboxSelector}:checked`);

    checkboxes.forEach(cb => {
        const value = cb.getAttribute(dataAttribute);
        if (value) {
            selected.add(parseInt(value) || value);
        }
    });

    return selected;
}

/**
 * 全選択チェックボックスの状態を更新
 * @param {HTMLElement} selectAllCheckbox - 全選択チェックボックス要素
 * @param {string} targetSelector - 対象チェックボックスのセレクタ
 */
function updateSelectAllState(selectAllCheckbox, targetSelector) {
    const checkboxes = document.querySelectorAll(targetSelector);
    const checkedCount = document.querySelectorAll(`${targetSelector}:checked`).length;

    if (checkboxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === checkboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCount > 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
}

/**
 * 行のフィルタリング
 * @param {string} rowSelector - 行のセレクタ
 * @param {string} filterType - フィルタータイプ ('all', 'pending', 'completed'など)
 * @param {string} statusAttribute - ステータス属性名 (default: 'data-status')
 * @param {string} buttonSelector - フィルターボタンのセレクタ (optional)
 */
function filterRows(rowSelector, filterType, statusAttribute = 'data-status', buttonSelector = null) {
    const rows = document.querySelectorAll(rowSelector);

    // ボタンのアクティブ状態を更新
    if (buttonSelector) {
        updateFilterButtons(buttonSelector, filterType);
    }

    // 行の表示/非表示を切り替え
    rows.forEach(row => {
        const status = row.getAttribute(statusAttribute);

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
 * フィルターボタンのアクティブ状態を更新
 * @param {string} buttonSelector - ボタンのセレクタ
 * @param {string} activeFilterType - アクティブなフィルタータイプ
 * @param {string} filterAttribute - フィルター属性名 (default: 'data-filter')
 */
function updateFilterButtons(buttonSelector, activeFilterType, filterAttribute = 'data-filter') {
    const buttons = document.querySelectorAll(buttonSelector);

    buttons.forEach(btn => {
        if (btn.getAttribute(filterAttribute) === activeFilterType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * 行の検索（テキストベース）
 * @param {string} rowSelector - 行のセレクタ
 * @param {string} query - 検索クエリ
 * @param {string} cellSelector - 検索対象セルのセレクタ (default: '.cell-value')
 * @param {Object} options - オプション設定
 * @returns {number} ヒット件数
 */
function searchRows(rowSelector, query, cellSelector = '.cell-value', options = {}) {
    const {
        caseSensitive = false,
        trimQuery = true,
        highlightMatches = false
    } = options;

    const rows = document.querySelectorAll(rowSelector);
    const searchQuery = trimQuery ? query.trim() : query;
    const processedQuery = caseSensitive ? searchQuery : searchQuery.toLowerCase();
    let hitCount = 0;

    rows.forEach(row => {
        if (!processedQuery) {
            row.style.display = '';
            return;
        }

        const cells = row.querySelectorAll(cellSelector);
        let found = false;

        cells.forEach(cell => {
            const text = caseSensitive ? cell.textContent : cell.textContent.toLowerCase();

            if (text.includes(processedQuery)) {
                found = true;

                // ハイライト機能（オプション）
                if (highlightMatches) {
                    highlightText(cell, processedQuery, caseSensitive);
                }
            }
        });

        if (found) {
            row.style.display = '';
            hitCount++;
        } else {
            row.style.display = 'none';
        }
    });

    return hitCount;
}

/**
 * テキストをハイライト（内部使用）
 * @param {HTMLElement} element - 対象要素
 * @param {string} query - 検索クエリ
 * @param {boolean} caseSensitive - 大文字小文字を区別するか
 */
function highlightText(element, query, caseSensitive) {
    const text = element.textContent;
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${query})`, flags);

    const highlighted = text.replace(regex, '<mark>$1</mark>');
    element.innerHTML = highlighted;
}

/**
 * ハイライトをクリア
 * @param {string} containerSelector - コンテナのセレクタ
 */
function clearHighlights(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const marks = container.querySelectorAll('mark');
    marks.forEach(mark => {
        const text = mark.textContent;
        mark.replaceWith(text);
    });
}

/**
 * 行数カウント
 * @param {string} rowSelector - 行のセレクタ
 * @param {string} statusAttribute - ステータス属性名 (optional)
 * @param {string} statusValue - カウント対象のステータス値 (optional)
 * @returns {number} 行数
 */
function countRows(rowSelector, statusAttribute = null, statusValue = null) {
    if (!statusAttribute || !statusValue) {
        return document.querySelectorAll(rowSelector).length;
    }

    return document.querySelectorAll(`${rowSelector}[${statusAttribute}="${statusValue}"]`).length;
}

/**
 * フィルターカウント更新
 * @param {Array} filterConfigs - フィルター設定の配列
 * @example
 * updateFilterCounts([
 *   { buttonSelector: '[data-filter="all"] .count', rowSelector: '.row', status: null },
 *   { buttonSelector: '[data-filter="pending"] .count', rowSelector: '.row', status: 'pending' }
 * ])
 */
function updateFilterCounts(filterConfigs) {
    filterConfigs.forEach(config => {
        const { buttonSelector, rowSelector, statusAttribute = 'data-status', statusValue } = config;
        const button = document.querySelector(buttonSelector);

        if (button) {
            const count = countRows(rowSelector, statusValue ? statusAttribute : null, statusValue);
            button.textContent = `(${count})`;
        }
    });
}

/**
 * テーブルソート
 * @param {HTMLTableElement} table - テーブル要素
 * @param {number} columnIndex - ソート対象のカラムインデックス
 * @param {string} sortOrder - ソート順 ('asc' or 'desc')
 * @param {string} dataType - データ型 ('string', 'number', 'date')
 */
function sortTable(table, columnIndex, sortOrder = 'asc', dataType = 'string') {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex]?.textContent.trim() || '';
        const cellB = rowB.cells[columnIndex]?.textContent.trim() || '';

        let valueA, valueB;

        switch (dataType) {
            case 'number':
                valueA = parseFloat(cellA.replace(/,/g, '')) || 0;
                valueB = parseFloat(cellB.replace(/,/g, '')) || 0;
                break;
            case 'date':
                valueA = new Date(cellA).getTime() || 0;
                valueB = new Date(cellB).getTime() || 0;
                break;
            default:
                valueA = cellA.toLowerCase();
                valueB = cellB.toLowerCase();
        }

        if (sortOrder === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });

    // ソート後の行を再配置
    rows.forEach(row => tbody.appendChild(row));
}

// グローバルに公開
window.TableHelper = {
    toggleSelectAll,
    getSelectedRows,
    updateSelectAllState,
    filterRows,
    updateFilterButtons,
    searchRows,
    highlightText,
    clearHighlights,
    countRows,
    updateFilterCounts,
    sortTable
};
