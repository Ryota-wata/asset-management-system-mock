/**
 * 見積処理画面のJavaScript
 */

// グローバル変数
let currentQuotation = null;
let currentStep = 1;
let ocrResults = [];
let matchingResults = [];
let linkingResults = [];

// 初期化
function initQuotationProcessingPage(quotationId) {
    console.log('=== Initializing Quotation Processing Page ===', quotationId);

    // 見積書情報を取得
    currentQuotation = window.quotationDocuments.find(q => q.id === quotationId);

    if (!currentQuotation) {
        console.error('Quotation not found:', quotationId);
        alert('見積書が見つかりません');
        handleBackFromProcessing();
        return;
    }

    // ヘッダー情報を設定
    document.getElementById('processingRfqNo').textContent = currentQuotation.rfqNo;
    document.getElementById('processingVendor').textContent = currentQuotation.vendor || '業者名未設定';
    document.getElementById('pdfFilename').textContent = currentQuotation.filename;

    // ステップをリセット
    currentStep = 1;
    goToStep(1);

    // 初回表示時にすべてのステップのサンプルデータを生成
    simulateOcrExtraction();
    performMatching();
    performLinking();

    // 処理状態に応じてステップを復元
    if (currentQuotation.processingStatus === 'OCR完了') {
        // マッチング結果を表示するためStep 2へ
        setTimeout(() => {
            goToStep(2);
        }, 100);
    } else if (currentQuotation.processingStatus === '紐付け完了') {
        // 紐付け結果を表示するためStep 3へ
        setTimeout(() => {
            goToStep(3);
        }, 100);
    }
}

