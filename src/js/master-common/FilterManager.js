/**
 * FilterManager - フィルター管理クラス
 */
class FilterManager {
    constructor(manager) {
        this.manager = manager;
    }

    toggle() {
        const filterId = `${this.manager.config.entityName}FilterHeader`;
        const filterHeader = document.getElementById(filterId);
        if (filterHeader) {
            filterHeader.style.display =
                filterHeader.style.display === 'none' ? 'block' : 'none';
        }
    }

    reset() {
        this.manager.config.filterFields.forEach(field => {
            const input = document.getElementById(`filter${field.id}`);
            if (input) input.value = '';
        });
        this.filter();
    }

    filter() {
        // 各フィルター値を取得
        const filters = {};
        this.manager.config.filterFields.forEach(field => {
            const input = document.getElementById(`filter${field.id}`);
            if (input) {
                filters[field.columnIndex] = input.value.toLowerCase();
            }
        });

        // テーブル行をフィルタリング
        const rows = document.querySelectorAll(
            `#${this.manager.config.tableBodyId} tr`
        );

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            let isMatch = true;

            for (const [columnIndex, filterValue] of Object.entries(filters)) {
                if (filterValue && cells[columnIndex]) {
                    const cellValue = cells[columnIndex].textContent.toLowerCase();
                    if (!cellValue.includes(filterValue)) {
                        isMatch = false;
                        break;
                    }
                }
            }

            row.style.display = isMatch ? '' : 'none';
        });

        this.manager.uiHelpers.updateCount();
    }
}

// グローバルに公開
window.FilterManager = FilterManager;
