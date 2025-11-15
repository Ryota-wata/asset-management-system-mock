/**
 * UIHelpers - UI共通処理クラス
 */
class UIHelpers {
    constructor(manager) {
        this.manager = manager;
    }

    updateCount() {
        const visibleRows = document.querySelectorAll(
            `#${this.manager.config.tableBodyId} tr:not([style*="display: none"])`
        );

        const countId = `${this.manager.config.entityName}Count`;
        const countElement = document.getElementById(countId);
        if (countElement) {
            countElement.textContent = `${visibleRows.length}件`;
        }

        const totalId = `total${this._capitalize(this.manager.config.entityName)}s`;
        const totalElement = document.getElementById(totalId);
        const endElement = document.getElementById('displayEnd');

        if (totalElement) totalElement.textContent = visibleRows.length;
        if (endElement) endElement.textContent = visibleRows.length;
    }

    showPage() {
        // すべての画面を非表示
        const allPages = document.querySelectorAll('.active');
        allPages.forEach(page => page.classList.remove('active'));

        // 対象ページを表示
        const page = document.getElementById(this.manager.config.pageId);
        if (page) {
            page.classList.add('active');
        } else {
            console.error(`${this.manager.config.pageId} element not found`);
        }
    }

    handleBack() {
        const page = document.getElementById(this.manager.config.pageId);
        if (page) {
            page.classList.remove('active');
        }

        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.classList.add('active');
        }
    }

    setupEventListeners() {
        // 新規作成モーダル外クリックで閉じる
        const newModalId = `${this.manager.config.entityName}NewModal`;
        const newModal = document.getElementById(newModalId);
        if (newModal) {
            newModal.addEventListener('click', (e) => {
                if (e.target === newModal) {
                    this.manager.crudManager.closeNewModal();
                }
            });
        }

        // 編集モーダル外クリックで閉じる
        const editModalId = `${this.manager.config.entityName}EditModal`;
        const editModal = document.getElementById(editModalId);
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    this.manager.crudManager.closeEditModal();
                }
            });
        }
    }

    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// グローバルに公開
window.UIHelpers = UIHelpers;
