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
    // QRコード管理画面から詳細画面へ遷移（navigation.jsの関数を使用）
    if (typeof transitionPage === 'function') {
        transitionPage('qrPage', 'qrDetailPage');
    } else {
        // フォールバック
        document.getElementById('qrPage').classList.remove('active');
        document.getElementById('qrDetailPage').classList.add('active');
    }

    // QR番号を設定
    document.getElementById('qrDetailHeaderNumber').textContent = qrNumber;
    document.getElementById('qrDetailNumber').textContent = qrNumber;
    document.getElementById('qrDetailPreviewNumber').textContent = qrNumber;
}

/**
 * QRコード新規発行画面を表示
 */
function showQRIssue() {
    if (typeof transitionPage === 'function') {
        transitionPage('qrPage', 'qrIssuePage');
    } else {
        // フォールバック
        document.getElementById('qrPage').classList.remove('active');
        document.getElementById('qrIssuePage').classList.add('active');
    }
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
    document.getElementById(`qr-issue-${tabName}-tab`).classList.add('active');
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
    const qrNumbers = Array.from(checkedBoxes).map(checkbox => {
        const row = checkbox.closest('tr');
        return row.querySelector('.qr-number').textContent;
    });

    if (qrNumbers.length > 0) {
        window.qrPrintFromPage = 'list';
        showQRPrint(qrNumbers);
    }
}

/**
 * 印刷対象リストのテーブル行を生成
 * @param {string} qrNumber - QR番号
 * @param {number} index - インデックス
 * @returns {string} テーブル行のHTML
 */
function createPrintTableRow(qrNumber, index) {
    return `
        <tr>
            <td>${index + 1}</td>
            <td class="qr-print-qr-number-cell">${qrNumber}</td>
            <td>印刷待機中</td>
        </tr>
    `;
}

/**
 * QRコード印刷画面を表示
 * @param {string[]} qrNumbers - 印刷するQR番号の配列
 */
function showQRPrint(qrNumbers) {
    // 印刷画面へ遷移
    const fromPageId = window.qrPrintFromPage === 'detail' ? 'qrDetailPage' : 'qrPage';

    if (typeof transitionPage === 'function') {
        transitionPage(fromPageId, 'qrPrintPage');
    } else {
        // フォールバック
        document.getElementById('qrPage').classList.remove('active');
        document.getElementById('qrDetailPage').classList.remove('active');
        document.getElementById('qrPrintPage').classList.add('active');
    }

    // 印刷対象リストを更新
    const tbody = document.getElementById('qrPrintTableBody');
    if (tbody) {
        tbody.innerHTML = qrNumbers.map((qrNumber, index) =>
            createPrintTableRow(qrNumber, index)
        ).join('');
    }

    // プレビューに最初のQR番号を表示
    if (qrNumbers.length > 0) {
        const previewElement = document.getElementById('qrPrintPreviewNumber');
        if (previewElement) {
            previewElement.textContent = qrNumbers[0];
        }
    }
}

/**
 * 選択数に応じてアクションボタンを有効化
 */
function updateQRActionButtons() {
    const checked = document.querySelectorAll('.qr-table-container tbody input[type="checkbox"]:checked').length;

    // アクションボタンの有効/無効を設定
    document.querySelectorAll('.qr-action-btn').forEach(btn => {
        btn.disabled = checked === 0;
    });

    // 選択数を表示
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
