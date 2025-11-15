/**
 * TableRenderer - テーブルレンダリングクラス
 */
class TableRenderer {
    constructor(manager) {
        this.manager = manager;
    }

    renderHeader() {
        const thead = document.querySelector(
            `#${this.manager.config.tableBodyId}`
        )?.closest('table')?.querySelector('thead tr');

        if (!thead) {
            console.error('thead not found');
            return;
        }

        thead.innerHTML = '';

        this.manager.columns.forEach(column => {
            const th = document.createElement('th');

            if (column.type === 'checkbox') {
                const checkboxId = `selectAll${this._capitalize(this.manager.config.entityName)}s`;
                th.innerHTML = `<input type="checkbox" id="${checkboxId}" onchange="${this.manager.config.entityName}Manager.handleSelectAll()">`;
            } else {
                th.textContent = column.label;
            }

            if (column.width) {
                th.style.width = column.width;
            }

            thead.appendChild(th);
        });

        console.log('Table header rendered successfully');
    }

    renderBody() {
        const tbody = document.getElementById(this.manager.config.tableBodyId);
        if (!tbody) {
            console.error('tbody not found');
            return;
        }

        tbody.innerHTML = '';

        this.manager.data.forEach((item, index) => {
            const tr = this.renderRow(item, index);
            tbody.appendChild(tr);
        });

        this.manager.uiHelpers.updateCount();
    }

    renderRow(item, index) {
        const tr = document.createElement('tr');
        const identifierKey = this.manager.config.identifierKey;
        tr.dataset[this._camelCase(identifierKey)] = item[identifierKey];

        this.manager.columns.forEach(column => {
            const td = this.renderCell(column, item, index);
            tr.appendChild(td);
        });

        return tr;
    }

    renderCell(column, item, index) {
        const td = document.createElement('td');

        switch (column.type) {
            case 'checkbox':
                td.innerHTML = `<input type="checkbox" class="row-checkbox" onchange="${this.manager.config.entityName}Manager.handleRowSelect()">`;
                break;

            case 'number':
                if (column.id === 'no') {
                    td.textContent = index + 1;
                }
                break;

            case 'actions':
                const identifier = item[this.manager.config.identifierKey];
                const identifierParam = typeof identifier === 'string'
                    ? `'${identifier}'`
                    : identifier;
                td.innerHTML = `<button class="table-action-btn edit" onclick="${this.manager.config.entityName}Manager.showEditModal(${identifierParam})">編集</button>`;
                break;

            default:
                const value = this._getFieldValue(item, column.field);
                td.textContent = value || '-';
                break;
        }

        return td;
    }

    _getFieldValue(item, field) {
        // フィールドマッピングを考慮
        const mapping = this.manager.config.fieldMapping || {};
        const actualField = mapping[field] || field;
        return item[actualField] || item[field];
    }

    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    _camelCase(str) {
        return str.replace(/-([a-z])/g, g => g[1].toUpperCase())
                  .replace(/^./, match => match.toLowerCase());
    }
}

// グローバルに公開
window.TableRenderer = TableRenderer;
