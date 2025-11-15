/**
 * CRUDManager - CRUD操作管理クラス
 */
class CRUDManager {
    constructor(manager) {
        this.manager = manager;
    }

    // 削除
    delete() {
        const selectedRows = this.manager.selectionManager.getSelectedRows();
        const count = selectedRows.length;

        if (count === 0) return;

        if (confirm(`選択した${count}件の${this.manager.config.displayName}を削除しますか？`)) {
            selectedRows.forEach(row => {
                const identifierKey = this.manager.config.identifierKey;
                const datasetKey = this._camelCase(identifierKey);
                const identifier = row.dataset[datasetKey];

                // データ配列から削除
                const index = this.manager.data.findIndex(item =>
                    String(item[identifierKey]) === String(identifier)
                );
                if (index !== -1) {
                    this.manager.data.splice(index, 1);
                }

                // DOM削除
                row.remove();
            });

            this.manager.filterManager.filter();
            this.manager.selectionManager.updateSelectionInfo();
            alert(`${count}件の${this.manager.config.displayName}を削除しました`);
        }
    }

    // 新規作成モーダル表示
    showNewModal() {
        const modalId = `${this.manager.config.entityName}NewModal`;
        const modal = document.getElementById(modalId);
        if (modal) {
            const formId = `${this.manager.config.entityName}NewForm`;
            const form = document.getElementById(formId);
            if (form) form.reset();

            modal.classList.add('show');
        }
    }

    closeNewModal() {
        const modalId = `${this.manager.config.entityName}NewModal`;
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // 新規登録
    handleNewSubmit(event) {
        event.preventDefault();

        // フォームデータ取得
        const formData = {};
        this.manager.config.formFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                formData[field.key] = input.value || field.default || '';
            }
        });

        // ID生成
        const newId = this.generateNewId();

        // 新規データ作成
        const newItem = {
            id: newId,
            ...formData
        };

        // データ追加
        this.manager.data.push(newItem);

        // テーブル再描画
        this.manager.renderer.renderBody();

        // モーダル閉じる
        this.closeNewModal();

        // 成功メッセージ
        const displayField = this.manager.config.formFields.find(f => f.key.includes('Name') || f.key.includes('Item'))?.key || this.manager.config.formFields[0].key;
        alert(`${this.manager.config.displayName}「${formData[displayField]}」を登録しました`);
    }

    // 編集モーダル表示
    showEditModal(identifier) {
        const modalId = `${this.manager.config.entityName}EditModal`;
        const modal = document.getElementById(modalId);

        if (!modal) {
            alert(`${this.manager.config.displayName}編集機能は実装中です\n\nID: ${identifier} の編集画面を表示します`);
            return;
        }

        // データ検索
        const identifierKey = this.manager.config.identifierKey;
        const item = this.manager.data.find(i =>
            String(i[identifierKey]) === String(identifier)
        );

        if (!item) {
            alert(`${this.manager.config.displayName}が見つかりません`);
            return;
        }

        // 隠しフィールドにIDをセット
        const idFieldName = `edit${this._capitalize(this.manager.config.entityName)}Id`;
        const idField = document.getElementById(idFieldName);
        if (idField) {
            idField.value = item.id || identifier;
        }

        // フォームに値をセット
        this.manager.config.formFields.forEach(field => {
            const input = document.getElementById(`edit${field.id}`);
            if (input) {
                input.value = item[field.key] || '';
            }
        });

        modal.classList.add('show');
    }

    closeEditModal() {
        const modalId = `${this.manager.config.entityName}EditModal`;
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // 編集送信
    handleEditSubmit(event) {
        event.preventDefault();

        const idFieldName = `edit${this._capitalize(this.manager.config.entityName)}Id`;
        const identifierInput = document.getElementById(idFieldName);
        const itemId = identifierInput ? parseInt(identifierInput.value) : null;

        // フォームデータ取得
        const formData = {};
        this.manager.config.formFields.forEach(field => {
            const input = document.getElementById(`edit${field.id}`);
            if (input) {
                formData[field.key] = input.value;
            }
        });

        // データ更新
        const index = this.manager.data.findIndex(i => i.id === itemId);

        if (index !== -1) {
            this.manager.data[index] = {
                ...this.manager.data[index],
                ...formData
            };
        }

        // テーブル再描画
        this.manager.renderer.renderBody();

        // モーダル閉じる
        this.closeEditModal();

        // 成功メッセージ
        const displayField = this.manager.config.formFields.find(f => f.key.includes('Name') || f.key.includes('Item'))?.key || this.manager.config.formFields[0].key;
        alert(`${this.manager.config.displayName}「${formData[displayField]}」を更新しました`);
    }

    generateNewId() {
        if (this.manager.data.length === 0) return 1;
        return Math.max(...this.manager.data.map(i => i.id || 0)) + 1;
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
window.CRUDManager = CRUDManager;
