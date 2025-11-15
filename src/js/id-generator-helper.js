/**
 * ID生成共通ヘルパー関数
 *
 * 見積依頼番号、申請番号などの連番IDを生成します。
 */

window.IdGenerator = {
    /**
     * 見積依頼番号を生成
     * @param {Array} existingRecords - 既存の見積依頼レコード配列
     * @returns {string} 新しい見積依頼番号 (例: RFQ-2025-0001)
     */
    generateRfqNo(existingRecords) {
        const year = new Date().getFullYear();
        const existingNos = existingRecords
            .map(r => r.rfqNo)
            .filter(no => no && no.startsWith(`RFQ-${year}-`));

        let maxNo = 0;
        existingNos.forEach(no => {
            const match = no.match(/RFQ-\d{4}-(\d{4})/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxNo) maxNo = num;
            }
        });

        const newNo = (maxNo + 1).toString().padStart(4, '0');
        return `RFQ-${year}-${newNo}`;
    },

    /**
     * 汎用的な連番生成
     * @param {string} prefix - プレフィックス (例: 'REQ', 'RFQ')
     * @param {number} year - 年度 (省略時は現在年度)
     * @param {Array<string>} existingNos - 既存の番号配列
     * @param {number} digits - 桁数 (デフォルト: 4)
     * @returns {string} 新しい連番 (例: REQ-2025-0001)
     */
    generateSequentialNo(prefix, year = null, existingNos = [], digits = 4) {
        const targetYear = year || new Date().getFullYear();
        const pattern = new RegExp(`${prefix}-${targetYear}-(\\d{${digits}})`);
        let maxNo = 0;

        existingNos.forEach(no => {
            const match = no.match(pattern);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxNo) maxNo = num;
            }
        });

        return `${prefix}-${targetYear}-${(maxNo + 1).toString().padStart(digits, '0')}`;
    },

    /**
     * ランダムな申請番号を生成（一時的な使用向け）
     * @param {string} prefix - プレフィックス (デフォルト: 'REQ')
     * @returns {string} ランダムな申請番号
     */
    generateRandomApplicationNo(prefix = 'REQ') {
        const year = new Date().getFullYear();
        const randomNo = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${year}-${randomNo}`;
    }
};
