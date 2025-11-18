/**
 * 明細と申請の紐付けチェック画面のJavaScript
 */

// グローバル変数
let currentMatchingQuotationId = null;
let matchingPairs = []; // 見積明細と申請の紐付けペア
let currentEditingMatchId = null;

// 初期化
function initQuotationMatchingPage(quotationId) {
    console.log('=== Initializing Quotation Matching Page ===', quotationId);

    currentMatchingQuotationId = quotationId;

    // OCR抽出結果を取得
    const ocrDetails = window.ocrExtractedDetails || [];

    // 個体管理品目のみをフィルタ
    const individualItems = ocrDetails.filter(d => d.assetMasterMatch.isIndividual);

    // 申請一覧を取得
    const applications = window.applicationListData || [];

    // AIによる自動紐付けを実行
    generateMatchingPairs(individualItems, applications);

    // 紐付けリストをレンダリング
    renderMatchingList();

    // 進捗を更新
    updateMatchingProgress();
}

// AIによる自動紐付けを生成
function generateMatchingPairs(individualItems, applications) {
    matchingPairs = individualItems.map((item, index) => {
        // AIが申請を提案（品目名でマッチング）
        const suggestedApplication = applications.find(app =>
            app.asset.name.includes(item.itemName) || item.itemName.includes(app.asset.name)
        ) || applications[index % applications.length]; // フォールバック

        return {
            id: `MATCH-${Date.now()}-${index}`,
            quotationDetail: item,
            application: suggestedApplication,
            matchType: 'ai-suggested', // ai-suggested, manual
            confirmed: false,
            confidence: item.confidence
        };
    });

    // グローバルに保存
    window.matchingPairs = matchingPairs;
}

