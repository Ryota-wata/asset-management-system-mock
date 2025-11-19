/**
 * 見積依頼一覧画面のJavaScript
 */

// 初期化
function initRfqListPage() {
    console.log('=== Initializing RFQ List Page ===');

    const countElement = document.getElementById('rfqCount');
    if (countElement) {
        countElement.textContent = '0件';
    }
}

// 戻るボタン
function handleBackFromRfqList() {
    if (window.PageNavigationHelper) {
        window.PageNavigationHelper.showPage('mainContainer');
    } else {
        document.getElementById('rfqListPage').classList.remove('active');
        document.getElementById('mainContainer').classList.add('active');
    }
}

// グローバルスコープに公開
window.initRfqListPage = initRfqListPage;
window.handleBackFromRfqList = handleBackFromRfqList;
