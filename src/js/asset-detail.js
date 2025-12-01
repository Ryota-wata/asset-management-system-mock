/**
 * 資産詳細画面
 */

// 現在表示中の資産データ
let currentAssetDetail = null;

// 編集モードフラグ
let isEditMode = false;

// 編集前の値を保持
let originalValues = {};

// 写真関連
let currentPhotoIndex = 0;
let assetPhotos = [];

/**
 * 資産詳細画面を初期化
 * @param {Object} asset - 資産データ
 */
function initAssetDetailPage(asset) {
    console.log('[AssetDetail] Initializing with asset:', asset);

    currentAssetDetail = asset;

    // 基本情報を表示
    displayAssetBasicInfo(asset);

    // 写真を表示
    displayAssetPhoto(asset);
}

/**
 * 基本情報を表示
 */
function displayAssetBasicInfo(asset) {
    // フィールドマッピング定義
    const fieldMappings = {
        'detailQrCode': 'qrCode',
        'detailFacility': 'facility',
        'detailBuilding': 'building',
        'detailFloor': 'floor',
        'detailDepartment': 'department',
        'detailSection': 'section',
        'detailCategory': 'category',
        'detailLargeClass': 'largeClass',
        'detailMediumClass': 'mediumClass',
        'detailItem': 'item',
        'detailName': 'name',
        'detailMaker': 'maker',
        'detailModel': 'model',
        'detailQuantity': 'quantity',
        'detailWidth': 'width',
        'detailDepth': 'depth',
        'detailHeight': 'height'
    };

    // 共通ユーティリティを使用して一括設定
    window.CommonUtils.setElementsText(asset, fieldMappings);
}

/**
 * 資産写真を表示
 */
function displayAssetPhoto(asset) {
    // 写真配列を初期化
    if (asset.photos && Array.isArray(asset.photos)) {
        assetPhotos = asset.photos;
    } else if (asset.photo) {
        assetPhotos = [asset.photo];
    } else {
        assetPhotos = [];
    }

    currentPhotoIndex = 0;
    updatePhotoDisplay();
    renderPhotoThumbnails();
}

/**
 * 写真表示を更新
 */
