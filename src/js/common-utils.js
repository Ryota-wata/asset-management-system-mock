/**
 * 共通ユーティリティ関数
 * 複数の画面で使用される汎用的な関数を集約
 */

window.CommonUtils = {
    /**
     * 日付フォーマット（YYYY-MM-DD）
     * @param {Date|string} date - 日付オブジェクトまたは文字列
     * @returns {string} フォーマットされた日付文字列
     */
    formatDate(date) {
        const d = date instanceof Date ? date : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 金額フォーマット（カンマ区切り）
     * @param {number} amount - 金額
     * @returns {string} フォーマットされた金額文字列
     */
    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return '¥' + amount.toLocaleString('ja-JP');
    },

    /**
     * テーブルのフィルタリング（汎用）
     * @param {Array} data - フィルタリング対象のデータ配列
     * @param {Object} filters - フィルター条件オブジェクト
     * @returns {Array} フィルタリング後のデータ
     */
    filterTableData(data, filters) {
        return data.filter(item => {
            for (const [key, value] of Object.entries(filters)) {
                // 空の値はスキップ
                if (!value || value === '') continue;

                // ネストされたオブジェクトのサポート
                const itemValue = key.includes('.')
                    ? key.split('.').reduce((obj, k) => obj?.[k], item)
                    : item[key];

                // 文字列の部分一致
                if (typeof itemValue === 'string' && typeof value === 'string') {
                    if (!itemValue.toLowerCase().includes(value.toLowerCase())) {
                        return false;
                    }
                }
                // 完全一致
                else if (itemValue !== value) {
                    return false;
                }
            }
            return true;
        });
    },

    /**
     * テーブルのソート（汎用）
     * @param {Array} data - ソート対象のデータ配列
     * @param {string} key - ソートキー
     * @param {string} order - 'asc' または 'desc'
     * @returns {Array} ソート後のデータ
     */
    sortTableData(data, key, order = 'asc') {
        const sorted = [...data].sort((a, b) => {
            const aValue = key.includes('.')
                ? key.split('.').reduce((obj, k) => obj?.[k], a)
                : a[key];
            const bValue = key.includes('.')
                ? key.split('.').reduce((obj, k) => obj?.[k], b)
                : b[key];

            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    },

    /**
     * ステータスバッジのHTMLを生成
     * @param {string} status - ステータス文字列
     * @param {Object} config - バッジの設定（class, text）
     * @returns {string} バッジのHTML
     */
    createStatusBadge(status, config = {}) {
        const defaultConfig = {
            class: 'status-badge',
            text: status
        };
        const badgeConfig = { ...defaultConfig, ...config };
        return `<span class="${badgeConfig.class}">${badgeConfig.text}</span>`;
    },

    /**
     * テーブル行のクリック可能化
     * @param {string} tableSelector - テーブルのセレクタ
     * @param {function} onRowClick - 行クリック時のコールバック
     */
    makeTableRowsClickable(tableSelector, onRowClick) {
        const table = document.querySelector(tableSelector);
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.style.cursor = 'pointer';
            row.addEventListener('click', function(event) {
                // ボタンやリンクのクリックは除外
                if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
                    return;
                }
                if (typeof onRowClick === 'function') {
                    onRowClick(row, event);
                }
            });
        });
    },

    /**
     * 確認ダイアログ（拡張版）
     * @param {string} message - メッセージ
     * @param {Object} options - オプション
     * @returns {boolean} ユーザーの選択
     */
    confirm(message, options = {}) {
        const {
            title = '確認',
            okText = 'OK',
            cancelText = 'キャンセル'
        } = options;

        // 将来的にはカスタムモーダルに置き換え可能
        return window.confirm(`${title}\n\n${message}`);
    },

    /**
     * デバウンス関数
     * @param {function} func - 実行する関数
     * @param {number} wait - 待機時間（ミリ秒）
     * @returns {function} デバウンスされた関数
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * ローディング表示の切り替え
     * @param {boolean} show - 表示するかどうか
     * @param {string} message - ローディングメッセージ
     */
    toggleLoading(show, message = '読み込み中...') {
        let loader = document.getElementById('globalLoader');

        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'globalLoader';
                loader.style.cssText = `
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); z-index: 9999;
                    display: flex; align-items: center; justify-content: center;
                `;
                loader.innerHTML = `
                    <div style="background: white; padding: 30px 50px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 32px; margin-bottom: 10px;">⏳</div>
                        <div style="font-size: 16px; color: #333;">${message}</div>
                    </div>
                `;
                document.body.appendChild(loader);
            }
            loader.style.display = 'flex';
        } else {
            if (loader) {
                loader.style.display = 'none';
            }
        }
    },

    /**
     * 複数のDOM要素にテキスト値を一括設定
     * @param {Object} data - データオブジェクト
     * @param {Object} fieldMappings - {elementId: fieldPath} のマッピング
     * @param {string} defaultValue - デフォルト値（未指定時）
     */
    setElementsText(data, fieldMappings, defaultValue = '-') {
        Object.entries(fieldMappings).forEach(([elementId, fieldPath]) => {
            const element = document.getElementById(elementId);
            if (!element) return;

            // ネストされたフィールドパスのサポート (例: 'address.city')
            const value = fieldPath.includes('.')
                ? fieldPath.split('.').reduce((obj, key) => obj?.[key], data)
                : data[fieldPath];

            element.textContent = value !== null && value !== undefined && value !== '' ? value : defaultValue;
        });
    },

    /**
     * フォーム入力値の一括取得
     * @param {Object} fieldMappings - {dataKey: elementId} のマッピング
     * @param {string} defaultValue - デフォルト値（未指定時）
     * @returns {Object} 取得した値のオブジェクト
     */
    getFormFieldValues(fieldMappings, defaultValue = '-') {
        const values = {};

        Object.entries(fieldMappings).forEach(([dataKey, elementId]) => {
            const element = document.getElementById(elementId);
            if (!element) {
                values[dataKey] = defaultValue;
                return;
            }

            // input要素を含む要素から値を取得
            const input = element.querySelector('input, select, textarea') || element;

            if (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
                values[dataKey] = input.value || defaultValue;
            } else {
                values[dataKey] = element.textContent || defaultValue;
            }
        });

        return values;
    },

    /**
     * フォーム入力値の一括設定
     * @param {Object} values - 設定する値のオブジェクト
     * @param {Object} fieldMappings - {dataKey: elementId} のマッピング
     */
    setFormFieldValues(values, fieldMappings) {
        Object.entries(fieldMappings).forEach(([dataKey, elementId]) => {
            const element = document.getElementById(elementId);
            if (!element) return;

            const value = values[dataKey];
            if (value === null || value === undefined) return;

            // input要素を含む要素に値を設定
            const input = element.querySelector('input, select, textarea') || element;

            if (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
                input.value = value === '-' ? '' : value;
            } else {
                element.textContent = value;
            }
        });
    },

    /**
     * 要素を編集可能な入力フィールドに変換
     * @param {Object} fieldConfigs - {elementId: {type, placeholder, ...}} の設定
     */
    convertToEditableFields(fieldConfigs) {
        Object.entries(fieldConfigs).forEach(([elementId, config]) => {
            const element = document.getElementById(elementId);
            if (!element) return;

            const currentValue = element.textContent;
            const displayValue = currentValue === '-' ? '' : currentValue;

            const {
                type = 'text',
                placeholder = '',
                readonly = false,
                options = null  // select要素用
            } = config;

            if (options && Array.isArray(options)) {
                // select要素を生成
                const optionsHtml = options.map(opt =>
                    `<option value="${opt.value}" ${opt.value === displayValue ? 'selected' : ''}>${opt.label}</option>`
                ).join('');
                element.innerHTML = `<select ${readonly ? 'disabled' : ''}>${optionsHtml}</select>`;
            } else {
                // input要素を生成
                element.innerHTML = `<input type="${type}" value="${displayValue}" placeholder="${placeholder}" ${readonly ? 'readonly' : ''}>`;
            }
        });
    },

    /**
     * 編集可能フィールドを通常のテキスト表示に戻す
     * @param {Array} elementIds - 要素IDの配列
     */
    convertToTextDisplay(elementIds) {
        elementIds.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (!element) return;

            const input = element.querySelector('input, select, textarea');
            if (input) {
                const value = input.value || '-';
                element.textContent = value;
            }
        });
    }
};
