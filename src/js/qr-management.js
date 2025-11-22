/**
 * QRコード発行・印刷機能
 * QRコードの新規発行と印刷プレビュー機能を提供します。
 */

// 発行設定の状態管理
let qrIssueState = {
    mode: 'new', // 'new' or 'reissue'
    prefixAlpha: 'R',
    prefix2Digit: '07',
    startNumber: 1,
    quantity: 50,
    template: 'qr-small',
    footerText: '',
    remarks: ''
};

// テンプレート別の文字数制限
const TEMPLATE_CHAR_LIMITS = {
    'qr-small': 12,      // 18mm幅
    'qr-medium': 18,     // 24mm幅
    'qr-large': 28,      // 36mm幅
    'barcode-small': 12, // 18mm幅
    'barcode-medium': 18,// 24mm幅
    'barcode-large': 28  // 36mm幅
};

/**
 * QRコード発行画面を初期化
 */
function initQRIssuePage() {
    console.log('=== Initializing QR Issue Page ===');

    // デフォルト値を設定
    qrIssueState = {
        mode: 'new',
        prefixAlpha: 'R',
        prefix2Digit: '07',
        startNumber: 1,
        quantity: 50,
        template: 'qr-small',
        footerText: '',
        remarks: ''
    };

    // フォーム要素の初期値を設定
    const prefixAlpha = document.getElementById('qrPrefixAlpha');
    const prefix2Digit = document.getElementById('qrPrefix2Digit');
    const startNumber = document.getElementById('qrStartNumber');
    const quantityInput = document.getElementById('qrIssueQuantity');
    const footerText = document.getElementById('footerText');

    if (prefixAlpha) prefixAlpha.value = qrIssueState.prefixAlpha;
    if (prefix2Digit) prefix2Digit.value = qrIssueState.prefix2Digit;
    if (startNumber) startNumber.value = String(qrIssueState.startNumber).padStart(5, '0');
    if (quantityInput) quantityInput.value = qrIssueState.quantity;
    if (footerText) footerText.value = '';

    // テンプレート選択のイベントリスナーを設定
    const templateRadios = document.querySelectorAll('input[name="labelTemplate"]');
    templateRadios.forEach(radio => {
        radio.addEventListener('change', onTemplateChange);
    });

    // 初期文字数制限を設定
    updateFooterCharLimit();

    // プレビューを更新
    updateQRIssuePreview();
}

/**
 * テンプレート選択変更時の処理
 */
function onTemplateChange(event) {
    qrIssueState.template = event.target.value;
    updateFooterCharLimit();
    updateQRIssuePreview();
}

/**
 * フッター文字数制限を更新
 */
