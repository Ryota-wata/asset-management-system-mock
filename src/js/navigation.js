/**
 * 画面遷移ロジック
 * 各画面間の遷移処理を管理します。
 */

/**
 * 画面遷移ヘルパー関数
 * @param {string} fromPageId - 遷移元の画面ID
 * @param {string} toPageId - 遷移先の画面ID
 */
function transitionPage(fromPageId, toPageId) {
    // PageNavigationHelperが利用可能な場合は、確実に全画面をクリアしてから遷移
    if (window.PageNavigationHelper) {
        console.log(`[transitionPage] Using PageNavigationHelper: ${fromPageId} -> ${toPageId}`);
        // 全画面のactiveをクリア
        window.PageNavigationHelper.clearAllPages();
        // 遷移先のみをactiveに
        const toPage = document.getElementById(toPageId);
        if (toPage) {
            toPage.classList.add('active');
        }
    } else {
        // フォールバック: 従来の動作
        const fromPage = document.getElementById(fromPageId);
        const toPage = document.getElementById(toPageId);
        if (fromPage) fromPage.classList.remove('active');
        if (toPage) toPage.classList.add('active');
    }
}

/**
 * QRコード管理画面への遷移
 */
function handleQRManagement() {
    transitionPage('mainContainer', 'qrPage');
}

/**
 * QRコード管理画面から戻る
 */
function handleBackFromQR() {
    transitionPage('qrPage', 'mainContainer');
}

/**
 * 登録内容修正画面から戻る
 */
function handleBackFromEdit() {
    if (window.currentEditingRow) {
        if (confirm('編集中のデータがあります。破棄して戻りますか？')) {
            transitionPage('registrationEditPage', 'mainContainer');
            closeListModal();
        }
    } else {
        transitionPage('registrationEditPage', 'mainContainer');
        closeListModal();
    }
}

/**
 * QRコード詳細画面から一覧に戻る
 */
function handleBackFromQRDetail() {
    transitionPage('qrDetailPage', 'qrPage');
}

/**
 * QRコード新規発行画面から一覧に戻る
 */
function handleBackFromQRIssue() {
    transitionPage('qrIssuePage', 'qrPage');
}

/**
 * QRコード印刷画面から戻る
 * 呼び出し元に応じて戻る先を変更
 */
function handleBackFromQRPrint() {
    const toPageId = window.qrPrintFromPage === 'detail' ? 'qrDetailPage' : 'qrPage';
    transitionPage('qrPrintPage', toPageId);
    window.qrPrintFromPage = '';
}

/**
 * 現有資産調査画面から検索画面に戻る
 */
function handleBackFromSurvey() {
    transitionPage('surveyPage', 'offlinePrepPage');
}

/**
 * 現有資産調査画面から統合画面へ遷移
 */
function handleSurveyNext() {
    transitionPage('surveyPage', 'assetSurveyIntegratedPage');
}

/**
 * オフライン準備画面から検索画面に戻る
 */
function handleBackFromOfflinePrep() {
    transitionPage('offlinePrepPage', 'mainContainer');
    closeListModal();
}

/**
 * 個体管理リストモーダルからデータ突合画面へ遷移
 */
function handleDataMatchingFromModal() {
    if (typeof closeListModal === 'function') {
        closeListModal();
    }

    transitionPage('mainContainer', 'dataMatchingPage');

    if (typeof renderSurveyList === 'function') {
        renderSurveyList();
    }
}

/**
 * オフライン準備画面から現有資産調査画面へ遷移
 */
function handleStartSurvey() {
    transitionPage('offlinePrepPage', 'surveyPage');

    if (typeof loadSurveyMasterData === 'function') {
        loadSurveyMasterData();
    }
}

/**
 * 現有資産調査統合画面から履歴表示画面へ遷移
 */
function handleShowHistoryList() {
    transitionPage('assetSurveyIntegratedPage', 'historyListPage');
}

/**
 * 履歴表示画面から現有資産調査統合画面に戻る
 */
function handleBackFromHistoryList() {
    transitionPage('historyListPage', 'assetSurveyIntegratedPage');
}

