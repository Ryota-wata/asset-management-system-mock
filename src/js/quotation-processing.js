/**
 * 見積処理画面のJavaScript
 */

// グローバル変数
let currentQuotation = null;
let currentStep = 1;
let ocrResults = [];
let matchingResults = [];
let linkingResults = [];

// 初期化
function initQuotationProcessingPage(quotationId) {
    console.log('=== Initializing Quotation Processing Page ===', quotationId);

    // 見積書情報を取得
    currentQuotation = window.quotationDocuments.find(q => q.id === quotationId);

    if (!currentQuotation) {
        console.error('Quotation not found:', quotationId);
        alert('見積書が見つかりません');
        handleBackFromProcessing();
        return;
    }

    // ヘッダー情報を設定
    document.getElementById('processingRfqNo').textContent = currentQuotation.rfqNo;
    document.getElementById('processingVendor').textContent = currentQuotation.vendor || '業者名未設定';
    document.getElementById('pdfFilename').textContent = currentQuotation.filename;

    // ステップをリセット
    currentStep = 1;
    goToStep(1);

    // 初回表示時にすべてのステップのサンプルデータを生成
    simulateOcrExtraction();
    performMatching();
    performLinking();

    // 処理状態に応じてステップを復元
    if (currentQuotation.processingStatus === 'OCR完了') {
        // マッチング結果を表示するためStep 2へ
        setTimeout(() => {
            goToStep(2);
        }, 100);
    } else if (currentQuotation.processingStatus === '紐付け完了') {
        // 紐付け結果を表示するためStep 3へ
        setTimeout(() => {
            goToStep(3);
        }, 100);
    }
}