// 紐付けリストをレンダリング
function renderMatchingList() {
    const container = document.getElementById('matchingListContainer');

    if (matchingPairs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">個体管理品目がありません</div>
                <div class="empty-subtext">見積明細に個体管理品目が含まれていません</div>
            </div>
        `;
        return;
    }

    container.innerHTML = matchingPairs.map((pair, index) => {
        const statusBadgeClass = pair.matchType === 'ai-suggested' ? 'ai-suggested' : 'manual';
        const statusBadgeText = pair.matchType === 'ai-suggested' ? 'AI自動紐付け' : '手動設定';
        const cardClass = pair.confirmed ? 'confirmed' : 'unconfirmed';

        const confidencePercent = Math.round(pair.confidence * 100);

        return `
            <div class="matching-card ${cardClass}" id="matching-card-${pair.id}">
                <div class="matching-card-header">
                    <div>
                        <span style="font-weight: 700; color: #2c3e50; margin-right: 8px;">紐付け ${index + 1}</span>
                        <span class="matching-status-badge ${statusBadgeClass}">${statusBadgeText}</span>
                        ${pair.confirmed ? '<span class="matching-status-badge confirmed" style="margin-left: 8px;">確認済</span>' : ''}
                    </div>
                    <div class="matching-card-actions">
                        <button class="matching-action-btn" onclick="editMatching('${pair.id}')">編集</button>
                        ${!pair.confirmed ? `<button class="matching-action-btn confirm" onclick="confirmSingleMatching('${pair.id}')">確認</button>` : ''}
                    </div>
                </div>

                <div class="matching-detail">
                    <!-- 見積明細側 -->
                    <div class="quotation-side">
                        <div class="side-title">📄 見積明細（個体管理品目）</div>
                        <div class="item-info">
                            <div class="item-name">${pair.quotationDetail.itemName}</div>
                            <div class="item-maker-model">${pair.quotationDetail.maker} / ${pair.quotationDetail.model}</div>
                            <div class="item-row">
                                <span class="item-label">数量</span>
                                <span class="item-value">${pair.quotationDetail.quantity}</span>
                            </div>
                            <div class="item-row">
                                <span class="item-label">金額</span>
                                <span class="item-value">¥${pair.quotationDetail.amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 紐付けアロー -->
                    <div class="matching-arrow">
                        <div class="arrow-icon">→</div>
                        <div class="confidence-text">${confidencePercent}%</div>
                    </div>

                    <!-- 申請側 -->
                    <div class="application-side">
                        <div class="side-title">📋 申請情報</div>
                        <div class="item-info">
                            <div class="item-name">${pair.application.asset.name}</div>
                            <div class="item-maker-model">申請No: ${pair.application.applicationNo}</div>
                            <div class="item-row">
                                <span class="item-label">数量</span>
                                <span class="item-value">${pair.application.quantity}</span>
                            </div>
                            <div class="item-row">
                                <span class="item-label">設置先</span>
                                <span class="item-value">${pair.application.facility.building} ${pair.application.facility.floor || ''}</span>
                            </div>
                            <div class="item-row">
                                <span class="item-label">実施年度</span>
                                <span class="item-value">${pair.application.executionYear}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="matching-confirmation">
                    <input type="checkbox" id="confirm-${pair.id}" ${pair.confirmed ? 'checked' : ''} onchange="toggleConfirmMatching('${pair.id}')">
                    <label for="confirm-${pair.id}">この紐付けを確認しました</label>
                </div>
            </div>
        `;
    }).join('');
}

// 単一の紐付けを確認
function confirmSingleMatching(matchId) {
    const pair = matchingPairs.find(p => p.id === matchId);
    if (!pair) return;

    pair.confirmed = true;
    renderMatchingList();
    updateMatchingProgress();
}

// 確認チェックボックスのトグル
function toggleConfirmMatching(matchId) {
    const pair = matchingPairs.find(p => p.id === matchId);
    if (!pair) return;

    const checkbox = document.getElementById(`confirm-${matchId}`);
    pair.confirmed = checkbox.checked;

    renderMatchingList();
    updateMatchingProgress();
}

// 進捗を更新
function updateMatchingProgress() {
    const totalCount = matchingPairs.length;
    const confirmedCount = matchingPairs.filter(p => p.confirmed).length;

    const progressElement = document.getElementById('matchingProgressCount');
    if (progressElement) {
        progressElement.textContent = `${confirmedCount}/${totalCount}件確認済`;
    }
}

// 紐付けを編集
function editMatching(matchId) {
    const pair = matchingPairs.find(p => p.id === matchId);
    if (!pair) return;

    currentEditingMatchId = matchId;

    // 編集モーダルの内容を生成
    const content = document.getElementById('matchingEditContent');
    const applications = window.applicationListData || [];

    content.innerHTML = `
        <div class="modal-edit-grid">
            <div class="edit-section">
                <div class="edit-section-title">📄 見積明細</div>
                <div class="item-info">
                    <div class="item-name">${pair.quotationDetail.itemName}</div>
                    <div class="item-maker-model">${pair.quotationDetail.maker} / ${pair.quotationDetail.model}</div>
                    <div class="item-row">
                        <span class="item-label">数量</span>
                        <span class="item-value">${pair.quotationDetail.quantity}</span>
                    </div>
                    <div class="item-row">
                        <span class="item-label">金額</span>
                        <span class="item-value">¥${pair.quotationDetail.amount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div class="edit-section">
                <div class="edit-section-title">📋 紐付ける申請を選択</div>
                <div class="application-select-list">
                    ${applications.map(app => {
                        const isSelected = pair.application.id === app.id;
                        return `
                            <div class="application-select-item ${isSelected ? 'selected' : ''}" onclick="selectApplicationForMatching('${app.id}')">
                                <div class="application-select-item-header">
                                    ${app.applicationNo} - ${app.asset.name}
                                </div>
                                <div class="application-select-item-details">
                                    数量: ${app.quantity} | 設置先: ${app.facility.building} ${app.facility.floor || ''} | 実施年度: ${app.executionYear}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    document.getElementById('matchingEditModal').classList.add('active');
}

// 申請を選択
function selectApplicationForMatching(applicationId) {
    // すべての選択状態をリセット
    document.querySelectorAll('.application-select-item').forEach(item => {
        item.classList.remove('selected');
    });

    // クリックされた項目を選択状態に
    event.currentTarget.classList.add('selected');

    // 一時的に保存
    window.tempSelectedApplicationId = applicationId;
}

// 紐付け編集を保存
function saveMatchingEdit() {
    if (!currentEditingMatchId) return;

    const pair = matchingPairs.find(p => p.id === currentEditingMatchId);
    if (!pair) return;

    const selectedApplicationId = window.tempSelectedApplicationId;
    if (!selectedApplicationId) {
        alert('申請を選択してください');
        return;
    }

    const application = window.applicationListData.find(app => app.id === selectedApplicationId);
    if (!application) return;

    // 紐付けを更新
    pair.application = application;
    pair.matchType = 'manual';
    pair.confirmed = false; // 再確認が必要

    closeMatchingEditModal();
    renderMatchingList();
    updateMatchingProgress();

    alert('紐付けを変更しました。内容を確認してチェックしてください。');
}

// 編集モーダルを閉じる
function closeMatchingEditModal() {
    document.getElementById('matchingEditModal').classList.remove('active');
    currentEditingMatchId = null;
    window.tempSelectedApplicationId = null;
}

// モーダル外クリック
function handleMatchingEditModalOutsideClick(event) {
    if (event.target.id === 'matchingEditModal') {
        closeMatchingEditModal();
    }
}

// 紐付けを確定
function confirmMatching() {
    const totalCount = matchingPairs.length;
    const confirmedCount = matchingPairs.filter(p => p.confirmed).length;

    if (confirmedCount < totalCount) {
        if (!confirm(`未確認の紐付けが${totalCount - confirmedCount}件あります。\n\nそのまま確定しますか？`)) {
            return;
        }
    }

    if (confirm(`すべての紐付けを確定します。\n\n確定後は発注書・検収書の出力画面に進みます。\nよろしいですか？`)) {
        // 紐付けデータをグローバルに保存
        window.confirmedMatchingPairs = matchingPairs;

        alert('紐付けを確定しました\n\n次の画面で発注書・検収書を出力できます');

        // 発注書・検収書出力画面へ遷移
        goToOrderTemplatePage();
    }
}

// 発注書・検収書出力画面へ遷移
function goToOrderTemplatePage() {
    document.getElementById('quotationMatchingPage').classList.remove('active');
    document.getElementById('orderTemplatePage').classList.add('active');

    if (typeof window.initOrderTemplatePage === 'function') {
        window.initOrderTemplatePage(currentMatchingQuotationId);
    }
}

// 戻るボタン
function handleBackFromMatching() {
    if (confirm('OCR結果画面に戻りますか？\n\n※紐付け内容は保持されます')) {
        document.getElementById('quotationMatchingPage').classList.remove('active');
        document.getElementById('quotationOcrResultPage').classList.add('active');
    }
}

// グローバルに公開
window.initQuotationMatchingPage = initQuotationMatchingPage;
window.confirmSingleMatching = confirmSingleMatching;
window.toggleConfirmMatching = toggleConfirmMatching;
window.editMatching = editMatching;
window.selectApplicationForMatching = selectApplicationForMatching;
window.saveMatchingEdit = saveMatchingEdit;
window.closeMatchingEditModal = closeMatchingEditModal;
window.handleMatchingEditModalOutsideClick = handleMatchingEditModalOutsideClick;
window.confirmMatching = confirmMatching;
window.handleBackFromMatching = handleBackFromMatching;
