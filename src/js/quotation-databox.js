/**
 * 見積明細DataBOX画面のJavaScript
 */

// グローバル変数
let currentRfqNo = null;
let currentRfqData = null;
let estimateQuotation = null;
let finalQuotation = null;
let orderDetailsData = [];

// 初期化
function initQuotationDataBoxPage(rfqNo) {
    console.log('=== Initializing Quotation DataBOX Page ===', rfqNo);

    currentRfqNo = rfqNo;

    // 見積依頼データを取得
    loadRfqData();

    // 基本情報を表示
    displayBasicInfo();

    // 見積データをロード
    loadQuotationData();

    // デフォルトで概算見積タブを表示
    switchDataBoxTab('estimate');
}

// 見積依頼データを取得
function loadRfqData() {
    if (!currentRfqNo || typeof window.rfqRecords === 'undefined') {
        return;
    }

    currentRfqData = window.rfqRecords.find(r => r.rfqNo === currentRfqNo);
    console.log('Current RFQ Data:', currentRfqData);
}

// 基本情報を表示
function displayBasicInfo() {
    document.getElementById('databoxRfqNo').textContent = currentRfqNo || '-';
    document.getElementById('infoRfqNo').textContent = currentRfqNo || '-';

    if (!currentRfqData) return;

    document.getElementById('infoVendor').textContent = currentRfqData.vendor || '-';
    document.getElementById('infoApplicationCount').textContent = `${currentRfqData.applicationIds?.length || 0}件`;

    // 概算見積・最終見積の金額表示
    if (estimateQuotation) {
        document.getElementById('infoEstimateAmount').textContent =
            `¥${estimateQuotation.totalAmount.toLocaleString()} (登録済)`;
    }

    if (finalQuotation) {
        document.getElementById('infoFinalAmount').textContent =
            `¥${finalQuotation.totalAmount.toLocaleString()} (登録済)`;
    }

    // 発注状態
    const orderStatus = currentRfqData.orderConfirmed ? '発注済' : '未発注';
    document.getElementById('infoOrderStatus').textContent = orderStatus;
}

// 見積データをロード
function loadQuotationData() {
    if (!currentRfqNo || typeof window.quotationData === 'undefined') {
        return;
    }

    const quotations = window.quotationData[currentRfqNo] || [];

    // 概算見積と最終見積を分ける
    estimateQuotation = quotations.find(q => q.phase === '概算');
    finalQuotation = quotations.find(q => q.phase === '最終');

    console.log('Estimate:', estimateQuotation);
    console.log('Final:', finalQuotation);

    // 各タブの内容を更新
    displayEstimateQuotation();
    displayFinalQuotation();
    displayOrderDetails();
}

