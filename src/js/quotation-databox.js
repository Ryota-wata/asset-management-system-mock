/**
 * 見積書管理画面のJavaScript
 */

// グローバル変数
let quotationDocuments = [];

// 初期化
function initQuotationDataBoxPage() {
    console.log('=== Initializing Quotation DataBox Page ===');

    // サンプルデータからquotationDocumentsを取得
    if (window.quotationDocuments && window.quotationDocuments.length > 0) {
        quotationDocuments = [...window.quotationDocuments];
    }

    // 見積書を見積依頼No.ごとにグループ化して表示
    renderQuotationsByRfq();
    updateQuotationCount();

    // アップロードモーダルの見積依頼No.選択肢を生成
    populateRfqSelect();
}

// 見積書を見積依頼No.ごとにグループ化して表示
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

    // 見積依頼No.ごとにグループ化
    const groupedByRfq = {};
    quotationDocuments.forEach(q => {
        if (!groupedByRfq[q.rfqNo]) {
            groupedByRfq[q.rfqNo] = [];
        }
        groupedByRfq[q.rfqNo].push(q);
    });

    // グループごとにセクションを生成
    let html = '';
    Object.keys(groupedByRfq).sort().forEach(rfqNo => {
        const quotations = groupedByRfq[rfqNo];
        html += createRfqSection(rfqNo, quotations);
    });

    container.innerHTML = html;
}

// 見積依頼No.ごとのセクションを生成
function createRfqSection(rfqNo, quotations) {
    return `
        <div class="rfq-section">
            <div class="rfq-section-header">
                <div class="rfq-section-title">
                    <span class="rfq-icon">📋</span>
                    <span class="rfq-no">${rfqNo}</span>
                    <span class="rfq-vendor">${quotations[0].vendor || '業者名未設定'}</span>
                </div>
                <div class="rfq-section-count">${quotations.length}件の見積書</div>
            </div>
            <div class="quotation-cards">
                ${quotations.map(q => createQuotationCard(q)).join('')}
            </div>
        </div>
    `;
}

// 見積書カードを生成
function createQuotationCard(quotation) {
    const phaseClass = quotation.phase === '概算' ? 'estimate' : 'final';
    const statusClass = getStatusClass(quotation.processingStatus || '未処理');
    const statusText = quotation.processingStatus || '未処理';
    const statusIcon = getStatusIcon(quotation.processingStatus || '未処理');

    return `
        <div class="quotation-card">
            <div class="quotation-card-header">
                <span class="quotation-phase-badge ${phaseClass}">${quotation.phase}</span>
                <span class="quotation-status-badge ${statusClass}">
                    ${statusIcon} ${statusText}
                </span>
            </div>
            <div class="quotation-card-body">
                <div class="quotation-info-row">
                    <span class="quotation-label">見積日:</span>
                    <span class="quotation-value">${quotation.quotationDate}</span>
                </div>
                <div class="quotation-info-row">
                    <span class="quotation-label">アップロード:</span>
                    <span class="quotation-value">${quotation.uploadDate}</span>
                </div>
                <div class="quotation-info-row">
                    <span class="quotation-label">ファイル:</span>
                    <span class="quotation-value quotation-filename">${quotation.filename}</span>
                </div>
            </div>
            <div class="quotation-card-footer">
                ${getActionButtons(quotation)}
            </div>
        </div>
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
        buttons += `<button class="quotation-action-btn primary" onclick="startProcessing('${quotation.id}')">処理開始</button>`;
    } else if (status === 'OCR完了') {
        buttons += `<button class="quotation-action-btn primary" onclick="continueProcessing('${quotation.id}')">処理を続ける</button>`;
    } else if (status === '紐付け完了') {
        buttons += `<button class="quotation-action-btn primary" onclick="continueProcessing('${quotation.id}')">処理を続ける</button>`;
        buttons += `<button class="quotation-action-btn" onclick="viewProcessingResult('${quotation.id}')">発注書・検収書出力</button>`;
    }

    buttons += `<button class="quotation-action-btn secondary" onclick="deleteQuotation('${quotation.id}')">削除</button>`;

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

// 見積依頼No.選択肢を生成
function populateRfqSelect() {
    const select = document.getElementById('uploadRfqNo');
    if (!select) return;

    // window.rfqRecordsから見積依頼No.を取得
    const rfqNos = window.rfqRecords ? window.rfqRecords.map(r => r.rfqNo) : [];

    // 既存の選択肢をクリア（初期のoptionは残す）
    while (select.options.length > 1) {
        select.remove(1);
    }

    // 選択肢を追加
    rfqNos.forEach(rfqNo => {
        const option = document.createElement('option');
        option.value = rfqNo;
        option.textContent = rfqNo;
        select.appendChild(option);
    });
}

// 見積書アップロード処理
function handleUploadQuotation(event) {
    event.preventDefault();

    const rfqNo = document.getElementById('uploadRfqNo').value;
    const phase = document.getElementById('uploadPhase').value;
    const vendor = document.getElementById('uploadVendor').value;
    const quotationDate = document.getElementById('uploadQuotationDate').value;
    const file = document.getElementById('uploadFile').files[0];

    if (!file) {
        alert('ファイルを選択してください');
        return;
    }

    // 新しい見積書を追加
    const newQuotation = {
        id: `Q-${Date.now()}`,
        rfqNo: rfqNo,
        phase: phase,
        vendor: vendor,
        quotationDate: quotationDate,
        uploadDate: new Date().toISOString().split('T')[0],
        filename: file.name,
        processingStatus: '未処理'
    };

    quotationDocuments.push(newQuotation);
    window.quotationDocuments = quotationDocuments;

    // 表示を更新
    renderQuotationsByRfq();
    updateQuotationCount();

    // モーダルを閉じる
    closeUploadQuotationModal();

    alert('見積書をアップロードしました');
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
    document.getElementById('outputModalPhase').textContent = quotation.phase;

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
