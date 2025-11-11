/**
 * 画面遷移ロジック
 * 各画面間の遷移処理を管理します。
 */

/**
 * QRコード管理画面への遷移
 */
function handleQRManagement() {
    document.getElementById('mainContainer').classList.remove('active');
    document.getElementById('qrPage').classList.add('active');
}

/**
 * QRコード管理画面から戻る
 */
function handleBackFromQR() {
    document.getElementById('qrPage').classList.remove('active');
    document.getElementById('mainContainer').classList.add('active');
}

/**
 * 登録内容修正画面から戻る
 */
function handleBackFromEdit() {
    if (window.currentEditingRow) {
        if (confirm('編集中のデータがあります。破棄して戻りますか？')) {
            document.getElementById('registrationEditPage').classList.remove('active');
            document.getElementById('mainContainer').classList.add('active');
            // 個体管理リストモーダルを閉じる
            closeListModal();
        }
    } else {
        document.getElementById('registrationEditPage').classList.remove('active');
        document.getElementById('mainContainer').classList.add('active');
        // 個体管理リストモーダルを閉じる
        closeListModal();
    }
}

/**
 * QRコード詳細画面から一覧に戻る
 */
function handleBackFromQRDetail() {
    document.getElementById('qrDetailPage').classList.remove('active');
    document.getElementById('qrPage').classList.add('active');
}

/**
 * QRコード新規発行画面から一覧に戻る
 */
function handleBackFromQRIssue() {
    document.getElementById('qrIssuePage').classList.remove('active');
    document.getElementById('qrPage').classList.add('active');
}

/**
 * QRコード印刷画面から戻る
 * 呼び出し元に応じて戻る先を変更
 */
function handleBackFromQRPrint() {
    document.getElementById('qrPrintPage').classList.remove('active');

    // 呼び出し元に応じて戻る先を変更
    if (window.qrPrintFromPage === 'detail') {
        document.getElementById('qrDetailPage').classList.add('active');
    } else {
        document.getElementById('qrPage').classList.add('active');
    }
    window.qrPrintFromPage = '';
}

/**
 * 現有資産調査画面から検索画面に戻る
 */
function handleBackFromSurvey() {
    document.getElementById('surveyPage').classList.remove('active');
    document.getElementById('offlinePrepPage').classList.add('active');
}

/**
 * 現有資産調査画面からQR読取画面へ遷移
 */
function handleSurveyNext() {
    document.getElementById('surveyPage').classList.remove('active');
    document.getElementById('qrScanPage').classList.add('active');
}

/**
 * オフライン準備画面から検索画面に戻る
 */
function handleBackFromOfflinePrep() {
    document.getElementById('offlinePrepPage').classList.remove('active');
    document.getElementById('mainContainer').classList.add('active');
    // 個体管理リストモーダルを閉じる
    closeListModal();
}

/**
 * オフライン準備画面から現有資産調査画面へ遷移
 */
function handleStartSurvey() {
    document.getElementById('offlinePrepPage').classList.remove('active');
    document.getElementById('surveyPage').classList.add('active');
    // マスタデータをロードして選択肢を設定
    if (typeof loadSurveyMasterData === 'function') {
        loadSurveyMasterData();
    }
}

/**
 * QR読取画面から現有資産調査画面に戻る
 */
function handleBackFromQRScan() {
    document.getElementById('qrScanPage').classList.remove('active');
    document.getElementById('surveyPage').classList.add('active');
}

/**
 * QR読取画面から写真撮影・資産番号入力画面へ遷移
 */
function handleQRScanNext() {
    document.getElementById('qrScanPage').classList.remove('active');
    document.getElementById('photoInputPage').classList.add('active');
}

/**
 * 写真撮影・資産番号入力画面からQR読取画面に戻る
 */
function handleBackFromPhotoInput() {
    document.getElementById('photoInputPage').classList.remove('active');
    document.getElementById('qrScanPage').classList.add('active');
}

