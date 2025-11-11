/**
 * 認証関連機能
 * ログイン、ログアウト、パスワードリセットなどの認証機能を提供します。
 */

/**
 * ログイン処理
 * メールアドレスに基づいてユーザー種別（病院/医療コンサル）を判定し、
 * 適切な画面要素の表示/非表示を制御します。
 * @param {Event} event - フォーム送信イベント
 */
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;

    // ログイン画面を非表示
    document.getElementById('loginPage').classList.add('hidden');
    // メインコンテナを表示
    document.getElementById('mainContainer').classList.add('active');

    // メールアドレスのドメインでユーザー種別を判定
    if (email.includes('@hospital')) {
        // 病院ユーザーの場合
        // consultant-onlyボタンを非表示
        const consultantButtons = document.querySelectorAll('.consultant-only');
        consultantButtons.forEach(btn => {
            btn.classList.add('hidden');
        });
        // hospital-onlyボタンを表示
        const hospitalButtons = document.querySelectorAll('.hospital-only');
        hospitalButtons.forEach(btn => {
            btn.classList.add('visible');
        });
    } else {
        // 医療コンサルユーザーの場合
        // consultant-onlyボタンを表示
        const consultantButtons = document.querySelectorAll('.consultant-only');
        consultantButtons.forEach(btn => {
            btn.classList.remove('hidden');
        });
        // hospital-onlyボタンを非表示
        const hospitalButtons = document.querySelectorAll('.hospital-only');
        hospitalButtons.forEach(btn => {
            btn.classList.remove('visible');
        });
    }
}

/**
 * パスワードリセット画面表示
 * @param {Event} event - クリックイベント
 */
function showPasswordReset(event) {
    event.preventDefault();
    alert('パスワードリセット機能は開発中です');
}

/**
 * ログアウト処理
 * すべての画面を非表示にし、ログイン画面に戻ります。
 */
function handleLogout() {
    if (confirm('ログアウトしますか?')) {
        // メインコンテナを非表示
        document.getElementById('mainContainer').classList.remove('active');
        // QRページを非表示
        document.getElementById('qrPage').classList.remove('active');
        // QRコード詳細画面を非表示
        document.getElementById('qrDetailPage').classList.remove('active');
        // QRコード新規発行画面を非表示
        document.getElementById('qrIssuePage').classList.remove('active');
        // QRコード印刷画面を非表示
        document.getElementById('qrPrintPage').classList.remove('active');
        // 現有資産調査画面を非表示
        document.getElementById('surveyPage').classList.remove('active');
        // QR読取画面を非表示
        document.getElementById('qrScanPage').classList.remove('active');
        // 写真撮影・資産番号入力画面を非表示
        document.getElementById('photoInputPage').classList.remove('active');
        // 資産情報登録画面（スマートフォン版）を非表示
        document.getElementById('assetInfoSmartphonePage').classList.remove('active');
        // 資産情報登録画面（タブレット版）を非表示
        document.getElementById('assetInfoTabletPage').classList.remove('active');
        // 履歴表示画面（スマートフォン版）を非表示
        document.getElementById('historyListSmartphonePage').classList.remove('active');
        // 履歴表示画面（タブレット版）を非表示
        document.getElementById('historyListTabletPage').classList.remove('active');
        // 登録内容修正画面を非表示
        document.getElementById('registrationEditPage').classList.remove('active');
        // ログイン画面を表示
        document.getElementById('loginPage').classList.remove('hidden');
        // フォームをリセット
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    }
}

// グローバルスコープに関数を公開
window.handleLogin = handleLogin;
window.showPasswordReset = showPasswordReset;
window.handleLogout = handleLogout;
