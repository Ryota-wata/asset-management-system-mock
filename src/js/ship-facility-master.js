/**
 * SHIP施設マスタ一覧画面のJavaScript
 */

/**
 * フィルター表示/非表示切り替え
 */
function toggleFacilityFilter() {
    const filterHeader = document.getElementById('facilityFilterHeader');
    if (filterHeader) {
        if (filterHeader.style.display === 'none') {
            filterHeader.style.display = 'block';
        } else {
            filterHeader.style.display = 'none';
        }
    }
}

/**
 * フィルターリセット
 */
function resetFacilityFilter() {
    document.getElementById('filterFacilityId').value = '';
    document.getElementById('filterFacilityName').value = '';
    document.getElementById('filterPrefecture').value = '';
    document.getElementById('filterBedSize').value = '';
    filterFacilityTable();
}

/**
 * テーブルフィルタリング
 */
function filterFacilityTable() {
    const facilityId = document.getElementById('filterFacilityId').value.toLowerCase();
    const facilityName = document.getElementById('filterFacilityName').value.toLowerCase();
    const prefecture = document.getElementById('filterPrefecture').value;
    const bedSize = document.getElementById('filterBedSize').value;

    const rows = document.querySelectorAll('#facilityTableBody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowFacilityId = cells[2]?.textContent.toLowerCase() || '';
        const rowFacilityName = cells[3]?.textContent.toLowerCase() || '';
        const rowPrefecture = cells[5]?.textContent || '';
        const rowBedSize = cells[7]?.textContent || '';

        let matchFacilityId = !facilityId || rowFacilityId.includes(facilityId);
        let matchFacilityName = !facilityName || rowFacilityName.includes(facilityName);
        let matchPrefecture = !prefecture || rowPrefecture === prefecture;
        let matchBedSize = true;

        if (bedSize) {
            const bedNumber = parseInt(rowBedSize);
            if (bedSize === '100未満') {
                matchBedSize = bedNumber < 100;
            } else if (bedSize === '100-200') {
                matchBedSize = bedNumber >= 100 && bedNumber < 200;
            } else if (bedSize === '200-300') {
                matchBedSize = bedNumber >= 200 && bedNumber < 300;
            } else if (bedSize === '300-500') {
                matchBedSize = bedNumber >= 300 && bedNumber < 500;
            } else if (bedSize === '500以上') {
                matchBedSize = bedNumber >= 500;
            }
        }

        if (matchFacilityId && matchFacilityName && matchPrefecture && matchBedSize) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // 件数表示を更新
    const countElement = document.getElementById('facilityCount');
    if (countElement) {
        countElement.textContent = `${visibleCount}件`;
    }

    // ページネーション情報を更新
    const totalElement = document.getElementById('totalFacilities');
    const endElement = document.getElementById('displayEnd');
    if (totalElement) totalElement.textContent = visibleCount;
    if (endElement) endElement.textContent = visibleCount;
}

/**
 * 全選択チェックボックス処理
 */
function handleSelectAllFacilities() {
    const selectAll = document.getElementById('selectAllFacilities');
    const checkboxes = document.querySelectorAll('#facilityTableBody .row-checkbox');

    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row.style.display !== 'none') {
            checkbox.checked = selectAll.checked;
        }
    });

    updateFacilitySelectionInfo();
}

/**
 * 行選択チェックボックス処理
 */
function handleFacilityRowSelect() {
    const checkboxes = document.querySelectorAll('#facilityTableBody .row-checkbox');
    const selectAll = document.getElementById('selectAllFacilities');

    const visibleCheckboxes = Array.from(checkboxes).filter(cb => {
        const row = cb.closest('tr');
        return row.style.display !== 'none';
    });

    const allChecked = visibleCheckboxes.length > 0 &&
                       visibleCheckboxes.every(cb => cb.checked);

    selectAll.checked = allChecked;
    updateFacilitySelectionInfo();
}

/**
 * 選択情報を更新
 */
