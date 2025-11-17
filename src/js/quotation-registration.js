/**
 * 見積明細登録画面のJavaScript
 */

// グローバル変数
let selectedRfqData = null;
let quotationDetailsData = [];

// 初期化
function initQuotationRegistrationPage() {
    console.log('=== Initializing Quotation Registration Page ===');

    // 見積依頼一覧をロード
    loadRfqSelectOptions();

    // 今日の日付をデフォルト設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quotationDate').value = today;
}

// 見積依頼No選択肢をロード
function loadRfqSelectOptions() {
    const select = document.getElementById('selectedRfqNo');

    if (typeof window.rfqRecords === 'undefined' || !window.rfqRecords) {
        console.log('rfqRecords not found');
        return;
    }

    // 見積依頼済または依頼書作成待の見積依頼のみ表示
    const availableRfqs = window.rfqRecords.filter(rfq =>
        rfq.status === '見積依頼済' || rfq.status === '依頼書作成待'
    );

    availableRfqs.forEach(rfq => {
        const option = document.createElement('option');
        option.value = rfq.rfqNo;
        option.textContent = `${rfq.rfqNo} - ${rfq.vendor}`;
        select.appendChild(option);
    });
}

// 見積依頼No変更時
function onRfqNoChange() {
    const rfqNo = document.getElementById('selectedRfqNo').value;

    if (!rfqNo) {
        document.getElementById('rfqInfoDisplay').style.display = 'none';
        selectedRfqData = null;
        quotationDetailsData = [];
        renderQuotationDetailsTable();
        return;
    }

    // 選択した見積依頼のデータを取得
    const rfq = window.rfqRecords.find(r => r.rfqNo === rfqNo);
    if (!rfq) return;

    selectedRfqData = rfq;

    // 情報表示
    document.getElementById('rfqInfoDisplay').style.display = 'block';
    document.getElementById('rfqVendor').textContent = rfq.vendor;
    document.getElementById('rfqApplicationCount').textContent = `${rfq.applicationIds.length}件`;

    // 購入先を自動入力
    document.getElementById('quotationVendor').value = rfq.vendor;

    // 紐づく申請から見積明細の初期データを生成
    generateInitialQuotationDetails();
}

// 見積明細の初期データを生成
function generateInitialQuotationDetails() {
    if (!selectedRfqData || typeof window.applicationListData === 'undefined') {
        return;
    }

    quotationDetailsData = [];

    // 見積依頼に紐づく申請を取得
    const applications = window.applicationListData.filter(app =>
        selectedRfqData.applicationIds.includes(app.id)
    );

    // 各申請から見積明細行を生成
    applications.forEach(app => {
        quotationDetailsData.push({
            applicationNo: app.applicationNo,
            itemName: app.asset.name,
            maker: '',
            model: app.asset.model || '',
            quantity: app.quantity,
            unitPrice: 0,
            amount: 0,
            category: '本体'
        });
    });

    renderQuotationDetailsTable();
}

// 見積明細テーブルをレンダリング
function renderQuotationDetailsTable() {
    const tbody = document.getElementById('quotationDetailsBody');

    if (quotationDetailsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #95a5a6;">
                    見積依頼Noを選択してください
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = quotationDetailsData.map((detail, index) => `
        <tr>
            <td>
                <div class="item-name">${detail.applicationNo}</div>
            </td>
            <td>
                <div class="item-name">${detail.itemName}</div>
            </td>
            <td>
                <input type="text" value="${detail.maker}"
                       onchange="updateDetailField(${index}, 'maker', this.value)"
                       placeholder="メーカー">
            </td>
            <td>
                <input type="text" value="${detail.model}"
                       onchange="updateDetailField(${index}, 'model', this.value)"
                       placeholder="型式">
            </td>
            <td>
                <div style="text-align: center;">${detail.quantity}</div>
            </td>
            <td>
                <input type="number" value="${detail.unitPrice}"
                       onchange="updateDetailField(${index}, 'unitPrice', parseFloat(this.value) || 0)"
                       placeholder="0">
            </td>
            <td>
                <div style="text-align: right; font-weight: 600;">
                    ¥${detail.amount.toLocaleString()}
                </div>
            </td>
            <td>
                <select onchange="updateDetailField(${index}, 'category', this.value)">
                    <option value="本体" ${detail.category === '本体' ? 'selected' : ''}>本体</option>
                    <option value="付属品" ${detail.category === '付属品' ? 'selected' : ''}>付属品</option>
                    <option value="消耗品" ${detail.category === '消耗品' ? 'selected' : ''}>消耗品</option>
                    <option value="工事費" ${detail.category === '工事費' ? 'selected' : ''}>工事費</option>
                    <option value="その他" ${detail.category === 'その他' ? 'selected' : ''}>その他</option>
                </select>
            </td>
            <td style="text-align: center;">
                <button class="remove-row-btn" onclick="removeDetailRow(${index})">削除</button>
            </td>
        </tr>
    `).join('');

    // 合計金額を自動計算
    calculateTotalAmount();
}

// 明細フィールド更新
function updateDetailField(index, field, value) {
    if (quotationDetailsData[index]) {
        quotationDetailsData[index][field] = value;

        // 単価変更時は金額を再計算
        if (field === 'unitPrice') {
            const quantity = parseQuantity(quotationDetailsData[index].quantity);
            quotationDetailsData[index].amount = value * quantity;
            renderQuotationDetailsTable();
        }
    }
}

// 数量をパース（"1台" → 1）
function parseQuantity(quantityStr) {
    const match = String(quantityStr).match(/\d+/);
    return match ? parseInt(match[0]) : 1;
}

// 明細行を追加
function addQuotationDetailRow() {
    if (!selectedRfqData) {
        alert('先に見積依頼Noを選択してください');
        return;
    }

    quotationDetailsData.push({
        applicationNo: '-',
        itemName: '',
        maker: '',
        model: '',
        quantity: '1式',
        unitPrice: 0,
        amount: 0,
        category: 'その他'
    });

    renderQuotationDetailsTable();
}

// 明細行を削除
function removeDetailRow(index) {
    if (confirm('この行を削除しますか？')) {
        quotationDetailsData.splice(index, 1);
        renderQuotationDetailsTable();
    }
}

// 合計金額を自動計算
function calculateTotalAmount() {
    const total = quotationDetailsData.reduce((sum, detail) => sum + detail.amount, 0);
    document.getElementById('quotationTotal').value = total;
}

// ファイル選択
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('selectedFileInfo').style.display = 'flex';
        document.getElementById('fileUploadArea').style.display = 'none';
    }
}

