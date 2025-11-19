/**
 * 見積書管理画面のJavaScript
 */

// グローバル変数
let quotationDocuments = [
    {
        id: 'Q-1737000000001',
        rfqNo: 'RFQ-2025-0001',
        vendor: '〇〇〇〇商事',
        quotationDate: '2025-01-18',
        uploadDate: '2025-01-18',
        filename: '見積書_RFQ-2025-0001_〇〇〇〇商事.pdf',
        processingStatus: '未処理'
    },
    {
        id: 'Q-1737000000002',
        rfqNo: 'RFQ-2025-0002',
        vendor: '△△△△メディカル',
        quotationDate: '2025-01-17',
        uploadDate: '2025-01-17',
        filename: '見積書_RFQ-2025-0002_△△△△メディカル.pdf',
        processingStatus: 'OCR完了'
    },
    {
        id: 'Q-1737000000003',
        rfqNo: 'RFQ-2025-0004',
        vendor: '◇◇◇◇医療機器',
        quotationDate: '2025-01-19',
        uploadDate: '2025-01-19',
        filename: '見積書_RFQ-2025-0004_◇◇◇◇医療機器.pdf',
        processingStatus: '紐付け完了'
    },
    {
        id: 'Q-1737000000004',
        rfqNo: 'RFQ-2025-0001',
        vendor: '〇〇〇〇商事',
        quotationDate: '2025-01-20',
        uploadDate: '2025-01-20',
        filename: '見積書_改訂版_RFQ-2025-0001_〇〇〇〇商事.pdf',
        processingStatus: '未処理'
    }
];

// 初期化
function initQuotationDataBoxPage() {
    console.log('=== Initializing Quotation DataBox Page ===');

    // 見積書を見積依頼No.ごとにグループ化して表示
    renderQuotationsByRfq();
    updateQuotationCount();
}

