/**
 * 発注書・検収書テンプレート出力画面のJavaScript
 */

// グローバル変数
let currentTemplateQuotationId = null;
let currentTemplateQuotation = null;
let orderDetails = [];

// 初期化
function initOrderTemplatePage(quotationId) {
    console.log('=== Initializing Order Template Page ===', quotationId);

    currentTemplateQuotationId = quotationId;

    // 見積書データを取得
    if (typeof window.quotationDocuments !== 'undefined') {
        currentTemplateQuotation = window.quotationDocuments.find(q => q.id === quotationId);
    }

    // 紐付けデータを取得
    const matchingPairs = window.confirmedMatchingPairs || [];

    // 発注明細を生成
    generateOrderDetails(matchingPairs);

    // サマリー情報を表示
    displaySummary();

    // 発注明細テーブルをレンダリング
    renderOrderDetailsTable();

    // ファイル名を設定
    updateDocumentFilenames();
}

// 発注明細を生成
function generateOrderDetails(matchingPairs) {
    orderDetails = matchingPairs.map((pair, index) => {
        return {
            no: index + 1,
            // 見積明細情報
            itemName: pair.quotationDetail.itemName,
            maker: pair.quotationDetail.maker,
            model: pair.quotationDetail.model,
            quantity: pair.quotationDetail.quantity,
            unitPrice: pair.quotationDetail.unitPrice,
            amount: pair.quotationDetail.amount,
            // 申請情報
            applicationNo: pair.application.applicationNo,
            facility: pair.application.facility,
            executionYear: pair.application.executionYear,
            purpose: pair.application.freeInput || ''
        };
    });

    // グローバルに保存
    window.orderDetails = orderDetails;
}

// サマリー情報を表示
function displaySummary() {
    if (currentTemplateQuotation) {
        document.getElementById('summaryRfqNo').textContent = currentTemplateQuotation.rfqNo;
        document.getElementById('summaryVendor').textContent = currentTemplateQuotation.vendor;
    }

    document.getElementById('summaryItemCount').textContent = `${orderDetails.length}件`;

    const totalAmount = orderDetails.reduce((sum, detail) => sum + detail.amount, 0);
    document.getElementById('summaryTotalAmount').textContent = `¥${totalAmount.toLocaleString()}`;

    document.getElementById('templateItemCount').textContent = `${orderDetails.length}件`;
}

// 発注明細テーブルをレンダリング
function renderOrderDetailsTable() {
    const tbody = document.getElementById('templateDetailsBody');

    tbody.innerHTML = orderDetails.map(detail => `
        <tr>
            <td style="text-align: center; font-weight: 600;">${detail.no}</td>
            <td style="font-weight: 600;">${detail.itemName}</td>
            <td>${detail.maker}<br><small style="color: #7f8c8d;">${detail.model}</small></td>
            <td style="text-align: center;">${detail.quantity}</td>
            <td>${detail.facility.building} ${detail.facility.floor || ''}<br>
                <small style="color: #7f8c8d;">${detail.facility.department || ''}</small>
            </td>
            <td style="text-align: center;">${detail.executionYear}</td>
            <td style="text-align: right; font-weight: 600;">¥${detail.amount.toLocaleString()}</td>
            <td style="font-weight: 600; color: #3498db;">${detail.applicationNo}</td>
        </tr>
    `).join('');
}

// ファイル名を設定
function updateDocumentFilenames() {
    const rfqNo = currentTemplateQuotation?.rfqNo || 'RFQ-XXXX';
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');

    document.getElementById('orderDocFilename').textContent = `${rfqNo}_発注書_${date}.pdf`;
    document.getElementById('inspectionDocFilename').textContent = `${rfqNo}_検収書_${date}.pdf`;
}

// プレビュー
function previewTemplate(type) {
    const typeName = type === 'order' ? '発注書' : '検収書';
    alert(`${typeName}のプレビュー機能は今後実装予定です\n\n実際のシステムでは、PDFプレビューが表示されます`);
}

// 個別の帳票を生成
function generateTemplate(type) {
    const typeName = type === 'order' ? '発注書' : '検収書';
    const rfqNo = currentTemplateQuotation?.rfqNo || 'RFQ-XXXX';

    if (confirm(`${typeName}を生成しますか？\n\n見積依頼No: ${rfqNo}\n品目数: ${orderDetails.length}件`)) {
        alert(`${typeName}を生成しました\n\n※実際のシステムでは、PDFファイルがダウンロードされます`);
    }
}