/**
 * 部門入力へボタンで現有資産調査画面へ遷移
 */
function handleGoToSurvey() {
    // 統合画面と履歴画面を非表示
    const assetSurveyIntegrated = document.getElementById('assetSurveyIntegratedPage');
    const historyList = document.getElementById('historyListPage');

    if (assetSurveyIntegrated) assetSurveyIntegrated.classList.remove('active');
    if (historyList) historyList.classList.remove('active');

    // 現有資産調査画面を表示
    const surveyPage = document.getElementById('surveyPage');
    if (surveyPage) surveyPage.classList.add('active');
}

/**
 * 資産台帳取込画面への遷移（個体管理リストモーダルから）
 */
function handleAssetImport() {
    if (typeof closeListModal === 'function') {
        closeListModal();
    }

    transitionPage('mainContainer', 'assetImportPage');
}

/**
 * 資産台帳取込画面から戻る
 */
function handleBackFromImport() {
    transitionPage('assetImportPage', 'mainContainer');

    if (typeof showListModal === 'function') {
        showListModal();
    }
}

/**
 * インポート画面から突き合わせ画面へ遷移
 */
function handleImportToMatching() {
    transitionPage('assetImportPage', 'assetMatchingPage');
}

/**
 * 突き合わせ画面から戻る（資産検索画面に戻る）
 */
function handleBackFromMatching() {
    transitionPage('assetMatchingPage', 'mainContainer');

    if (typeof closeListModal === 'function') {
        closeListModal();
    }
}

/**
 * 資産検索画面から資産検索結果画面へ遷移
 */
function handleViewSearchResult() {
    console.log('=== handleViewSearchResult called ===');

    const mainContainer = document.getElementById('mainContainer');
    const searchResultPage = document.getElementById('searchResultPage');

    if (!mainContainer || !searchResultPage) {
        console.error('Required elements not found!');
        return;
    }

    transitionPage('mainContainer', 'searchResultPage');

    console.log('=== Screen transition complete ===');

    // 資産検索結果画面の初期化を直接呼び出し
    setTimeout(() => {
        if (typeof window.initSearchResultPage === 'function') {
            window.initSearchResultPage();
        } else {
            console.error('initSearchResultPage is not defined!');
        }
    }, 100);
}

/**
 * 資産検索結果画面から資産検索画面に戻る
 */
function handleBackFromSearchResult() {
    transitionPage('searchResultPage', 'mainContainer');
}

/**
 * メイン画面から申請一覧画面へ遷移
 */
function goToApplicationList() {
    transitionPage('mainContainer', 'applicationListPage');

    if (typeof window.initApplicationListPage === 'function') {
        window.initApplicationListPage();
    }
}

/**
 * メイン画面から見積依頼一覧画面へ遷移
 */
function goToRfqList() {
    transitionPage('mainContainer', 'rfqListPage');

    if (typeof window.initRfqListPage === 'function') {
        window.initRfqListPage();
    }
}

/**
 * メイン画面から見積DataBox画面へ直接遷移
 */
function goToQuotationDataBoxDirect() {
    transitionPage('mainContainer', 'quotationDataBoxPage');

    if (typeof window.initQuotationDataBoxPage === 'function') {
        window.initQuotationDataBoxPage();
    }
}

/**
 * テスト用: 見積DataBoxからOCR結果画面へ（サンプルデータで）
 */
function goToOcrResultPageTest() {
    // サンプルの見積書IDで遷移
    const sampleQuotationId = window.quotationDocuments?.[0]?.id || 'Q-1737000000001';

    transitionPage('quotationDataBoxPage', 'quotationOcrResultPage');

    if (typeof window.initQuotationOcrResultPage === 'function') {
        window.initQuotationOcrResultPage(sampleQuotationId);
    }
}

/**
 * テスト用: OCR結果画面から紐付けチェック画面へ
 */
function goToMatchingCheckTest() {
    const sampleQuotationId = window.quotationDocuments?.[0]?.id || 'Q-1737000000001';

    transitionPage('quotationOcrResultPage', 'quotationMatchingPage');

    if (typeof window.initQuotationMatchingPage === 'function') {
        window.initQuotationMatchingPage(sampleQuotationId);
    }
}

