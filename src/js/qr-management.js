/**
 * QRコード管理機能
 * QRコードの詳細表示、新規発行、印刷などの機能を提供します。
 */

// 印刷画面の呼び出し元を記録
window.qrPrintFromPage = '';

/**
 * QRコード詳細画面を表示
 * @param {string} qrNumber - QR番号
 */
function showQRDetail(qrNumber) {
    // QRコード管理画面を非表示
    document.getElementById('qrPage').classList.remove('active');
    // QRコード詳細画面を表示
    document.getElementById('qrDetailPage').classList.add('active');

    // QR番号を設定
    document.getElementById('qrDetailHeaderNumber').textContent = qrNumber;
    document.getElementById('qrDetailNumber').textContent = qrNumber;
    document.getElementById('qrDetailPreviewNumber').textContent = qrNumber;
}

/**
 * QRコード新規発行画面を表示
 */
function showQRIssue() {
    document.getElementById('qrPage').classList.remove('active');
    document.getElementById('qrIssuePage').classList.add('active');
}

/**
 * QRコード新規発行画面のタブ切り替え
 * @param {string} tabName - タブ名（'single' または 'bulk'）
 */
function switchQRIssueTab(tabName) {
    // タブボタンの切り替え
    document.querySelectorAll('.qr-issue-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // タブコンテンツの切り替え
    document.querySelectorAll('.qr-issue-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('qr-issue-' + tabName + '-tab').classList.add('active');
}

/**
 * QRコード新規発行画面の一括発行プレビュー更新
 */
function updateQRIssueBulkPreview() {
    // 実際の実装では、入力枚数に応じてプレビューを更新
    console.log('プレビュー更新');
}

/**
 * QRコード詳細画面から印刷
 */
function handleQRDetailPrint() {
    const qrNumber = document.getElementById('qrDetailNumber').textContent;
    window.qrPrintFromPage = 'detail';
    showQRPrint([qrNumber]);
}

/**
 * QRコード管理画面から一括印刷
 */
function handleBulkPrint() {
    const checkedBoxes = document.querySelectorAll('.qr-table-container tbody input[type="checkbox"]:checked');
    const qrNumbers = [];

    checkedBoxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const qrNumber = row.querySelector('.qr-number').textContent;
        qrNumbers.push(qrNumber);
    });

    if (qrNumbers.length > 0) {
        window.qrPrintFromPage = 'list';
        showQRPrint(qrNumbers);
    }
}

/**
 * QRコード印刷画面を表示
 * @param {string[]} qrNumbers - 印刷するQR番号の配列
 */
function showQRPrint(qrNumbers) {
    // 印刷画面を表示
    document.getElementById('qrPage').classList.remove('active');
    document.getElementById('qrDetailPage').classList.remove('active');
    document.getElementById('qrPrintPage').classList.add('active');

    // 印刷対象リストを更新
    const tbody = document.getElementById('qrPrintTableBody');
    tbody.innerHTML = '';

    qrNumbers.forEach((qrNumber, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="qr-print-qr-number-cell">${qrNumber}</td>
            <td>印刷待機中</td>
        `;
        tbody.appendChild(row);
    });

    // プレビューに最初のQR番号を表示
    if (qrNumbers.length > 0) {
        document.getElementById('qrPrintPreviewNumber').textContent = qrNumbers[0];
    }
}

/**
 * 選択数に応じてアクションボタンを有効化
 */
function updateQRActionButtons() {
    const checked = document.querySelectorAll('.qr-table-container tbody input[type="checkbox"]:checked').length;
    const actionButtons = document.querySelectorAll('.qr-action-btn');
    actionButtons.forEach(btn => {
        btn.disabled = checked === 0;
    });
    const selectedCountElement = document.querySelector('.qr-selected-count');
    if (selectedCountElement) {
        selectedCountElement.textContent = `${checked}件選択中`;
    }
}

// グローバルスコープに関数を公開
window.showQRDetail = showQRDetail;
window.showQRIssue = showQRIssue;
window.showQRPrint = showQRPrint;
window.switchQRIssueTab = switchQRIssueTab;
window.updateQRIssueBulkPreview = updateQRIssueBulkPreview;
window.handleQRDetailPrint = handleQRDetailPrint;
window.handleBulkPrint = handleBulkPrint;
window.updateQRActionButtons = updateQRActionButtons;
