/**
 * QRコード発行・印刷機能
 * QRコードの新規発行と印刷プレビュー機能を提供します。
 */

// 発行設定の状態管理
let qrIssueState = {
    mode: 'new', // 'new' or 'reissue'
    prefix: 'H001',
    quantity: 50,
    startNumber: 501,
    remarks: ''
};

/**
 * QRコード発行画面を初期化
 */
function initQRIssuePage() {
    console.log('=== Initializing QR Issue Page ===');

    // デフォルト値を設定
    qrIssueState = {
        mode: 'new',
        prefix: 'H001',
        quantity: 50,
        startNumber: 501,
        remarks: ''
    };

    // 発行枚数の入力フィールドを更新
    const quantityInput = document.getElementById('qrIssueQuantity');
    if (quantityInput) {
        quantityInput.value = qrIssueState.quantity;
    }

    // プレビューを更新
    updateQRIssuePreview();
}

/**
 * QRコード発行画面のタブ切り替え
 * @param {string} tabName - タブ名（'new' または 'reissue'）
 */
function switchQRIssueTab(tabName) {
    qrIssueState.mode = tabName;

    // タブボタンの切り替え
    document.querySelectorAll('.qr-issue-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // タブコンテンツの切り替え
    document.querySelectorAll('.qr-issue-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetTab = document.getElementById(`qr-issue-${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

/**
 * 発行枚数変更時のプレビュー更新
 */
function updateQRIssuePreview() {
    const quantityInput = document.getElementById('qrIssueQuantity');
    if (quantityInput) {
        qrIssueState.quantity = parseInt(quantityInput.value) || 50;

        // 最大100枚に制限
        if (qrIssueState.quantity > 100) {
            qrIssueState.quantity = 100;
            quantityInput.value = 100;
        }
        if (qrIssueState.quantity < 1) {
            qrIssueState.quantity = 1;
            quantityInput.value = 1;
        }
    }

    // 番号範囲を更新
    const startNum = qrIssueState.startNumber;
    const endNum = startNum + qrIssueState.quantity - 1;

    const startDisplay = `${qrIssueState.prefix}-${String(startNum).padStart(4, '0')}`;
    const endDisplay = `${qrIssueState.prefix}-${String(endNum).padStart(4, '0')}`;

    // 表示を更新
    const rangeStart = document.getElementById('qrIssueRangeStart');
    const rangeEnd = document.getElementById('qrIssueRangeEnd');
    const countDisplay = document.getElementById('qrIssueCount');

    if (rangeStart) rangeStart.textContent = startDisplay;
    if (rangeEnd) rangeEnd.textContent = endDisplay;
    if (countDisplay) countDisplay.textContent = `(${qrIssueState.quantity}枚)`;
}

/**
 * 印刷プレビューへ遷移
 */
function goToQRPrintPreview() {
    // 発行予定番号リストを生成
    const qrNumbers = [];
    const startNum = qrIssueState.startNumber;

    for (let i = 0; i < qrIssueState.quantity; i++) {
        const num = startNum + i;
        qrNumbers.push(`${qrIssueState.prefix}-${String(num).padStart(4, '0')}`);
    }

    // 印刷画面へ遷移
    if (typeof transitionPage === 'function') {
        transitionPage('qrIssuePage', 'qrPrintPage');
    } else {
        document.getElementById('qrIssuePage').classList.remove('active');
        document.getElementById('qrPrintPage').classList.add('active');
    }

    // 印刷対象リストを更新
    updateQRPrintList(qrNumbers);
}

/**
 * 印刷対象リストを更新
 * @param {string[]} qrNumbers - QR番号の配列
 */
function updateQRPrintList(qrNumbers) {
    const tbody = document.getElementById('qrPrintTableBody');
    if (!tbody) return;

    if (qrNumbers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">印刷対象がありません</td></tr>';
        return;
    }

    // 表示行数を制限（最大10行 + 省略表示）
    const displayLimit = 10;
    let html = '';

    qrNumbers.slice(0, displayLimit).forEach((qrNumber, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td class="qr-print-qr-number-cell">${qrNumber}</td>
                <td>印刷待機中</td>
            </tr>
        `;
    });

    if (qrNumbers.length > displayLimit) {
        html += `
            <tr>
                <td colspan="3" style="text-align: center; color: #666;">
                    ... 他${qrNumbers.length - displayLimit}件 ...
                </td>
            </tr>
        `;
        // 最後の1件も表示
        html += `
            <tr>
                <td>${qrNumbers.length}</td>
                <td class="qr-print-qr-number-cell">${qrNumbers[qrNumbers.length - 1]}</td>
                <td>印刷待機中</td>
            </tr>
        `;
    }

    tbody.innerHTML = html;

    // プレビューに最初のQR番号を表示
    const previewElement = document.getElementById('qrPrintPreviewNumber');
    if (previewElement && qrNumbers.length > 0) {
        previewElement.textContent = qrNumbers[0];
    }
}

/**
 * 印刷を開始
 */
function startQRPrint() {
    alert('印刷を開始します（実装予定）');
    // TODO: 実際の印刷処理を実装
}

/**
 * 印刷をキャンセルして発行画面に戻る
 */
function cancelQRPrint() {
    if (typeof handleBackFromQRPrint === 'function') {
        handleBackFromQRPrint();
    } else {
        document.getElementById('qrPrintPage').classList.remove('active');
        document.getElementById('qrIssuePage').classList.add('active');
    }
}

/**
 * ラベルテンプレート選択モーダルを表示（将来実装）
 */
function showLabelTemplateModal() {
    alert('ラベルテンプレート選択機能は今後実装予定です');
}

/**
 * フッター項目設定モーダルを表示（将来実装）
 */
function showFooterSettingModal() {
    alert('フッター項目設定機能は今後実装予定です');
}

// グローバルスコープに関数を公開
window.initQRIssuePage = initQRIssuePage;
window.switchQRIssueTab = switchQRIssueTab;
window.updateQRIssuePreview = updateQRIssuePreview;
window.goToQRPrintPreview = goToQRPrintPreview;
window.updateQRPrintList = updateQRPrintList;
window.startQRPrint = startQRPrint;
window.cancelQRPrint = cancelQRPrint;
window.showLabelTemplateModal = showLabelTemplateModal;
window.showFooterSettingModal = showFooterSettingModal;
