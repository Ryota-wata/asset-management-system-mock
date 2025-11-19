/**
 * 見積依頼一覧画面のJavaScript
 */

// サンプルデータ
let rfqListData = [
    {
        id: 1,
        rfqNo: 'RFQ-2025-0001',
        vendor: '〇〇〇〇商事',
        requestDate: '2025-01-15',
        status: '見積待ち',
        applicationCount: 3,
        applications: [
            { applicationNo: 'APP-2025-0001', assetName: '電気手術用電源装置2システム' },
            { applicationNo: 'APP-2025-0002', assetName: '医科歯科用洗浄器' },
            { applicationNo: 'APP-2025-0005', assetName: '超音波診断装置' }
        ]
    },
    {
        id: 2,
        rfqNo: 'RFQ-2025-0002',
        vendor: '△△△△メディカル',
        requestDate: '2025-01-16',
        status: '見積受領',
        applicationCount: 2,
        applications: [
            { applicationNo: 'APP-2025-0003', assetName: 'CT関連機器' },
            { applicationNo: 'APP-2025-0004', assetName: 'MRI装置' }
        ]
    },
    {
        id: 3,
        rfqNo: 'RFQ-2025-0003',
        vendor: '□□□□株式会社',
        requestDate: '2025-01-17',
        status: '見積待ち',
        applicationCount: 1,
        applications: [
            { applicationNo: 'APP-2025-0006', assetName: 'X線撮影装置' }
        ]
    },
    {
        id: 4,
        rfqNo: 'RFQ-2025-0004',
        vendor: '◇◇◇◇医療機器',
        requestDate: '2025-01-18',
        status: '見積受領',
        applicationCount: 4,
        applications: [
            { applicationNo: 'APP-2025-0007', assetName: '内視鏡システム' },
            { applicationNo: 'APP-2025-0008', assetName: '人工呼吸器' },
            { applicationNo: 'APP-2025-0009', assetName: '心電計' },
            { applicationNo: 'APP-2025-0010', assetName: '輸液ポンプ' }
        ]
    }
];

let filteredRfqListData = [...rfqListData];

// 初期化
function initRfqListPage() {
    console.log('=== Initializing RFQ List Page ===');

    renderRfqListTable();
    updateRfqCount();
}

// テーブル表示
function renderRfqListTable() {
    const tbody = document.getElementById('rfqListTableBody');

    if (!tbody) {
        console.error('rfqListTableBody not found');
        return;
    }

    if (filteredRfqListData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">見積依頼がありません</div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredRfqListData.map(rfq => {
        const statusBadgeClass = rfq.status === '見積受領' ? 'status-received' : 'status-waiting';

        return `
            <tr>
                <td><strong>${rfq.rfqNo}</strong></td>
                <td>${rfq.vendor}</td>
                <td>${rfq.requestDate}</td>
                <td>
                    <span class="rfq-status-badge ${statusBadgeClass}">
                        ${rfq.status}
                    </span>
                </td>
                <td>${rfq.applicationCount}件</td>
                <td>
                    <button class="table-btn primary" onclick="viewRfqDetail(${rfq.id})">詳細</button>
                    ${rfq.status === '見積受領' ? '<button class="table-btn success" onclick="processQuotation(${rfq.id})">見積処理</button>' : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// 件数更新
function updateRfqCount() {
    const countElement = document.getElementById('rfqCount');
    if (countElement) {
        countElement.textContent = `${filteredRfqListData.length}件`;
    }
}

// 詳細表示
function viewRfqDetail(rfqId) {
    const rfq = rfqListData.find(r => r.id === rfqId);
    if (!rfq) return;

    alert(`見積依頼詳細\n\n見積依頼No: ${rfq.rfqNo}\n購入先店舗: ${rfq.vendor}\n申請件数: ${rfq.applicationCount}件`);
}

// 見積処理
function processQuotation(rfqId) {
    const rfq = rfqListData.find(r => r.id === rfqId);
    if (!rfq) return;

    alert(`見積処理画面へ遷移します\n見積依頼No: ${rfq.rfqNo}`);
}

// 戻るボタン
function handleBackFromRfqList() {
    if (window.PageNavigationHelper) {
        window.PageNavigationHelper.showPage('mainContainer');
    } else {
        document.getElementById('rfqListPage').classList.remove('active');
        document.getElementById('mainContainer').classList.add('active');
    }
}

// グローバルスコープに公開
window.rfqListData = rfqListData;
window.initRfqListPage = initRfqListPage;
window.handleBackFromRfqList = handleBackFromRfqList;
window.viewRfqDetail = viewRfqDetail;
window.processQuotation = processQuotation;
