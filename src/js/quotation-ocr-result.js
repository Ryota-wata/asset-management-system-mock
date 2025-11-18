/**
 * AI-OCR明細抽出結果画面のJavaScript
 */

// グローバル変数
let currentQuotationId = null;
let currentQuotation = null;
let ocrExtractedDetails = [];

// 初期化
function initQuotationOcrResultPage(quotationId) {
    console.log('=== Initializing Quotation OCR Result Page ===', quotationId);

    currentQuotationId = quotationId;

    // 見積書データを取得
    if (typeof window.quotationDocuments !== 'undefined') {
        currentQuotation = window.quotationDocuments.find(q => q.id === quotationId);
    }

    if (!currentQuotation) {
        console.error('Quotation not found:', quotationId);
        return;
    }

    // OCR抽出結果を生成（サンプルデータ）
    generateOcrExtractedDetails();

    // 基本情報を表示
    displayBasicInfo();

    // OCR明細テーブルをレンダリング
    renderOcrDetailsTable();
}

// OCR抽出明細を生成（サンプルデータ）
function generateOcrExtractedDetails() {
    // 実際のシステムではAI-OCRサービスから取得
    // ここではサンプルデータを生成
    ocrExtractedDetails = [
        {
            no: 1,
            itemName: '人工呼吸器',
            maker: 'フィリップス',
            model: 'V60',
            quantity: 2,
            unitPrice: 1500000,
            amount: 3000000,
            assetMasterMatch: {
                matched: true,
                assetName: '人工呼吸器',
                category: '大型機器',
                isIndividual: true
            },
            confidence: 0.95
        },
        {
            no: 2,
            itemName: 'パルスオキシメータ',
            maker: 'コニカミノルタ',
            model: 'PULSOX-300',
            quantity: 5,
            unitPrice: 80000,
            amount: 400000,
            assetMasterMatch: {
                matched: true,
                assetName: 'パルスオキシメータ',
                category: '小型機器',
                isIndividual: false
            },
            confidence: 0.92
        },
        {
            no: 3,
            itemName: 'ベッドサイドモニタ',
            maker: '日本光電',
            model: 'BSM-2301',
            quantity: 3,
            unitPrice: 800000,
            amount: 2400000,
            assetMasterMatch: {
                matched: true,
                assetName: 'ベッドサイドモニター',
                category: '大型機器',
                isIndividual: true
            },
            confidence: 0.88
        },
        {
            no: 4,
            itemName: '注射器',
            maker: 'テルモ',
            model: 'SS-10ES',
            quantity: 100,
            unitPrice: 150,
            amount: 15000,
            assetMasterMatch: {
                matched: true,
                assetName: '注射器（10mL）',
                category: '消耗品',
                isIndividual: false
            },
            confidence: 0.90
        },
        {
            no: 5,
            itemName: '超音波診断装置',
            maker: 'GEヘルスケア',
            model: 'Vivid T9',
            quantity: 1,
            unitPrice: 8000000,
            amount: 8000000,
            assetMasterMatch: {
                matched: true,
                assetName: '超音波診断装置',
                category: '大型機器',
                isIndividual: true
            },
            confidence: 0.96
        },
        {
            no: 6,
            itemName: '電動ベッド',
            maker: 'パラマウントベッド',
            model: 'KA-7000',
            quantity: 10,
            unitPrice: 350000,
            amount: 3500000,
            assetMasterMatch: {
                matched: true,
                assetName: '電動ベッド',
                category: '大型機器',
                isIndividual: true
            },
            confidence: 0.94
        },
        {
            no: 7,
            itemName: '保守点検費用',
            maker: '-',
            model: '-',
            quantity: 1,
            unitPrice: 200000,
            amount: 200000,
            assetMasterMatch: {
                matched: false,
                assetName: null,
                category: 'サービス',
                isIndividual: false
            },
            confidence: 0.00
        }
    ];

    // グローバルに保存
    window.ocrExtractedDetails = ocrExtractedDetails;
}