function updateFacilitySelectionInfo() {
    const checkboxes = document.querySelectorAll('#facilityTableBody .row-checkbox:checked');
    const count = checkboxes.length;

    const selectionInfo = document.getElementById('facilitySelectionInfo');
    const deleteBtn = document.getElementById('facilityDeleteBtn');

    if (selectionInfo) {
        selectionInfo.textContent = `${count}件選択中`;
    }

    if (deleteBtn) {
        deleteBtn.disabled = count === 0;
    }
}

/**
 * Excel出力
 */
function handleFacilityExport() {
    alert('Excel出力機能は実装中です');
}

/**
 * 施設削除
 */
function handleFacilityDelete() {
    const checkboxes = document.querySelectorAll('#facilityTableBody .row-checkbox:checked');
    const count = checkboxes.length;

    if (count === 0) return;

    if (confirm(`選択した${count}件の施設を削除しますか？`)) {
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            row.remove();
        });

        filterFacilityTable();
        updateFacilitySelectionInfo();
        alert(`${count}件の施設を削除しました`);
    }
}

/**
 * 戻るボタン
 */
function handleFacilityBack() {
    // マスタ管理モーダルに戻る、または前の画面に戻る
    const shipFacilityPage = document.getElementById('shipFacilityMasterPage');
    if (shipFacilityPage) {
        shipFacilityPage.classList.remove('active');
    }

    // メイン画面を表示
    const mainContainer = document.getElementById('mainContainer');
    if (mainContainer) {
        mainContainer.classList.add('active');
    }
}

/**
 * 新規作成モーダルを表示
 */
function showFacilityNewModal() {
    alert('新規施設作成機能は実装中です\n\n以下の項目を入力する画面を表示します：\n- 施設ID\n- 施設名\n- 施設名（カナ）\n- 郵便番号\n- 都道府県\n- 市区町村\n- 住所\n- 電話番号\n- FAX番号\n- 病床規模\n- 設立年月日\n- その他詳細情報');
}

/**
 * 施設編集モーダルを表示
 * @param {string} facilityId - 施設ID
 */
function showFacilityEditModal(facilityId) {
    alert(`施設編集機能は実装中です\n\n施設ID: ${facilityId} の編集画面を表示します`);
}

/**
 * 施設詳細モーダルを表示
 * @param {string} facilityId - 施設ID
 */
function showFacilityDetailModal(facilityId) {
    alert(`施設詳細機能は実装中です\n\n施設ID: ${facilityId} の詳細情報を表示します`);
}

/**
 * ページネーション - 前へ
 */
function goToPreviousPage() {
    alert('前のページへ移動（実装中）');
}

/**
 * ページネーション - 次へ
 */
function goToNextPage() {
    alert('次のページへ移動（実装中）');
}

/**
 * SHIP施設マスタ画面を表示
 */
function showShipFacilityMaster() {
    // すべての画面を非表示
    const allPages = document.querySelectorAll('.active');
    allPages.forEach(page => page.classList.remove('active'));

    // SHIP施設マスタ画面を表示
    const shipFacilityPage = document.getElementById('shipFacilityMasterPage');
    if (shipFacilityPage) {
        shipFacilityPage.classList.add('active');

        // 初期表示時にフィルターを実行
        filterFacilityTable();
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 初期件数を設定
    const totalRows = document.querySelectorAll('#facilityTableBody tr').length;
    const countElement = document.getElementById('facilityCount');
    if (countElement) {
        countElement.textContent = `${totalRows}件`;
    }
});

// グローバルに公開
window.toggleFacilityFilter = toggleFacilityFilter;
window.resetFacilityFilter = resetFacilityFilter;
window.filterFacilityTable = filterFacilityTable;
window.handleSelectAllFacilities = handleSelectAllFacilities;
window.handleFacilityRowSelect = handleFacilityRowSelect;
window.handleFacilityExport = handleFacilityExport;
window.handleFacilityDelete = handleFacilityDelete;
window.handleFacilityBack = handleFacilityBack;
window.showFacilityNewModal = showFacilityNewModal;
window.showFacilityEditModal = showFacilityEditModal;
window.showFacilityDetailModal = showFacilityDetailModal;
window.goToPreviousPage = goToPreviousPage;
window.goToNextPage = goToNextPage;
window.showShipFacilityMaster = showShipFacilityMaster;
