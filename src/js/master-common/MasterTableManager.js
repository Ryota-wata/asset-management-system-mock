/**
 * MasterTableManager - マスタテーブル管理の汎用クラス
 *
 * SHIP施設マスタ、SHIP資産マスタなど、各種マスタテーブルの
 * 共通機能を提供する統合管理クラス
 */
class MasterTableManager {
    constructor(config) {
        this.config = {
            entityName: config.entityName,          // "facility" or "asset"
            displayName: config.displayName,        // "施設" or "資産"
            dataUrl: config.dataUrl,                // JSONファイルパス
            dataKey: config.dataKey,                // "facilities" or "assets"
            identifierKey: config.identifierKey,    // "facilityCode" or "id"
            pageId: config.pageId,                  // DOMのID
            tableBodyId: config.tableBodyId,
            filterFields: config.filterFields,      // フィルター項目配列
            formFields: config.formFields,          // フォーム項目配列
            defaultColumns: config.defaultColumns,  // デフォルトカラム定義
            fieldMapping: config.fieldMapping || {} // フィールドマッピング
        };

        this.data = [];
        this.columns = [];

        // サブマネージャーのインスタンス化
        this.dataLoader = new DataLoader(this);
        this.renderer = new TableRenderer(this);
        this.filterManager = new FilterManager(this);
        this.selectionManager = new SelectionManager(this);
        this.crudManager = new CRUDManager(this);
        this.uiHelpers = new UIHelpers(this);
    }

    async initialize() {
        console.log(`${this.config.displayName}マスタ初期化開始`);

        const result = await this.dataLoader.load();
        if (!result) {
            console.error(`${this.config.displayName}マスタの読み込みに失敗しました`);
            return false;
        }

        this.renderer.renderHeader();
        this.renderer.renderBody();

        console.log(`${this.config.displayName}マスタ初期化完了`);
        return true;
    }

    // FilterManagerへのプロキシメソッド
    toggleFilter() {
        return this.filterManager.toggle();
    }

    resetFilter() {
        return this.filterManager.reset();
    }

    filter() {
        return this.filterManager.filter();
    }

    // SelectionManagerへのプロキシメソッド
    handleSelectAll() {
        return this.selectionManager.handleSelectAll();
    }

    handleRowSelect() {
        return this.selectionManager.handleRowSelect();
    }

    updateSelectionInfo() {
        return this.selectionManager.updateSelectionInfo();
    }

    getSelectedRows() {
        return this.selectionManager.getSelectedRows();
    }

    // CRUDManagerへのプロキシメソッド
    handleDelete() {
        return this.crudManager.delete();
    }

    showNewModal() {
        return this.crudManager.showNewModal();
    }

    closeNewModal() {
        return this.crudManager.closeNewModal();
    }

    handleNewSubmit(event) {
        return this.crudManager.handleNewSubmit(event);
    }

    showEditModal(identifier) {
        return this.crudManager.showEditModal(identifier);
    }

    closeEditModal() {
        return this.crudManager.closeEditModal();
    }

    handleEditSubmit(event) {
        return this.crudManager.handleEditSubmit(event);
    }

    // UIHelpersへのプロキシメソッド
    updateCount() {
        return this.uiHelpers.updateCount();
    }

    showPage() {
        return this.uiHelpers.showPage();
    }

    handleBack() {
        return this.uiHelpers.handleBack();
    }

    setupEventListeners() {
        return this.uiHelpers.setupEventListeners();
    }
}

// グローバルに公開
window.MasterTableManager = MasterTableManager;
