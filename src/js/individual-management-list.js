/**
 * 個体管理リスト原本画面のJavaScript
 */

// グローバル変数
let individualManagementList = [];
let filteredIndividualList = [];

// QRコード採番カウンター（実際はサーバー側で管理）
let qrCodeCounter = 1000;

// 初期化
function initIndividualManagementListPage() {
    console.log('=== Initializing Individual Management List Page ===');

    // サンプルデータ
    if (!window.individualManagementList || window.individualManagementList.length === 0) {
        window.individualManagementList = getSampleIndividualData();
    }

    individualManagementList = [...window.individualManagementList];
    filteredIndividualList = [...individualManagementList];

    renderIndividualTable();
    updateIndividualCount();
}

// サンプルデータ
function getSampleIndividualData() {
    return [
        {
            id: 1,
            qrCode: 'QR-2024-0001',
            assetName: '超音波診断装置',
            model: 'ProSound Alpha 7',
            location: {
                building: '本館',
                floor: '2F',
                department: '手術部門',
                section: '手術'
            },
            registrationDate: '2024-01-15',
            applicationNo: 'REQ-2024-0100',
            applicationType: '新規購入申請',
            status: '使用中',
            vendor: 'メディカルサプライ株式会社',
            serialNumber: 'SN-12345678',
            acquisitionCost: 15000000,
            documents: [
                {
                    type: '契約書',
                    filename: '超音波診断装置_契約書_2024-01-10.pdf',
                    uploadDate: '2024-01-15',
                    size: 2456789
                },
                {
                    type: '納品書',
                    filename: '超音波診断装置_納品書_2024-01-15.pdf',
                    uploadDate: '2024-01-15',
                    size: 1234567
                },
                {
                    type: '保証書',
                    filename: '超音波診断装置_保証書.pdf',
                    uploadDate: '2024-01-15',
                    size: 987654
                }
            ]
        },
        {
            id: 2,
            qrCode: 'QR-2024-0002',
            assetName: '電気手術用電源装置',
            model: 'EW11',
            location: {
                building: '本館',
                floor: '2F',
                department: '手術部門',
                section: '手術'
            },
            registrationDate: '2024-02-20',
            applicationNo: 'REQ-2024-0105',
            applicationType: '新規購入申請',
            status: '使用中',
            vendor: '◯◯メディカル 東京支店',
            serialNumber: 'SN-87654321',
            acquisitionCost: 8500000
        }
    ];
}

// テーブル描画
function renderIndividualTable() {
    const tbody = document.getElementById('individualTableBody');

    if (!tbody) {
        console.error('individualTableBody not found');
        return;
    }

    if (filteredIndividualList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">個体データがありません</td></tr>';
        return;
    }

    tbody.innerHTML = filteredIndividualList.map(item => createIndividualTableRow(item)).join('');
}

// テーブル行を生成
function createIndividualTableRow(item) {
    const locationText = `${item.location.building} ${item.location.floor} ${item.location.department} ${item.location.section}`;
    const statusBadge = getIndividualStatusBadge(item.status);

    return `
        <tr>
            <td><strong class="qr-code-text">${item.qrCode}</strong></td>
            <td>${item.assetName}</td>
            <td>${item.model || '-'}</td>
            <td>${locationText}</td>
            <td>${item.registrationDate}</td>
            <td><span class="application-no-link" onclick="viewApplicationFromIndividual('${item.applicationNo}')">${item.applicationNo}</span></td>
            <td>${statusBadge}</td>
            <td>
                <div class="individual-actions">
                    <button class="table-btn primary" onclick="viewIndividualDetail('${item.id}')">詳細</button>
                </div>
            </td>
        </tr>
    `;
}

// ステータスバッジ取得
function getIndividualStatusBadge(status) {
    const statusMap = {
        '使用中': { class: 'status-active', text: '使用中' },
        '廃棄済': { class: 'status-disposed', text: '廃棄済' }
    };

    const badge = statusMap[status] || { class: 'status-active', text: status };
    return `<span class="status-badge ${badge.class}">${badge.text}</span>`;
}