/**
 * テスト用: 紐付けチェック画面から発注書出力画面へ
 */
function goToOrderTemplateTest() {
    const sampleQuotationId = window.quotationDocuments?.[0]?.id || 'Q-1737000000001';

    transitionPage('quotationMatchingPage', 'orderTemplatePage');

    if (typeof window.initOrderTemplatePage === 'function') {
        window.initOrderTemplatePage(sampleQuotationId);
    }
}

/**
 * 資産検索結果画面から申請一覧画面へ遷移
 */
function goToApplicationListFromSearch() {
    transitionPage('searchResultPage', 'applicationListPage');

    if (typeof window.initApplicationListPage === 'function') {
        window.initApplicationListPage();
    }
}

/**
 * 資産検索結果画面から見積依頼一覧画面へ遷移
 */
function goToRfqListFromSearch() {
    transitionPage('searchResultPage', 'rfqListPage');

    if (typeof window.initRfqListPage === 'function') {
        window.initRfqListPage();
    }
}

/**
 * 資産検索結果画面から見積DataBox画面へ遷移
 */
function goToQuotationDataBoxFromSearch() {
    transitionPage('searchResultPage', 'quotationDataBoxPage');

    if (typeof window.initQuotationDataBoxPage === 'function') {
        window.initQuotationDataBoxPage();
    }
}

/**
 * 汎用: 申請一覧画面へ遷移（どの画面からでも）
 */
function goToApplicationList() {
    console.log('[goToApplicationList] Called from navigation.js');

    // 現在アクティブな画面を取得
    const activePages = ['searchResultPage', 'rfqListPage', 'quotationDataBoxPage', 'mainContainer', 'individualManagementListPage'];
    const currentPage = activePages.find(pageId => {
        const page = document.getElementById(pageId);
        return page && page.classList.contains('active');
    });

    console.log('[goToApplicationList] Current active page:', currentPage || 'none found');

    if (currentPage) {
        transitionPage(currentPage, 'applicationListPage');
    } else {
        // フォールバック: mainContainerから遷移
        transitionPage('mainContainer', 'applicationListPage');
    }

    if (typeof window.initApplicationListPage === 'function') {
        window.initApplicationListPage();
    }
}

/**
 * 汎用: 見積依頼一覧画面へ遷移（どの画面からでも）
 */
function goToRfqList() {
    console.log('[goToRfqList] Called from navigation.js');

    // 現在アクティブな画面を取得
    const activePages = ['searchResultPage', 'applicationListPage', 'quotationDataBoxPage', 'mainContainer', 'individualManagementListPage'];
    const currentPage = activePages.find(pageId => {
        const page = document.getElementById(pageId);
        return page && page.classList.contains('active');
    });

    console.log('[goToRfqList] Current active page:', currentPage || 'none found');

    if (currentPage) {
        transitionPage(currentPage, 'rfqListPage');
    } else {
        // フォールバック: mainContainerから遷移
        transitionPage('mainContainer', 'rfqListPage');
    }

    if (typeof window.initRfqListPage === 'function') {
        window.initRfqListPage();
    }
}

/**
 * 汎用: 見積DataBox画面へ遷移（どの画面からでも）
 */
function goToQuotationDataBox() {
    console.log('[goToQuotationDataBox] Called from navigation.js');

    // 現在アクティブな画面を取得
    const activePages = ['searchResultPage', 'applicationListPage', 'rfqListPage', 'mainContainer', 'individualManagementListPage'];
    const currentPage = activePages.find(pageId => {
        const page = document.getElementById(pageId);
        return page && page.classList.contains('active');
    });

    console.log('[goToQuotationDataBox] Current active page:', currentPage || 'none found');

    if (currentPage) {
        transitionPage(currentPage, 'quotationDataBoxPage');
    } else {
        // フォールバック: mainContainerから遷移
        transitionPage('mainContainer', 'quotationDataBoxPage');
    }

    if (typeof window.initQuotationDataBoxPage === 'function') {
        window.initQuotationDataBoxPage();
    }
}

