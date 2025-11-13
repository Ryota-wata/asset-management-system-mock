/**
 * データ突合画面のJavaScript
 */

// サンプルデータ: 現有品調査リスト
const surveyData = [
    { id: 1, sealNo: 'S0123', assetNo: '12345', department: '手術部門', item: '電気メス', maker: 'オリンパス', model: 'ESG-400', quantity: 1, purchaseDate: '2020/04/15', status: 'completed', matchedLedgerId: 1, matchingType: 'A1' },
    { id: 2, sealNo: 'S0124', assetNo: '', department: '放射線科', item: 'CT装置', maker: 'GEヘルスケア', model: 'Revolution', quantity: 1, purchaseDate: '', status: 'pending', matchedLedgerId: null, matchingType: null },
    { id: 3, sealNo: 'S0125', assetNo: '67890', department: '検査科', item: '血液分析装置', maker: 'シスメックス', model: '', quantity: 1, purchaseDate: '', status: 'pending', matchedLedgerId: null, matchingType: null },
    { id: 4, sealNo: 'S0126', assetNo: '11111', department: '病理科', item: '顕微鏡', maker: 'ニコン', model: 'Eclipse', quantity: 1, purchaseDate: '2019/06/20', status: 'review', matchedLedgerId: 3, matchingType: 'B2' },
    { id: 5, sealNo: 'S0127', assetNo: '', department: '外来', item: '診察台', maker: '', model: '', quantity: 1, purchaseDate: '', status: 'mismatch', matchedLedgerId: null, matchingType: 'D2' },
    { id: 6, sealNo: 'S0128', assetNo: '22222', department: '放射線科', item: 'MRI装置', maker: 'シーメンス', model: 'MAGNETOM Vida', quantity: 1, purchaseDate: '2021/01/10', status: 'pending', matchedLedgerId: null, matchingType: null },
    { id: 7, sealNo: 'S0129', assetNo: '', department: '検査科', item: '血液分析装置', maker: 'シスメックス', model: 'XN-9000', quantity: 1, purchaseDate: '', status: 'pending', matchedLedgerId: null, matchingType: null },
    { id: 8, sealNo: 'S0130', assetNo: '33333', department: '手術部門', item: '内視鏡システム', maker: 'オリンパス', model: 'EVIS X1', quantity: 1, purchaseDate: '2022/03/25', status: 'pending', matchedLedgerId: null, matchingType: null }
];

// サンプルデータ: 資産台帳リスト
const ledgerData = [
    { id: 1, assetNo: '12345', department: '手術部門', item: '電気メス', maker: 'オリンパス', model: 'ESG-400', purchaseDate: '2020/04/15', matched: true },
    { id: 2, assetNo: '67890', department: '検査科', item: '血液分析装置', maker: 'シスメックス', model: 'XN-3000', purchaseDate: '2019/03/10', matched: false },
    { id: 3, assetNo: '11111', department: '放射線科', item: 'MRI装置', maker: 'シーメンス', model: 'MAGNETOM Vida', purchaseDate: '2021/01/10', matched: false },
    { id: 4, assetNo: '22222', department: '検査科', item: '血液分析装置', maker: 'シスメックス', model: 'XN-9000', purchaseDate: '2018/05/20', matched: false },
    { id: 5, assetNo: '44444', department: '病理科', item: '顕微鏡', maker: 'ニコン', model: 'Eclipse E200', purchaseDate: '2019/06/20', matched: false },
    { id: 6, assetNo: '55555', department: '手術部門', item: '内視鏡システム', maker: 'オリンパス', model: 'EVIS X1', purchaseDate: '2022/03/25', matched: false },
    { id: 7, assetNo: '66666', department: '放射線科', item: 'CT装置', maker: 'GEヘルスケア', model: 'Revolution CT', purchaseDate: '2020/08/15', matched: false }
];

// 現在の選択行
let currentSelectedSurveyId = null;
let currentSelectedLedgerId = null;

// サブウィンドウ参照
let ledgerSubWindow = null;

// フィルター状態を保存（両画面で共有）
let currentFilters = {
    status: 'all',
    department: '',
    item: '',
    maker: '',
    keyword: ''
};

/**
 * 現有品調査リストをレンダリング
 */
