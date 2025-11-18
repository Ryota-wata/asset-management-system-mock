/**
 * 申請一覧画面のJavaScript
 */

// グローバル変数
let applicationListData = [];
let filteredApplicationListData = [];
let currentEditingApplicationId = null;
let selectedApplicationIds = new Set(); // チェックボックスで選択した申請ID
let rfqRecords = []; // 見積依頼レコード

// サンプル申請データ
const sampleApplications = [
    {
        id: 1,
        applicationNo: 'REQ-2025-0001',
        applicationDate: '2025-11-15',
        applicationType: '新規購入申請',
        asset: {
            name: '電気手術用電源装置',
            model: 'EW11 超音波吸引器'
        },
        vendor: '◯◯メディカル 東京支店',
        quantity: '1台',
        rfqNo: 'RFQ-2025-0001',
        status: '承認待ち',
        approvalProgress: {
            current: 1,
            total: 3
        },
        facility: {
            building: '本館',
            floor: '2F',
            department: '手術部門',
            section: '手術'
        },
        freeInput: '老朽化に伴う更新',
        executionYear: '2025年度'
    },
    {
        id: 2,
        applicationNo: 'REQ-2025-0002',
        applicationDate: '2025-11-15',
        applicationType: '新規購入申請',
        asset: {
            name: '超音波診断装置',
            model: 'US-3000X'
        },
        vendor: '◯◯メディカル 東京支店',
        quantity: '2台',
        rfqNo: 'RFQ-2025-0001',
        status: '承認待ち',
        approvalProgress: {
            current: 1,
            total: 3
        },
        facility: {
            building: '本館',
            floor: '3F',
            department: '内科',
            section: '循環器内科'
        },
        freeInput: '診療業務拡大のため',
        executionYear: '2025年度'
    },
    {
        id: 3,
        applicationNo: 'REQ-2025-0003',
        applicationDate: '2025-11-14',
        applicationType: '更新購入申請',
        asset: {
            name: 'X線撮影装置',
            model: 'XR-500'
        },
        vendor: '日立メディコ 大阪支店',
        quantity: '1式',
        rfqNo: 'RFQ-2025-0002',
        status: '承認済み',
        approvalProgress: {
            current: 3,
            total: 3
        },
        facility: {
            building: '本館',
            floor: '1F',
            department: '放射線科',
            section: 'X線撮影室'
        },
        freeInput: '耐用年数超過',
        executionYear: '2025年度'
    },
    {
        id: 4,
        applicationNo: 'REQ-2025-0004',
        applicationDate: '2025-11-13',
        applicationType: '増設購入申請',
        asset: {
            name: '人工呼吸器',
            model: 'VT-2000'
        },
        vendor: 'フクダ電子 東京支店',
        quantity: '3台',
        rfqNo: '',
        status: '下書き',
        approvalProgress: {
            current: 0,
            total: 3
        },
        facility: {
            building: '本館',
            floor: '4F',
            department: 'ICU',
            section: '集中治療室'
        },
        freeInput: '患者数増加のため',
        executionYear: '2025年度'
    },
    {
        id: 5,
        applicationNo: 'REQ-2025-0005',
        applicationDate: '2025-11-12',
        applicationType: '移動申請',
        asset: {
            name: '心電図モニター',
            model: 'ECG-100'
        },
        vendor: '-',
        quantity: '1台',
        rfqNo: '-',
        status: '差し戻し',
        approvalProgress: {
            current: 0,
            total: 2
        },
        facility: {
            building: '本館',
            floor: '5F',
            department: '外科',
            section: '一般外科'
        },
        freeInput: '病棟移転に伴う移動',
        executionYear: '2025年度'
    }
];

// 初期化
function initApplicationListPage() {
    console.log('=== Initializing Application List Page ===');

    // サンプルデータをロード
    applicationListData = [...sampleApplications];
    filteredApplicationListData = [...applicationListData];

    // グローバル変数を更新
    window.applicationListData = applicationListData;
    window.rfqRecords = rfqRecords;

    // テーブルをレンダリング
    renderApplicationTable();
    updateApplicationCount();
}

