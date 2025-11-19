/**
 * 資産詳細画面
 */

// 現在表示中の資産データ
let currentAssetDetail = null;

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
    // No.
    document.getElementById('detailNo').textContent =
        asset.no || '-';

    // 施設名
    document.getElementById('detailFacility').textContent =
        asset.facility || '-';

    // 棟
    document.getElementById('detailBuilding').textContent =
        asset.building || '-';

    // 階
    document.getElementById('detailFloor').textContent =
        asset.floor || '-';

    // 部門
    document.getElementById('detailDepartment').textContent =
        asset.department || '-';

    // 部署
    document.getElementById('detailSection').textContent =
        asset.section || '-';

    // Category
    document.getElementById('detailCategory').textContent =
        asset.category || '-';

    // 大分類
    document.getElementById('detailLargeClass').textContent =
        asset.largeClass || '-';

    // 中分類
    document.getElementById('detailMediumClass').textContent =
        asset.mediumClass || '-';

    // 品目
    document.getElementById('detailItem').textContent =
        asset.item || '-';

    // 品名
    document.getElementById('detailName').textContent =
        asset.name || '-';

    // メーカー
    document.getElementById('detailMaker').textContent =
        asset.maker || '-';

    // 型式
    document.getElementById('detailModel').textContent =
        asset.model || '-';

    // 数量
    document.getElementById('detailQuantity').textContent =
        asset.quantity || '-';

    // 幅(W)
    document.getElementById('detailWidth').textContent =
        asset.width || '-';

    // 奥行(D)
    document.getElementById('detailDepth').textContent =
        asset.depth || '-';

    // 高さ(H)
    document.getElementById('detailHeight').textContent =
        asset.height || '-';
}

/**
 * 資産写真を表示
 */
function displayAssetPhoto(asset) {
    const photoElement = document.getElementById('assetDetailPhoto');

    if (asset.photo) {
        photoElement.src = asset.photo;
        photoElement.alt = asset.name || '資産写真';
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

// グローバルに公開
window.initAssetDetailPage = initAssetDetailPage;
window.selectDocument = selectDocument;
window.handleBackFromAssetDetail = handleBackFromAssetDetail;