// QRコードを生成
function generateQRCode() {
    const year = new Date().getFullYear();
    const code = `QR-${year}-${String(qrCodeCounter).padStart(4, '0')}`;
    qrCodeCounter++;
    return code;
}

// QRコードをプレビュー（カウンターを増やさない）
function previewQRCodes(quantity) {
    const year = new Date().getFullYear();
    const codes = [];
    for (let i = 0; i < quantity; i++) {
        codes.push(`QR-${year}-${String(qrCodeCounter + i).padStart(4, '0')}`);
    }
    return codes;
}

// 申請から個体を登録（モーダルを開く）
function registerIndividualFromApplication(applicationId) {
    const application = window.applicationListData.find(app => app.id === applicationId);

    if (!application) {
        alert('申請データが見つかりません');
        return;
    }

    if (application.status !== '承認済') {
        alert('承認済みの申請のみ個体登録できます');
        return;
    }

    // モーダルに申請情報を表示
    showIndividualRegistrationModal(application);
}

// 新規個体を登録
function registerNewIndividual(application, documents = []) {
    const quantity = parseInt(application.quantity) || 1;
    const newIndividuals = [];

    for (let i = 0; i < quantity; i++) {
        const qrCode = generateQRCode();
        const newIndividual = {
            id: Date.now() + i,
            qrCode: qrCode,
            assetName: application.asset.name,
            model: application.asset.model,
            location: application.facility,
            registrationDate: new Date().toISOString().split('T')[0],
            applicationNo: application.applicationNo,
            applicationType: application.applicationType,
            status: '使用中',
            vendor: application.vendor,
            serialNumber: `SN-${Date.now()}-${i}`,
            acquisitionCost: application.quotationInfo?.[0]?.unitPrice || 0,
            documents: documents // ドキュメントを追加
        };

        newIndividuals.push(newIndividual);
        individualManagementList.push(newIndividual);
    }

    window.individualManagementList = individualManagementList;

    // 申請のステータスを更新
    application.individualRegistered = true;
    application.registeredQRCodes = newIndividuals.map(ind => ind.qrCode);

    // 表示を更新
    filteredIndividualList = [...individualManagementList];
    renderIndividualTable();
    updateIndividualCount();

    return newIndividuals;
}

// 更新（旧個体廃棄→新個体登録）
function updateIndividual(application, documents = []) {
    // TODO: 実際は旧個体を特定する画面が必要
    // ここでは仮実装として、最初にマッチする個体を廃棄とする
    const oldIndividual = individualManagementList.find(ind =>
        ind.assetName === application.asset.name && ind.status === '使用中'
    );

    if (oldIndividual) {
        oldIndividual.status = '廃棄済';
        oldIndividual.disposalDate = new Date().toISOString().split('T')[0];
        oldIndividual.disposalApplicationNo = application.applicationNo;
    }

    // 新個体を登録
    return registerNewIndividual(application, documents);
}

// 個体を廃棄
function disposeIndividual(application, documents = []) {
    // TODO: 実際は廃棄対象個体を特定する画面が必要
    // ここでは仮実装として、マッチする個体を廃棄とする
    const targetIndividuals = individualManagementList.filter(ind =>
        ind.assetName === application.asset.name && ind.status === '使用中'
    );

    if (targetIndividuals.length === 0) {
        alert('廃棄対象の個体が見つかりません');
        return null;
    }

    const quantity = parseInt(application.quantity) || 1;
    const disposedQRCodes = [];

    for (let i = 0; i < Math.min(quantity, targetIndividuals.length); i++) {
        targetIndividuals[i].status = '廃棄済';
        targetIndividuals[i].disposalDate = new Date().toISOString().split('T')[0];
        targetIndividuals[i].disposalApplicationNo = application.applicationNo;
        // 廃棄時のドキュメントも追加
        if (documents.length > 0) {
            targetIndividuals[i].disposalDocuments = documents;
        }
        disposedQRCodes.push(targetIndividuals[i].qrCode);
    }

    window.individualManagementList = individualManagementList;

    // 申請のステータスを更新
    application.individualRegistered = true;
    application.disposedQRCodes = disposedQRCodes;

    // 表示を更新
    filteredIndividualList = [...individualManagementList];
    renderIndividualTable();
    updateIndividualCount();

    return targetIndividuals.slice(0, Math.min(quantity, targetIndividuals.length));
}

