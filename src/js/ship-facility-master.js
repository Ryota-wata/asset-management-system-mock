/**
 * SHIP施設マスタ一覧画面のJavaScript
 */

// グローバル変数
let shipFacilityConfig = null;
let shipFacilityData = [];

/**
 * facility-master.jsonを読み込む
 */
async function loadFacilityMasterConfig() {
    try {
        const response = await fetch('data/facility-master.json');
        const config = await response.json();
        shipFacilityConfig = config;
        shipFacilityData = config.data;
        return config;
    } catch (error) {
        console.error('Failed to load facility-master.json:', error);
        return null;
    }
}

/**
 * テーブルヘッダーを動的に生成
 */
function renderFacilityTableHeader() {
    if (!shipFacilityConfig) return;

    const thead = document.querySelector('#facilityTableBody').closest('table').querySelector('thead tr');
    if (!thead) return;

    thead.innerHTML = '';

    shipFacilityConfig.columns.forEach(column => {
        const th = document.createElement('th');

        if (column.type === 'checkbox') {
            th.innerHTML = '<input type="checkbox" id="selectAllFacilities" onchange="handleSelectAllFacilities()">';
        } else {
            th.textContent = column.label;
        }

        if (column.width) {
            th.style.width = column.width;
        }

        thead.appendChild(th);
    });
}

/**
 * テーブルボディを動的に生成
 */
function renderFacilityTableBody() {
    if (!shipFacilityConfig || !shipFacilityData) return;

    const tbody = document.getElementById('facilityTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    shipFacilityData.forEach((facility, index) => {
        const tr = document.createElement('tr');
        tr.dataset.facilityId = facility.facilityId;

        shipFacilityConfig.columns.forEach(column => {
            const td = document.createElement('td');

            switch (column.type) {
                case 'checkbox':
                    td.innerHTML = '<input type="checkbox" class="row-checkbox" onchange="handleFacilityRowSelect()">';
                    break;

                case 'number':
                    if (column.id === 'no') {
                        td.textContent = index + 1;
                    }
                    break;

                case 'actions':
                    td.innerHTML = `<button class="table-action-btn edit" onclick="showFacilityEditModal('${facility.facilityId}')">編集</button>`;
                    break;

                default:
                    const value = facility[column.field];
                    td.textContent = value || '-';
                    break;
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    // 件数を更新
    updateFacilityCount();
}

/**
 * 件数表示を更新
 */
function updateFacilityCount() {
    const visibleRows = document.querySelectorAll('#facilityTableBody tr:not([style*="display: none"])');
    const countElement = document.getElementById('facilityCount');
    if (countElement) {
        countElement.textContent = `${visibleRows.length}件`;
    }

    const totalElement = document.getElementById('totalFacilities');
    const endElement = document.getElementById('displayEnd');
    if (totalElement) totalElement.textContent = visibleRows.length;
    if (endElement) endElement.textContent = visibleRows.length;
}

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
    updateFacilityCount();
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
    const modal = document.getElementById('facilityNewModal');
    if (modal) {
        // フォームをリセット
        const form = document.getElementById('facilityNewForm');
        if (form) {
            form.reset();
        }

        modal.classList.add('show');
    }
}

/**
 * 新規作成モーダルを閉じる
 */
function closeFacilityNewModal() {
    const modal = document.getElementById('facilityNewModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * 新規施設登録フォーム送信処理
 * @param {Event} event - フォーム送信イベント
 */
function handleFacilityNewSubmit(event) {
    event.preventDefault();

    // フォームデータを取得
    const formData = {
        facilityId: document.getElementById('facilityId').value,
        facilityName: document.getElementById('facilityName').value,
        facilityNameKana: document.getElementById('facilityNameKana').value,
        bedSize: document.getElementById('bedSize').value,
        establishedDate: document.getElementById('establishedDate').value,
        postalCode: document.getElementById('postalCode').value,
        prefecture: document.getElementById('prefecture').value,
        city: document.getElementById('city').value,
        address: document.getElementById('address').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        faxNumber: document.getElementById('faxNumber').value,
        notes: document.getElementById('notes').value
    };

    console.log('新規施設データ:', formData);

    // shipFacilityDataに追加
    const newFacility = {
        facilityId: formData.facilityId,
        facilityName: formData.facilityName,
        facilityNameKana: formData.facilityNameKana,
        prefecture: formData.prefecture,
        city: formData.city,
        bedSize: formData.bedSize ? formData.bedSize + '床' : '',
        phoneNumber: formData.phoneNumber,
        postalCode: formData.postalCode,
        address: formData.address,
        faxNumber: formData.faxNumber,
        establishedDate: formData.establishedDate,
        notes: formData.notes
    };

    shipFacilityData.push(newFacility);

    // テーブルを再描画
    renderFacilityTableBody();

    // モーダルを閉じる
    closeFacilityNewModal();

    // 成功メッセージ
    alert(`施設「${formData.facilityName}」を登録しました`);
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
async function showShipFacilityMaster() {
    // すべての画面を非表示
    const allPages = document.querySelectorAll('.active');
    allPages.forEach(page => page.classList.remove('active'));

    // SHIP施設マスタ画面を表示
    const shipFacilityPage = document.getElementById('shipFacilityMasterPage');
    if (shipFacilityPage) {
        shipFacilityPage.classList.add('active');

        // JSONを読み込んでテーブルを生成
        await loadFacilityMasterConfig();
        renderFacilityTableHeader();
        renderFacilityTableBody();
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // モーダル外クリックで閉じる
    const newModal = document.getElementById('facilityNewModal');
    if (newModal) {
        newModal.addEventListener('click', function(e) {
            if (e.target === newModal) {
                closeFacilityNewModal();
            }
        });
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
window.closeFacilityNewModal = closeFacilityNewModal;
window.handleFacilityNewSubmit = handleFacilityNewSubmit;
window.showFacilityEditModal = showFacilityEditModal;
window.showFacilityDetailModal = showFacilityDetailModal;
window.goToPreviousPage = goToPreviousPage;
window.goToNextPage = goToNextPage;
window.showShipFacilityMaster = showShipFacilityMaster;