function updatePhotoDisplay() {
    const photoElement = document.getElementById('assetDetailPhoto');
    const photoCounter = document.getElementById('photoCounter');
    const prevBtn = document.getElementById('prevPhotoBtn');
    const nextBtn = document.getElementById('nextPhotoBtn');

    if (assetPhotos.length > 0) {
        photoElement.src = assetPhotos[currentPhotoIndex];
        photoElement.alt = currentAssetDetail?.name || '資産写真';
        photoCounter.textContent = `${currentPhotoIndex + 1} / ${assetPhotos.length}`;
    } else {
        // デフォルト画像（グレーの背景）
        photoElement.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                <rect width="400" height="300" fill="#e0e0e0"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="18" font-family="sans-serif">
                    写真なし
                </text>
            </svg>
        `);
        photoElement.alt = '写真なし';
        photoCounter.textContent = '0 / 0';
    }

    // ナビゲーションボタンの有効/無効を設定
    prevBtn.disabled = currentPhotoIndex === 0 || assetPhotos.length === 0;
    nextBtn.disabled = currentPhotoIndex >= assetPhotos.length - 1 || assetPhotos.length === 0;
}

/**
 * サムネイル一覧を表示
 */
function renderPhotoThumbnails() {
    const thumbnailsContainer = document.getElementById('photoThumbnails');
    thumbnailsContainer.innerHTML = '';

    assetPhotos.forEach((photo, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = photo;
        thumbnail.alt = `写真 ${index + 1}`;
        thumbnail.className = 'photo-thumbnail';
        if (index === currentPhotoIndex) {
            thumbnail.classList.add('active');
        }
        thumbnail.onclick = () => selectPhoto(index);
        thumbnailsContainer.appendChild(thumbnail);
    });
}

/**
 * 写真を選択
 * @param {number} index - 写真のインデックス
 */
function selectPhoto(index) {
    if (index >= 0 && index < assetPhotos.length) {
        currentPhotoIndex = index;
        updatePhotoDisplay();
        renderPhotoThumbnails();
    }
}

/**
 * 写真をナビゲート
 * @param {number} direction - 方向（-1: 前へ, 1: 次へ）
 */
function navigatePhoto(direction) {
    const newIndex = currentPhotoIndex + direction;
    if (newIndex >= 0 && newIndex < assetPhotos.length) {
        currentPhotoIndex = newIndex;
        updatePhotoDisplay();
        renderPhotoThumbnails();
    }
}

/**
 * ドキュメントを選択
 * @param {number} docId - ドキュメントID
 */
function selectDocument(docId) {
    console.log('[AssetDetail] Selecting document:', docId);

    // すべてのドキュメントアイテムから active クラスを削除
    const documentItems = document.querySelectorAll('.document-item');
    documentItems.forEach(item => item.classList.remove('active'));

    // 選択されたドキュメントを active に
    const selectedItem = documentItems[docId - 1];
    if (selectedItem) {
        selectedItem.classList.add('active');

        // ビューアーのメッセージを更新
        const documentName = selectedItem.querySelector('.document-name').textContent;
        const viewerMessage = document.querySelector('.viewer-message');
        if (viewerMessage) {
            viewerMessage.textContent = documentName;
        }
    }
}

/**
 * 詳細画面から戻る
 */
function handleBackFromAssetDetail() {
    console.log('[AssetDetail] Going back to search results');

    // 資産検索結果画面に戻る
    PageNavigationHelper.showPage('searchResultPage');
}

/**
 * 編集モードの切り替え
 */
function toggleEditMode() {
    console.log('[AssetDetail] Toggling edit mode');

    if (isEditMode) {
        return;
    }

    isEditMode = true;

    // ボタンの表示/非表示を切り替え
    document.getElementById('editBtn').style.display = 'none';
    document.getElementById('saveBtn').style.display = 'inline-block';
    document.getElementById('cancelBtn').style.display = 'inline-block';

    // 写真編集ボタンを表示
    document.getElementById('photoEditOverlay').style.display = 'flex';

    // ドキュメント追加ボタンを表示
    document.getElementById('documentActions').style.display = 'flex';

    // ドキュメント削除ボタンを表示
    const deleteButtons = document.querySelectorAll('.doc-delete-btn');
    deleteButtons.forEach(btn => btn.style.display = 'inline-block');

    // 編集前の値を保存
    saveOriginalValues();

    // 各項目を入力フィールドに変換
    convertToEditMode();
}

/**
 * 編集前の値を保存
 */
function saveOriginalValues() {
    originalValues = {
        qrCode: document.getElementById('detailQrCode').textContent,
        facility: document.getElementById('detailFacility').textContent,
        building: document.getElementById('detailBuilding').textContent,
        floor: document.getElementById('detailFloor').textContent,
        department: document.getElementById('detailDepartment').textContent,
        section: document.getElementById('detailSection').textContent,
        category: document.getElementById('detailCategory').textContent,
        largeClass: document.getElementById('detailLargeClass').textContent,
        mediumClass: document.getElementById('detailMediumClass').textContent,
        item: document.getElementById('detailItem').textContent,
        name: document.getElementById('detailName').textContent,
        maker: document.getElementById('detailMaker').textContent,
        model: document.getElementById('detailModel').textContent,
        quantity: document.getElementById('detailQuantity').textContent,
        width: document.getElementById('detailWidth').textContent,
        depth: document.getElementById('detailDepth').textContent,
        height: document.getElementById('detailHeight').textContent
    };
}

/**
 * 各項目を入力フィールドに変換
 */
function convertToEditMode() {
    const fieldConfigs = {
        'detailQrCode': { type: 'text', placeholder: 'QRコードNo.を入力' },
        'detailFacility': { type: 'text', placeholder: '施設名を入力' },
        'detailBuilding': { type: 'text', placeholder: '棟を入力' },
        'detailFloor': { type: 'text', placeholder: '階を入力' },
        'detailDepartment': { type: 'text', placeholder: '部門を入力' },
        'detailSection': { type: 'text', placeholder: '部署を入力' },
        'detailCategory': { type: 'text', placeholder: 'Categoryを入力' },
        'detailLargeClass': { type: 'text', placeholder: '大分類を入力' },
        'detailMediumClass': { type: 'text', placeholder: '中分類を入力' },
        'detailItem': { type: 'text', placeholder: '品目を入力' },
        'detailName': { type: 'text', placeholder: '品名を入力' },
        'detailMaker': { type: 'text', placeholder: 'メーカーを入力' },
        'detailModel': { type: 'text', placeholder: '型式を入力' },
        'detailQuantity': { type: 'number', placeholder: '数量を入力' },
        'detailWidth': { type: 'text', placeholder: '幅を入力' },
        'detailDepth': { type: 'text', placeholder: '奥行を入力' },
        'detailHeight': { type: 'text', placeholder: '高さを入力' }
    };

    // 共通ユーティリティを使用して一括変換
    window.CommonUtils.convertToEditableFields(fieldConfigs);
}

/**
 * 資産詳細を保存
 */
function saveAssetDetail() {
    console.log('[AssetDetail] Saving asset details');

    // フィールドマッピング定義
    const fieldMappings = {
        'qrCode': 'detailQrCode',
        'facility': 'detailFacility',
        'building': 'detailBuilding',
        'floor': 'detailFloor',
        'department': 'detailDepartment',
        'section': 'detailSection',
        'category': 'detailCategory',
        'largeClass': 'detailLargeClass',
        'mediumClass': 'detailMediumClass',
        'item': 'detailItem',
        'name': 'detailName',
        'maker': 'detailMaker',
        'model': 'detailModel',
        'quantity': 'detailQuantity',
        'width': 'detailWidth',
        'depth': 'detailDepth',
        'height': 'detailHeight'
    };

    // 共通ユーティリティを使用して入力値を一括取得
    const updatedValues = window.CommonUtils.getFormFieldValues(fieldMappings);

    // currentAssetDetailオブジェクトに反映
    Object.assign(currentAssetDetail, updatedValues);

    // 編集モードを終了
    exitEditMode();

    // 更新された値を表示
    displayAssetBasicInfo(currentAssetDetail);

    // 成功メッセージ
    alert('資産情報を保存しました');
}

/**
 * 編集をキャンセル
 */
function cancelEdit() {
    console.log('[AssetDetail] Cancelling edit');

    // 編集モードを終了
    exitEditMode();

    // フィールドマッピング定義
    const fieldMappings = {
        'detailQrCode': 'qrCode',
        'detailFacility': 'facility',
        'detailBuilding': 'building',
        'detailFloor': 'floor',
        'detailDepartment': 'department',
        'detailSection': 'section',
        'detailCategory': 'category',
        'detailLargeClass': 'largeClass',
        'detailMediumClass': 'mediumClass',
        'detailItem': 'item',
        'detailName': 'name',
        'detailMaker': 'maker',
        'detailModel': 'model',
        'detailQuantity': 'quantity',
        'detailWidth': 'width',
        'detailDepth': 'depth',
        'detailHeight': 'height'
    };

    // 共通ユーティリティを使用して元の値を復元
    window.CommonUtils.setElementsText(originalValues, fieldMappings);
}

/**
 * 編集モードを終了
 */
function exitEditMode() {
    isEditMode = false;

    // ボタンの表示/非表示を切り替え
    document.getElementById('editBtn').style.display = 'inline-block';
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';

    // 写真編集ボタンを非表示
    document.getElementById('photoEditOverlay').style.display = 'none';

    // ドキュメント追加ボタンを非表示
    document.getElementById('documentActions').style.display = 'none';

    // ドキュメント削除ボタンを非表示
    const deleteButtons = document.querySelectorAll('.doc-delete-btn');
    deleteButtons.forEach(btn => btn.style.display = 'none');
}

/**
 * 写真のアップロード処理（複数対応）
 */
function handlePhotoUpload(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    console.log('[AssetDetail] Uploading photos:', files.length);

    // 最大6枚までの制限をチェック
    const remainingSlots = 6 - assetPhotos.length;
    if (remainingSlots <= 0) {
        alert('写真は最大6枚までしか登録できません。');
        event.target.value = ''; // ファイル選択をリセット
        return;
    }

    // 追加可能な枚数を計算
    const filesToAdd = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
        alert(`写真は最大6枚までです。${filesToAdd.length}枚のみ追加します。`);
    }

    // 各ファイルを読み込んで配列に追加
    let loadedCount = 0;
    filesToAdd.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            assetPhotos.push(e.target.result);
            loadedCount++;

            // すべてのファイルの読み込みが完了したら表示を更新
            if (loadedCount === filesToAdd.length) {
                // 最後に追加した写真を表示
                currentPhotoIndex = assetPhotos.length - 1;
                updatePhotoDisplay();
                renderPhotoThumbnails();

                // 資産データにも保存
                if (currentAssetDetail) {
                    currentAssetDetail.photos = assetPhotos;
                }

                console.log('[AssetDetail] Photos updated, total:', assetPhotos.length);
            }
        };
        reader.readAsDataURL(file);
    });

    // ファイル選択をリセット
    event.target.value = '';
}

/**
 * 現在表示中の写真を削除
 */
function deleteCurrentPhoto() {
    console.log('[AssetDetail] Deleting current photo');

    if (assetPhotos.length === 0) {
        alert('削除する写真がありません。');
        return;
    }

    if (confirm('この写真を削除しますか？')) {
        // 現在の写真を配列から削除
        assetPhotos.splice(currentPhotoIndex, 1);

        // インデックスを調整
        if (currentPhotoIndex >= assetPhotos.length && currentPhotoIndex > 0) {
            currentPhotoIndex = assetPhotos.length - 1;
        }

        // 表示を更新
        updatePhotoDisplay();
        renderPhotoThumbnails();

        // 資産データを更新
        if (currentAssetDetail) {
            currentAssetDetail.photos = assetPhotos;
        }

        console.log('[AssetDetail] Photo deleted, remaining:', assetPhotos.length);
    }
}

/**
 * PDFドキュメントを印刷
 */
function printDocument() {
    console.log('[AssetDetail] Printing document');

    const selectedDoc = document.querySelector('.document-item.active .document-name');
    if (selectedDoc) {
        const docName = selectedDoc.textContent;
        alert(`「${docName}」を印刷します。\n\n※ 実際のシステムでは、ここでPDFの印刷ダイアログが表示されます。`);
        // 実際のシステムでは window.print() や PDF.js を使用
    } else {
        alert('印刷するドキュメントを選択してください。');
    }
}

/**
 * ドキュメントのアップロード処理
 */
function handleDocumentUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('[AssetDetail] Uploading document:', file.name);

    // ドキュメントリストに追加
    const documentList = document.getElementById('documentList');
    const docId = Date.now(); // 一時的なID

    const newDocItem = document.createElement('div');
    newDocItem.className = 'document-item';
    newDocItem.onclick = () => selectDocument(docId);

    newDocItem.innerHTML = `
        <div class="document-icon">📄</div>
        <div class="document-info">
            <div class="document-name">${file.name}</div>
            <div class="document-meta">${new Date().toISOString().split('T')[0]} 登録</div>
        </div>
        <button class="doc-delete-btn" onclick="deleteDocument(event, ${docId})" style="display: ${isEditMode ? 'inline-block' : 'none'};">🗑️</button>
    `;

    documentList.appendChild(newDocItem);

    alert('ドキュメントを追加しました');
}

/**
 * ドキュメントの削除
 */
function deleteDocument(event, docId) {
    event.stopPropagation(); // ドキュメント選択イベントの発火を防ぐ

    console.log('[AssetDetail] Deleting document:', docId);

    if (confirm('このドキュメントを削除しますか？')) {
        // ドキュメントアイテムを削除
        const documentItems = document.querySelectorAll('.document-item');
        documentItems.forEach((item, index) => {
            if (index + 1 === docId || item.querySelector(`[onclick*="${docId}"]`)) {
                item.remove();
            }
        });

        alert('ドキュメントを削除しました');
    }
}

// グローバルに公開
window.initAssetDetailPage = initAssetDetailPage;
window.selectDocument = selectDocument;
window.handleBackFromAssetDetail = handleBackFromAssetDetail;
window.toggleEditMode = toggleEditMode;
window.saveAssetDetail = saveAssetDetail;
window.cancelEdit = cancelEdit;
window.navigatePhoto = navigatePhoto;
window.selectPhoto = selectPhoto;
window.handlePhotoUpload = handlePhotoUpload;
window.deleteCurrentPhoto = deleteCurrentPhoto;
window.printDocument = printDocument;
window.handleDocumentUpload = handleDocumentUpload;
window.deleteDocument = deleteDocument;

// ========================================
// 申請アクション関数
// ========================================

/**
 * 移動申請（資産カルテから）
 */
function handleAssetDetailMoveRequest() {
    if (!currentAssetDetail) {
        alert('資産情報が読み込まれていません');
        return;
    }

    const confirmMsg = `以下の資産の移動申請を開始します:\n\n` +
        `品名: ${currentAssetDetail.name}\n` +
        `メーカー: ${currentAssetDetail.maker}\n` +
        `型式: ${currentAssetDetail.model}\n\n` +
        `移動申請画面に遷移しますか？`;

    if (confirm(confirmMsg)) {
        alert('移動申請画面に遷移します\n※実装予定');
        // TODO: 移動申請モーダルまたは画面への遷移
    }
}

/**
 * 廃棄申請（資産カルテから）
 */
function handleAssetDetailDisposalRequest() {
    if (!currentAssetDetail) {
        alert('資産情報が読み込まれていません');
        return;
    }

    const confirmMsg = `以下の資産の廃棄申請を開始します:\n\n` +
        `品名: ${currentAssetDetail.name}\n` +
        `メーカー: ${currentAssetDetail.maker}\n` +
        `型式: ${currentAssetDetail.model}\n\n` +
        `廃棄申請画面に遷移しますか？`;

    if (confirm(confirmMsg)) {
        alert('廃棄申請画面に遷移します\n※実装予定');
        // TODO: 廃棄申請モーダルまたは画面への遷移
    }
}

/**
 * 修理申請（資産カルテから）
 */
function handleAssetDetailRepairRequest() {
    if (!currentAssetDetail) {
        alert('資産情報が読み込まれていません');
        return;
    }

    const confirmMsg = `以下の資産の修理申請を開始します:\n\n` +
        `品名: ${currentAssetDetail.name}\n` +
        `メーカー: ${currentAssetDetail.maker}\n` +
        `型式: ${currentAssetDetail.model}\n\n` +
        `修理申請画面に遷移しますか？`;

    if (confirm(confirmMsg)) {
        alert('修理申請画面に遷移します\n※実装予定');
        // TODO: 修理申請モーダルまたは画面への遷移
    }
}

/**
 * 保守申請（資産カルテから）
 */
function handleAssetDetailMaintenanceRequest() {
    if (!currentAssetDetail) {
        alert('資産情報が読み込まれていません');
        return;
    }

    const confirmMsg = `以下の資産の保守申請を開始します:\n\n` +
        `品名: ${currentAssetDetail.name}\n` +
        `メーカー: ${currentAssetDetail.maker}\n` +
        `型式: ${currentAssetDetail.model}\n\n` +
        `保守申請画面に遷移しますか？`;

    if (confirm(confirmMsg)) {
        alert('保守申請画面に遷移します\n※実装予定');
        // TODO: 保守申請モーダルまたは画面への遷移
    }
}

// グローバルに公開
window.handleAssetDetailMoveRequest = handleAssetDetailMoveRequest;
window.handleAssetDetailDisposalRequest = handleAssetDetailDisposalRequest;
window.handleAssetDetailRepairRequest = handleAssetDetailRepairRequest;
window.handleAssetDetailMaintenanceRequest = handleAssetDetailMaintenanceRequest;