// フィルター適用
function applyIndividualFilter() {
    const qrCode = document.getElementById('filterQrCode').value.toLowerCase();
    const assetName = document.getElementById('filterAssetName').value.toLowerCase();
    const location = document.getElementById('filterLocation').value.toLowerCase();
    const status = document.getElementById('filterStatus').value;

    filteredIndividualList = individualManagementList.filter(item => {
        const matchQrCode = !qrCode || item.qrCode.toLowerCase().includes(qrCode);
        const matchAssetName = !assetName || item.assetName.toLowerCase().includes(assetName);
        const matchLocation = !location ||
            `${item.location.building} ${item.location.floor} ${item.location.department} ${item.location.section}`
            .toLowerCase().includes(location);
        const matchStatus = !status || item.status === status;

        return matchQrCode && matchAssetName && matchLocation && matchStatus;
    });

    renderIndividualTable();
    updateIndividualCount();
}

// フィルタークリア
function clearIndividualFilter() {
    document.getElementById('filterQrCode').value = '';
    document.getElementById('filterAssetName').value = '';
    document.getElementById('filterLocation').value = '';
    document.getElementById('filterStatus').value = '';

    filteredIndividualList = [...individualManagementList];
    renderIndividualTable();
    updateIndividualCount();
}

// 件数更新
function updateIndividualCount() {
    const countElem = document.getElementById('individualCount');
    if (countElem) {
        countElem.textContent = `${filteredIndividualList.length}件`;
    }
}

