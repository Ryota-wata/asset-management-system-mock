/**
 * 画面遷移ヘルパー - 確実な画面切り替えを保証
 */

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