// ステップ遷移
function goToStep(step) {
    // 現在のステップコンテンツを非表示
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });

    // ステップインジケーターを更新
    document.querySelectorAll('.step-item').forEach(item => {
        const stepNum = parseInt(item.dataset.step);
        item.classList.remove('active', 'completed');

        if (stepNum === step) {
            item.classList.add('active');
        } else if (stepNum < step) {
            item.classList.add('completed');
        }
    });

    // 新しいステップを表示
    document.getElementById(`step${step}Content`).classList.add('active');
    currentStep = step;

    // スクロールをトップに
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// OCR抽出開始
function startOcrExtraction() {
    const btn = document.querySelector('.ocr-start-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner">⏳</span> 抽出中...';

    // シミュレーション（実際はAPI呼び出し）
    setTimeout(() => {
        simulateOcrExtraction();
        btn.innerHTML = '<span class="btn-icon">✅</span> 抽出完了';
        document.getElementById('step1NextBtn').disabled = false;
    }, 2000);
}

// OCR抽出のシミュレーション
function simulateOcrExtraction() {
    // サンプルOCR結果を生成
    ocrResults = [
        { id: 1, itemName: '超音波診断装置 ProSound Alpha 7', quantity: 1, unitPrice: 15000000, amount: 15000000, note: '' },
        { id: 2, itemName: 'リニアプローブ UST-5713T', quantity: 2, unitPrice: 800000, amount: 1600000, note: '' },
        { id: 3, itemName: 'コンベックスプローブ UST-675P', quantity: 1, unitPrice: 900000, amount: 900000, note: '' },
        { id: 4, itemName: 'カート型ワークステーション', quantity: 1, unitPrice: 300000, amount: 300000, note: '' },
        { id: 5, itemName: '保守点検（1年間）', quantity: 1, unitPrice: 500000, amount: 500000, note: '' }
    ];

    // OCR結果テーブルを表示
    renderOcrResults();
    document.getElementById('ocrResultTable').style.display = 'block';
    document.getElementById('step1NextBtn').disabled = false;
}

// OCR結果を表示
function renderOcrResults() {
    const tbody = document.getElementById('ocrResultBody');
    tbody.innerHTML = ocrResults.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.itemName}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">¥${item.unitPrice.toLocaleString()}</td>
            <td class="text-right">¥${item.amount.toLocaleString()}</td>
            <td>${item.note}</td>
        </tr>
    `).join('');
}

// 資産マスタとの突き合わせ実行
function performMatching() {
    // 各OCR明細に対して、資産マスタから類似度の高い候補を3つ返す
    matchingResults = ocrResults.map(item => {
        const candidates = findTop3CandidatesFromAssetMaster(item.itemName);

        return {
            id: item.id,
            ocrItemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            candidates: candidates, // 候補3つ
            selectedCandidate: null, // ユーザーが選択した候補
            linkedApplication: null, // 紐付けた申請
            isConfirmed: false // 確定済みフラグ
        };
    });

    renderMatchingResults();
    updateMatchingSummary();
}

// 資産マスタから類似度の高い候補を3つ返す
function findTop3CandidatesFromAssetMaster(itemName) {
    if (!window.assetMasterData) {
        console.error('assetMasterData not found');
        return [];
    }

    // 全ての個体管理品目を取得
    const allItems = [];
    Object.keys(window.assetMasterData.items || {}).forEach(mediumId => {
        window.assetMasterData.items[mediumId].forEach(item => {
            // 大分類と中分類を逆引き
            const mediumClass = findMediumClassById(mediumId);
            const largeClass = mediumClass ? findLargeClassById(mediumClass.largeId) : null;

            allItems.push({
                itemId: item.id,
                itemName: item.name,
                mediumId: mediumId,
                mediumName: mediumClass ? mediumClass.name : '-',
                largeId: mediumClass ? mediumClass.largeId : null,
                largeName: largeClass ? largeClass.name : '-'
            });
        });
    });

    // 類似度計算（簡易版：部分一致でスコアリング）
    const scoredItems = allItems.map(item => {
        const similarity = calculateSimilarity(itemName, item.itemName);
        return {
            ...item,
            similarity: similarity
        };
    });

    // 類似度の高い順にソートして上位3つを返す
    scoredItems.sort((a, b) => b.similarity - a.similarity);
    return scoredItems.slice(0, 3);
}

// 中分類IDから中分類情報を取得
function findMediumClassById(mediumId) {
    if (!window.assetMasterData || !window.assetMasterData.mediumClasses) return null;

    for (const largeId in window.assetMasterData.mediumClasses) {
        const medium = window.assetMasterData.mediumClasses[largeId].find(m => m.id === mediumId);
        if (medium) {
            return { ...medium, largeId: largeId };
        }
    }
    return null;
}

// 大分類IDから大分類情報を取得
function findLargeClassById(largeId) {
    if (!window.assetMasterData || !window.assetMasterData.largeClasses) return null;
    return window.assetMasterData.largeClasses.find(l => l.id === largeId);
}

// 類似度計算（簡易版）
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    // 小文字化
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    // 完全一致
    if (s1 === s2) return 1.0;

    // 部分一致
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // 共通文字数による類似度
    const common = countCommonChars(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    return common / maxLen;
}

// 共通文字数をカウント
function countCommonChars(str1, str2) {
    let count = 0;
    const shorter = str1.length < str2.length ? str1 : str2;
    const longer = str1.length >= str2.length ? str1 : str2;

    for (let char of shorter) {
        if (longer.includes(char)) count++;
    }

    return count;
}

// マッチング結果を表示（テーブル形式）
function renderMatchingResults() {
    const container = document.getElementById('matchingItemsContainer');

    if (!container) {
        console.error('matchingItemsContainer not found');
        return;
    }

    container.innerHTML = `
        <table class="data-table matching-table">
            <thead>
                <tr>
                    <th style="width: 50px;">No</th>
                    <th style="width: 250px;">OCR抽出品目</th>
                    <th style="width: 80px;">数量</th>
                    <th style="width: 120px;">単価</th>
                    <th>資産マスタ候補（3つ）</th>
                    <th style="width: 250px;">申請紐付け</th>
                    <th style="width: 100px;">ステータス</th>
                    <th style="width: 100px;">操作</th>
                </tr>
            </thead>
            <tbody>
                ${matchingResults.map(item => createMatchingTableRow(item)).join('')}
            </tbody>
        </table>
    `;
}

// マッチングテーブル行を生成
function createMatchingTableRow(item) {
    // 候補のラジオボタン
    const candidatesHTML = item.candidates.map((candidate, index) => {
        const isSelected = item.selectedCandidate && item.selectedCandidate.itemId === candidate.itemId;
        const similarityPercent = Math.round(candidate.similarity * 100);
        const radioId = `candidate_${item.id}_${index}`;

        return `
            <div class="candidate-option">
                <input type="radio"
                       id="${radioId}"
                       name="candidate_${item.id}"
                       value="${index}"
                       ${isSelected ? 'checked' : ''}
                       onchange="selectCandidate(${item.id}, ${index})">
                <label for="${radioId}" class="candidate-label">
                    <span class="candidate-rank-tag">候補${index + 1}</span>
                    <span class="candidate-path-text">
                        <span class="path-large">${candidate.largeName}</span>
                        <span class="path-separator">›</span>
                        <span class="path-medium">${candidate.mediumName}</span>
                        <span class="path-separator">›</span>
                        <span class="path-item">${candidate.itemName}</span>
                    </span>
                    <span class="candidate-similarity-tag">${similarityPercent}%</span>
                </label>
            </div>
        `;
    }).join('');

    // 申請選択ボタン
    const applicationSelectHTML = item.selectedCandidate ? (
        item.linkedApplication ?
        `<div class="linked-application-display">
            <div class="linked-app-info">
                <div class="linked-app-no">${item.linkedApplication.applicationNo}</div>
                <div class="linked-app-detail">${item.linkedApplication.asset ? item.linkedApplication.asset.name : '-'}</div>
            </div>
            <button class="table-btn secondary small" onclick="openApplicationSelectModal(${item.id})">変更</button>
        </div>` :
        `<button class="table-btn primary" onclick="openApplicationSelectModal(${item.id})">申請を選択</button>`
    ) : '<span class="text-muted">候補を選択してください</span>';

    // ステータスバッジ
    const statusBadge = item.isConfirmed
        ? '<span class="status-badge confirmed">✓ 確定済み</span>'
        : '<span class="status-badge unconfirmed">未確定</span>';

    // 確定ボタン
    const confirmButton = (item.selectedCandidate && item.linkedApplication && !item.isConfirmed)
        ? `<button class="table-btn success" onclick="confirmItem(${item.id})">確定</button>`
        : (item.isConfirmed
            ? `<button class="table-btn secondary" onclick="unconfirmItem(${item.id})">解除</button>`
            : `<button class="table-btn" disabled>確定</button>`);

    return `
        <tr class="${item.isConfirmed ? 'confirmed-row' : ''}">
            <td class="text-center">${item.id}</td>
            <td><strong>${item.ocrItemName}</strong></td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">¥${item.unitPrice.toLocaleString()}</td>
            <td>
                <div class="candidates-container">
                    ${candidatesHTML}
                    <div class="manual-search-container">
                        <button class="table-btn secondary small" onclick="openManualAssetSearch(${item.id})">
                            🔎 手動検索
                        </button>
                    </div>
                </div>
            </td>
            <td>
                ${applicationSelectHTML}
            </td>
            <td class="text-center">
                ${statusBadge}
            </td>
            <td class="text-center">
                ${confirmButton}
            </td>
        </tr>
    `;
}

// アコーディオンの開閉
function toggleMatchingItem(itemId) {
    const body = document.getElementById(`matchingBody_${itemId}`);
    const item = body.closest('.matching-item');

    if (body.style.display === 'none' || body.style.display === '') {
        body.style.display = 'block';
        item.classList.add('expanded');
    } else {
        body.style.display = 'none';
        item.classList.remove('expanded');
    }
}

// 候補を選択
function selectCandidate(itemId, candidateIndex) {
    const matchingItem = matchingResults.find(r => r.id === itemId);
    if (!matchingItem) return;

    // 選択された候補を設定
    matchingItem.selectedCandidate = matchingItem.candidates[candidateIndex];

    // 再描画
    renderMatchingResults();
    updateMatchingSummary();
}

// 申請選択モーダルを開く
function openApplicationSelectModal(itemId) {
    currentSelectingItemId = itemId;

    // 申請リストを表示
    renderApplicationSelectModalTable();

    document.getElementById('modalRfqNo').textContent = currentQuotation.rfqNo;
    document.getElementById('applicationSelectModal').classList.add('active');
}

// 申請選択モーダルのテーブルを描画
function renderApplicationSelectModalTable() {
    const tbody = document.getElementById('applicationModalBody');

    if (!window.applicationListData || window.applicationListData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">申請データがありません</td></tr>';
        return;
    }

    // 見積依頼No.で絞り込み（承認済みのみ）
    const applications = window.applicationListData.filter(app =>
        app.rfqNo === currentQuotation.rfqNo && app.status === '承認済'
    );

    if (applications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">該当する申請がありません（承認済みの申請のみ表示されます）</td></tr>';
        return;
    }

    tbody.innerHTML = applications.map(app => {
        const assetInfo = app.asset ? `${app.asset.name} ${app.asset.model || ''}` : '-';
        return `
            <tr class="clickable-row" onclick="selectApplicationFromModal('${app.applicationNo}')">
                <td>
                    <button class="table-btn primary small" onclick="event.stopPropagation(); selectApplicationFromModal('${app.applicationNo}')">選択</button>
                </td>
                <td>${app.applicationNo}</td>
                <td>${app.applicationDate}</td>
                <td>${app.applicationType}</td>
                <td>${assetInfo}</td>
                <td class="text-right">${app.quantity}</td>
            </tr>
        `;
    }).join('');
}

// モーダルから申請を選択
function selectApplicationFromModal(applicationNo) {
    const matchingItem = matchingResults.find(r => r.id === currentSelectingItemId);
    if (!matchingItem) return;

    const application = window.applicationListData.find(app => app.applicationNo === applicationNo);
    if (!application) return;

    // 申請を紐付け
    matchingItem.linkedApplication = application;

    // 再描画
    renderMatchingResults();
    updateMatchingSummary();

    closeApplicationSelectModal();
}

// 確定
function confirmItem(itemId) {
    const matchingItem = matchingResults.find(r => r.id === itemId);
    if (!matchingItem) return;

    if (!matchingItem.selectedCandidate) {
        alert('資産マスタ候補を選択してください');
        return;
    }

    if (!matchingItem.linkedApplication) {
        alert('申請を選択してください');
        return;
    }

    // 確定フラグをセット
    matchingItem.isConfirmed = true;

    // 再描画
    renderMatchingResults();
    updateMatchingSummary();
}

// 確定解除
function unconfirmItem(itemId) {
    const matchingItem = matchingResults.find(r => r.id === itemId);
    if (!matchingItem) return;

    if (confirm('確定を解除しますか？')) {
        // 確定フラグを解除
        matchingItem.isConfirmed = false;

        // 再描画
        renderMatchingResults();
        updateMatchingSummary();
    }
}

// 手動で資産マスタを検索
function openManualAssetSearch(itemId) {
    currentSelectingItemId = itemId;

    // 資産マスタ選択モーダルを開く（既存のモーダルを流用）
    renderAssetMasterModalForManualSearch();
    document.getElementById('assetMasterSelectModal').classList.add('active');
}

// 手動検索用の資産マスタモーダル表示
function renderAssetMasterModalForManualSearch() {
    const tbody = document.getElementById('assetMasterModalBody');

    if (!window.assetMasterData || !window.assetMasterData.items) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">資産マスタが登録されていません</td></tr>';
        return;
    }

    // 全ての個体管理品目を一覧表示
    const allItems = [];
    Object.keys(window.assetMasterData.items).forEach(mediumId => {
        window.assetMasterData.items[mediumId].forEach(item => {
            const mediumClass = findMediumClassById(mediumId);
            const largeClass = mediumClass ? findLargeClassById(mediumClass.largeId) : null;

            allItems.push({
                itemId: item.id,
                itemName: item.name,
                itemCode: item.code || item.id,
                largeName: largeClass ? largeClass.name : '-',
                mediumName: mediumClass ? mediumClass.name : '-'
            });
        });
    });

    tbody.innerHTML = allItems.map(item => `
        <tr>
            <td><button class="table-btn primary" onclick="confirmManualAssetSelection('${item.itemId}', '${item.itemName.replace(/'/g, "\\'")}', '${item.largeName}', '${item.mediumName}')">選択</button></td>
            <td>${item.itemCode}</td>
            <td>${item.itemName}</td>
            <td>${item.largeName} › ${item.mediumName}</td>
        </tr>
    `).join('');
}

// 手動選択した資産マスタを確定
function confirmManualAssetSelection(itemId, itemName, largeName, mediumName) {
    const matchingItem = matchingResults.find(r => r.id === currentSelectingItemId);
    if (!matchingItem) return;

    // 手動選択した候補を設定
    matchingItem.selectedCandidate = {
        itemId: itemId,
        itemName: itemName,
        largeName: largeName,
        mediumName: mediumName,
        similarity: 1.0 // 手動選択なので100%
    };

    // 再描画
    renderMatchingResults();
    updateMatchingSummary();

    closeAssetMasterSelectModal();
    alert('資産マスタを選択しました');
}

// マッチングサマリーを更新
function updateMatchingSummary() {
    const total = matchingResults.length;
    const confirmed = matchingResults.filter(r => r.isConfirmed).length;
    const unconfirmed = total - confirmed;

    document.getElementById('totalItemsCount').textContent = total;
    document.getElementById('confirmedItemsCount').textContent = confirmed;
    document.getElementById('unconfirmedItemsCount').textContent = unconfirmed;
}

// 申請紐付け実行
function performLinking() {
    // マッチング結果から紐付け結果を生成
    linkingResults = matchingResults.filter(r => r.matchStatus === 'matched').map(item => {
        // 該当する申請を検索（見積依頼No.で絞り込み）
        const application = findMatchingApplication(item.assetMaster, currentQuotation.rfqNo);

        return {
            id: item.id,
            assetMaster: item.assetMaster,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            linkStatus: application ? 'linked' : 'unlinked',
            application: application
        };
    });

    renderLinkingResults();
    updateLinkingSummary();
}

// 該当する申請を検索
function findMatchingApplication(assetMaster, rfqNo) {
    if (!window.applicationRecords || window.applicationRecords.length === 0) {
        return null;
    }

    // 見積依頼No.が一致し、資産情報が類似する申請を検索
    const applications = window.applicationRecords.filter(app => app.rfqNo === rfqNo);

    if (applications.length === 0) {
        return null;
    }

    // 簡易的なマッチング（実際はより精密に）
    for (const app of applications) {
        if (app.assetName && assetMaster.itemName &&
            (app.assetName.includes(assetMaster.itemName.substring(0, 5)) ||
             assetMaster.itemName.includes(app.assetName.substring(0, 5)))) {
            return app;
        }
    }

    // 見つからない場合は最初のアプリケーションを返す（デモ用）
    return applications[0];
}

// 紐付け結果を表示
function renderLinkingResults() {
    const tbody = document.getElementById('linkingTableBody');
    tbody.innerHTML = linkingResults.map(item => {
        const statusBadge = item.linkStatus === 'linked'
            ? '<span class="link-badge linked">✓ 紐付け済み</span>'
            : '<span class="link-badge unlinked">未紐付け</span>';

        const applicationInfo = item.application
            ? `${item.application.applicationNo} - ${item.application.assetName}`
            : '<span class="text-muted">-</span>';

        const actionBtn = item.linkStatus === 'unlinked'
            ? `<button class="table-btn primary" onclick="selectApplication(${item.id})">選択</button>`
            : `<button class="table-btn secondary" onclick="selectApplication(${item.id})">変更</button>`;

        return `
            <tr>
                <td>${item.id}</td>
                <td>${item.assetMaster.itemName}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">¥${item.unitPrice.toLocaleString()}</td>
                <td>${statusBadge}</td>
                <td>${applicationInfo}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join('');
}