// 個体詳細を表示
function viewIndividualDetail(individualId) {
    const individual = individualManagementList.find(ind => ind.id == individualId);

    if (!individual) {
        alert('個体データが見つかりません');
        return;
    }

    const locationText = `${individual.location.building} ${individual.location.floor} ${individual.location.department} ${individual.location.section}`;

    const content = `
        <div class="detail-section">
            <div class="detail-section-title">基本情報</div>
            <div class="detail-row">
                <span class="label">QRコード:</span>
                <span class="value"><strong>${individual.qrCode}</strong></span>
            </div>
            <div class="detail-row">
                <span class="label">資産名称:</span>
                <span class="value">${individual.assetName}</span>
            </div>
            <div class="detail-row">
                <span class="label">型式:</span>
                <span class="value">${individual.model || '-'}</span>
            </div>
            <div class="detail-row">
                <span class="label">製造番号:</span>
                <span class="value">${individual.serialNumber || '-'}</span>
            </div>
            <div class="detail-row">
                <span class="label">ステータス:</span>
                <span class="value">${getIndividualStatusBadge(individual.status)}</span>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">設置情報</div>
            <div class="detail-row">
                <span class="label">設置場所:</span>
                <span class="value">${locationText}</span>
            </div>
        </div>

        <div class="detail-section">
            <div class="detail-section-title">申請・登録情報</div>
            <div class="detail-row">
                <span class="label">申請番号:</span>
                <span class="value">${individual.applicationNo}</span>
            </div>
            <div class="detail-row">
                <span class="label">申請種別:</span>
                <span class="value">${individual.applicationType}</span>
            </div>
            <div class="detail-row">
                <span class="label">登録日:</span>
                <span class="value">${individual.registrationDate}</span>
            </div>
            <div class="detail-row">
                <span class="label">購入先:</span>
                <span class="value">${individual.vendor || '-'}</span>
            </div>
            <div class="detail-row">
                <span class="label">取得価格:</span>
                <span class="value">¥${(individual.acquisitionCost || 0).toLocaleString()}</span>
            </div>
            ${individual.status === '廃棄済' ? `
            <div class="detail-row">
                <span class="label">廃棄日:</span>
                <span class="value">${individual.disposalDate || '-'}</span>
            </div>
            <div class="detail-row">
                <span class="label">廃棄申請番号:</span>
                <span class="value">${individual.disposalApplicationNo || '-'}</span>
            </div>
            ` : ''}
        </div>

        ${(individual.documents && individual.documents.length > 0) || (individual.disposalDocuments && individual.disposalDocuments.length > 0) ? `
        <div class="detail-section">
            <div class="detail-section-title">📎 関連ドキュメント</div>
            ${individual.documents && individual.documents.length > 0 ? `
                <div style="margin-bottom: 12px;">
                    <strong style="font-size: 13px; color: #2c3e50;">登録時のドキュメント:</strong>
                    <div class="document-list">
                        ${individual.documents.map((doc, index) => `
                            <div class="document-item">
                                <span class="document-icon">📄</span>
                                <div class="document-info">
                                    <div class="document-type">${doc.type}</div>
                                    <div class="document-filename">${doc.filename}</div>
                                    <div class="document-date">アップロード日: ${doc.uploadDate}</div>
                                </div>
                                <button class="document-download-btn" onclick="downloadDocument('${doc.filename}')">ダウンロード</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${individual.disposalDocuments && individual.disposalDocuments.length > 0 ? `
                <div>
                    <strong style="font-size: 13px; color: #2c3e50;">廃棄時のドキュメント:</strong>
                    <div class="document-list">
                        ${individual.disposalDocuments.map((doc, index) => `
                            <div class="document-item">
                                <span class="document-icon">📄</span>
                                <div class="document-info">
                                    <div class="document-type">${doc.type}</div>
                                    <div class="document-filename">${doc.filename}</div>
                                    <div class="document-date">アップロード日: ${doc.uploadDate}</div>
                                </div>
                                <button class="document-download-btn" onclick="downloadDocument('${doc.filename}')">ダウンロード</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
        ` : ''}
    `;

    document.getElementById('individualDetailContent').innerHTML = content;
    document.getElementById('individualDetailModal').classList.add('active');
}

// 個体詳細モーダルを閉じる
function closeIndividualDetailModal() {
    document.getElementById('individualDetailModal').classList.remove('active');
}

// モーダル外クリック
function handleIndividualDetailModalOutsideClick(event) {
    if (event.target.id === 'individualDetailModal') {
        closeIndividualDetailModal();
    }
}

// 申請番号から申請詳細を表示
function viewApplicationFromIndividual(applicationNo) {
    alert(`申請詳細を表示: ${applicationNo}\n（申請一覧画面に遷移する実装を追加予定）`);
}

// Excel出力
function exportIndividualList() {
    alert('個体管理リストをExcel形式で出力します（実装予定）');
}

// 戻るボタン
function handleBackFromIndividualList() {
    document.getElementById('individualManagementListPage').classList.remove('active');
    document.getElementById('applicationListPage').classList.add('active');
}

// 個体管理リスト画面へ遷移
function goToIndividualManagementList() {
    if (window.PageNavigationHelper) {
        window.PageNavigationHelper.showPage('individualManagementListPage', window.initIndividualManagementListPage);
    } else {
        // フォールバック
        document.querySelectorAll('.application-list-page, .quotation-databox-page, .search-result-page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById('individualManagementListPage').classList.add('active');
        if (typeof window.initIndividualManagementListPage === 'function') {
            window.initIndividualManagementListPage();
        }
    }
}

// 個体登録モーダルを表示
let currentRegistrationApplication = null;

function showIndividualRegistrationModal(application) {
    currentRegistrationApplication = application;

    const applicationType = application.applicationType;
    const quantity = parseInt(application.quantity) || 1;
    let actionDescription = '';
    let qrCodeHtml = '';

    // QRコードが必要な申請種別の場合
    if (applicationType === '新規購入申請' || applicationType === '増設申請' || applicationType === '更新購入申請') {
        const qrCodes = previewQRCodes(quantity);

        if (applicationType === '新規購入申請' || applicationType === '増設申請') {
            actionDescription = 'QRコードを採番して個体管理リストに登録します。';
        } else if (applicationType === '更新購入申請') {
            actionDescription = '旧個体を廃棄し、新個体のQRコードを採番して登録します。';
        }

        if (quantity === 1) {
            qrCodeHtml = `
                <div class="info-row qr-code-preview">
                    <span class="info-label">採番QRコード:</span>
                    <span class="info-value qr-code-value"><strong>${qrCodes[0]}</strong></span>
                </div>
            `;
        } else {
            qrCodeHtml = `
                <div class="info-row qr-code-preview">
                    <span class="info-label">採番QRコード:</span>
                    <span class="info-value qr-code-value">
                        <strong>${qrCodes[0]} ~ ${qrCodes[qrCodes.length - 1]}</strong>
                        <small style="display: block; margin-top: 4px; color: #666;">(${quantity}個)</small>
                    </span>
                </div>
            `;
        }
    } else if (applicationType === '廃棄申請') {
        actionDescription = '該当個体を廃棄済みとして登録します。';
    }

    const infoHtml = `
        <div class="registration-info-card">
            <div class="info-row">
                <span class="info-label">申請番号:</span>
                <span class="info-value"><strong>${application.applicationNo}</strong></span>
            </div>
            <div class="info-row">
                <span class="info-label">申請種別:</span>
                <span class="info-value">${applicationType}</span>
            </div>
            <div class="info-row">
                <span class="info-label">資産名称:</span>
                <span class="info-value">${application.asset.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">型式:</span>
                <span class="info-value">${application.asset.model}</span>
            </div>
            <div class="info-row">
                <span class="info-label">数量:</span>
                <span class="info-value">${application.quantity}</span>
            </div>
            ${qrCodeHtml}
            <div class="info-description">
                ${actionDescription}
            </div>
        </div>
    `;

    document.getElementById('registrationInfo').innerHTML = infoHtml;

    // ドキュメントリストをリセット
    const uploadList = document.getElementById('documentUploadList');
    uploadList.innerHTML = `
        <div class="document-upload-item">
            <select class="document-type-select">
                <option value="">種別を選択</option>
                <option value="契約書">契約書</option>
                <option value="納品書">納品書</option>
                <option value="検収書">検収書</option>
                <option value="保証書">保証書</option>
                <option value="取扱説明書">取扱説明書</option>
                <option value="その他">その他</option>
            </select>
            <input type="file" class="document-file-input" accept=".pdf,.jpg,.jpeg,.png">
            <button type="button" class="document-remove-btn" onclick="removeDocumentUpload(this)" style="display: none;">削除</button>
        </div>
    `;

    document.getElementById('individualRegistrationModal').classList.add('active');
}

// 個体登録モーダルを閉じる
function closeIndividualRegistrationModal() {
    document.getElementById('individualRegistrationModal').classList.remove('active');
    document.getElementById('individualRegistrationForm').reset();
    currentRegistrationApplication = null;
}

// モーダル外クリック
function handleRegistrationModalOutsideClick(event) {
    if (event.target.id === 'individualRegistrationModal') {
        closeIndividualRegistrationModal();
    }
}

// ドキュメントアップロード欄を追加
function addDocumentUpload() {
    const uploadList = document.getElementById('documentUploadList');
    const newItem = document.createElement('div');
    newItem.className = 'document-upload-item';
    newItem.innerHTML = `
        <select class="document-type-select">
            <option value="">種別を選択</option>
            <option value="契約書">契約書</option>
            <option value="納品書">納品書</option>
            <option value="検収書">検収書</option>
            <option value="保証書">保証書</option>
            <option value="取扱説明書">取扱説明書</option>
            <option value="その他">その他</option>
        </select>
        <input type="file" class="document-file-input" accept=".pdf,.jpg,.jpeg,.png">
        <button type="button" class="document-remove-btn" onclick="removeDocumentUpload(this)">削除</button>
    `;
    uploadList.appendChild(newItem);
}

// ドキュメントアップロード欄を削除
function removeDocumentUpload(button) {
    button.closest('.document-upload-item').remove();
}

// 個体登録フォーム送信
function handleIndividualRegistrationSubmit(event) {
    event.preventDefault();

    if (!currentRegistrationApplication) {
        alert('申請データが見つかりません');
        return;
    }

    // ドキュメントを収集
    const documents = [];
    const uploadItems = document.querySelectorAll('.document-upload-item');
    uploadItems.forEach(item => {
        const typeSelect = item.querySelector('.document-type-select');
        const fileInput = item.querySelector('.document-file-input');

        if (typeSelect.value && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            documents.push({
                type: typeSelect.value,
                filename: file.name,
                uploadDate: new Date().toISOString().split('T')[0],
                size: file.size
            });
        }
    });

    const applicationType = currentRegistrationApplication.applicationType;
    let result;

    // 申請タイプに応じた処理
    if (applicationType === '新規購入申請' || applicationType === '増設申請') {
        result = registerNewIndividual(currentRegistrationApplication, documents);
        alert(`${result.length}件の個体を登録しました\n\nQRコード:\n${result.map(ind => ind.qrCode).join('\n')}`);
    } else if (applicationType === '更新購入申請') {
        result = updateIndividual(currentRegistrationApplication, documents);
        alert(`更新完了\n\n新QRコード:\n${result.map(ind => ind.qrCode).join('\n')}`);
    } else if (applicationType === '廃棄申請') {
        result = disposeIndividual(currentRegistrationApplication, documents);
        if (result) {
            alert(`${result.length}件の個体を廃棄しました\n\nQRコード:\n${result.map(ind => ind.qrCode).join('\n')}`);
        }
    }

    // 申請一覧の表示を更新
    if (typeof window.renderApplicationTable === 'function') {
        window.renderApplicationTable();
    }

    // モーダルを閉じる
    closeIndividualRegistrationModal();
}

// ドキュメントダウンロード（モック）
function downloadDocument(filename) {
    alert(`ドキュメントをダウンロードします: ${filename}\n（実装予定）`);
}

// グローバルに公開
window.individualManagementList = individualManagementList;
window.initIndividualManagementListPage = initIndividualManagementListPage;
window.registerIndividualFromApplication = registerIndividualFromApplication;
window.viewIndividualDetail = viewIndividualDetail;
window.closeIndividualDetailModal = closeIndividualDetailModal;
window.handleIndividualDetailModalOutsideClick = handleIndividualDetailModalOutsideClick;
window.viewApplicationFromIndividual = viewApplicationFromIndividual;
window.applyIndividualFilter = applyIndividualFilter;
window.clearIndividualFilter = clearIndividualFilter;
window.exportIndividualList = exportIndividualList;
window.handleBackFromIndividualList = handleBackFromIndividualList;
window.goToIndividualManagementList = goToIndividualManagementList;
window.showIndividualRegistrationModal = showIndividualRegistrationModal;
window.closeIndividualRegistrationModal = closeIndividualRegistrationModal;
window.handleRegistrationModalOutsideClick = handleRegistrationModalOutsideClick;
window.addDocumentUpload = addDocumentUpload;
window.removeDocumentUpload = removeDocumentUpload;
window.handleIndividualRegistrationSubmit = handleIndividualRegistrationSubmit;
window.downloadDocument = downloadDocument;