// 見積書を一つのテーブルで表示
function renderQuotationsByRfq() {
    const container = document.getElementById('quotationsByRfqContainer');

    if (!container) {
        console.error('quotationsByRfqContainer not found');
        return;
    }

    if (quotationDocuments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">見積書がアップロードされていません</div>
                <div class="empty-subtext">「見積書アップロード」ボタンから追加してください</div>
            </div>
        `;
        return;
    }

    // 単一テーブルで全ての見積書を表示
    container.innerHTML = `
        <div class="quotation-table-wrapper">
            <table class="data-table quotation-table">
                <thead>
                    <tr>
                        <th style="width: 150px;">見積依頼No</th>
                        <th style="width: 200px;">業者名</th>
                        <th style="width: 120px;">ステータス</th>
                        <th style="width: 120px;">見積日</th>
                        <th style="width: 120px;">アップロード</th>
                        <th>ファイル名</th>
                        <th style="width: 300px;">操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${quotationDocuments.map(q => createQuotationTableRow(q)).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// 見積書テーブル行を生成
function createQuotationTableRow(quotation) {
    const statusClass = getStatusClass(quotation.processingStatus || '未処理');
    const statusText = quotation.processingStatus || '未処理';
    const statusIcon = getStatusIcon(quotation.processingStatus || '未処理');

    return `
        <tr>
            <td><strong>${quotation.rfqNo}</strong></td>
            <td>${quotation.vendor || '業者名未設定'}</td>
            <td>
                <span class="quotation-status-badge ${statusClass}">
                    ${statusIcon} ${statusText}
                </span>
            </td>
            <td>${quotation.quotationDate}</td>
            <td>${quotation.uploadDate}</td>
            <td class="quotation-filename">${quotation.filename}</td>
            <td>
                <div class="quotation-actions">
                    ${getActionButtons(quotation)}
                </div>
            </td>
        </tr>
    `;
}

// 処理状態に応じたクラスを返す
function getStatusClass(status) {
    const statusMap = {
        '未処理': 'status-pending',
        'OCR完了': 'status-ocr-done',
        '紐付け完了': 'status-completed'
    };
    return statusMap[status] || 'status-pending';
}

// 処理状態に応じたアイコンを返す
function getStatusIcon(status) {
    const iconMap = {
        '未処理': '⏳',
        'OCR完了': '🤖',
        '紐付け完了': '✅'
    };
    return iconMap[status] || '⏳';
}

// アクションボタンを生成
function getActionButtons(quotation) {
    const status = quotation.processingStatus || '未処理';
    let buttons = '';

    if (status === '未処理') {
        buttons += `<button class="table-btn primary" onclick="startProcessing('${quotation.id}')">処理開始</button>`;
    } else if (status === 'OCR完了') {
        buttons += `<button class="table-btn primary" onclick="continueProcessing('${quotation.id}')">処理を続ける</button>`;
    } else if (status === '紐付け完了') {
        buttons += `<button class="table-btn primary" onclick="continueProcessing('${quotation.id}')">詳細確認</button>`;
        buttons += `<button class="table-btn success" onclick="viewProcessingResult('${quotation.id}')">出力</button>`;
    }

    buttons += `<button class="table-btn secondary" onclick="deleteQuotation('${quotation.id}')">削除</button>`;

    return buttons;
}

// 処理開始（見積処理画面へ遷移）
function startProcessing(quotationId) {
    console.log('Processing started for:', quotationId);

    // 見積書管理画面を非表示
    document.getElementById('quotationDataBoxPage').classList.remove('active');

    // 見積処理画面を表示
    document.getElementById('quotationProcessingPage').classList.add('active');

    // 見積処理画面を初期化
    if (typeof window.initQuotationProcessingPage === 'function') {
        window.initQuotationProcessingPage(quotationId);
    }
}

// 処理を続ける
function continueProcessing(quotationId) {
    console.log('Continue processing:', quotationId);

    // 処理開始と同じ（途中から再開）
    startProcessing(quotationId);
}

// 処理結果を表示（発注書・検収書出力）
function viewProcessingResult(quotationId) {
    console.log('View result:', quotationId);
    const quotation = quotationDocuments.find(q => q.id === quotationId);
    if (!quotation) return;

    showOutputModal(quotation);
}

// 見積書削除
function deleteQuotation(quotationId) {
    const quotation = quotationDocuments.find(q => q.id === quotationId);
    if (!quotation) return;

    if (confirm(`見積書を削除しますか？\n\nファイル: ${quotation.filename}\n見積依頼No: ${quotation.rfqNo}`)) {
        quotationDocuments = quotationDocuments.filter(q => q.id !== quotationId);
        window.quotationDocuments = quotationDocuments;

        renderQuotationsByRfq();
        updateQuotationCount();

        alert('見積書を削除しました');
    }
}

// 見積書件数を更新
function updateQuotationCount() {
    const countElem = document.getElementById('quotationCount');
    if (countElem) {
        countElem.textContent = `${quotationDocuments.length}件`;
    }
}

// 見積書アップロードモーダルを開く
function showUploadQuotationModal() {
    document.getElementById('uploadQuotationModal').classList.add('active');
}

// 見積書アップロードモーダルを閉じる
function closeUploadQuotationModal() {
    document.getElementById('uploadQuotationModal').classList.remove('active');
    document.getElementById('uploadQuotationForm').reset();
}

// モーダル外クリック
function handleUploadModalOutsideClick(event) {
    if (event.target.id === 'uploadQuotationModal') {
        closeUploadQuotationModal();
    }
}

// 見積依頼選択モーダルを開く
function showRfqSelectModal() {
    renderRfqSelectTable();
    document.getElementById('rfqSelectModal').classList.add('active');
}

// 見積依頼選択モーダルを閉じる
function closeRfqSelectModal() {
    document.getElementById('rfqSelectModal').classList.remove('active');
}

// 見積依頼選択モーダル外側クリック
function handleRfqSelectModalOutsideClick(event) {
    if (event.target.id === 'rfqSelectModal') {
        closeRfqSelectModal();
    }
}

// 見積依頼選択テーブルを描画
function renderRfqSelectTable() {
    const tbody = document.getElementById('rfqSelectTableBody');
    if (!tbody) return;

    if (!window.rfqRecords || window.rfqRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">見積依頼がありません</td></tr>';
        return;
    }

    tbody.innerHTML = window.rfqRecords.map(rfq => {
        const applicationCount = rfq.applicationIds ? rfq.applicationIds.length : 0;
        const statusBadge = getStatusBadge(rfq.status || '依頼書作成待');

        return `
            <tr>
                <td>
                    <button class="table-btn primary" onclick="selectRfq('${rfq.rfqNo}', '${rfq.vendor}')">選択</button>
                </td>
                <td><strong>${rfq.rfqNo}</strong></td>
                <td>${rfq.vendor || '業者名未設定'}</td>
                <td>${rfq.createdDate || '-'}</td>
                <td class="text-center">${applicationCount}件</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join('');
}

// 見積依頼を選択
function selectRfq(rfqNo, vendor) {
    // hiddenフィールドに値を設定
    document.getElementById('uploadRfqNo').value = rfqNo;
    document.getElementById('uploadVendor').value = vendor;

    // 表示エリアを更新
    const infoContainer = document.getElementById('rfqSelectedInfo');
    infoContainer.innerHTML = `
        <div class="rfq-info-selected">
            <div class="rfq-info-row">
                <span class="rfq-info-label">見積依頼No:</span>
                <span class="rfq-info-value">${rfqNo}</span>
            </div>
            <div class="rfq-info-row">
                <span class="rfq-info-label">業者名:</span>
                <span class="rfq-info-value">${vendor}</span>
            </div>
        </div>
    `;

    // モーダルを閉じる
    closeRfqSelectModal();
}

// ステータスバッジ取得（見積依頼用）
function getStatusBadge(status) {
    const statusMap = {
        '依頼書作成待': { class: 'status-pending', text: '依頼書作成待' },
        '見積依頼済': { class: 'status-requested', text: '見積依頼済' },
        '見積回答待': { class: 'status-waiting', text: '見積回答待' },
        '見積回答済': { class: 'status-replied', text: '見積回答済' }
    };

    const badge = statusMap[status] || { class: 'status-pending', text: status };
    return `<span class="status-badge ${badge.class}">${badge.text}</span>`;
}

// 見積書アップロード処理
function handleUploadQuotation(event) {
    event.preventDefault();

    const rfqNo = document.getElementById('uploadRfqNo').value;
    const vendor = document.getElementById('uploadVendor').value;
    const file = document.getElementById('uploadFile').files[0];

    if (!rfqNo || !vendor) {
        alert('見積依頼を選択してください');
        return;
    }

    // 現在日付を取得
    const today = new Date().toISOString().split('T')[0];

    // 新しい見積書を追加
    const newQuotation = {
        id: `Q-${Date.now()}`,
        rfqNo: rfqNo,
        vendor: vendor,
        quotationDate: today,
        uploadDate: today,
        filename: file ? file.name : `見積書_${rfqNo}_${today}.pdf`,
        processingStatus: '未処理'
    };

    quotationDocuments.push(newQuotation);
    window.quotationDocuments = quotationDocuments;

    // 表示を更新
    renderQuotationsByRfq();
    updateQuotationCount();

    // モーダルを閉じる
    closeUploadQuotationModal();

    alert('見積書を登録しました');
}

// 戻るボタン
function handleBackFromDataBox() {
    document.getElementById('quotationDataBoxPage').classList.remove('active');
    document.getElementById('searchResultPage').classList.add('active');
}

// 発注書・検収書出力モーダルを表示
function showOutputModal(quotation) {
    // モーダルの情報を設定
    document.getElementById('outputModalRfqNo').textContent = quotation.rfqNo;
    document.getElementById('outputModalVendor').textContent = quotation.vendor || '業者名未設定';

    // モーダルを表示
    document.getElementById('outputModal').classList.add('active');
}

function closeOutputModal() {
    document.getElementById('outputModal').classList.remove('active');
}

function handleOutputModalOutsideClick(event) {
    if (event.target.id === 'outputModal') {
        closeOutputModal();
    }
}

// 発注書を生成
function generatePurchaseOrder() {
    alert('発注書をExcel形式で出力します（実装予定）');
    // TODO: 発注書のExcel出力を実装
}

// 検収書を生成
function generateInspectionReport() {
    alert('検収書をExcel形式で出力します（実装予定）');
    // TODO: 検収書のExcel出力を実装
}

// グローバルに公開
window.quotationDocuments = quotationDocuments;
window.initQuotationDataBoxPage = initQuotationDataBoxPage;
window.showUploadQuotationModal = showUploadQuotationModal;
window.closeUploadQuotationModal = closeUploadQuotationModal;
window.handleUploadModalOutsideClick = handleUploadModalOutsideClick;
window.handleUploadQuotation = handleUploadQuotation;
window.showRfqSelectModal = showRfqSelectModal;
window.closeRfqSelectModal = closeRfqSelectModal;
window.handleRfqSelectModalOutsideClick = handleRfqSelectModalOutsideClick;
window.selectRfq = selectRfq;
window.startProcessing = startProcessing;
window.continueProcessing = continueProcessing;
window.viewProcessingResult = viewProcessingResult;
window.deleteQuotation = deleteQuotation;
window.handleBackFromDataBox = handleBackFromDataBox;
window.showOutputModal = showOutputModal;
window.closeOutputModal = closeOutputModal;
window.handleOutputModalOutsideClick = handleOutputModalOutsideClick;
window.generatePurchaseOrder = generatePurchaseOrder;
window.generateInspectionReport = generateInspectionReport;
