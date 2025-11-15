/**
 * DataLoader - マスタデータ読み込み管理クラス
 */
class DataLoader {
    constructor(manager) {
        this.manager = manager;
    }

    async load() {
        try {
            const cacheBuster = new Date().getTime();
            const response = await fetch(
                `${this.manager.config.dataUrl}?v=${cacheBuster}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const config = await response.json();

            // データキーの存在チェック
            const dataKey = this.manager.config.dataKey;
            if (!config[dataKey] && !config.data) {
                throw new Error(`Invalid JSON: missing ${dataKey}/data`);
            }

            // カラム設定（なければデフォルト生成）
            this.manager.columns = config.columns ||
                                   this.manager.config.defaultColumns;

            // データ設定
            this.manager.data = config[dataKey] || config.data;

            console.log(`${this.manager.config.displayName}マスタを読み込みました:`, config);
            console.log(`${this.manager.config.displayName}データ件数: ${this.manager.data.length}`);

            return config;
        } catch (error) {
            console.error(`Failed to load ${this.manager.config.displayName}マスタ:`, error);
            alert(`${this.manager.config.displayName}マスタデータの読み込みに失敗しました: ${error.message}`);
            return null;
        }
    }
}

// グローバルに公開
window.DataLoader = DataLoader;