// 基本情報を表示
function displayBasicInfo() {
    document.getElementById('ocrRfqNo').textContent = currentQuotation.rfqNo;
    document.getElementById('ocrVendor').textContent = currentQuotation.vendor;
    document.getElementById('ocrQuotationDate').textContent = currentQuotation.quotationDate;
    document.getElementById('ocrExecutionDate').textContent = currentQuotation.ocrDate || new Date().toISOString().split('T')[0];

    const detailCount = ocrExtractedDetails.length;
    const individualCount = ocrExtractedDetails.filter(d => d.assetMasterMatch.isIndividual).length;

    document.getElementById('ocrDetailCount').textContent = `${detailCount}件`;
    document.getElementById('ocrIndividualCount').textContent = `${individualCount}件`;
    document.getElementById('ocrExtractedCount').textContent = `${detailCount}件抽出`;
}

// OCR明細テーブルをレンダリング
function renderOcrDetailsTable() {
    const tbody = document.getElementById('ocrDetailsBody');

    tbody.innerHTML = ocrExtractedDetails.map(detail => {
        const rowClass = detail.assetMasterMatch.isIndividual ? 'individual-item' : '';
        const matchBadgeClass = detail.assetMasterMatch.matched ? 'matched' : 'no-match';
        const matchBadgeText = detail.assetMasterMatch.matched ? 'マッチ' : '未マッチ';

        const confidenceClass = detail.confidence >= 0.9 ? 'high' : detail.confidence >= 0.7 ? 'medium' : 'low';
        const confidencePercent = Math.round(detail.confidence * 100);

        const individualBadgeClass = detail.assetMasterMatch.isIndividual ? 'yes' : 'no';
        const individualBadgeText = detail.assetMasterMatch.isIndividual ? '個体管理' : '対象外';

        return `
            <tr class="${rowClass}">
                <td style="text-align: center; font-weight: 600;">${detail.no}</td>
                <td style="font-weight: 600;">${detail.itemName}</td>
                <td>${detail.maker}</td>
                <td>${detail.model}</td>
                <td style="text-align: center;">${detail.quantity}</td>
                <td style="text-align: right;">¥${detail.unitPrice.toLocaleString()}</td>
                <td style="text-align: right; font-weight: 600;">¥${detail.amount.toLocaleString()}</td>
                <td>
                    ${detail.assetMasterMatch.matched ? `
                        <div class="asset-match">
                            <div class="asset-match-name">${detail.assetMasterMatch.assetName}</div>
                            <div class="asset-match-category">${detail.assetMasterMatch.category}</div>
                        </div>
                    ` : `
                        <span class="match-status-badge ${matchBadgeClass}">${matchBadgeText}</span>
                    `}
                </td>
                <td style="text-align: center;">
                    <span class="individual-badge ${individualBadgeClass}">${individualBadgeText}</span>
                </td>
                <td>
                    ${detail.assetMasterMatch.matched ? `
                        <div class="confidence-score">
                            <div class="confidence-bar">
                                <div class="confidence-fill ${confidenceClass}" style="width: ${confidencePercent}%;"></div>
                            </div>
                            <span class="confidence-value">${confidencePercent}%</span>
                        </div>
                    ` : '-'}
                </td>
            </tr>
        `;
    }).join('');

    // サマリーを更新
    const totalAmount = ocrExtractedDetails.reduce((sum, d) => sum + d.amount, 0);
    const individualCount = ocrExtractedDetails.filter(d => d.assetMasterMatch.isIndividual).length;

    document.getElementById('ocrTotalAmount').textContent = `¥${totalAmount.toLocaleString()}`;
    document.getElementById('ocrIndividualItemCount').textContent = `${individualCount}件`;
}

// 申請との紐付けチェック画面へ遷移
function goToMatchingCheck() {
    document.getElementById('quotationOcrResultPage').classList.remove('active');
    document.getElementById('quotationMatchingPage').classList.add('active');

    if (typeof window.initQuotationMatchingPage === 'function') {
        window.initQuotationMatchingPage(currentQuotationId);
    }
}

// 戻るボタン
function handleBackFromOcrResult() {
    if (confirm('見積DataBoxに戻りますか？')) {
        document.getElementById('quotationOcrResultPage').classList.remove('active');
        document.getElementById('quotationDataBoxPage').classList.add('active');

        if (typeof window.initQuotationDataBoxPage === 'function') {
            window.initQuotationDataBoxPage();
        }
    }
}

// グローバルに公開
window.initQuotationOcrResultPage = initQuotationOcrResultPage;
window.goToMatchingCheck = goToMatchingCheck;
window.handleBackFromOcrResult = handleBackFromOcrResult;