// 紐付けサマリーを更新
function updateLinkingSummary() {
    const total = linkingResults.length;
    const linked = linkingResults.filter(r => r.linkStatus === 'linked').length;
    const unlinked = total - linked;

    document.getElementById('totalLinkedItemsCount').textContent = total;
    document.getElementById('linkedItemsCount').textContent = linked;
    document.getElementById('unlinkedItemsCount').textContent = unlinked;
}


// 資産マスタ選択モーダルを開く
let currentSelectingItemId = null;

function selectAssetMaster(itemId) {
    currentSelectingItemId = itemId;

    // 資産マスタリストを表示
    renderAssetMasterModal();

    document.getElementById('assetMasterSelectModal').classList.add('active');
}

function closeAssetMasterSelectModal() {
    document.getElementById('assetMasterSelectModal').classList.remove('active');
    currentSelectingItemId = null;
}

function handleAssetMasterModalOutsideClick(event) {
    if (event.target.id === 'assetMasterSelectModal') {
        closeAssetMasterSelectModal();
    }
}

function renderAssetMasterModal() {
    const tbody = document.getElementById('assetMasterModalBody');

    if (!window.assetMaster || window.assetMaster.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">資産マスタが登録されていません</td></tr>';
        return;
    }

    tbody.innerHTML = window.assetMaster.map(master => `
        <tr>
            <td><button class="table-btn primary" onclick="confirmAssetMasterSelection('${master.itemCode}')">選択</button></td>
            <td>${master.itemCode}</td>
            <td>${master.itemName}</td>
            <td>${master.category || '-'}</td>
        </tr>
    `).join('');
}

