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
        console.log('Loading facility-master.json...');
        // キャッシュバスターを追加してブラウザキャッシュを回避
        const cacheBuster = new Date().getTime();
        const response = await fetch(`src/data/facility-master.json?v=${cacheBuster}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const config = await response.json();
        console.log('Loaded config:', config);
        console.log('All config keys:', Object.keys(config));

        // columnsとdata/facilitiesの両方をチェック
        const hasColumns = !!config.columns;
        const hasData = !!(config.data || config.facilities);

        if (!hasColumns || !hasData) {
            console.error('Missing required fields!');
            console.error('Has columns?', hasColumns);
            console.error('Has data?', !!config.data);
            console.error('Has facilities?', !!config.facilities);
            throw new Error('Invalid JSON structure: missing columns or data/facilities');
        }

        // columnsがない場合は動的に生成
        if (!config.columns) {
            config.columns = [
                { id: "checkbox", label: "", field: "checkbox", type: "checkbox", width: "50px" },
                { id: "no", label: "No.", field: "no", type: "number", width: "60px" },
                { id: "code", label: "施設ID", field: "code", type: "text", width: "100px" },
                { id: "name", label: "施設名", field: "name", type: "text", width: "200px" },
                { id: "region", label: "都道府県", field: "region", type: "text", width: "100px" },
                { id: "type", label: "施設種別", field: "type", type: "text", width: "150px" },
                { id: "actions", label: "操作", field: "actions", type: "actions", width: "100px" }
            ];
        }

        shipFacilityConfig = config;
        // dataまたはfacilitiesを使用
        shipFacilityData = config.data || config.facilities;
        console.log('shipFacilityConfig set:', shipFacilityConfig);
        console.log('shipFacilityData set:', shipFacilityData);
        return config;
    } catch (error) {
        console.error('Failed to load facility-master.json:', error);
        alert('施設マスタデータの読み込みに失敗しました: ' + error.message);
        return null;
    }
}

/**
 * テーブルヘッダーを動的に生成
 */
function renderFacilityTableHeader() {
    console.log('renderFacilityTableHeader called');
    console.log('shipFacilityConfig:', shipFacilityConfig);

    if (!shipFacilityConfig) {
        console.error('shipFacilityConfig is null or undefined');
        return;
    }

    if (!shipFacilityConfig.columns) {
        console.error('shipFacilityConfig.columns is undefined');
        return;
    }

    const thead = document.querySelector('#facilityTableBody').closest('table').querySelector('thead tr');
    if (!thead) {
        console.error('thead not found');
        return;
    }

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

    console.log('Table header rendered successfully');
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
        tr.dataset.facilityCode = facility.code;

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
                    td.innerHTML = `<button class="table-action-btn edit" onclick="showFacilityEditModal('${facility.code}')">編集</button>`;
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
    document.getElementById('filterType').value = '';
    filterFacilityTable();
}

/**
 * テーブルフィルタリング
 */
function filterFacilityTable() {
    const facilityId = document.getElementById('filterFacilityId').value.toLowerCase();
    const facilityName = document.getElementById('filterFacilityName').value.toLowerCase();
    const prefecture = document.getElementById('filterPrefecture').value;
    const type = document.getElementById('filterType').value;

    const rows = document.querySelectorAll('#facilityTableBody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        // 新しいテーブル構造: [checkbox, No, 施設ID, 施設名, 都道府県, 施設種別, 操作]
        const rowFacilityId = cells[2]?.textContent.toLowerCase() || '';
        const rowFacilityName = cells[3]?.textContent.toLowerCase() || '';
        const rowPrefecture = cells[4]?.textContent || '';
        const rowType = cells[5]?.textContent || '';

        let matchFacilityId = !facilityId || rowFacilityId.includes(facilityId);
        let matchFacilityName = !facilityName || rowFacilityName.includes(facilityName);
        let matchPrefecture = !prefecture || rowPrefecture === prefecture;
        let matchType = !type || rowType === type;

        if (matchFacilityId && matchFacilityName && matchPrefecture && matchType) {
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
        code: document.getElementById('facilityCode').value,
        name: document.getElementById('facilityName').value,
        region: document.getElementById('facilityRegion').value,
        type: document.getElementById('facilityType').value
    };

    console.log('新規施設データ:', formData);

    // IDを生成（既存データの最大ID + 1）
    const maxId = shipFacilityData.length > 0
        ? Math.max(...shipFacilityData.map(f => f.id))
        : 0;

    // shipFacilityDataに追加
    const newFacility = {
        id: maxId + 1,
        code: formData.code,
        name: formData.name,
        region: formData.region,
        type: formData.type
    };

    shipFacilityData.push(newFacility);

    // テーブルを再描画
    renderFacilityTableBody();

    // モーダルを閉じる
    closeFacilityNewModal();

    // 成功メッセージ
    alert(`施設「${formData.name}」を登録しました`);
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
    console.log('showShipFacilityMaster called');

    // すべての画面を非表示
    const allPages = document.querySelectorAll('.active');
    allPages.forEach(page => page.classList.remove('active'));

    // SHIP施設マスタ画面を表示
    const shipFacilityPage = document.getElementById('shipFacilityMasterPage');
    if (shipFacilityPage) {
        shipFacilityPage.classList.add('active');

        // JSONを読み込んでテーブルを生成
        const config = await loadFacilityMasterConfig();

        if (!config) {
            console.error('Failed to load facility master config');
            alert('施設マスタの読み込みに失敗しました。');
            return;
        }

        console.log('Config loaded successfully, rendering table...');
        renderFacilityTableHeader();
        renderFacilityTableBody();
        console.log('Table rendered');
    } else {
        console.error('shipFacilityMasterPage element not found');
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
