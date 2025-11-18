/**
 * 見積DataBox画面（PDF保管庫）のJavaScript
 */

// グローバル変数
let quotationDocuments = []; // アップロードされた見積書
let filteredQuotationDocuments = [];
let currentActiveTab = 'estimate';
let currentQuotationDetail = null;

// 初期化
function initQuotationDataBoxPage() {
    console.log('=== Initializing Quotation DataBox Page ===');

    // サンプルデータがあればロード
    if (typeof window.quotationDocuments !== 'undefined') {
        quotationDocuments = window.quotationDocuments;
    }

    filteredQuotationDocuments = [...quotationDocuments];

    // 見積依頼Noのオプションをロード
    loadRfqNoOptions();

    // テーブルをレンダリング
    renderQuotationGrid();
    updateQuotationCount();
}

// 見積依頼Noのオプションをロード
function loadRfqNoOptions() {
    const select = document.getElementById('uploadRfqNo');
    if (!select) return;

    select.innerHTML = '<option value="">選択してください</option>';

    if (typeof window.rfqRecords === 'undefined') return;

    window.rfqRecords.forEach(rfq => {
        const option = document.createElement('option');
        option.value = rfq.rfqNo;
        option.textContent = `${rfq.rfqNo} - ${rfq.vendor}`;
        select.appendChild(option);
    });
}