function filterAssetMaster() {
    const keyword = document.getElementById('assetMasterSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#assetMasterModalBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(keyword) ? '' : 'none';
    });
}

function confirmAssetMasterSelection(itemCode) {
    const assetMaster = window.assetMaster.find(m => m.itemCode === itemCode);

    if (!assetMaster) return;

    // マッチング結果を更新
    const matchingItem = matchingResults.find(r => r.id === currentSelectingItemId);
    if (matchingItem) {
        matchingItem.assetMaster = assetMaster;
        matchingItem.matchStatus = 'matched';
        matchingItem.confidence = 1.0;

        renderMatchingResults();
        updateMatchingSummary();
    }

    closeAssetMasterSelectModal();
    alert('資産マスタを紐付けました');
}

function closeApplicationSelectModal() {
    document.getElementById('applicationSelectModal').classList.remove('active');
    currentSelectingItemId = null;
}

function handleApplicationModalOutsideClick(event) {
    if (event.target.id === 'applicationSelectModal') {
        closeApplicationSelectModal();
    }
}

// PDF プレビュー
function openPdfPreview() {
    alert('PDFプレビュー機能は実装予定です');
}

// 処理完了
function completeProcessing() {
    // 確定されていない項目があるかチェック
    const unconfirmedCount = matchingResults.filter(r => !r.isConfirmed).length;
    if (unconfirmedCount > 0) {
        if (!confirm(`未確定の項目が${unconfirmedCount}件あります。\n\nこのまま処理を完了しますか？`)) {
            return;
        }
    }

    if (confirm('見積明細の紐付けを完了しますか？\n\n処理状態が「紐付け完了」に更新され、申請情報に見積情報が追加されます。')) {
        // 確定済みの項目を申請一覧に反映
        const confirmedItems = matchingResults.filter(r => r.isConfirmed);

        confirmedItems.forEach(item => {
            if (item.linkedApplication && item.selectedCandidate) {
                // 申請データを検索
                const application = window.applicationListData.find(
                    app => app.applicationNo === item.linkedApplication.applicationNo
                );

                if (application) {
                    // 申請データに見積情報を追加
                    if (!application.quotationInfo) {
                        application.quotationInfo = [];
                    }

                    application.quotationInfo.push({
                        quotationId: currentQuotation.id,
                        quotationDate: currentQuotation.quotationDate,
                        vendor: currentQuotation.vendor,
                        ocrItemName: item.ocrItemName,
                        assetMaster: {
                            itemId: item.selectedCandidate.itemId,
                            itemName: item.selectedCandidate.itemName,
                            largeName: item.selectedCandidate.largeName,
                            mediumName: item.selectedCandidate.mediumName
                        },
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        amount: item.amount
                    });

                    console.log(`申請 ${application.applicationNo} に見積情報を追加:`, application.quotationInfo);
                }
            }
        });

        // 見積書の処理状態を更新
        currentQuotation.processingStatus = '紐付け完了';

        // グローバルデータを更新
        const index = window.quotationDocuments.findIndex(q => q.id === currentQuotation.id);
        if (index !== -1) {
            window.quotationDocuments[index] = currentQuotation;
        }

        alert(`見積明細の紐付けが完了しました。\n\n${confirmedItems.length}件の明細を申請情報に追加しました。`);
        handleBackFromProcessing();
    }
}