// テーブルをレンダリング
function renderApplicationTable() {
    const tbody = document.getElementById('applicationTableBody');

    if (!tbody) {
        console.error('applicationTableBody not found');
        return;
    }

    if (filteredApplicationListData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">申請がありません</div>
                    <div class="empty-state-subtext">検索条件を変更してください</div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredApplicationListData.map(app => {
        const statusBadge = window.BadgeHelper.getApplicationStatusBadge(app.status);
        const typeBadge = window.BadgeHelper.getApplicationTypeBadge(app.applicationType);
        const rfqDisplay = app.rfqNo ? `<span class="rfq-no">${app.rfqNo}</span>` : '<span class="rfq-no empty">未設定</span>';
        const vendorDisplay = app.vendor === '-' ? '<span style="color: #95a5a6;">-</span>' : app.vendor;
        const isChecked = selectedApplicationIds.has(app.id) ? 'checked' : '';

        // アクションボタン
        let actionButtons = `<button class="app-action-btn detail" onclick="showApplicationDetail(${app.id})">詳細</button>`;

        if (app.status === '下書き' || app.status === '差し戻し') {
            actionButtons += `<button class="app-action-btn edit" onclick="editApplication(${app.id})">編集</button>`;
        }

        if (app.status === '下書き') {
            actionButtons += `<button class="app-action-btn delete" onclick="deleteApplication(${app.id})">削除</button>`;
        }

        return `
            <tr>
                <td><input type="checkbox" class="application-checkbox" value="${app.id}" ${isChecked} onchange="toggleApplicationSelection(${app.id})"></td>
                <td><strong>${app.applicationNo}</strong></td>
                <td>${app.applicationDate}</td>
                <td>${typeBadge}</td>
                <td>
                    <div class="asset-info-cell">
                        <div class="asset-name">${app.asset.name}</div>
                        <div class="asset-model">型式: ${app.asset.model}</div>
                    </div>
                </td>
                <td>${app.quantity}</td>
                <td>${rfqDisplay}</td>
                <td>${vendorDisplay}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="approval-progress">
                        <span class="progress-text">${app.approvalProgress.current}/${app.approvalProgress.total}</span> 承認
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ステータスバッジを取得（badge-helper.jsの関数を使用）
// 削除: 共通ヘルパーに統合

// 申請種別バッジを取得（badge-helper.jsの関数を使用）
// 削除: 共通ヘルパーに統合

// 申請件数を更新
function updateApplicationCount() {
    const countElement = document.getElementById('applicationCount');
    if (countElement) {
        countElement.textContent = `${filteredApplicationListData.length}件`;
    }
}

// フィルタリング
function filterApplications() {
    const filterType = document.getElementById('filterApplicationType').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const filterRfqNo = document.getElementById('filterRfqNo').value.trim();
    const filterDateFrom = document.getElementById('filterDateFrom').value;
    const filterDateTo = document.getElementById('filterDateTo').value;
    const filterKeyword = document.getElementById('filterKeyword').value.trim().toLowerCase();

    filteredApplicationListData = applicationListData.filter(app => {
        // 申請種別フィルター
        if (filterType && app.applicationType !== filterType) return false;

        // 状態フィルター
        if (filterStatus && app.status !== filterStatus) return false;

        // 見積依頼Noフィルター
        if (filterRfqNo && app.rfqNo !== filterRfqNo) return false;

        // 申請日フィルター
        if (filterDateFrom && app.applicationDate < filterDateFrom) return false;
        if (filterDateTo && app.applicationDate > filterDateTo) return false;

        // キーワードフィルター
        if (filterKeyword) {
            const searchText = `${app.applicationNo} ${app.asset.name} ${app.asset.model}`.toLowerCase();
            if (!searchText.includes(filterKeyword)) return false;
        }

        return true;
    });

    renderApplicationTable();
    updateApplicationCount();
}

// フィルタークリア
function clearFilters() {
    document.getElementById('filterApplicationType').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterRfqNo').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    document.getElementById('filterKeyword').value = '';

    filterApplications();
}

// 申請詳細を表示
function showApplicationDetail(id) {
    const app = applicationListData.find(a => a.id === id);
    if (!app) return;

    const content = document.getElementById('applicationDetailContent');

    content.innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">📋 申請情報</div>
            <div class="detail-row">
                <div class="label">申請番号</div>
                <div class="value"><strong>${app.applicationNo}</strong></div>
            </div>
            <div class="detail-row">
                <div class="label">申請日</div>
                <div class="value">${app.applicationDate}</div>
            </div>
            <div class="detail-row">
                <div class="label">申請種別</div>
                <div class="value">${window.BadgeHelper.getApplicationTypeBadge(app.applicationType)}</div>
            </div>
            <div class="detail-row">
                <div class="label">状態</div>
                <div class="value">${window.BadgeHelper.getApplicationStatusBadge(app.status)}</div>
            </div>
            <div class="detail-row">
                <div class="label">承認進捗</div>
                <div class="value">${app.approvalProgress.current}/${app.approvalProgress.total} 承認済み</div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">📦 資産情報</div>
            <div class="detail-row">
                <div class="label">品目</div>
                <div class="value"><strong>${app.asset.name}</strong></div>
            </div>
            <div class="detail-row">
                <div class="label">型式</div>
                <div class="value">${app.asset.model}</div>
            </div>
            <div class="detail-row">
                <div class="label">数量</div>
                <div class="value">${app.quantity}</div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">🏪 購入先情報</div>
            <div class="detail-row">
                <div class="label">購入先店舗</div>
                <div class="value">${app.vendor}</div>
            </div>
            <div class="detail-row">
                <div class="label">見積依頼No</div>
                <div class="value">${app.rfqNo || '<span style="color: #95a5a6;">未設定</span>'}</div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">🏥 設置先情報</div>
            <div class="detail-row">
                <div class="label">棟</div>
                <div class="value">${app.facility.building || '-'}</div>
            </div>
            <div class="detail-row">
                <div class="label">階</div>
                <div class="value">${app.facility.floor || '-'}</div>
            </div>
            <div class="detail-row">
                <div class="label">部門</div>
                <div class="value">${app.facility.department || '-'}</div>
            </div>
            <div class="detail-row">
                <div class="label">部署</div>
                <div class="value">${app.facility.section || '-'}</div>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">📝 その他情報</div>
            <div class="detail-row">
                <div class="label">申請理由・コメント</div>
                <div class="value">${app.freeInput || '-'}</div>
            </div>
            <div class="detail-row">
                <div class="label">執行年度</div>
                <div class="value">${app.executionYear || '-'}</div>
            </div>
        </div>
    `;

    document.getElementById('applicationDetailModal').classList.add('active');
}

// 申請詳細モーダルを閉じる
function closeApplicationDetailModal() {
    document.getElementById('applicationDetailModal').classList.remove('active');
}

// 申請詳細モーダルの枠外クリック
function handleDetailModalOutsideClick(event) {
    if (event.target.id === 'applicationDetailModal') {
        closeApplicationDetailModal();
    }
}

// 申請編集（見積依頼No付与）
function editApplication(id) {
    const app = applicationListData.find(a => a.id === id);
    if (!app) return;

    currentEditingApplicationId = id;

    // 基本情報を表示
    document.getElementById('editBasicInfo').innerHTML = `
        <div class="detail-row">
            <div class="label">申請番号</div>
            <div class="value"><strong>${app.applicationNo}</strong></div>
        </div>
        <div class="detail-row">
            <div class="label">資産</div>
            <div class="value">${app.asset.name} / ${app.asset.model}</div>
        </div>
        <div class="detail-row">
            <div class="label">購入先店舗</div>
            <div class="value"><strong>${app.vendor}</strong></div>
        </div>
        <div class="detail-row">
            <div class="label">数量</div>
            <div class="value">${app.quantity}</div>
        </div>
    `;

    // 見積依頼Noのグルーピング選択肢を生成
    generateRfqGroupingOptions(app);

    document.getElementById('applicationEditModal').classList.add('active');
}

// 見積依頼Noグルーピング選択肢を生成
function generateRfqGroupingOptions(app) {
    const container = document.getElementById('rfqGroupingOptions');

    // 同じ購入先店舗の既存の見積依頼Noを検索
    const existingRfqs = {};
    applicationListData.forEach(a => {
        if (a.rfqNo && a.vendor === app.vendor && a.id !== app.id) {
            if (!existingRfqs[a.rfqNo]) {
                existingRfqs[a.rfqNo] = [];
            }
            existingRfqs[a.rfqNo].push(a);
        }
    });

    let optionsHtml = '<div style="margin-bottom: 15px; color: #7f8c8d; font-size: 13px;">同じ購入先店舗の申請をグルーピングします</div>';

    // 既存の見積依頼Noがある場合
    if (Object.keys(existingRfqs).length > 0) {
        optionsHtml += '<div style="font-weight: 600; margin-bottom: 10px; color: #2c3e50;">既存の見積依頼Noに紐付ける</div>';
        Object.keys(existingRfqs).forEach(rfqNo => {
            const apps = existingRfqs[rfqNo];
            const isSelected = app.rfqNo === rfqNo;
            optionsHtml += `
                <div class="rfq-grouping-option ${isSelected ? 'selected' : ''}" onclick="selectRfqOption('${rfqNo}')">
                    <div>
                        <input type="radio" name="rfqGroup" value="${rfqNo}" ${isSelected ? 'checked' : ''}>
                        <span class="rfq-label">${rfqNo}</span>
                    </div>
                    <div class="rfq-info">${app.vendor}: ${apps.length}件の申請</div>
                </div>
            `;
        });
    }

    // 新規作成オプション
    const newRfqNo = generateNewRfqNo();
    const isNewSelected = !app.rfqNo || !Object.keys(existingRfqs).includes(app.rfqNo);

    optionsHtml += '<div style="font-weight: 600; margin: 15px 0 10px 0; color: #2c3e50;">新規作成</div>';
    optionsHtml += `
        <div class="rfq-grouping-option ${isNewSelected ? 'selected' : ''}" onclick="selectRfqOption('${newRfqNo}')">
            <div>
                <input type="radio" name="rfqGroup" value="${newRfqNo}" ${isNewSelected ? 'checked' : ''}>
                <span class="rfq-label">新しい見積依頼Noを作成</span>
            </div>
            <div class="rfq-info">${newRfqNo} として登録</div>
        </div>
    `;

    container.innerHTML = optionsHtml;
}

// 見積依頼No選択
function selectRfqOption(rfqNo) {
    // すべてのオプションから selected クラスを削除
    document.querySelectorAll('.rfq-grouping-option').forEach(option => {
        option.classList.remove('selected');
    });

    // クリックされたオプションに selected クラスを追加
    event.currentTarget.classList.add('selected');

    // ラジオボタンをチェック
    const radio = event.currentTarget.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = true;
    }
}

// 新しい見積依頼Noを生成（id-generator-helper.jsの関数を使用）
// 削除: 共通ヘルパーに統合
function generateNewRfqNo() {
    return window.IdGenerator.generateRfqNo(rfqRecords);
}

// 申請編集を保存
function saveApplicationEdit() {
    if (currentEditingApplicationId === null) return;

    const selectedRfq = document.querySelector('input[name="rfqGroup"]:checked');
    if (!selectedRfq) {
        alert('見積依頼Noを選択してください');
        return;
    }

    const app = applicationListData.find(a => a.id === currentEditingApplicationId);
    if (app) {
        app.rfqNo = selectedRfq.value;

        // テーブルを再レンダリング
        renderApplicationTable();

        alert('見積依頼Noを更新しました');
        closeApplicationEditModal();
    }
}

// 申請編集モーダルを閉じる
function closeApplicationEditModal() {
    document.getElementById('applicationEditModal').classList.remove('active');
    currentEditingApplicationId = null;
}

// 申請編集モーダルの枠外クリック
function handleEditModalOutsideClick(event) {
    if (event.target.id === 'applicationEditModal') {
        if (confirm('編集内容が失われますが、閉じてもよろしいですか？')) {
            closeApplicationEditModal();
        }
    }
}

// 申請削除
function deleteApplication(id) {
    const app = applicationListData.find(a => a.id === id);
    if (!app) return;

    if (confirm(`申請番号 ${app.applicationNo} を削除してもよろしいですか？`)) {
        applicationListData = applicationListData.filter(a => a.id !== id);
        filterApplications();
        alert('申請を削除しました');
    }
}

// チェックボックス選択管理
function toggleApplicationSelection(id) {
    if (selectedApplicationIds.has(id)) {
        selectedApplicationIds.delete(id);
    } else {
        selectedApplicationIds.add(id);
    }
    updateBulkOperationBar();
    updateSelectAllCheckbox();
}

// 全選択チェックボックス
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllApplications');

    if (selectAllCheckbox.checked) {
        // 全選択
        filteredApplicationListData.forEach(app => {
            selectedApplicationIds.add(app.id);
        });
    } else {
        // 全解除
        selectedApplicationIds.clear();
    }

    renderApplicationTable();
    updateBulkOperationBar();
}

// 全選択チェックボックスの状態を更新
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllApplications');
    if (!selectAllCheckbox) return;

    const visibleIds = filteredApplicationListData.map(app => app.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedApplicationIds.has(id));

    selectAllCheckbox.checked = allSelected;
}

