/**
 * SHIP施設マスタ設定
 *
 * MasterTableManagerクラスを使用した汎用マスタ管理実装
 * 設定のみを定義し、共通ロジックはmaster-commonモジュールに委譲
 */

// 施設マスタマネージャーのインスタンス作成
const facilityManager = new MasterTableManager({
    entityName: 'facility',
    displayName: '施設',
    dataUrl: 'src/data/facility-master.json',
    dataKey: 'facilities',
    identifierKey: 'facilityCode',
    pageId: 'shipFacilityMasterPage',
    tableBodyId: 'facilityTableBody',

    // フィルター項目定義
    filterFields: [
        { id: 'FacilityId', columnIndex: 2 },
        { id: 'FacilityName', columnIndex: 3 }
    ],

    // フォーム項目定義
    formFields: [
        { id: 'FacilityCode', key: 'facilityCode' },
        { id: 'FacilityName', key: 'facilityName' },
        { id: 'FacilityBuilding', key: 'building', default: '本館' },
        { id: 'FacilityFloor', key: 'floor', default: '1F' },
        { id: 'FacilityDepartment', key: 'department', default: '-' },
        { id: 'FacilitySection', key: 'section', default: '-' }
    ],

    // デフォルトカラム定義
    defaultColumns: [
        { id: "checkbox", label: "", field: "checkbox", type: "checkbox", width: "50px" },
        { id: "no", label: "No.", field: "no", type: "number", width: "60px" },
        { id: "code", label: "施設コード", field: "facilityCode", type: "text", width: "100px" },
        { id: "name", label: "施設名", field: "facilityName", type: "text", width: "200px" },
        { id: "building", label: "棟", field: "building", type: "text", width: "100px" },
        { id: "floor", label: "階", field: "floor", type: "text", width: "80px" },
        { id: "department", label: "部門", field: "department", type: "text", width: "120px" },
        { id: "section", label: "部署", field: "section", type: "text", width: "120px" },
        { id: "actions", label: "操作", field: "actions", type: "actions", width: "100px" }
    ],

    // フィールドマッピング（後方互換性のため）
    fieldMapping: {
        'name': 'facilityName',
        'code': 'facilityCode'
    }
});

// グローバルに公開（既存のHTMLイベントハンドラとの互換性維持）
window.facilityManager = facilityManager;
window.toggleFacilityFilter = () => facilityManager.toggleFilter();
window.resetFacilityFilter = () => facilityManager.resetFilter();
window.filterFacilityTable = () => facilityManager.filter();
window.handleSelectAllFacilities = () => facilityManager.handleSelectAll();
window.handleFacilityRowSelect = () => facilityManager.handleRowSelect();
window.handleFacilityExport = () => alert('Excel出力機能は実装中です');
window.handleFacilityDelete = () => facilityManager.handleDelete();
window.handleFacilityBack = () => facilityManager.handleBack();
window.showFacilityNewModal = () => facilityManager.showNewModal();
window.closeFacilityNewModal = () => facilityManager.closeNewModal();
window.handleFacilityNewSubmit = (e) => facilityManager.handleNewSubmit(e);
window.showFacilityEditModal = (code) => facilityManager.showEditModal(code);
window.closeFacilityEditModal = () => facilityManager.closeEditModal();
window.handleFacilityEditSubmit = (e) => facilityManager.handleEditSubmit(e);
window.showFacilityDetailModal = (id) => alert(`施設詳細機能は実装中です\n\n施設ID: ${id} の詳細情報を表示します`);
window.goToPreviousPage = () => alert('前のページへ移動（実装中）');
window.goToNextPage = () => alert('次のページへ移動（実装中）');

// 画面表示関数
async function showShipFacilityMaster() {
    console.log('showShipFacilityMaster called');
    facilityManager.showPage();
    await facilityManager.initialize();
}
window.showShipFacilityMaster = showShipFacilityMaster;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    facilityManager.setupEventListeners();
});
