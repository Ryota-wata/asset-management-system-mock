/**
 * 現有資産調査統合画面のロジック
 * QR読取・写真撮影・資産情報登録を統合
 */

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

    // シールNo.から数字部分を抽出
    const match = sealNo.match(/^([A-Za-z]*)(\d+)$/);
    if (!match) {
        preview.style.display = 'none';
        return;
    }

    const prefix = match[1]; // アルファベット部分
    const startNum = parseInt(match[2]); // 数字部分
    const numLength = match[2].length; // 桁数（ゼロパディング用）

    // 連番範囲を表示
    const endNum = startNum + quantity - 1;
    const startPadded = String(startNum).padStart(numLength, '0');
    const endPadded = String(endNum).padStart(numLength, '0');

    const previewHtml = `<div class="survey-integrated-preview-item">${prefix}${startPadded} ～ ${prefix}${endPadded}</div>`;

    previewContent.innerHTML = previewHtml;
    preview.style.display = 'block';
}

/**
 * トグルスイッチの切り替え
 * @param {HTMLElement} switchElement - トグルスイッチ要素
 */
function toggleIntegratedSwitch(switchElement) {
    const isActive = switchElement.classList.contains('active');
    const label = switchElement.parentElement.querySelector('.survey-integrated-toggle-label');

    if (isActive) {
        switchElement.classList.remove('active');
        label.textContent = 'オフ';
    } else {
        switchElement.classList.add('active');
        label.textContent = 'オン';
    }
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

        // シールNo.から連番を生成
        const match = sealNo.match(/^([A-Za-z]*)(\d+)$/);
        if (!match) {
            alert('シールNo.の形式が正しくありません\n（例: K0001, ABC123）');
            return;
        }

        const prefix = match[1];
        const startNum = parseInt(match[2]);
        const numLength = match[2].length;

        // 連番リスト生成
        const serialNos = [];
        for (let i = 0; i < quantity; i++) {
            const num = startNum + i;
            const paddedNum = String(num).padStart(numLength, '0');
            serialNos.push(prefix + paddedNum);
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
    document.getElementById('integratedSealNo').value = '';
    document.getElementById('integratedRoomName').value = '';
    document.getElementById('integratedAssetNo').value = '';
    document.getElementById('integratedEquipmentNo').value = '';
    document.getElementById('integratedPurchaseDate').value = '';
    document.getElementById('integratedWidth').value = '';
    document.getElementById('integratedDepth').value = '';
    document.getElementById('integratedHeight').value = '';
    document.getElementById('integratedRemarks').value = '';

    // 一括登録モードをリセット
    document.getElementById('bulkRegistrationMode').checked = false;
    document.getElementById('bulkQuantity').value = '';
    document.getElementById('bulkQuantityGroup').style.display = 'none';
    document.getElementById('bulkPreview').style.display = 'none';
    document.getElementById('sealNoLabel').textContent = 'シールNo.';

    // トグルスイッチをリセット
    document.querySelectorAll('.survey-integrated-toggle-switch').forEach(sw => {
        sw.classList.remove('active');
        const label = sw.parentElement.querySelector('.survey-integrated-toggle-label');
        if (label) label.textContent = 'オフ';
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
