/**
 * 現有資産調査統合画面のロジック
 * QR読取・写真撮影・資産情報登録を統合
 */

/**
 * トグルスイッチの状態を設定
 * @param {HTMLElement} switchElement - トグルスイッチ要素
 * @param {boolean} isActive - アクティブ状態
 */
function setToggleState(switchElement, isActive) {
    const label = switchElement.parentElement?.querySelector('.survey-integrated-toggle-label');
    if (!label) return;

    if (isActive) {
        switchElement.classList.add('active');
        label.textContent = 'オン';
    } else {
        switchElement.classList.remove('active');
        label.textContent = 'オフ';
    }
}

/**
 * シールNo.から連番情報を解析
 * @param {string} sealNo - シールNo.
 * @returns {Object|null} { prefix, startNum, numLength } または null
 */
function parseSerialNumber(sealNo) {
    const match = sealNo.match(/^([A-Za-z]*)(\d+)$/);
    if (!match) return null;

    return {
        prefix: match[1],
        startNum: parseInt(match[2]),
        numLength: match[2].length
    };
}

/**
 * 連番リストを生成
 * @param {string} sealNo - 開始シールNo.
 * @param {number} quantity - 個数
 * @returns {Array<string>|null} 連番リスト または null（形式エラー）
 */
function generateSerialNumbers(sealNo, quantity) {
    const parsed = parseSerialNumber(sealNo);
    if (!parsed) return null;

    const { prefix, startNum, numLength } = parsed;
    const serialNos = [];

    for (let i = 0; i < quantity; i++) {
        const num = startNum + i;
        const paddedNum = String(num).padStart(numLength, '0');
        serialNos.push(prefix + paddedNum);
    }

    return serialNos;
}

/**
 * 一括登録モードの切り替え
 */
function toggleBulkRegistration() {
    const checkbox = document.getElementById('bulkRegistrationMode');
    const bulkQuantityGroup = document.getElementById('bulkQuantityGroup');
    const bulkPreview = document.getElementById('bulkPreview');
    const sealNoLabel = document.getElementById('sealNoLabel');

    if (checkbox.checked) {
        // 一括登録モードON
        bulkQuantityGroup.style.display = 'flex';
        sealNoLabel.textContent = '開始シールNo.';
        updateBulkSealNoPreview();
    } else {
        // 一括登録モードOFF
        bulkQuantityGroup.style.display = 'none';
        bulkPreview.style.display = 'none';
        sealNoLabel.textContent = 'シールNo.';
        document.getElementById('bulkQuantity').value = '';
    }
}

/**
 * 一括登録の連番プレビューを更新
 */
function updateBulkSealNoPreview() {
    const checkbox = document.getElementById('bulkRegistrationMode');
    const sealNo = document.getElementById('integratedSealNo').value;
    const quantity = parseInt(document.getElementById('bulkQuantity').value) || 0;
    const preview = document.getElementById('bulkPreview');
    const previewContent = document.getElementById('bulkPreviewContent');

    if (!checkbox.checked || !sealNo || quantity <= 0) {
        preview.style.display = 'none';
        return;
    }

    const serialNos = generateSerialNumbers(sealNo, quantity);
    if (!serialNos) {
        preview.style.display = 'none';
        return;
    }

    const previewHtml = `<div class="survey-integrated-preview-item">${serialNos[0]} ～ ${serialNos[serialNos.length - 1]}</div>`;
    previewContent.innerHTML = previewHtml;
    preview.style.display = 'block';
}

/**
 * トグルスイッチの切り替え
 * @param {HTMLElement} switchElement - トグルスイッチ要素
 */
function toggleIntegratedSwitch(switchElement) {
    const isActive = switchElement.classList.contains('active');
    setToggleState(switchElement, !isActive);
}

/**
 * QR読取ボタンの処理
 */
function handleIntegratedQRScan() {
    alert('QRコードを読み取ります');
    // 実際の実装ではカメラを起動してQRコードを読み取る
}

/**
 * 写真撮影ボタンの処理
 */