// ステップ遷移
function goToStep(step) {
    // 現在のステップコンテンツを非表示
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });

    // ステップインジケーターを更新
    document.querySelectorAll('.step-item').forEach(item => {
        const stepNum = parseInt(item.dataset.step);
        item.classList.remove('active', 'completed');

        if (stepNum === step) {
            item.classList.add('active');
        } else if (stepNum < step) {
            item.classList.add('completed');
        }
    });

    // 新しいステップを表示
    document.getElementById(`step${step}Content`).classList.add('active');
    currentStep = step;

    // スクロールをトップに
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// OCR抽出開始
function startOcrExtraction() {
    const btn = document.querySelector('.ocr-start-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner">⏳</span> 抽出中...';

    // シミュレーション（実際はAPI呼び出し）
    setTimeout(() => {
        simulateOcrExtraction();
        btn.innerHTML = '<span class="btn-icon">✅</span> 抽出完了';
        document.getElementById('step1NextBtn').disabled = false;
    }, 2000);
}

// OCR抽出のシミュレーション
function simulateOcrExtraction() {
    // サンプルOCR結果を生成
    ocrResults = [
        { id: 1, itemName: '超音波診断装置 ProSound Alpha 7', quantity: 1, unitPrice: 15000000, amount: 15000000, note: '' },
        { id: 2, itemName: 'リニアプローブ UST-5713T', quantity: 2, unitPrice: 800000, amount: 1600000, note: '' },
        { id: 3, itemName: 'コンベックスプローブ UST-675P', quantity: 1, unitPrice: 900000, amount: 900000, note: '' },
        { id: 4, itemName: 'カート型ワークステーション', quantity: 1, unitPrice: 300000, amount: 300000, note: '' },
        { id: 5, itemName: '保守点検（1年間）', quantity: 1, unitPrice: 500000, amount: 500000, note: '' }
    ];

    // OCR結果テーブルを表示
    renderOcrResults();
    document.getElementById('ocrResultTable').style.display = 'block';
    document.getElementById('step1NextBtn').disabled = false;
}

// OCR結果を表示
function renderOcrResults() {
    const tbody = document.getElementById('ocrResultBody');
    tbody.innerHTML = ocrResults.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.itemName}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">¥${item.unitPrice.toLocaleString()}</td>
            <td class="text-right">¥${item.amount.toLocaleString()}</td>
            <td>${item.note}</td>
        </tr>
    `).join('');
}

// 資産マスタとの突き合わせ実行
function performMatching() {
    // シミュレーション：OCR結果を資産マスタと突き合わせ
    matchingResults = ocrResults.map(item => {
        // 簡易的なマッチング（実際は類似度計算など）
        const matched = findMatchingAssetMaster(item.itemName);

        return {
            id: item.id,
            ocrItemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            matchStatus: matched ? 'matched' : 'unmatched',
            assetMaster: matched,
            confidence: matched ? 0.85 + Math.random() * 0.15 : 0
        };
    });

    renderMatchingResults();
    updateMatchingSummary();
}

// 資産マスタを検索（簡易版）
function findMatchingAssetMaster(itemName) {
    // window.assetMasterから類似品目を検索
    if (!window.assetMaster || window.assetMaster.length === 0) {
        return null;
    }

    // 簡易的なキーワードマッチング
    const keywords = ['超音波', 'プローブ', 'ワークステーション', '保守'];
    for (const keyword of keywords) {
        if (itemName.includes(keyword)) {
            const found = window.assetMaster.find(master =>
                master.itemName && master.itemName.includes(keyword)
            );
            if (found) return found;
        }
    }

    // 見つからない場合は最初のアイテムを返す（デモ用）
    return window.assetMaster[0];
}

// マッチング結果を表示
function renderMatchingResults() {
    const tbody = document.getElementById('matchingTableBody');
    tbody.innerHTML = matchingResults.map(item => {
        const statusBadge = item.matchStatus === 'matched'
            ? '<span class="match-badge matched">✓ マッチ</span>'
            : '<span class="match-badge unmatched">? 要確認</span>';

        const assetInfo = item.assetMaster
            ? `${item.assetMaster.itemCode} - ${item.assetMaster.itemName}`
            : '<span class="text-muted">-</span>';

        const actionBtn = item.matchStatus === 'unmatched'
            ? `<button class="table-btn primary" onclick="selectAssetMaster(${item.id})">選択</button>`
            : `<button class="table-btn secondary" onclick="selectAssetMaster(${item.id})">変更</button>`;

        return `
            <tr>
                <td>${item.id}</td>
                <td>${item.ocrItemName}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">¥${item.unitPrice.toLocaleString()}</td>
                <td>${statusBadge}</td>
                <td>${assetInfo}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join('');
}

// マッチングサマリーを更新
function updateMatchingSummary() {
    const total = matchingResults.length;
    const matched = matchingResults.filter(r => r.matchStatus === 'matched').length;
    const unmatched = total - matched;

    document.getElementById('totalItemsCount').textContent = total;
    document.getElementById('matchedItemsCount').textContent = matched;
    document.getElementById('unmatchedItemsCount').textContent = unmatched;
}

// 申請紐付け実行
function performLinking() {
    // マッチング結果から紐付け結果を生成
    linkingResults = matchingResults.filter(r => r.matchStatus === 'matched').map(item => {
        // 該当する申請を検索（見積依頼No.で絞り込み）
        const application = findMatchingApplication(item.assetMaster, currentQuotation.rfqNo);

        return {
            id: item.id,
            assetMaster: item.assetMaster,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            linkStatus: application ? 'linked' : 'unlinked',
            application: application
        };
    });

    renderLinkingResults();
    updateLinkingSummary();
}

