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
        // すべてのアクティブな画面を非表示
        const activeElements = document.querySelectorAll('.active, .show');
        activeElements.forEach(el => {
            el.classList.remove('active', 'show');
        });

        // ログイン画面を表示
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.classList.remove('hidden');
        }

        // フォームをリセット
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
    }
}

// グローバルスコープに関数を公開
window.handleLogin = handleLogin;
window.showPasswordReset = showPasswordReset;
window.handleLogout = handleLogout;