// 見積書グリッドをレンダリング
function renderQuotationGrid() {
    const estimateGrid = document.getElementById('estimateQuotationGrid');
    const finalGrid = document.getElementById('finalQuotationGrid');
    const allGrid = document.getElementById('allQuotationGrid');

    // 概算見積
    const estimateQuotations = filteredQuotationDocuments.filter(q => q.phase === '概算');
    if (estimateQuotations.length === 0) {
        estimateGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">概算見積がアップロードされていません</div>
                <div class="empty-subtext">「見積書アップロード」ボタンから追加してください</div>
            </div>
        `;
    } else {
        estimateGrid.innerHTML = estimateQuotations.map(q => createQuotationCard(q)).join('');
    }

    // 最終見積
    const finalQuotations = filteredQuotationDocuments.filter(q => q.phase === '最終');
    if (finalQuotations.length === 0) {
        finalGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">最終見積がアップロードされていません</div>
                <div class="empty-subtext">「見積書アップロード」ボタンから追加してください</div>
            </div>
        `;
    } else {
        finalGrid.innerHTML = finalQuotations.map(q => createQuotationCard(q)).join('');
    }

    // すべて
    if (filteredQuotationDocuments.length === 0) {
        allGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">見積書がアップロードされていません</div>
                <div class="empty-subtext">「見積書アップロード」ボタンから追加してください</div>
            </div>
        `;
    } else {
        allGrid.innerHTML = filteredQuotationDocuments.map(q => createQuotationCard(q)).join('');
    }
}

// 見積書カードを作成
function createQuotationCard(quotation) {
    const phaseClass = quotation.phase === '概算' ? 'estimate' : 'final';
    const ocrStatusClass = quotation.ocrStatus === '完了' ? 'completed' : 'pending';
    const ocrStatusText = quotation.ocrStatus === '完了' ? 'OCR完了' : 'OCR未実行';

    return `
        <div class="quotation-card" onclick="showQuotationDetail('${quotation.id}')">
            <div class="quotation-card-header">
                <span class="quotation-phase-badge ${phaseClass}">${quotation.phase}</span>
                <span class="quotation-ocr-status ${ocrStatusClass}">${ocrStatusText}</span>
            </div>
            <div class="quotation-card-body">
                <div class="quotation-rfq-no">${quotation.rfqNo}</div>
                <div class="quotation-vendor">${quotation.vendor}</div>
                <div class="quotation-date">見積日: ${quotation.quotationDate}</div>
                <div class="quotation-date">アップロード: ${quotation.uploadDate}</div>
            </div>
            <div class="quotation-card-footer">
                <div class="quotation-pdf-icon">📄</div>
                <div class="quotation-actions">
                    <button class="quotation-action-btn" onclick="event.stopPropagation(); showQuotationDetail('${quotation.id}')">詳細</button>
                    <button class="quotation-action-btn danger" onclick="event.stopPropagation(); deleteQuotation('${quotation.id}')">削除</button>
                </div>
            </div>
        </div>
    `;
}

// 見積書詳細を表示
function showQuotationDetail(quotationId) {
    const quotation = quotationDocuments.find(q => q.id === quotationId);
    if (!quotation) return;

    currentQuotationDetail = quotation;

    const content = document.getElementById('quotationDetailContent');
    const ocrStatusBadge = quotation.ocrStatus === '完了'
        ? '<span class="quotation-ocr-status completed">OCR完了</span>'
        : '<span class="quotation-ocr-status pending">OCR未実行</span>';

    content.innerHTML = `
        <div class="quotation-detail-section">
            <div class="quotation-detail-row">
                <span class="label">見積依頼No</span>
                <span class="value">${quotation.rfqNo}</span>
            </div>
            <div class="quotation-detail-row">
                <span class="label">見積区分</span>
                <span class="value"><span class="quotation-phase-badge ${quotation.phase === '概算' ? 'estimate' : 'final'}">${quotation.phase}</span></span>
            </div>
            <div class="quotation-detail-row">
                <span class="label">業者名</span>
                <span class="value">${quotation.vendor}</span>
            </div>
            <div class="quotation-detail-row">
                <span class="label">見積日</span>
                <span class="value">${quotation.quotationDate}</span>
            </div>
            <div class="quotation-detail-row">
                <span class="label">アップロード日</span>
                <span class="value">${quotation.uploadDate}</span>
            </div>
            <div class="quotation-detail-row">
                <span class="label">OCR状態</span>
                <span class="value">${ocrStatusBadge}</span>
            </div>
        </div>

        <div class="quotation-detail-section">
            <div style="font-weight: 600; margin-bottom: 12px;">PDFプレビュー</div>
            <div class="pdf-preview">
                <div>
                    📄<br>
                    ${quotation.filename}<br>
                    <small>※実際のシステムではPDFプレビューが表示されます</small>
                </div>
            </div>
        </div>
    `;

    // OCR実行ボタンの表示制御
    const ocrBtn = document.getElementById('executeOcrBtn');
    if (quotation.ocrStatus === '完了') {
        ocrBtn.textContent = 'OCR結果を表示';
    } else {
        ocrBtn.textContent = 'AI-OCR実行';
    }

    document.getElementById('quotationDetailModal').classList.add('active');
}

// 見積書詳細モーダルを閉じる
function closeQuotationDetailModal() {
    document.getElementById('quotationDetailModal').classList.remove('active');
    currentQuotationDetail = null;
}

// モーダル外クリック
function handleDetailModalOutsideClick(event) {
    if (event.target.id === 'quotationDetailModal') {
        closeQuotationDetailModal();
    }
}

// AI-OCR実行
function executeOcr() {
    if (!currentQuotationDetail) return;

    if (currentQuotationDetail.ocrStatus === '完了') {
        // OCR結果画面へ遷移
        closeQuotationDetailModal();
        goToOcrResultPage(currentQuotationDetail.id);
    } else {
        // OCR実行
        if (confirm(`${currentQuotationDetail.rfqNo} の見積書をAI-OCRで処理しますか？`)) {
            // OCR処理シミュレーション
            currentQuotationDetail.ocrStatus = '完了';
            currentQuotationDetail.ocrDate = new Date().toISOString().split('T')[0];

            alert('AI-OCR処理が完了しました\n\n抽出された明細を確認してください');

            closeQuotationDetailModal();
            renderQuotationGrid();

            // OCR結果画面へ遷移
            goToOcrResultPage(currentQuotationDetail.id);
        }
    }
}

// OCR結果画面への遷移
function goToOcrResultPage(quotationId) {
    document.getElementById('quotationDataBoxPage').classList.remove('active');
    document.getElementById('quotationOcrResultPage').classList.add('active');

    if (typeof window.initQuotationOcrResultPage === 'function') {
        window.initQuotationOcrResultPage(quotationId);
    }
}

// 見積書削除
function deleteQuotation(quotationId) {
    const quotation = quotationDocuments.find(q => q.id === quotationId);
    if (!quotation) return;

    if (confirm(`見積書を削除しますか？\n\n見積依頼No: ${quotation.rfqNo}\n業者: ${quotation.vendor}`)) {
        quotationDocuments = quotationDocuments.filter(q => q.id !== quotationId);
        window.quotationDocuments = quotationDocuments;
        filteredQuotationDocuments = [...quotationDocuments];

        renderQuotationGrid();
        updateQuotationCount();

        alert('見積書を削除しました');
    }
}

// 件数を更新
function updateQuotationCount() {
    const countElement = document.getElementById('quotationCount');
    if (countElement) {
        countElement.textContent = `${filteredQuotationDocuments.length}件`;
    }
}

// フィルタリング
function filterQuotations() {
    const rfqNo = document.getElementById('filterRfqNo')?.value.trim().toLowerCase();
    const vendor = document.getElementById('filterVendor')?.value.trim().toLowerCase();
    const uploadDate = document.getElementById('filterUploadDate')?.value;

    filteredQuotationDocuments = quotationDocuments.filter(q => {
        if (rfqNo && !q.rfqNo.toLowerCase().includes(rfqNo)) return false;
        if (vendor && !q.vendor.toLowerCase().includes(vendor)) return false;
        if (uploadDate && q.uploadDate !== uploadDate) return false;
        return true;
    });

    renderQuotationGrid();
    updateQuotationCount();
}

// フィルタークリア
function clearQuotationFilters() {
    document.getElementById('filterRfqNo').value = '';
    document.getElementById('filterVendor').value = '';
    document.getElementById('filterUploadDate').value = '';

    filterQuotations();
}

// タブ切り替え
function switchDataBoxTab(tabName) {
    currentActiveTab = tabName;

    // タブボタンのアクティブ状態を切り替え
    document.querySelectorAll('.databox-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // タブコンテンツの表示切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabName === 'estimate') {
        document.getElementById('estimateTabContent').classList.add('active');
    } else if (tabName === 'final') {
        document.getElementById('finalTabContent').classList.add('active');
    } else if (tabName === 'all') {
        document.getElementById('allTabContent').classList.add('active');
    }
}

// アップロードモーダルを表示
function showUploadQuotationModal() {
    loadRfqNoOptions();
    document.getElementById('uploadQuotationModal').classList.add('active');
}

// アップロードモーダルを閉じる
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

// 見積書アップロード処理
function handleUploadQuotation(event) {
    event.preventDefault();

    const rfqNo = document.getElementById('uploadRfqNo').value;
    const phase = document.getElementById('uploadPhase').value;
    const vendor = document.getElementById('uploadVendor').value;
    const quotationDate = document.getElementById('uploadQuotationDate').value;
    const file = document.getElementById('uploadFile').files[0];

    if (!file) {
        alert('PDFファイルを選択してください');
        return;
    }

    // 見積書データを作成
    const newQuotation = {
        id: `Q-${Date.now()}`,
        rfqNo: rfqNo,
        phase: phase,
        vendor: vendor,
        quotationDate: quotationDate,
        uploadDate: new Date().toISOString().split('T')[0],
        filename: file.name,
        ocrStatus: '未実行',
        ocrDate: null
    };

    quotationDocuments.push(newQuotation);
    window.quotationDocuments = quotationDocuments;
    filteredQuotationDocuments = [...quotationDocuments];

    renderQuotationGrid();
    updateQuotationCount();
    closeUploadQuotationModal();

    alert(`見積書をアップロードしました\n\n見積依頼No: ${rfqNo}\n業者: ${vendor}`);
}

// 画面遷移
function goToRfqListFromDataBox() {
    document.getElementById('quotationDataBoxPage').classList.remove('active');
    document.getElementById('rfqListPage').classList.add('active');

    if (typeof window.initRfqListPage === 'function') {
        window.initRfqListPage();
    }
}

function handleBackFromDataBox() {
    if (confirm('見積依頼一覧画面に戻りますか？')) {
        goToRfqListFromDataBox();
    }
}

// グローバルに公開
window.quotationDocuments = quotationDocuments;
window.initQuotationDataBoxPage = initQuotationDataBoxPage;
window.switchDataBoxTab = switchDataBoxTab;
window.showUploadQuotationModal = showUploadQuotationModal;
window.closeUploadQuotationModal = closeUploadQuotationModal;
window.handleUploadModalOutsideClick = handleUploadModalOutsideClick;
window.handleUploadQuotation = handleUploadQuotation;
window.showQuotationDetail = showQuotationDetail;
window.closeQuotationDetailModal = closeQuotationDetailModal;
window.handleDetailModalOutsideClick = handleDetailModalOutsideClick;
window.executeOcr = executeOcr;
window.deleteQuotation = deleteQuotation;
window.filterQuotations = filterQuotations;
window.clearQuotationFilters = clearQuotationFilters;
window.goToRfqListFromDataBox = goToRfqListFromDataBox;
window.handleBackFromDataBox = handleBackFromDataBox;