// 一括操作バーの表示更新
function updateBulkOperationBar() {
    const bulkBar = document.getElementById('bulkOperationBar');
    const countElement = document.getElementById('bulkSelectionCount');

    if (selectedApplicationIds.size > 0) {
        bulkBar.classList.add('active');
        countElement.textContent = `${selectedApplicationIds.size}件選択中`;
    } else {
        bulkBar.classList.remove('active');
    }
}

// 選択解除
function clearSelection() {
    selectedApplicationIds.clear();
    renderApplicationTable();
    updateBulkOperationBar();
    updateSelectAllCheckbox();
}

// 見積グルーピングモーダルを開く
function openRfqGroupingModal() {
    if (selectedApplicationIds.size === 0) {
        alert('申請を選択してください');
        return;
    }

    const selectedApps = applicationListData.filter(app => selectedApplicationIds.has(app.id));

    // 選択した申請のリストを表示
    const listHtml = selectedApps.map(app => `
        <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #ddd;">
            <div><strong>${app.applicationNo}</strong> - ${app.asset.name}</div>
            <div>${app.quantity}</div>
        </div>
    `).join('');

    document.getElementById('selectedApplicationsList').innerHTML = listHtml;

    // 見積依頼Noを自動生成
    const newRfqNo = window.IdGenerator.generateRfqNo(rfqRecords);
    document.getElementById('newRfqNo').value = newRfqNo;
    document.getElementById('newRfqVendor').value = '';

    document.getElementById('rfqGroupingModal').classList.add('active');
}