// 該当する申請を検索
function findMatchingApplication(assetMaster, rfqNo) {
    if (!window.applicationRecords || window.applicationRecords.length === 0) {
        return null;
    }

    // 見積依頼No.が一致し、資産情報が類似する申請を検索
    const applications = window.applicationRecords.filter(app => app.rfqNo === rfqNo);

    if (applications.length === 0) {
        return null;
    }

    // 簡易的なマッチング（実際はより精密に）
    for (const app of applications) {
        if (app.assetName && assetMaster.itemName &&
            (app.assetName.includes(assetMaster.itemName.substring(0, 5)) ||
             assetMaster.itemName.includes(app.assetName.substring(0, 5)))) {
            return app;
        }
    }

    // 見つからない場合は最初のアプリケーションを返す（デモ用）
    return applications[0];
}

// 紐付け結果を表示
function renderLinkingResults() {
    const tbody = document.getElementById('linkingTableBody');
    tbody.innerHTML = linkingResults.map(item => {
        const statusBadge = item.linkStatus === 'linked'
            ? '<span class="link-badge linked">✓ 紐付け済み</span>'
            : '<span class="link-badge unlinked">未紐付け</span>';

        const applicationInfo = item.application
            ? `${item.application.applicationNo} - ${item.application.assetName}`
            : '<span class="text-muted">-</span>';

        const actionBtn = item.linkStatus === 'unlinked'
            ? `<button class="table-btn primary" onclick="selectApplication(${item.id})">選択</button>`
            : `<button class="table-btn secondary" onclick="selectApplication(${item.id})">変更</button>`;

        return `
            <tr>
                <td>${item.id}</td>
                <td>${item.assetMaster.itemName}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">¥${item.unitPrice.toLocaleString()}</td>
                <td>${statusBadge}</td>
                <td>${applicationInfo}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join('');
}

// 紐付けサマリーを更新
function updateLinkingSummary() {
    const total = linkingResults.length;
    const linked = linkingResults.filter(r => r.linkStatus === 'linked').length;
    const unlinked = total - linked;

    document.getElementById('totalLinkedItemsCount').textContent = total;
    document.getElementById('linkedItemsCount').textContent = linked;
    document.getElementById('unlinkedItemsCount').textContent = unlinked;
}


// 資産マスタ選択モーダルを開く
let currentSelectingItemId = null;

function selectAssetMaster(itemId) {
    currentSelectingItemId = itemId;

    // 資産マスタリストを表示
    renderAssetMasterModal();

    document.getElementById('assetMasterSelectModal').classList.add('active');
}

function closeAssetMasterSelectModal() {
    document.getElementById('assetMasterSelectModal').classList.remove('active');
    currentSelectingItemId = null;
}

function handleAssetMasterModalOutsideClick(event) {
    if (event.target.id === 'assetMasterSelectModal') {
        closeAssetMasterSelectModal();
    }
}

function renderAssetMasterModal() {
    const tbody = document.getElementById('assetMasterModalBody');

    if (!window.assetMaster || window.assetMaster.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">資産マスタが登録されていません</td></tr>';
        return;
    }

    tbody.innerHTML = window.assetMaster.map(master => `
        <tr>
            <td><button class="table-btn primary" onclick="confirmAssetMasterSelection('${master.itemCode}')">選択</button></td>
            <td>${master.itemCode}</td>
            <td>${master.itemName}</td>
            <td>${master.category || '-'}</td>
        </tr>
    `).join('');
}

function filterAssetMaster() {
    const keyword = document.getElementById('assetMasterSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#assetMasterModalBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(keyword) ? '' : 'none';
    });
}

function confirmAssetMasterSelection(itemCode) {
    const assetMaster = window.assetMaster.find(m => m.itemCode === itemCode);

    if (!assetMaster) return;

    // マッチング結果を更新
    const matchingItem = matchingResults.find(r => r.id === currentSelectingItemId);
    if (matchingItem) {
        matchingItem.assetMaster = assetMaster;
        matchingItem.matchStatus = 'matched';
        matchingItem.confidence = 1.0;

        renderMatchingResults();
        updateMatchingSummary();
    }

    closeAssetMasterSelectModal();
    alert('資産マスタを紐付けました');
}

// 申請選択モーダルを開く
function selectApplication(itemId) {
    currentSelectingItemId = itemId;

    // 申請リストを表示
    renderApplicationModal();

    document.getElementById('modalRfqNo').textContent = currentQuotation.rfqNo;
    document.getElementById('applicationSelectModal').classList.add('active');
}

function closeApplicationSelectModal() {
    document.getElementById('applicationSelectModal').classList.remove('active');
    currentSelectingItemId = null;
}

function handleApplicationModalOutsideClick(event) {
    if (event.target.id === 'applicationSelectModal') {
        closeApplicationSelectModal();
    }
}

function renderApplicationModal() {
    const tbody = document.getElementById('applicationModalBody');

    if (!window.applicationRecords || window.applicationRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">申請が登録されていません</td></tr>';
        return;
    }

    // 見積依頼No.で絞り込み
    const applications = window.applicationRecords.filter(app => app.rfqNo === currentQuotation.rfqNo);

    if (applications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">該当する申請がありません</td></tr>';
        return;
    }

    tbody.innerHTML = applications.map(app => `
        <tr>
            <td><button class="table-btn primary" onclick="confirmApplicationSelection('${app.applicationNo}')">選択</button></td>
            <td>${app.applicationNo}</td>
            <td>${app.applicationDate}</td>
            <td>${app.applicationType}</td>
            <td>${app.assetName}</td>
            <td class="text-right">${app.quantity}</td>
        </tr>
    `).join('');
}

function confirmApplicationSelection(applicationNo) {
    const application = window.applicationRecords.find(app => app.applicationNo === applicationNo);

    if (!application) return;

    // 紐付け結果を更新
    const linkingItem = linkingResults.find(r => r.id === currentSelectingItemId);
    if (linkingItem) {
        linkingItem.application = application;
        linkingItem.linkStatus = 'linked';

        renderLinkingResults();
        updateLinkingSummary();
    }

    closeApplicationSelectModal();
    alert('申請に紐付けました');
}

// PDF プレビュー
function openPdfPreview() {
    alert('PDFプレビュー機能は実装予定です');
}

// 処理完了
function completeProcessing() {
    if (confirm('見積明細の紐付けを完了しますか？\n\n処理状態が「紐付け完了」に更新されます。')) {
        // 見積書の処理状態を更新
        currentQuotation.processingStatus = '紐付け完了';

        // グローバルデータを更新
        const index = window.quotationDocuments.findIndex(q => q.id === currentQuotation.id);
        if (index !== -1) {
            window.quotationDocuments[index] = currentQuotation;
        }

        alert('見積明細の紐付けが完了しました');
        handleBackFromProcessing();
    }
}

// 戻る
function handleBackFromProcessing() {
    document.getElementById('quotationProcessingPage').classList.remove('active');
    document.getElementById('quotationDataBoxPage').classList.add('active');

    // 見積書管理画面を再初期化
    if (typeof window.initQuotationDataBoxPage === 'function') {
        window.initQuotationDataBoxPage();
    }
}

// グローバルに公開
window.initQuotationProcessingPage = initQuotationProcessingPage;
window.goToStep = goToStep;
window.startOcrExtraction = startOcrExtraction;
window.selectAssetMaster = selectAssetMaster;
window.closeAssetMasterSelectModal = closeAssetMasterSelectModal;
window.handleAssetMasterModalOutsideClick = handleAssetMasterModalOutsideClick;
window.filterAssetMaster = filterAssetMaster;
window.confirmAssetMasterSelection = confirmAssetMasterSelection;
window.selectApplication = selectApplication;
window.closeApplicationSelectModal = closeApplicationSelectModal;
window.handleApplicationModalOutsideClick = handleApplicationModalOutsideClick;
window.confirmApplicationSelection = confirmApplicationSelection;
window.openPdfPreview = openPdfPreview;
window.completeProcessing = completeProcessing;
window.handleBackFromProcessing = handleBackFromProcessing;