/**
 * 写真撮影・資産番号入力画面から資産情報登録画面へ遷移
 */
function handlePhotoInputNext() {
    document.getElementById('photoInputPage').classList.remove('active');
    document.getElementById('assetInfoPage').classList.add('active');
}

/**
 * 資産情報登録画面から写真撮影・資産番号入力画面に戻る
 */
function handleBackFromAssetInfo() {
    document.getElementById('assetInfoPage').classList.remove('active');
    document.getElementById('photoInputPage').classList.add('active');
}

/**
 * 資産情報登録画面から履歴表示画面へ遷移
 */
function handleShowHistoryList() {
    document.getElementById('assetInfoPage').classList.remove('active');
    document.getElementById('historyListPage').classList.add('active');
}

/**
 * 履歴表示画面から資産情報登録画面に戻る
 */
function handleBackFromHistoryList() {
    document.getElementById('historyListPage').classList.remove('active');
    document.getElementById('assetInfoPage').classList.add('active');
}

/**
 * 部門入力へボタンで現有資産調査画面へ遷移
 */
function handleGoToSurvey() {
    // 全ての画面を非表示
    document.getElementById('assetInfoPage').classList.remove('active');
    document.getElementById('historyListPage').classList.remove('active');
    document.getElementById('photoInputPage').classList.remove('active');
    document.getElementById('qrScanPage').classList.remove('active');

    // 現有資産調査画面を表示
    document.getElementById('surveyPage').classList.add('active');
}

/**
 * 資産台帳取込画面への遷移（個体管理リストモーダルから）
 */
function handleAssetImport() {
    // モーダルを閉じる
    if (typeof closeListModal === 'function') {
        closeListModal();
    }

    // 資産台帳取込画面を表示
    document.getElementById('mainContainer').classList.remove('active');
    document.getElementById('assetImportPage').classList.add('active');
}

/**
 * 資産台帳取込画面から戻る
 */
function handleBackFromImport() {
    document.getElementById('assetImportPage').classList.remove('active');
    document.getElementById('mainContainer').classList.add('active');
    // 個体管理リストモーダルを再度開く
    if (typeof showListModal === 'function') {
        showListModal();
    }
}

/**
 * インポート画面から突き合わせ画面へ遷移
 */
function handleImportToMatching() {
    document.getElementById('assetImportPage').classList.remove('active');
    document.getElementById('assetMatchingPage').classList.add('active');
}

/**
 * 突き合わせ画面から戻る
 */
function handleBackFromMatching() {
    document.getElementById('assetMatchingPage').classList.remove('active');
    document.getElementById('assetImportPage').classList.add('active');
}

// グローバルスコープに関数を公開
window.handleQRManagement = handleQRManagement;
window.handleBackFromQR = handleBackFromQR;
window.handleBackFromEdit = handleBackFromEdit;
window.handleBackFromQRDetail = handleBackFromQRDetail;
window.handleBackFromQRIssue = handleBackFromQRIssue;
window.handleBackFromQRPrint = handleBackFromQRPrint;
window.handleBackFromSurvey = handleBackFromSurvey;
window.handleSurveyNext = handleSurveyNext;
window.handleBackFromOfflinePrep = handleBackFromOfflinePrep;
window.handleStartSurvey = handleStartSurvey;
window.handleBackFromQRScan = handleBackFromQRScan;
window.handleQRScanNext = handleQRScanNext;
window.handleBackFromPhotoInput = handleBackFromPhotoInput;
window.handlePhotoInputNext = handlePhotoInputNext;
window.handleBackFromAssetInfo = handleBackFromAssetInfo;
window.handleShowHistoryList = handleShowHistoryList;
window.handleBackFromHistoryList = handleBackFromHistoryList;
window.handleGoToSurvey = handleGoToSurvey;
window.handleAssetImport = handleAssetImport;
window.handleBackFromImport = handleBackFromImport;
window.handleImportToMatching = handleImportToMatching;
window.handleBackFromMatching = handleBackFromMatching;
