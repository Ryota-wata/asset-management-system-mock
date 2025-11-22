/**
 * 画面遷移ロジック
 * 各画面間の遷移処理を管理します。
 * PageNavigationHelperと画面遷移関数を統合したモジュール。
 */

// =============================================================================
// PageNavigationHelper - 画面遷移ヘルパーオブジェクト
// =============================================================================

window.PageNavigationHelper = {
    /**
     * 全ての画面から .active クラスを削除
     */
    clearAllPages() {
        console.log('[PageNavigationHelper] Clearing all pages...');

        // 全ての画面要素をIDで直接指定（クラス名の不一致を回避）
        const pageIds = [
            'loginPage', 'mainContainer', 'qrIssuePage', 'qrPrintPage',
            'offlinePrepPage', 'surveyPage', 'historyListPage',
            'assetImportPage', 'assetMatchingPage', 'dataMatchingPage',
            'searchResultPage', 'assetDetailPage', 'applicationListPage', 'rfqListPage',
            'quotationDataBoxPage', 'quotationProcessingPage',
            'individualManagementListPage', 'assetSurveyIntegratedPage',
            'shipFacilityMasterPage', 'shipAssetMasterPage', 'registrationEditPage'
        ];

        let removedCount = 0;
        pageIds.forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page && page.classList.contains('active')) {
                console.log(`[PageNavigationHelper] Removing active from: ${pageId}`);
                page.classList.remove('active');
                removedCount++;
            }
        });

        console.log(`[PageNavigationHelper] Removed active from ${removedCount} pages`);
    },

    /**
     * 指定した画面のみを表示（他は全て非表示）
     * @param {string} pageId - 表示する画面のID（例: 'applicationListPage'）
     * @param {function} initFunction - 画面の初期化関数（オプション）
     */
    showPage(pageId, initFunction = null) {
        console.log(`[PageNavigation] Switching to: ${pageId}`);

        // 全画面を非表示
        this.clearAllPages();

        // 指定画面を表示
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');

            // 初期化関数があれば実行
            if (initFunction && typeof initFunction === 'function') {
                console.log(`[PageNavigation] Initializing ${pageId}`);
                initFunction();
            }
        } else {
            console.error(`[PageNavigation] Page not found: ${pageId}`);
        }
    },

    /**
     * 全てのモーダルを閉じる
     */
    closeAllModals() {
        const allModals = document.querySelectorAll('.modal');
        allModals.forEach(modal => {
            modal.classList.remove('active');
        });
    },

    /**
     * 汎用的な戻るボタンハンドラー
     * @param {string} fromPageId - 遷移元の画面ID
     * @param {string} toPageId - 遷移先の画面ID
     * @param {function} onBeforeBack - 戻る前に実行するコールバック（任意）
     * @returns {function} 戻るボタンのハンドラー関数
     */
    createBackHandler(fromPageId, toPageId, onBeforeBack = null) {
        return function() {
            // 戻る前の処理があれば実行
            if (onBeforeBack && typeof onBeforeBack === 'function') {
                const shouldContinue = onBeforeBack();
                if (shouldContinue === false) {
                    return; // キャンセル
                }
            }

            // 画面遷移
            if (window.PageNavigationHelper) {
                window.PageNavigationHelper.clearAllPages();
                const toPage = document.getElementById(toPageId);
                if (toPage) {
                    toPage.classList.add('active');
                }
            } else {
                // フォールバック
                const fromPage = document.getElementById(fromPageId);
                const toPage = document.getElementById(toPageId);
                if (fromPage) fromPage.classList.remove('active');
                if (toPage) toPage.classList.add('active');
            }
        };
    },

    /**
     * モーダル外クリックハンドラーを作成
     * @param {string} modalId - モーダルのID
     * @param {function} closeFunction - モーダルを閉じる関数
     * @returns {function} 外クリックハンドラー関数
     */
    createModalOutsideClickHandler(modalId, closeFunction) {
        return function(event) {
            if (event.target.id === modalId) {
                if (typeof closeFunction === 'function') {
                    closeFunction();
                } else {
                    // デフォルト: activeクラスを削除
                    event.target.classList.remove('active');
                }
            }
        };
    }
};

// グローバルエイリアス
window.switchToPage = window.PageNavigationHelper.showPage.bind(window.PageNavigationHelper);

// =============================================================================
// 画面遷移関数
// =============================================================================

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
 * QRコード発行画面への遷移（個体管理リスト作成モーダルから）
 */
function handleQRIssueFromModal() {
    if (typeof closeListModal === 'function') {
        closeListModal();
    }
    transitionPage('mainContainer', 'qrIssuePage');
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
 * QRコード発行画面から戻る（資産検索画面へ直接遷移）
 */
function handleBackFromQRIssue() {
    transitionPage('qrIssuePage', 'mainContainer');
}

/**
 * QRコード印刷画面から発行画面に戻る
 */
function handleBackFromQRPrint() {
    transitionPage('qrPrintPage', 'qrIssuePage');
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

/**
 * 個体管理リスト原本画面に遷移
 */
function goToIndividualManagementList() {
    console.log('[goToIndividualManagementList] Called from navigation.js');

    // 現在アクティブな画面を取得
    const activePages = ['searchResultPage', 'assetDetailPage', 'applicationListPage', 'rfqListPage', 'mainContainer'];
    const currentPage = activePages.find(pageId => {
        const page = document.getElementById(pageId);
        return page && page.classList.contains('active');
    });

    console.log('[goToIndividualManagementList] Current active page:', currentPage || 'none found');

    if (currentPage) {
        transitionPage(currentPage, 'individualManagementListPage');
    } else {
        // フォールバック: mainContainerから遷移
        transitionPage('mainContainer', 'individualManagementListPage');
    }

    if (typeof window.initIndividualManagementListPage === 'function') {
        window.initIndividualManagementListPage();
    }
}

// グローバルスコープに関数を公開
window.transitionPage = transitionPage;
window.handleQRIssueFromModal = handleQRIssueFromModal;
window.handleBackFromEdit = handleBackFromEdit;
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
window.goToIndividualManagementList = goToIndividualManagementList;

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