// 戻る
function handleBackFromProcessing() {
    document.getElementById('quotationProcessingPage').classList.remove('active');
    document.getElementById('quotationDataBoxPage').classList.add('active');

    // 見積書管理画面を再初期化
    if (typeof window.initQuotationDataBoxPage === 'function') {
        window.initQuotationDataBoxPage();
    }
}

// グローバルに公開
window.initQuotationProcessingPage = initQuotationProcessingPage;
window.goToStep = goToStep;
window.startOcrExtraction = startOcrExtraction;
window.toggleMatchingItem = toggleMatchingItem;
window.selectCandidate = selectCandidate;
window.openApplicationSelectModal = openApplicationSelectModal;
window.selectApplicationFromModal = selectApplicationFromModal;
window.confirmItem = confirmItem;
window.unconfirmItem = unconfirmItem;
window.openManualAssetSearch = openManualAssetSearch;
window.confirmManualAssetSelection = confirmManualAssetSelection;
window.selectAssetMaster = selectAssetMaster;
window.closeAssetMasterSelectModal = closeAssetMasterSelectModal;
window.handleAssetMasterModalOutsideClick = handleAssetMasterModalOutsideClick;
window.filterAssetMaster = filterAssetMaster;
window.confirmAssetMasterSelection = confirmAssetMasterSelection;
window.closeApplicationSelectModal = closeApplicationSelectModal;
window.handleApplicationModalOutsideClick = handleApplicationModalOutsideClick;
window.openPdfPreview = openPdfPreview;
window.completeProcessing = completeProcessing;
window.handleBackFromProcessing = handleBackFromProcessing;