function handleIntegratedPhotoCapture() {
    alert('写真を撮影します');
    // 実際の実装ではカメラを起動して写真を撮影
}

/**
 * 商品登録ボタンの処理
 */
function handleIntegratedAssetRegistration() {
    const checkbox = document.getElementById('bulkRegistrationMode');
    const sealNo = document.getElementById('integratedSealNo').value;
    const roomName = document.getElementById('integratedRoomName').value;
    const assetNo = document.getElementById('integratedAssetNo').value;
    const quantity = parseInt(document.getElementById('bulkQuantity').value) || 1;

    // バリデーション
    if (!sealNo) {
        alert('シールNo.を入力してください');
        return;
    }

    if (!roomName) {
        alert('室名を入力してください');
        return;
    }

    // 一括登録モードの場合
    if (checkbox.checked) {
        if (quantity <= 0) {
            alert('登録個数を入力してください');
            return;
        }

        const serialNos = generateSerialNumbers(sealNo, quantity);
        if (!serialNos) {
            alert('シールNo.の形式が正しくありません\n（例: K0001, ABC123）');
            return;
        }

        // 登録確認
        const confirmMessage = `一括登録を実行します\n\n登録個数: ${quantity}件\nシールNo.: ${serialNos[0]} ～ ${serialNos[serialNos.length - 1]}\n室名: ${roomName}\n\nよろしいですか？`;

        if (confirm(confirmMessage)) {
            alert(`${quantity}件の資産を一括登録しました\n\nシールNo.: ${serialNos[0]} ～ ${serialNos[serialNos.length - 1]}\n室名: ${roomName}`);
            clearIntegratedForm();
        }
    } else {
        // 通常登録
        alert('資産を登録しました\n\nシールNo.: ' + sealNo + '\n室名: ' + roomName + '\n資産番号: ' + assetNo);
        clearIntegratedForm();
    }
}

/**
 * フォームをクリア
 */
function clearIntegratedForm() {
    // 入力フィールドをクリア
    const inputIds = [
        'integratedSealNo',
        'integratedRoomName',
        'integratedAssetNo',
        'integratedEquipmentNo',
        'integratedPurchaseDate',
        'integratedWidth',
        'integratedDepth',
        'integratedHeight',
        'integratedRemarks'
    ];

    inputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });

    // 一括登録モードをリセット
    const bulkCheckbox = document.getElementById('bulkRegistrationMode');
    if (bulkCheckbox) bulkCheckbox.checked = false;

    const bulkQuantity = document.getElementById('bulkQuantity');
    if (bulkQuantity) bulkQuantity.value = '';

    const bulkQuantityGroup = document.getElementById('bulkQuantityGroup');
    if (bulkQuantityGroup) bulkQuantityGroup.style.display = 'none';

    const bulkPreview = document.getElementById('bulkPreview');
    if (bulkPreview) bulkPreview.style.display = 'none';

    const sealNoLabel = document.getElementById('sealNoLabel');
    if (sealNoLabel) sealNoLabel.textContent = 'シールNo.';

    // トグルスイッチをリセット
    document.querySelectorAll('.survey-integrated-toggle-switch').forEach(sw => {
        setToggleState(sw, false);
    });
}

/**
 * 統合画面から戻る
 */
function handleBackFromIntegratedSurvey() {
    document.getElementById('assetSurveyIntegratedPage').classList.remove('active');
    document.getElementById('surveyPage').classList.add('active');
}

// グローバルに公開
window.toggleBulkRegistration = toggleBulkRegistration;
window.updateBulkSealNoPreview = updateBulkSealNoPreview;
window.toggleIntegratedSwitch = toggleIntegratedSwitch;
window.handleIntegratedQRScan = handleIntegratedQRScan;
window.handleIntegratedPhotoCapture = handleIntegratedPhotoCapture;
window.handleIntegratedAssetRegistration = handleIntegratedAssetRegistration;
window.clearIntegratedForm = clearIntegratedForm;
window.handleBackFromIntegratedSurvey = handleBackFromIntegratedSurvey;
