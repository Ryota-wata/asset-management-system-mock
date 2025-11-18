/**
 * 見積依頼一覧画面のJavaScript
 */

// グローバル変数
let rfqListData = [];
let filteredRfqListData = [];
let currentRfqDetail = null;

// 見積依頼一覧のデータを生成
function generateRfqListData() {
    // rfqRecordsから直接取得
    if (typeof window.rfqRecords === 'undefined') {
        return [];
    }

    return window.rfqRecords.map(rfq => {
        // 紐づく申請を取得
        const applications = window.applicationListData.filter(app =>
            rfq.applicationIds.includes(app.id)
        );

        return {
            rfqNo: rfq.rfqNo,
            vendor: rfq.vendor,
            createdDate: rfq.createdDate,
            status: rfq.status,
            applications: applications,
            applicationCount: applications.length,
            totalAmount: rfq.totalAmount
        };
    });
}

// 初期化
function initRfqListPage() {
    console.log('=== Initializing RFQ List Page ===');

    // 見積依頼データを生成
    rfqListData = generateRfqListData();
    filteredRfqListData = [...rfqListData];

    // テーブルをレンダリング
    renderRfqTable();
    updateRfqCount();
}

// テーブルをレンダリング
function renderRfqTable() {
    const tbody = document.getElementById('rfqTableBody');

    if (!tbody) {
        console.error('rfqTableBody not found');
        return;
    }

    if (filteredRfqListData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="rfq-empty-state">
                    <div class="rfq-empty-state-icon">📋</div>
                    <div class="rfq-empty-state-text">見積依頼がありません</div>
                    <div class="rfq-empty-state-subtext">申請一覧画面で見積依頼Noを付与してください</div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredRfqListData.map(rfq => {
        const statusBadge = window.BadgeHelper.getRfqStatusBadge(rfq.status);
        const amountDisplay = rfq.totalAmount
            ? `<span class="total-amount">¥${rfq.totalAmount.toLocaleString()}</span>`
            : '<span class="total-amount not-calculated">未算出</span>';

        // アクションボタン
        let actionButtons = `<button class="rfq-action-btn detail" onclick="showRfqDetail('${rfq.rfqNo}')">詳細</button>`;
        actionButtons += `<button class="rfq-action-btn databox" onclick="goToQuotationDataBox()">見積DataBox</button>`;

        return `
            <tr>
                <td><span class="rfq-number">${rfq.rfqNo}</span></td>
                <td>${rfq.createdDate}</td>
                <td>${rfq.vendor}</td>
                <td><span class="application-count-badge">${rfq.applicationCount}件</span></td>
                <td>${amountDisplay}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="rfq-action-buttons">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// RFQ状態バッジを取得（badge-helper.jsの関数を使用）
// 削除: 共通ヘルパーに統合

// 件数を更新
function updateRfqCount() {
    const countElement = document.getElementById('rfqCount');
    if (countElement) {
        countElement.textContent = `${filteredRfqListData.length}件`;
    }
}

// フィルタリング
function filterRfqList() {
    const filterVendor = document.getElementById('filterVendor').value.trim().toLowerCase();
    const filterStatus = document.getElementById('filterRfqStatus').value;
    const filterDateFrom = document.getElementById('filterRfqDateFrom').value;
    const filterDateTo = document.getElementById('filterRfqDateTo').value;

    filteredRfqListData = rfqListData.filter(rfq => {
        // 購入先店舗フィルター
        if (filterVendor && !rfq.vendor.toLowerCase().includes(filterVendor)) return false;

        // 状態フィルター
        if (filterStatus && rfq.status !== filterStatus) return false;

        // 依頼日フィルター
        if (filterDateFrom && rfq.createdDate < filterDateFrom) return false;
        if (filterDateTo && rfq.createdDate > filterDateTo) return false;

        return true;
    });

    renderRfqTable();
    updateRfqCount();
}

// フィルタークリア
function clearRfqFilters() {
    document.getElementById('filterVendor').value = '';
    document.getElementById('filterRfqStatus').value = '';
    document.getElementById('filterRfqDateFrom').value = '';
    document.getElementById('filterRfqDateTo').value = '';

    filterRfqList();
}

// 見積依頼詳細を表示
function showRfqDetail(rfqNo) {
    const rfq = rfqListData.find(r => r.rfqNo === rfqNo);
    if (!rfq) return;

    currentRfqDetail = rfq;

    const content = document.getElementById('rfqDetailContent');

    // 紐づく申請のテーブルHTML
    const applicationsTableHtml = `
        <table class="rfq-applications-table">
            <thead>
                <tr>
                    <th>申請番号</th>
                    <th>品目</th>
                    <th>数量</th>
                    <th>申請日</th>
                    <th>状態</th>
                </tr>
            </thead>
            <tbody>
                ${rfq.applications.map(app => `
                    <tr>
                        <td><strong>${app.applicationNo}</strong></td>
                        <td>${app.asset.name}</td>
                        <td>${app.quantity}</td>
                        <td>${app.applicationDate}</td>
                        <td>${window.BadgeHelper.getApplicationStatusBadge(app.status)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    content.innerHTML = `
        <div class="rfq-detail-section">
            <div class="rfq-detail-section-title">📋 見積依頼情報</div>
            <div class="rfq-detail-row">
                <div class="label">見積依頼No</div>
                <div class="value"><strong>${rfq.rfqNo}</strong></div>
            </div>
            <div class="rfq-detail-row">
                <div class="label">購入先店舗</div>
                <div class="value">${rfq.vendor}</div>
            </div>
            <div class="rfq-detail-row">
                <div class="label">依頼日</div>
                <div class="value">${rfq.createdDate}</div>
            </div>
            <div class="rfq-detail-row">
                <div class="label">状態</div>
                <div class="value">${window.BadgeHelper.getRfqStatusBadge(rfq.status)}</div>
            </div>
            <div class="rfq-detail-row">
                <div class="label">申請件数</div>
                <div class="value"><span class="application-count-badge">${rfq.applicationCount}件</span></div>
            </div>
            ${rfq.totalAmount ? `
            <div class="rfq-detail-row">
                <div class="label">合計金額</div>
                <div class="value"><span class="total-amount">¥${rfq.totalAmount.toLocaleString()}</span></div>
            </div>
            ` : ''}
        </div>

        <div class="rfq-detail-section">
            <div class="rfq-detail-section-title">📦 紐づく申請一覧</div>
            ${applicationsTableHtml}
        </div>

        ${rfq.status === '見積登録済' || rfq.status === '承認済' ? `
        <div class="rfq-detail-section">
            <div class="rfq-detail-section-title">📄 見積書情報</div>
            <div class="rfq-detail-row">
                <div class="label">見積書ファイル</div>
                <div class="value">quotation_${rfq.rfqNo}.pdf <button class="rfq-action-btn" onclick="alert('プレビュー機能は未実装')">プレビュー</button></div>
            </div>
            <div class="rfq-detail-row">
                <div class="label">登録日</div>
                <div class="value">${rfq.createdDate}</div>
            </div>
        </div>
        ` : `
        <div class="rfq-detail-section">
            <div class="rfq-detail-section-title">📄 見積書情報</div>
            <div style="text-align: center; padding: 20px; color: #95a5a6;">
                見積書は未登録です
            </div>
        </div>
        `}
    `;

    // ボタンの表示制御
    const pdfBtn = document.getElementById('generateRfqPdfBtn');
    const registerBtn = document.getElementById('registerQuotationBtn');

    if (rfq.status === '依頼書作成待') {
        pdfBtn.style.display = 'block';
        registerBtn.style.display = 'none';
    } else if (rfq.status === '見積依頼済') {
        pdfBtn.style.display = 'none';
        registerBtn.style.display = 'block';
    } else {
        pdfBtn.style.display = 'none';
        registerBtn.style.display = 'none';
    }

    document.getElementById('rfqDetailModal').classList.add('active');
}

// 申請状態バッジを取得（badge-helper.jsの関数を使用）
// 削除: 共通ヘルパーに統合

// 見積依頼詳細モーダルを閉じる
function closeRfqDetailModal() {
    document.getElementById('rfqDetailModal').classList.remove('active');
    currentRfqDetail = null;
}

// モーダル外クリック
function handleRfqDetailModalOutsideClick(event) {
    if (event.target.id === 'rfqDetailModal') {
        closeRfqDetailModal();
    }
}

// 依頼書PDF生成（詳細モーダルから）
function generateRfqPdf() {
    if (!currentRfqDetail) return;
    generateRfqPdfDirect(currentRfqDetail.rfqNo);
}

// 依頼書PDF生成（直接）
function generateRfqPdfDirect(rfqNo) {
    const rfq = rfqListData.find(r => r.rfqNo === rfqNo);
    if (!rfq) return;

    if (confirm(`${rfq.rfqNo} の見積依頼書PDFを生成しますか？\n\n購入先: ${rfq.vendor}\n申請件数: ${rfq.applicationCount}件`)) {
        alert(`見積依頼書PDFを生成しました\n\nファイル名: request_${rfq.rfqNo}.pdf\n\n※実際のシステムでは、PDFダウンロードまたはプレビューが表示されます`);

        // 状態を「見積依頼済」に更新
        rfq.status = '見積依頼済';
        renderRfqTable();

        if (currentRfqDetail && currentRfqDetail.rfqNo === rfqNo) {
            closeRfqDetailModal();
        }
    }
}

// 見積書登録（詳細モーダルから） - 廃止（新フローでは使用しない）
function registerQuotation() {
    alert('この機能は新しいフローでは使用されません。\n見積DataBoxから見積書をアップロードしてください。');
}

// 見積明細DataBOX画面への遷移
function goToQuotationDataBox() {
    document.getElementById('rfqListPage').classList.remove('active');
    document.getElementById('quotationDataBoxPage').classList.add('active');

    // 見積明細DataBOX画面を初期化
    if (typeof window.initQuotationDataBoxPage === 'function') {
        window.initQuotationDataBoxPage();
    }
}

// 承認依頼
function requestApproval(rfqNo) {
    const rfq = rfqListData.find(r => r.rfqNo === rfqNo);
    if (!rfq) return;

    if (confirm(`${rfq.rfqNo} の見積内容を承認依頼しますか？\n\n購入先: ${rfq.vendor}\n合計金額: ¥${rfq.totalAmount?.toLocaleString()}`)) {
        alert('承認依頼を送信しました');

        // 状態を「承認済」に更新（本来は承認フロー後）
        rfq.status = '承認済';
        renderRfqTable();
    }
}

// 申請一覧への遷移
function goToApplicationListFromRfq() {
    document.getElementById('rfqListPage').classList.remove('active');
    document.getElementById('applicationListPage').classList.add('active');

    // 申請一覧を再初期化
    if (typeof window.initApplicationListPage === 'function') {
        window.initApplicationListPage();
    }
}

// 戻るボタン
function handleBackFromRfqList() {
    if (confirm('資産検索画面に戻りますか？')) {
        document.getElementById('rfqListPage').classList.remove('active');
        document.getElementById('searchResultPage').classList.add('active');
    }
}

// グローバルに公開
window.initRfqListPage = initRfqListPage;
window.filterRfqList = filterRfqList;
window.clearRfqFilters = clearRfqFilters;
window.showRfqDetail = showRfqDetail;
window.closeRfqDetailModal = closeRfqDetailModal;
window.handleRfqDetailModalOutsideClick = handleRfqDetailModalOutsideClick;
window.generateRfqPdf = generateRfqPdf;
window.generateRfqPdfDirect = generateRfqPdfDirect;
window.registerQuotation = registerQuotation;
window.goToQuotationDataBox = goToQuotationDataBox;
window.requestApproval = requestApproval;
window.goToApplicationListFromRfq = goToApplicationListFromRfq;
window.handleBackFromRfqList = handleBackFromRfqList;