// 見積グルーピングモーダルを閉じる
function closeRfqGroupingModal() {
    document.getElementById('rfqGroupingModal').classList.remove('active');
}

// モーダル外クリック
function handleRfqGroupingModalOutsideClick(event) {
    if (event.target.id === 'rfqGroupingModal') {
        if (confirm('入力内容が失われますが、閉じてもよろしいですか？')) {
            closeRfqGroupingModal();
        }
    }
}

// 見積依頼を作成して申請に紐付け
function createRfqAndAssign() {
    const rfqNo = document.getElementById('newRfqNo').value;
    const vendor = document.getElementById('newRfqVendor').value.trim();

    if (!vendor) {
        alert('購入先店舗を入力してください');
        return;
    }

    if (selectedApplicationIds.size === 0) {
        alert('申請を選択してください');
        return;
    }

    // 見積依頼レコードを作成
    const newRfqRecord = {
        rfqNo: rfqNo,
        vendor: vendor,
        createdDate: new Date().toISOString().split('T')[0],
        status: '依頼書作成待',
        applicationIds: Array.from(selectedApplicationIds),
        totalAmount: null
    };

    rfqRecords.push(newRfqRecord);

    // グローバル変数を更新
    window.rfqRecords = rfqRecords;

    // 選択した申請に見積依頼Noと購入先を設定
    applicationListData.forEach(app => {
        if (selectedApplicationIds.has(app.id)) {
            app.rfqNo = rfqNo;
            app.vendor = vendor;
        }
    });

    alert(`見積依頼を作成しました\n\n見積依頼No: ${rfqNo}\n購入先店舗: ${vendor}\n紐付け申請数: ${selectedApplicationIds.size}件`);

    // 選択をクリアして画面を更新
    clearSelection();
    closeRfqGroupingModal();
    renderApplicationTable();

    console.log('見積依頼レコード:', rfqRecords);
}