// グローバルスコープに関数を公開
window.transitionPage = transitionPage;
window.handleQRManagement = handleQRManagement;
window.handleBackFromQR = handleBackFromQR;
window.handleBackFromEdit = handleBackFromEdit;
window.handleBackFromQRDetail = handleBackFromQRDetail;
window.handleBackFromQRIssue = handleBackFromQRIssue;
window.handleBackFromQRPrint = handleBackFromQRPrint;
window.handleBackFromSurvey = handleBackFromSurvey;
window.handleSurveyNext = handleSurveyNext;
window.handleBackFromOfflinePrep = handleBackFromOfflinePrep;
window.handleDataMatchingFromModal = handleDataMatchingFromModal;
window.handleStartSurvey = handleStartSurvey;
window.handleShowHistoryList = handleShowHistoryList;
window.handleBackFromHistoryList = handleBackFromHistoryList;
window.handleGoToSurvey = handleGoToSurvey;
window.handleAssetImport = handleAssetImport;
window.handleBackFromImport = handleBackFromImport;
window.handleImportToMatching = handleImportToMatching;
window.handleBackFromMatching = handleBackFromMatching;
window.handleViewSearchResult = handleViewSearchResult;
window.handleBackFromSearchResult = handleBackFromSearchResult;
window.goToApplicationList = goToApplicationList;
window.goToRfqList = goToRfqList;
window.goToQuotationDataBox = goToQuotationDataBox;
window.goToQuotationDataBoxDirect = goToQuotationDataBoxDirect;
window.goToOcrResultPageTest = goToOcrResultPageTest;
window.goToMatchingCheckTest = goToMatchingCheckTest;
window.goToOrderTemplateTest = goToOrderTemplateTest;
window.goToApplicationListFromSearch = goToApplicationListFromSearch;
window.goToRfqListFromSearch = goToRfqListFromSearch;
window.goToQuotationDataBoxFromSearch = goToQuotationDataBoxFromSearch;

/**
 * 汎用ナビゲーションメニューの制御
 * アクティブな画面を自動判定してメニューを開閉する
 */
function toggleNavMenu() {
    // アクティブな画面を特定
    const activePageClasses = [
        'search-result-page',
        'application-list-page',
        'rfq-list-page',
        'quotation-databox-page'
    ];

    let activePageClass = null;
    for (const pageClass of activePageClasses) {
        const page = document.querySelector(`.${pageClass}.active`);
        if (page) {
            activePageClass = pageClass;
            break;
        }
    }

    if (!activePageClass) {
        console.warn('No active page found for toggleNavMenu');
        return;
    }

    // アクティブな画面のメニューボタンとドロップダウンを取得
    const btn = document.querySelector(`.${activePageClass} .nav-menu-btn`);
    const menu = document.querySelector(`.${activePageClass} .nav-menu-dropdown`);

    if (!btn || !menu) {
        console.warn(`Menu elements not found for ${activePageClass}`);
        return;
    }

    // メニューの開閉
    const isActive = menu.classList.contains('active');

    if (!isActive) {
        btn.classList.add('active');
        menu.classList.add('active');
    } else {
        btn.classList.remove('active');
        menu.classList.remove('active');
    }
}

/**
 * ドロップダウンメニューの外側クリックで閉じる
 * 全画面共通のイベントリスナー
 */
let navMenuClickListenerAdded = false;

if (!navMenuClickListenerAdded) {
    document.addEventListener('click', function(event) {
        // メニュー内のクリックは無視
        if (event.target.closest('.nav-menu')) {
            return;
        }

        // 全画面のメニューを閉じる
        const allMenuBtns = document.querySelectorAll('.nav-menu-btn');
        const allMenuDropdowns = document.querySelectorAll('.nav-menu-dropdown');

        allMenuBtns.forEach(btn => btn.classList.remove('active'));
        allMenuDropdowns.forEach(menu => menu.classList.remove('active'));
    });

    navMenuClickListenerAdded = true;
}

window.toggleNavMenu = toggleNavMenu;