function updateFooterCharLimit() {
    const template = getSelectedTemplate();
    const maxChars = TEMPLATE_CHAR_LIMITS[template] || 12;
    const footerText = document.getElementById('footerText');
    const charMaxDisplay = document.getElementById('footerCharMax');
    const charCountDisplay = document.getElementById('footerCharCount');

    // 最大文字数を更新
    if (footerText) {
        footerText.maxLength = maxChars;

        // 現在のテキストが制限を超えている場合は切り詰め
        if (footerText.value.length > maxChars) {
            footerText.value = footerText.value.substring(0, maxChars);
            qrIssueState.footerText = footerText.value;
        }
    }

    // 表示を更新
    if (charMaxDisplay) {
        charMaxDisplay.textContent = maxChars;
    }
    if (charCountDisplay && footerText) {
        charCountDisplay.textContent = footerText.value.length;
    }
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
 * QRコード番号をフォーマット
 * @param {string} alpha - アルファベット
 * @param {string} digit2 - 2桁数字
 * @param {number} number - 5桁数字
 * @returns {string} フォーマットされた番号
 */
function formatQRNumber(alpha, digit2, number) {
    const paddedDigit2 = String(digit2).padStart(2, '0');
    const paddedNumber = String(number).padStart(5, '0');
    return `${alpha}${paddedDigit2}-${paddedNumber}`;
}

/**
 * 発行設定変更時のプレビュー更新
 */
function updateQRIssuePreview() {
    // フォームから値を取得
    const prefixAlpha = document.getElementById('qrPrefixAlpha');
    const prefix2Digit = document.getElementById('qrPrefix2Digit');
    const startNumber = document.getElementById('qrStartNumber');
    const quantityInput = document.getElementById('qrIssueQuantity');
    const footerText = document.getElementById('footerText');

    if (prefixAlpha) qrIssueState.prefixAlpha = prefixAlpha.value;
    if (prefix2Digit) qrIssueState.prefix2Digit = prefix2Digit.value.replace(/\D/g, '').slice(0, 2);
    if (startNumber) {
        const numValue = parseInt(startNumber.value.replace(/\D/g, '')) || 1;
        qrIssueState.startNumber = Math.min(Math.max(numValue, 1), 99999);
    }
    if (quantityInput) {
        qrIssueState.quantity = Math.min(Math.max(parseInt(quantityInput.value) || 1, 1), 100);
    }
    if (footerText) {
        qrIssueState.footerText = footerText.value;
        // 文字数カウントを更新
        const charCountDisplay = document.getElementById('footerCharCount');
        if (charCountDisplay) {
            charCountDisplay.textContent = footerText.value.length;
        }
    }

    // 番号範囲を計算
    const startNum = qrIssueState.startNumber;
    const endNum = startNum + qrIssueState.quantity - 1;

    const startDisplay = formatQRNumber(qrIssueState.prefixAlpha, qrIssueState.prefix2Digit, startNum);
    const endDisplay = formatQRNumber(qrIssueState.prefixAlpha, qrIssueState.prefix2Digit, endNum);

    // 表示を更新
    const rangeStart = document.getElementById('qrIssueRangeStart');
    const rangeEnd = document.getElementById('qrIssueRangeEnd');
    const countDisplay = document.getElementById('qrIssueCount');

    if (rangeStart) rangeStart.textContent = startDisplay;
    if (rangeEnd) rangeEnd.textContent = endDisplay;
    if (countDisplay) countDisplay.textContent = `(${qrIssueState.quantity}枚)`;
}

/**
 * 選択されたテンプレートを取得
 */
function getSelectedTemplate() {
    const selected = document.querySelector('input[name="labelTemplate"]:checked');
    return selected ? selected.value : 'qr-small';
}

/**
 * 印刷プレビューへ遷移
 */
function goToQRPrintPreview() {
    // テンプレートを取得
    qrIssueState.template = getSelectedTemplate();

    // 発行予定番号リストを生成
    const qrNumbers = [];
    const startNum = qrIssueState.startNumber;

    for (let i = 0; i < qrIssueState.quantity; i++) {
        const num = startNum + i;
        qrNumbers.push(formatQRNumber(qrIssueState.prefixAlpha, qrIssueState.prefix2Digit, num));
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

    // 印刷プレビューを更新（記入項目を反映）
    updateQRPrintPreview();
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
 * 印刷プレビューを更新（記入項目を反映）
 */
function updateQRPrintPreview() {
    // QR番号
    const previewNumber = document.getElementById('qrPrintPreviewNumber');
    if (previewNumber) {
        const firstNumber = formatQRNumber(qrIssueState.prefixAlpha, qrIssueState.prefix2Digit, qrIssueState.startNumber);
        previewNumber.textContent = firstNumber;
    }

    // フッターテキストを表示（単一行）
    const previewFooter = document.getElementById('qrPrintPreviewLine1');
    if (previewFooter) {
        previewFooter.textContent = qrIssueState.footerText || '';
        previewFooter.style.display = qrIssueState.footerText ? 'block' : 'none';
    }

    // テンプレートタイプの表示
    const templateInfo = document.getElementById('qrPrintTemplateInfo');
    if (templateInfo) {
        const templateNames = {
            'qr-small': 'QRコード 小サイズ (18mm幅)',
            'qr-medium': 'QRコード 中サイズ (24mm幅)',
            'qr-large': 'QRコード 大サイズ (36mm幅)',
            'barcode-small': 'バーコード 小サイズ (18mm幅)',
            'barcode-medium': 'バーコード 中サイズ (24mm幅)',
            'barcode-large': 'バーコード 大サイズ (36mm幅)'
        };
        templateInfo.textContent = templateNames[qrIssueState.template] || 'QRコード 小サイズ';
    }

    // アイコンの切り替え（QRコード：正方形 or バーコード：長方形）
    const previewIcon = document.querySelector('.qr-print-qr-placeholder');
    if (previewIcon) {
        // クラスをリセット
        previewIcon.classList.remove('qr-square', 'barcode-rect');

        if (qrIssueState.template.startsWith('barcode')) {
            // バーコード：長方形
            previewIcon.classList.add('barcode-rect');
            previewIcon.innerHTML = '';
        } else {
            // QRコード：正方形
            previewIcon.classList.add('qr-square');
            previewIcon.innerHTML = '▣';
        }
    }
}

/**
 * 印刷を開始
 */
function startQRPrint() {
    const template = qrIssueState.template;
    const count = qrIssueState.quantity;
    alert(`印刷を開始します\n\nテンプレート: ${template}\n枚数: ${count}枚\n\n（実際の印刷処理は今後実装予定）`);
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

// グローバルスコープに関数を公開
window.initQRIssuePage = initQRIssuePage;
window.switchQRIssueTab = switchQRIssueTab;
window.updateQRIssuePreview = updateQRIssuePreview;
window.goToQRPrintPreview = goToQRPrintPreview;
window.updateQRPrintList = updateQRPrintList;
window.updateQRPrintPreview = updateQRPrintPreview;
window.startQRPrint = startQRPrint;
window.cancelQRPrint = cancelQRPrint;
window.formatQRNumber = formatQRNumber;
window.getSelectedTemplate = getSelectedTemplate;
window.onTemplateChange = onTemplateChange;
window.updateFooterCharLimit = updateFooterCharLimit;
window.TEMPLATE_CHAR_LIMITS = TEMPLATE_CHAR_LIMITS;