// すべての帳票を生成
function generateAllTemplates() {
    const rfqNo = currentTemplateQuotation?.rfqNo || 'RFQ-XXXX';

    if (confirm(`すべての帳票を生成しますか？\n\n・発注書\n・検収書テンプレート\n\n見積依頼No: ${rfqNo}\n品目数: ${orderDetails.length}件`)) {
        // 生成処理のシミュレーション
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');

        const generatedFiles = [
            {
                icon: '📑',
                name: `${rfqNo}_発注書_${date}.pdf`,
                type: 'order'
            },
            {
                icon: '✅',
                name: `${rfqNo}_検収書_${date}.pdf`,
                type: 'inspection'
            }
        ];

        // モーダルに結果を表示
        showGeneratedFilesModal(generatedFiles);
    }
}

// 生成完了モーダルを表示
function showGeneratedFilesModal(files) {
    const filesList = document.getElementById('generatedFilesList');

    filesList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-icon">${file.icon}</div>
            <div class="file-name">${file.name}</div>
            <button class="file-download-btn" onclick="downloadFile('${file.type}')">ダウンロード</button>
        </div>
    `).join('');

    document.getElementById('templateGeneratedModal').classList.add('active');
}

// ファイルダウンロード
function downloadFile(type) {
    alert(`ファイルダウンロード機能は今後実装予定です\n\n※実際のシステムでは、PDFファイルがダウンロードされます`);
}

// モーダルを閉じる
function closeTemplateGeneratedModal() {
    document.getElementById('templateGeneratedModal').classList.remove('active');
}

// モーダル外クリック
function handleTemplateModalOutsideClick(event) {
    if (event.target.id === 'templateGeneratedModal') {
        closeTemplateGeneratedModal();
    }
}

// 個体管理リスト原本へ登録
function registerToAssetMaster() {
    if (confirm(`個体管理リスト原本へ登録しますか？\n\n${orderDetails.length}件の個体管理品目をQRコード採番して登録します。\n\nよろしいですか？`)) {
        // QRコード採番
        const assets = orderDetails.map((detail, index) => {
            const qrCode = `QR-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`;

            return {
                qrCode: qrCode,
                qrIssuedDate: new Date().toISOString().split('T')[0],

                // 申請情報
                applicationNo: detail.applicationNo,
                itemName: detail.itemName,
                quantity: detail.quantity,
                facility: detail.facility,
                executionYear: detail.executionYear,
                purpose: detail.purpose,

                // 見積明細情報
                rfqNo: currentTemplateQuotation?.rfqNo,
                vendor: currentTemplateQuotation?.vendor,
                maker: detail.maker,
                model: detail.model,
                quotationPrice: detail.amount,
                quotationDate: currentTemplateQuotation?.quotationDate,

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

        // 個体管理リスト原本に追加
        if (!window.assetMasterList) {
            window.assetMasterList = [];
        }
        window.assetMasterList.push(...assets);

        console.log('Assets registered to master list:', assets);

        alert(`個体管理リスト原本への登録が完了しました\n\n登録件数: ${assets.length}件\nQRコード採番: ${assets[0].qrCode} ～ ${assets[assets.length - 1].qrCode}\n\n次のステップ:\n・納品時に検収処理\n・シリアル番号・写真登録\n・固定資産Noの紐付け`);

        // 申請一覧画面へ戻る
        if (confirm('申請一覧画面に戻りますか？')) {
            goToApplicationList();
        }
    }
}

// 申請一覧画面へ遷移
function goToApplicationList() {
    document.getElementById('orderTemplatePage').classList.remove('active');
    document.getElementById('applicationListPage').classList.add('active');

    if (typeof window.initApplicationListPage === 'function') {
        window.initApplicationListPage();
    }
}

// 戻るボタン
function handleBackFromTemplate() {
    if (confirm('紐付けチェック画面に戻りますか？')) {
        document.getElementById('orderTemplatePage').classList.remove('active');
        document.getElementById('quotationMatchingPage').classList.add('active');
    }
}

// グローバルに公開
window.initOrderTemplatePage = initOrderTemplatePage;
window.previewTemplate = previewTemplate;
window.generateTemplate = generateTemplate;
window.generateAllTemplates = generateAllTemplates;
window.downloadFile = downloadFile;
window.closeTemplateGeneratedModal = closeTemplateGeneratedModal;
window.handleTemplateModalOutsideClick = handleTemplateModalOutsideClick;
window.registerToAssetMaster = registerToAssetMaster;
window.handleBackFromTemplate = handleBackFromTemplate;