// ファイル削除
function removeFile() {
    document.getElementById('quotationFile').value = '';
    document.getElementById('selectedFileInfo').style.display = 'none';
    document.getElementById('fileUploadArea').style.display = 'block';
}

// 下書き保存
function saveQuotationDraft() {
    alert('下書き保存機能は今後実装予定です');
}

// 見積明細登録
function submitQuotationRegistration() {
    // バリデーション
    const rfqNo = document.getElementById('selectedRfqNo').value;
    const vendor = document.getElementById('quotationVendor').value.trim();
    const date = document.getElementById('quotationDate').value;
    const total = document.getElementById('quotationTotal').value;
    const phase = document.querySelector('input[name="quotationPhase"]:checked').value;

    if (!rfqNo) {
        alert('見積依頼Noを選択してください');
        return;
    }

    if (!vendor) {
        alert('見積業者を入力してください');
        return;
    }

    if (!date) {
        alert('見積日を入力してください');
        return;
    }

    if (!total || parseFloat(total) <= 0) {
        alert('合計金額を入力してください');
        return;
    }

    // 明細チェック
    const hasEmptyMaker = quotationDetailsData.some(d => !d.maker);
    if (hasEmptyMaker) {
        if (!confirm('メーカーが未入力の明細があります。このまま登録しますか？')) {
            return;
        }
    }

    // 見積明細データを作成
    const quotationData = {
        rfqNo: rfqNo,
        vendor: vendor,
        quotationDate: date,
        expiryDate: document.getElementById('quotationExpiry').value,
        totalAmount: parseFloat(total),
        phase: phase,
        details: quotationDetailsData,
        registeredDate: new Date().toISOString().split('T')[0]
    };

    console.log('Quotation Data:', quotationData);

    // グローバルに保存（見積明細DataBOX画面で使用）
    if (!window.quotationData) {
        window.quotationData = {};
    }
    window.quotationData[rfqNo] = window.quotationData[rfqNo] || [];
    window.quotationData[rfqNo].push(quotationData);

    // 見積依頼レコードの状態を更新
    const rfq = window.rfqRecords.find(r => r.rfqNo === rfqNo);
    if (rfq) {
        if (phase === '最終') {
            rfq.status = '見積登録済';
            rfq.totalAmount = parseFloat(total);
        }
    }

    alert(`見積明細を登録しました\n\n見積依頼No: ${rfqNo}\n見積フェーズ: ${phase}\n合計金額: ¥${parseFloat(total).toLocaleString()}`);

    // 見積明細DataBOX画面へ遷移
    goToQuotationDataBox(rfqNo);
}

// 見積明細DataBOX画面へ遷移
function goToQuotationDataBox(rfqNo) {
    document.getElementById('quotationRegistrationPage').classList.remove('active');
    document.getElementById('quotationDataBoxPage').classList.add('active');

    // 見積明細DataBOX画面を初期化
    if (typeof window.initQuotationDataBoxPage === 'function') {
        window.initQuotationDataBoxPage(rfqNo);
    }
}

// 戻るボタン
function handleBackFromQuotationRegistration() {
    if (confirm('入力内容が失われますが、戻りますか？')) {
        document.getElementById('quotationRegistrationPage').classList.remove('active');
        document.getElementById('rfqListPage').classList.add('active');
    }
}

// グローバルに公開
window.initQuotationRegistrationPage = initQuotationRegistrationPage;
window.onRfqNoChange = onRfqNoChange;
window.handleFileSelect = handleFileSelect;
window.removeFile = removeFile;
window.addQuotationDetailRow = addQuotationDetailRow;
window.removeDetailRow = removeDetailRow;
window.updateDetailField = updateDetailField;
window.saveQuotationDraft = saveQuotationDraft;
window.submitQuotationRegistration = submitQuotationRegistration;
window.handleBackFromQuotationRegistration = handleBackFromQuotationRegistration;