// 見積依頼一覧への遷移
function goToRfqListFromApplication() {
    document.getElementById('applicationListPage').classList.remove('active');
    document.getElementById('rfqListPage').classList.add('active');

    // 見積依頼一覧を初期化
    if (typeof window.initRfqListPage === 'function') {
        window.initRfqListPage();
    }
}

// 戻るボタン
function handleBackFromApplicationList() {
    if (confirm('資産検索画面に戻りますか？')) {
        document.getElementById('applicationListPage').classList.remove('active');
        document.getElementById('searchResultPage').classList.add('active');
    }
}

// グローバルに公開
window.applicationListData = applicationListData;
window.rfqRecords = rfqRecords;
window.initApplicationListPage = initApplicationListPage;
window.filterApplications = filterApplications;
window.clearFilters = clearFilters;
window.showApplicationDetail = showApplicationDetail;
window.closeApplicationDetailModal = closeApplicationDetailModal;
window.handleDetailModalOutsideClick = handleDetailModalOutsideClick;
window.editApplication = editApplication;
window.selectRfqOption = selectRfqOption;
window.saveApplicationEdit = saveApplicationEdit;
window.closeApplicationEditModal = closeApplicationEditModal;
window.handleEditModalOutsideClick = handleEditModalOutsideClick;
window.deleteApplication = deleteApplication;
window.toggleApplicationSelection = toggleApplicationSelection;
window.toggleSelectAll = toggleSelectAll;
window.clearSelection = clearSelection;
window.openRfqGroupingModal = openRfqGroupingModal;
window.closeRfqGroupingModal = closeRfqGroupingModal;
window.handleRfqGroupingModalOutsideClick = handleRfqGroupingModalOutsideClick;
window.createRfqAndAssign = createRfqAndAssign;
window.goToRfqListFromApplication = goToRfqListFromApplication;
window.handleBackFromApplicationList = handleBackFromApplicationList;

// ナビゲーションメニューの制御
function toggleNavMenu() {
    const btn = document.querySelector('.application-list-page .nav-menu-btn');
    const menu = document.querySelector('.application-list-page .nav-menu-dropdown');

    if (!btn || !menu) return;

    const isActive = menu.classList.contains('active');

    if (!isActive) {
        btn.classList.add('active');
        menu.classList.add('active');
    } else {
        btn.classList.remove('active');
        menu.classList.remove('active');
    }
}

// ドロップダウンメニューの外側クリックで閉じる
document.addEventListener('click', function(event) {
    if (!event.target.closest('.nav-menu')) {
        const btn = document.querySelector('.application-list-page .nav-menu-btn');
        const menu = document.querySelector('.application-list-page .nav-menu-dropdown');
        if (btn) btn.classList.remove('active');
        if (menu) menu.classList.remove('active');
    }
});

window.toggleNavMenu = toggleNavMenu;