function renderSurveyList() {
    const tbody = document.getElementById('surveyTableBody');
    if (!tbody) return;

    // フィルタリング
    let filteredData = surveyData.filter(item => {
        if (currentFilters.status !== 'all' && item.status !== currentFilters.status) return false;
        if (currentFilters.department && item.department !== currentFilters.department) return false;
        if (currentFilters.item && item.item !== currentFilters.item) return false;
        if (currentFilters.maker && item.maker !== currentFilters.maker) return false;
        if (currentFilters.keyword) {
            const keyword = currentFilters.keyword.toLowerCase();
            const searchText = `${item.sealNo} ${item.assetNo} ${item.department} ${item.item} ${item.maker} ${item.model}`.toLowerCase();
            if (!searchText.includes(keyword)) return false;
        }
        return true;
    });

    tbody.innerHTML = '';

    filteredData.forEach(item => {
        const statusBadge = getStatusBadge(item.status);
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', item.id);
        if (item.id === currentSelectedSurveyId) {
            tr.classList.add('selected');
        }

        tr.innerHTML = `
            <td><input type="checkbox" class="survey-checkbox" data-id="${item.id}"></td>
            <td>${statusBadge}</td>
            <td>${item.sealNo}</td>
            <td>${item.assetNo || '-'}</td>
            <td>${item.department}</td>
            <td>${item.item}</td>
            <td>${item.maker || '-'}</td>
            <td>${item.model || '-'}</td>
            <td>${item.quantity}</td>
            <td>${item.purchaseDate || '-'}</td>
            <td><button class="match-btn" onclick="selectSurveyRow(${item.id})">突合</button></td>
        `;

        tbody.appendChild(tr);
    });

    // カウント更新
    updateSurveyCount(filteredData.length);
    updateProgress();
}

/**
 * ステータスバッジを取得
 */
function getStatusBadge(status) {
    const statusMap = {
        'pending': { icon: '⚪', text: '未処理', class: 'pending' },
        'completed': { icon: '🟢', text: '確定済', class: 'completed' },
        'review': { icon: '🟡', text: '要確認', class: 'review' },
        'mismatch': { icon: '🔴', text: '不一致', class: 'mismatch' }
    };
    const badge = statusMap[status] || statusMap['pending'];
    return `<span class="status-badge ${badge.class}">${badge.icon} ${badge.text}</span>`;
}

/**
 * カウント更新
 */
function updateSurveyCount(count) {
    const countElement = document.getElementById('surveyListCount');
    if (countElement) {
        countElement.textContent = `表示: ${count}件`;
    }
}

/**
 * 進捗更新
 */
function updateProgress() {
    const total = surveyData.length;
    const completed = surveyData.filter(item => item.status === 'completed').length;
    const pending = surveyData.filter(item => item.status === 'pending').length;

    const progressText = document.getElementById('matchingProgressText');
    if (progressText) {
        progressText.textContent = `確定済 ${completed}/${total}件 | 未処理 ${pending}件`;
    }
}

/**
 * 現有品調査リストの行を選択
 */
function selectSurveyRow(id) {
    currentSelectedSurveyId = id;
    const item = surveyData.find(d => d.id === id);

    if (!item) return;

    // テーブルの選択状態を更新
    document.querySelectorAll('#surveyTableBody tr').forEach(tr => {
        tr.classList.remove('selected');
    });
    document.querySelector(`#surveyTableBody tr[data-id="${id}"]`)?.classList.add('selected');

    // 詳細パネルを表示
    showDetailPanel(item);
}

/**
 * 詳細パネルを表示
 */
function showDetailPanel(item) {
    const panel = document.getElementById('detailPanel');
    if (!panel) return;

    // データを設定
    document.getElementById('detailSealNo').textContent = item.sealNo;
    document.getElementById('detailAssetNo').textContent = item.assetNo || '-';
    document.getElementById('detailDepartment').textContent = item.department;
    document.getElementById('detailItem').textContent = item.item;
    document.getElementById('detailMaker').textContent = item.maker || '-';
    document.getElementById('detailModel').textContent = item.model || '-';
    document.getElementById('detailQuantity').textContent = item.quantity;
    document.getElementById('detailPurchaseDate').textContent = item.purchaseDate || '-';

    // 紐付け先を設定
    if (item.matchedLedgerId) {
        const ledgerItem = ledgerData.find(l => l.id === item.matchedLedgerId);
        if (ledgerItem) {
            document.getElementById('linkedAssetNo').value = ledgerItem.assetNo;
        }
    } else {
        document.getElementById('linkedAssetNo').value = '';
    }

    // ステータスを設定
    if (item.matchingType) {
        const radio = document.querySelector(`input[name="matchingStatus"][value="${item.matchingType}"]`);
        if (radio) radio.checked = true;
    } else {
        document.querySelectorAll('input[name="matchingStatus"]').forEach(r => r.checked = false);
    }

    // 枝番の表示/非表示
    handleStatusChange();

    panel.classList.add('active');
}

/**
 * 詳細パネルを閉じる
 */
function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) {
        panel.classList.remove('active');
    }
    currentSelectedSurveyId = null;

    // 選択状態をクリア
    document.querySelectorAll('#surveyTableBody tr').forEach(tr => {
        tr.classList.remove('selected');
    });
}

/**
 * ステータス変更時の処理
 */
