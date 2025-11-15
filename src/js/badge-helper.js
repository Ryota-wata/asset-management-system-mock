/**
 * バッジ生成共通ヘルパー関数
 *
 * 申請一覧、見積依頼一覧などで使用するバッジHTMLを生成します。
 */

window.BadgeHelper = {
    /**
     * 申請ステータスバッジを取得
     * @param {string} status - ステータス文字列
     * @returns {string} バッジHTML
     */
    getApplicationStatusBadge(status) {
        const badgeMap = {
            '下書き': '<span class="status-badge draft">🟦 下書き</span>',
            '承認待ち': '<span class="status-badge pending">🟨 承認待ち</span>',
            '承認済み': '<span class="status-badge approved">🟩 承認済み</span>',
            '差し戻し': '<span class="status-badge returned">🟥 差し戻し</span>',
            '却下': '<span class="status-badge rejected">⬛ 却下</span>'
        };
        return badgeMap[status] || status;
    },

    /**
     * 見積依頼ステータスバッジを取得
     * @param {string} status - ステータス文字列
     * @returns {string} バッジHTML
     */
    getRfqStatusBadge(status) {
        const badgeMap = {
            '依頼書作成待': '<span class="rfq-status-badge pending-doc">📄 依頼書作成待</span>',
            '見積依頼済': '<span class="rfq-status-badge requested">📧 見積依頼済</span>',
            '見積登録済': '<span class="rfq-status-badge quotation-registered">✅ 見積登録済</span>',
            '承認済': '<span class="rfq-status-badge approved">🟢 承認済</span>'
        };
        return badgeMap[status] || status;
    },

    /**
     * 申請種別バッジを取得
     * @param {string} type - 申請種別文字列
     * @returns {string} バッジHTML
     */
    getApplicationTypeBadge(type) {
        const badgeMap = {
            '新規購入申請': '<span class="application-type-badge new-purchase">🆕 新規購入</span>',
            '増設購入申請': '<span class="application-type-badge expansion">➕ 増設購入</span>',
            '更新購入申請': '<span class="application-type-badge renewal">🔄 更新購入</span>',
            '移動申請': '<span class="application-type-badge move">📦 移動</span>',
            '廃棄申請': '<span class="application-type-badge disposal">🗑️ 廃棄</span>',
            '保留申請': '<span class="application-type-badge hold">⏸️ 保留</span>'
        };
        return badgeMap[type] || type;
    }
};
