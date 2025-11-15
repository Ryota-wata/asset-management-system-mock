/**
 * SHIP資産マスタ設定
 *
 * MasterTableManagerクラスを使用した汎用マスタ管理実装
 * 設定のみを定義し、共通ロジックはmaster-commonモジュールに委譲
 */

// 資産マスタマネージャーのインスタンス作成
const assetManager = new MasterTableManager({
    entityName: 'asset',
    displayName: '資産',
    dataUrl: 'src/data/asset-master.json',
    dataKey: 'assets',
    identifierKey: 'id',
    pageId: 'shipAssetMasterPage',
    tableBodyId: 'assetTableBody',

    // フィルター項目定義
    filterFields: [
        { id: 'Category', columnIndex: 2 },
        { id: 'LargeClass', columnIndex: 3 },
        { id: 'MediumClass', columnIndex: 4 },
        { id: 'Item', columnIndex: 5 }
    ],

    // フォーム項目定義
    formFields: [
        { id: 'AssetCategory', key: 'category' },
        { id: 'AssetLargeClass', key: 'largeClass' },
        { id: 'AssetMediumClass', key: 'mediumClass' },
        { id: 'AssetItem', key: 'item' },
        { id: 'AssetManufacturer', key: 'manufacturer' },
        { id: 'AssetModel', key: 'model' }
    ],

    // デフォルトカラム定義
    defaultColumns: [
        { id: "checkbox", label: "", field: "checkbox", type: "checkbox", width: "50px" },
        { id: "no", label: "No.", field: "no", type: "number", width: "60px" },
        { id: "category", label: "Category", field: "category", type: "text", width: "100px" },
        { id: "largeClass", label: "大分類", field: "largeClass", type: "text", width: "150px" },
        { id: "mediumClass", label: "中分類", field: "mediumClass", type: "text", width: "150px" },
        { id: "item", label: "品目", field: "item", type: "text", width: "200px" },
        { id: "manufacturer", label: "メーカー", field: "manufacturer", type: "text", width: "150px" },
        { id: "model", label: "型式", field: "model", type: "text", width: "150px" },
        { id: "actions", label: "操作", field: "actions", type: "actions", width: "100px" }
    ]
});

// グローバルに公開（既存のHTMLイベントハンドラとの互換性維持）
window.assetManager = assetManager;
window.toggleAssetFilter = () => assetManager.toggleFilter();
window.resetAssetFilter = () => assetManager.resetFilter();
window.filterAssetTable = () => assetManager.filter();
window.handleSelectAllAssets = () => assetManager.handleSelectAll();
window.handleAssetRowSelect = () => assetManager.handleRowSelect();
window.handleAssetExport = () => alert('Excel出力機能は実装中です');
window.handleAssetDelete = () => assetManager.handleDelete();
window.handleAssetBack = () => assetManager.handleBack();
window.showAssetNewModal = () => assetManager.showNewModal();
window.closeAssetNewModal = () => assetManager.closeNewModal();
window.handleAssetNewSubmit = (e) => assetManager.handleNewSubmit(e);
window.showAssetEditModal = (id) => assetManager.showEditModal(id);
window.closeAssetEditModal = () => assetManager.closeEditModal();
window.handleAssetEditSubmit = (e) => assetManager.handleEditSubmit(e);
window.showAssetDetailModal = (id) => alert(`資産詳細機能は実装中です\n\n資産ID: ${id} の詳細情報を表示します`);
window.goToAssetPreviousPage = () => alert('前のページへ移動（実装中）');
window.goToAssetNextPage = () => alert('次のページへ移動（実装中）');

// 画面表示関数
async function showShipAssetMaster() {
    console.log('showShipAssetMaster called');
    assetManager.showPage();
    await assetManager.initialize();
}
window.showShipAssetMaster = showShipAssetMaster;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    assetManager.setupEventListeners();
});