// 概算見積を表示
function displayEstimateQuotation() {
    const content = document.getElementById('estimateQuotationContent');

    if (!estimateQuotation) {
        content.innerHTML = '<p style="text-align: center; padding: 40px; color: #95a5a6;">概算見積が未登録です</p>';
        return;
    }

    content.innerHTML = `
        <div class="quotation-summary">
            <div class="summary-row">
                <span class="label">見積業者:</span>
                <span class="value">${estimateQuotation.vendor}</span>
            </div>
            <div class="summary-row">
                <span class="label">見積日:</span>
                <span class="value">${estimateQuotation.quotationDate}</span>
            </div>
            <div class="summary-row">
                <span class="label">合計金額:</span>
                <span class="value amount">¥${estimateQuotation.totalAmount.toLocaleString()}</span>
            </div>
        </div>
        <div class="quotation-details-table-wrapper" style="margin-top: 16px;">
            <table class="quotation-details-table">
                <thead>
                    <tr>
                        <th>品目</th>
                        <th>メーカー</th>
                        <th>型式</th>
                        <th>数量</th>
                        <th>単価</th>
                        <th>金額</th>
                        <th>明細区分</th>
                    </tr>
                </thead>
                <tbody>
                    ${estimateQuotation.details.map(d => `
                        <tr>
                            <td class="item-name">${d.itemName}</td>
                            <td>${d.maker}</td>
                            <td>${d.model}</td>
                            <td>${d.quantity}</td>
                            <td>¥${d.unitPrice.toLocaleString()}</td>
                            <td>¥${d.amount.toLocaleString()}</td>
                            <td>${d.category}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// 最終見積を表示
function displayFinalQuotation() {
    const content = document.getElementById('finalQuotationContent');

    if (!finalQuotation) {
        content.innerHTML = '<p style="text-align: center; padding: 40px; color: #95a5a6;">最終見積が未登録です</p>';
        return;
    }

    content.innerHTML = `
        <div class="quotation-summary">
            <div class="summary-row">
                <span class="label">見積業者:</span>
                <span class="value">${finalQuotation.vendor}</span>
            </div>
            <div class="summary-row">
                <span class="label">見積日:</span>
                <span class="value">${finalQuotation.quotationDate}</span>
            </div>
            <div class="summary-row">
                <span class="label">合計金額:</span>
                <span class="value amount">¥${finalQuotation.totalAmount.toLocaleString()}</span>
            </div>
        </div>
        <div class="quotation-details-table-wrapper" style="margin-top: 16px;">
            <table class="quotation-details-table">
                <thead>
                    <tr>
                        <th>品目</th>
                        <th>メーカー</th>
                        <th>型式</th>
                        <th>数量</th>
                        <th>単価</th>
                        <th>金額</th>
                        <th>明細区分</th>
                    </tr>
                </thead>
                <tbody>
                    ${finalQuotation.details.map(d => `
                        <tr>
                            <td class="item-name">${d.itemName}</td>
                            <td>${d.maker}</td>
                            <td>${d.model}</td>
                            <td>${d.quantity}</td>
                            <td>¥${d.unitPrice.toLocaleString()}</td>
                            <td>¥${d.amount.toLocaleString()}</td>
                            <td>${d.category}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// 発注管理タブ - 明細表示（申請情報と統合）
function displayOrderDetails() {
    if (!finalQuotation || !currentRfqData) {
        document.getElementById('orderDetailsBody').innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #95a5a6;">
                    最終見積を登録してください
                </td>
            </tr>
        `;
        return;
    }

    // 申請データと見積明細を統合
    const applications = window.applicationListData.filter(app =>
        currentRfqData.applicationIds.includes(app.id)
    );

    orderDetailsData = applications.map((app, index) => {
        const detail = finalQuotation.details[index] || {};

        return {
            applicationNo: app.applicationNo,
            itemName: app.asset.name,
            maker: detail.maker || '-',
            model: detail.model || app.asset.model || '-',
            quantity: app.quantity,
            facility: `${app.facility.building} ${app.facility.floor || ''} ${app.facility.department || ''}`.trim(),
            amount: detail.amount || 0,
            qrCode: null,
            isIndividual: detail.category === '本体', // 本体のみ個体管理
            application: app,
            detail: detail
        };
    });

    renderOrderDetailsTable();
    updateQrCountInfo();
}

// 発注明細テーブルをレンダリング
function renderOrderDetailsTable() {
    const tbody = document.getElementById('orderDetailsBody');
    const filterIndividual = document.getElementById('filterIndividualOnly')?.checked || false;

    let displayData = orderDetailsData;
    if (filterIndividual) {
        displayData = orderDetailsData.filter(d => d.isIndividual);
    }

    tbody.innerHTML = displayData.map(data => `
        <tr>
            <td class="app-no">${data.applicationNo}</td>
            <td class="item-name">${data.itemName}</td>
            <td>${data.maker}</td>
            <td>${data.model}</td>
            <td>${data.quantity}</td>
            <td>${data.facility}</td>
            <td style="text-align: right; font-weight: 600;">¥${data.amount.toLocaleString()}</td>
            <td>
                ${data.qrCode
                    ? `<span class="qr-code">${data.qrCode}</span>`
                    : '<span class="qr-code not-assigned">未採番</span>'
                }
            </td>
        </tr>
    `).join('');
}

// QRコード件数情報を更新
function updateQrCountInfo() {
    const individualCount = orderDetailsData.filter(d => d.isIndividual).length;
    document.getElementById('qrCountInfo').textContent = `✓ QRコード自動採番（${individualCount}件）`;
}

// フィルター
function filterOrderDetails() {
    renderOrderDetailsTable();
}

// タブ切り替え
function switchDataBoxTab(tabName) {
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
    } else if (tabName === 'order') {
        document.getElementById('orderTabContent').classList.add('active');
    } else if (tabName === 'documents') {
        document.getElementById('documentsTabContent').classList.add('active');
    }
}

// 発注確定処理
function confirmOrder() {
    if (!finalQuotation) {
        alert('最終見積を登録してください');
        return;
    }

    const individualItems = orderDetailsData.filter(d => d.isIndividual);

    if (individualItems.length === 0) {
        alert('個体管理品目がありません');
        return;
    }

    const confirmMsg = `発注確定処理を実行します。\n\n` +
        `個体管理品目: ${individualItems.length}件\n` +
        `QRコード自動採番します。\n\n` +
        `よろしいですか？`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // QRコード採番
    const assets = individualItems.map((item, index) => {
        const qrCode = `QR-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`;
        item.qrCode = qrCode;

        return {
            qrCode: qrCode,
            qrIssuedDate: new Date().toISOString().split('T')[0],

            // 申請情報
            applicationNo: item.applicationNo,
            applicationDate: item.application.applicationDate,
            applicationType: item.application.applicationType,
            itemName: item.itemName,
            quantity: item.quantity,
            facility: item.application.facility,
            executionYear: item.application.executionYear,
            purpose: item.application.freeInput,

            // 見積明細情報
            rfqNo: currentRfqNo,
            vendor: finalQuotation.vendor,
            maker: item.maker,
            model: item.model,
            quotationPrice: item.amount,
            quotationDate: finalQuotation.quotationDate,
            itemCategory: item.detail.category,

            // 発注情報
            orderDate: new Date().toISOString().split('T')[0],

            // 検収情報（後から追加）
            inspectionDate: null,
            serialNumber: null,
            photos: [],

            // 固定資産情報（後から追加）
            fixedAssetNo: null,

            // 状態管理
            status: '仮登録' // 仮登録 / 検収済 / 資産登録完了
        };
    });

    // 個体管理リスト原本に仮登録
    if (!window.assetMasterList) {
        window.assetMasterList = [];
    }
    window.assetMasterList.push(...assets);

    // 見積依頼レコードを更新
    if (currentRfqData) {
        currentRfqData.orderConfirmed = true;
        currentRfqData.orderDate = new Date().toISOString().split('T')[0];
    }

    console.log('Assets registered:', assets);

    // 発注確定モーダルを表示
    showOrderConfirmModal(assets);

    // テーブルを更新
    renderOrderDetailsTable();
    displayBasicInfo();
}

// 発注確定モーダルを表示
function showOrderConfirmModal(assets) {
    const resultsHtml = `
        <div style="line-height: 1.8;">
            ✓ QRコード採番: ${assets.length}件<br>
            <ul style="margin: 8px 0; padding-left: 20px;">
                ${assets.map(a => `<li>${a.qrCode} (${a.itemName})</li>`).join('')}
            </ul>
            ✓ 個体管理リスト原本へ仮登録完了<br>
            ✓ 申請情報 + 見積情報を統合<br>
            ✓ 帳票生成完了
        </div>
    `;

    document.getElementById('processingResults').innerHTML = resultsHtml;

    // ドキュメント名を設定
    document.getElementById('orderDocName').textContent = `${currentRfqNo}_発注書.pdf`;
    document.getElementById('qrLabelDocName').textContent = `${currentRfqNo}_QRラベル.pdf`;
    document.getElementById('inspectionDocName').textContent = `${currentRfqNo}_検収書.pdf`;
    document.getElementById('assetRequestDocName').textContent = `${currentRfqNo}_固定資産登録依頼書.pdf`;

    document.getElementById('orderConfirmModal').classList.add('active');
}

// モーダルを閉じる
function closeOrderConfirmModal() {
    document.getElementById('orderConfirmModal').classList.remove('active');
}

// モーダル外クリック
function handleOrderConfirmModalOutsideClick(event) {
    if (event.target.id === 'orderConfirmModal') {
        closeOrderConfirmModal();
    }
}

// ドキュメント操作（プレビュー・ダウンロード）
function previewDocument(type) {
    alert(`${type} のプレビュー機能は今後実装予定です`);
}

function downloadDocument(type) {
    alert(`${type} のPDF出力機能は今後実装予定です`);
}

function downloadAllDocuments() {
    alert('すべての帳票をダウンロード機能は今後実装予定です');
}

// 設置情報編集
function editFacilityInfo() {
    alert('設置情報編集機能は今後実装予定です');
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
window.initQuotationDataBoxPage = initQuotationDataBoxPage;
window.switchDataBoxTab = switchDataBoxTab;
window.filterOrderDetails = filterOrderDetails;
window.confirmOrder = confirmOrder;
window.closeOrderConfirmModal = closeOrderConfirmModal;
window.handleOrderConfirmModalOutsideClick = handleOrderConfirmModalOutsideClick;
window.previewDocument = previewDocument;
window.downloadDocument = downloadDocument;
window.downloadAllDocuments = downloadAllDocuments;
window.editFacilityInfo = editFacilityInfo;
window.goToRfqListFromDataBox = goToRfqListFromDataBox;
window.handleBackFromDataBox = handleBackFromDataBox;
