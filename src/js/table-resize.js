/**
 * テーブルカラムリサイズ機能
 * テーブルのカラム幅をドラッグ&ドロップで調整可能にする
 */

/**
 * テーブルにリサイズ機能を追加
 * @param {HTMLTableElement} table - 対象のテーブル要素
 */
function makeTableResizable(table) {
    if (!table) return;

    // 既にリサイズ可能な場合はスキップ
    if (table.classList.contains('resizable-initialized')) return;

    const thead = table.querySelector('thead');
    if (!thead) return;

    const ths = thead.querySelectorAll('th');
    if (ths.length === 0) return;

    // 各カラムヘッダーにリサイズハンドルを追加
    ths.forEach((th, index) => {
        // 最後のカラムにはリサイズハンドルを追加しない（テーブル全体の幅を超えないため）
        if (index === ths.length - 1) return;

        const resizer = document.createElement('div');
        resizer.className = 'column-resizer';
        th.style.position = 'relative';
        th.appendChild(resizer);

        let startX = 0;
        let startWidth = 0;

        const onMouseDown = (e) => {
            e.preventDefault();
            e.stopPropagation();

            startX = e.pageX;
            startWidth = th.offsetWidth;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            // リサイズ中のスタイル
            resizer.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        };

        const onMouseMove = (e) => {
            const diff = e.pageX - startX;
            const newWidth = startWidth + diff;

            // 最小幅を50pxに設定
            if (newWidth >= 50) {
                th.style.width = newWidth + 'px';
                th.style.minWidth = newWidth + 'px';
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            resizer.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        resizer.addEventListener('mousedown', onMouseDown);
    });

    table.classList.add('resizable-initialized');
}

/**
 * ページ内のすべてのリサイズ可能テーブルを初期化
 */
function initializeResizableTables() {
    const tables = document.querySelectorAll('.resizable-table');
    tables.forEach(table => makeTableResizable(table));
}

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeResizableTables);
} else {
    initializeResizableTables();
}

// グローバルに公開（動的に追加されたテーブル用）
window.makeTableResizable = makeTableResizable;
window.initializeResizableTables = initializeResizableTables;
