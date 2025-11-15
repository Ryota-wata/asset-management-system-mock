/**
 * SelectionManager - 選択管理クラス
 */
class SelectionManager {
    constructor(manager) {
        this.manager = manager;
    }

    handleSelectAll() {
        const selectAllId = `selectAll${this._capitalize(this.manager.config.entityName)}s`;
        const selectAll = document.getElementById(selectAllId);
        const checkboxes = document.querySelectorAll(
            `#${this.manager.config.tableBodyId} .row-checkbox`
        );

        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (row.style.display !== 'none') {
                checkbox.checked = selectAll.checked;
            }
        });

        this.updateSelectionInfo();
    }

    handleRowSelect() {
        const selectAllId = `selectAll${this._capitalize(this.manager.config.entityName)}s`;
        const checkboxes = document.querySelectorAll(
            `#${this.manager.config.tableBodyId} .row-checkbox`
        );
        const selectAll = document.getElementById(selectAllId);

        const visibleCheckboxes = Array.from(checkboxes).filter(cb => {
            const row = cb.closest('tr');
            return row.style.display !== 'none';
        });

        const allChecked = visibleCheckboxes.length > 0 &&
                          visibleCheckboxes.every(cb => cb.checked);

        selectAll.checked = allChecked;
        this.updateSelectionInfo();
    }

    updateSelectionInfo() {
        const checkboxes = document.querySelectorAll(
            `#${this.manager.config.tableBodyId} .row-checkbox:checked`
        );
        const count = checkboxes.length;

        const selectionInfoId = `${this.manager.config.entityName}SelectionInfo`;
        const deleteBtnId = `${this.manager.config.entityName}DeleteBtn`;

        const selectionInfo = document.getElementById(selectionInfoId);
        const deleteBtn = document.getElementById(deleteBtnId);

        if (selectionInfo) {
            selectionInfo.textContent = `${count}件選択中`;
        }

        if (deleteBtn) {
            deleteBtn.disabled = count === 0;
        }
    }

    getSelectedRows() {
        const checkboxes = document.querySelectorAll(
            `#${this.manager.config.tableBodyId} .row-checkbox:checked`
        );
        return Array.from(checkboxes).map(cb => cb.closest('tr'));
    }

    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// グローバルに公開
window.SelectionManager = SelectionManager;