function handleStatusChange() {
    const selectedStatus = document.querySelector('input[name="matchingStatus"]:checked');
    const branchSection = document.getElementById('branchNumberSection');

    if (branchSection) {
        // A2の場合のみ枝番入力を表示
        if (selectedStatus && selectedStatus.value === 'A2') {
            branchSection.style.display = 'block';
        } else {
            branchSection.style.display = 'none';
        }
    }
}

/**
 * 資産台帳から選択モーダルを開く
 */
function selectFromLedger() {
    const modal = document.getElementById('ledgerSelectModal');
    if (!modal) return;

    // モーダルを表示
    renderLedgerModalTable();
    modal.classList.add('active');
}

/**
 * 資産台帳選択モーダルを閉じる
 */
function closeLedgerSelectModal() {
    const modal = document.getElementById('ledgerSelectModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentSelectedLedgerId = null;
}

/**
 * 資産台帳モーダルのテーブルをレンダリング
 */
function renderLedgerModalTable() {
    const tbody = document.getElementById('ledgerModalTableBody');
    if (!tbody) return;

    // フィルタリング（現在のフィルター状態を適用）
    let filteredData = ledgerData.filter(item => {
        if (currentFilters.department && item.department !== currentFilters.department) return false;
        if (currentFilters.item && item.item !== currentFilters.item) return false;
        if (currentFilters.maker && item.maker !== currentFilters.maker) return false;
        return true;
    });

    tbody.innerHTML = '';

    filteredData.forEach(item => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', item.id);
        if (item.id === currentSelectedLedgerId) {
            tr.classList.add('selected');
        }

        tr.innerHTML = `
            <td><input type="radio" name="ledgerSelect" value="${item.id}" onchange="currentSelectedLedgerId = ${item.id}"></td>
            <td>${item.matched ? '✓済' : '未'}</td>
            <td>${item.assetNo}</td>
            <td>${item.department}</td>
            <td>${item.item}</td>
            <td>${item.maker}</td>
            <td>${item.model}</td>
            <td>${item.purchaseDate}</td>
        `;

        tr.onclick = function() {
            const radio = tr.querySelector('input[type="radio"]');
            radio.checked = true;
            currentSelectedLedgerId = item.id;

            // 選択状態を更新
            document.querySelectorAll('#ledgerModalTableBody tr').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');
        };

        tbody.appendChild(tr);
    });
}

/**
 * 資産台帳モーダルでのフィルター
 */
function filterLedgerModal() {
    const keyword = document.getElementById('ledgerSearchInput').value.toLowerCase();
    const tbody = document.getElementById('ledgerModalTableBody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(tr => {
        const text = tr.textContent.toLowerCase();
        if (text.includes(keyword)) {
            tr.style.display = '';
        } else {
            tr.style.display = 'none';
        }
    });
}

/**
 * 資産台帳選択を確定
 */
function confirmLedgerSelection() {
    if (!currentSelectedLedgerId) {
        alert('資産を選択してください');
        return;
    }

    const ledgerItem = ledgerData.find(l => l.id === currentSelectedLedgerId);
    if (ledgerItem) {
        document.getElementById('linkedAssetNo').value = ledgerItem.assetNo;
    }

    closeLedgerSelectModal();
}

/**
 * 突合を確定
 */
function confirmMatching() {
    if (!currentSelectedSurveyId) {
        alert('現有品調査リストから項目を選択してください');
        return;
    }

    const selectedStatus = document.querySelector('input[name="matchingStatus"]:checked');
    if (!selectedStatus) {
        alert('突合ステータスを選択してください');
        return;
    }

    const linkedAssetNo = document.getElementById('linkedAssetNo').value;
    if (!linkedAssetNo && selectedStatus.value !== 'D2') {
        alert('紐付け先資産番号を入力してください');
        return;
    }

    // データを更新
    const item = surveyData.find(d => d.id === currentSelectedSurveyId);
    if (item) {
        item.status = 'completed';
        item.matchingType = selectedStatus.value;
        item.assetNo = linkedAssetNo;

        // 枝番がある場合
        if (selectedStatus.value === 'A2') {
            const branchNumber = document.getElementById('branchNumber').value;
            if (branchNumber) {
                item.assetNo = `${linkedAssetNo}-${branchNumber}`;
            }
        }
    }

    // 画面を更新
    renderSurveyList();
    closeDetailPanel();

    // サブウィンドウにも通知
    if (ledgerSubWindow && !ledgerSubWindow.closed) {
        ledgerSubWindow.postMessage({ type: 'FILTER_UPDATE', filters: currentFilters }, '*');
    }

    alert('突合を確定しました');
}

/**
 * 突合を保留
 */
function pendingMatching() {
    if (!currentSelectedSurveyId) return;

    const item = surveyData.find(d => d.id === currentSelectedSurveyId);
    if (item) {
        item.status = 'review';
    }

    renderSurveyList();
    closeDetailPanel();
}

/**
 * 突合を解除
 */
function clearMatching() {
    if (!currentSelectedSurveyId) return;

    if (!confirm('突合を解除してもよろしいですか？')) return;

    const item = surveyData.find(d => d.id === currentSelectedSurveyId);
    if (item) {
        item.status = 'pending';
        item.matchingType = null;
        item.matchedLedgerId = null;
    }

    renderSurveyList();
    closeDetailPanel();
}

/**
 * フィルターを適用
 */
function applyMatchingFilters() {
    currentFilters.status = document.getElementById('filterStatus').value;
    currentFilters.department = document.getElementById('filterDepartmentMatching').value;
    currentFilters.item = document.getElementById('filterItemMatching').value;
    currentFilters.maker = document.getElementById('filterMakerMatching').value;
    currentFilters.keyword = document.getElementById('searchKeywordMatching').value;

    // 現有品調査リストを更新
    renderSurveyList();

    // サブウィンドウにフィルター状態を通知
    if (ledgerSubWindow && !ledgerSubWindow.closed) {
        ledgerSubWindow.postMessage({ type: 'FILTER_UPDATE', filters: currentFilters }, '*');
    }
}

/**
 * フィルターをリセット
 */
function resetMatchingFilters() {
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterDepartmentMatching').value = '';
    document.getElementById('filterItemMatching').value = '';
    document.getElementById('filterMakerMatching').value = '';
    document.getElementById('searchKeywordMatching').value = '';

    applyMatchingFilters();
}

/**
 * 全選択切り替え
 */
function toggleSelectAllSurvey(checkbox) {
    const checkboxes = document.querySelectorAll('.survey-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
}

/**
 * 一括確定
 */
function bulkConfirmMatching() {
    const checkedBoxes = document.querySelectorAll('.survey-checkbox:checked');
    if (checkedBoxes.length === 0) {
        alert('確定する項目を選択してください');
        return;
    }

    if (!confirm(`${checkedBoxes.length}件を一括確定しますか？`)) {
        return;
    }

    checkedBoxes.forEach(cb => {
        const id = parseInt(cb.getAttribute('data-id'));
        const item = surveyData.find(d => d.id === id);
        if (item && item.status !== 'completed') {
            item.status = 'completed';
        }
    });

    renderSurveyList();
    alert('一括確定しました');
}

/**
 * Excel出力
 */
function exportMatchingData() {
    alert('Excel出力機能は実装中です');
}

/**
 * 写真を見る
 */
function viewSurveyPhotos() {
    alert('写真表示機能は実装中です');
}

/**
 * 資産台帳を別ウィンドウで開く
 */
function openLedgerSubWindow() {
    const width = 1200;
    const height = 800;
    const left = window.screenX + window.outerWidth;
    const top = window.screenY;

    ledgerSubWindow = window.open(
        'ledger-sub-window.html',
        'LedgerSubWindow',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    // サブウィンドウが読み込まれた後、フィルター状態を送信
    if (ledgerSubWindow) {
        ledgerSubWindow.addEventListener('load', () => {
            setTimeout(() => {
                ledgerSubWindow.postMessage({ type: 'FILTER_UPDATE', filters: currentFilters }, '*');
            }, 500);
        });
    }
}

/**
 * 戻るボタン
 */
function handleBackFromDataMatching() {
    if (typeof handleBackFromOfflinePrep === 'function') {
        handleBackFromOfflinePrep();
    } else {
        document.getElementById('dataMatchingPage').classList.remove('active');
        document.getElementById('offlinePrepPage').classList.add('active');
    }
}

// グローバルに公開
window.renderSurveyList = renderSurveyList;
window.selectSurveyRow = selectSurveyRow;
window.closeDetailPanel = closeDetailPanel;
window.handleStatusChange = handleStatusChange;
window.selectFromLedger = selectFromLedger;
window.closeLedgerSelectModal = closeLedgerSelectModal;
window.filterLedgerModal = filterLedgerModal;
window.confirmLedgerSelection = confirmLedgerSelection;
window.confirmMatching = confirmMatching;
window.pendingMatching = pendingMatching;
window.clearMatching = clearMatching;
window.applyMatchingFilters = applyMatchingFilters;
window.resetMatchingFilters = resetMatchingFilters;
window.toggleSelectAllSurvey = toggleSelectAllSurvey;
window.bulkConfirmMatching = bulkConfirmMatching;
window.exportMatchingData = exportMatchingData;
window.viewSurveyPhotos = viewSurveyPhotos;
window.openLedgerSubWindow = openLedgerSubWindow;
window.handleBackFromDataMatching = handleBackFromDataMatching;
window.surveyData = surveyData;
window.ledgerData = ledgerData;
window.currentFilters = currentFilters;
