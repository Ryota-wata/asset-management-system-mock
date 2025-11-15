/**
 * 初期化・イベントリスナー
 * Choices.jsの初期化、DOMイベントリスナーの設定などを行います。
 */

/**
 * Choices.jsの初期化を行う関数
 * マスタデータからプルダウンを生成します
 */
async function initChoices() {
    // 施設情報のドロップダウン（マスタデータから取得）
    if (document.getElementById('facilityNameSelect')) {
        window.facilityNameChoice = await initFacilityNameSelect('facilityNameSelect');
    }

    if (document.getElementById('departmentSelect')) {
        window.departmentChoice = await initDepartmentSelect('departmentSelect');
    }

    if (document.getElementById('sectionSelect')) {
        window.sectionChoice = await initSectionSelect('sectionSelect');
    }

    // 資産情報のドロップダウン（マスタデータから取得）
    if (document.getElementById('largeClassSelect')) {
        window.largeClassChoice = await initLargeClassSelect('largeClassSelect');
    }

    if (document.getElementById('mediumClassSelect')) {
        window.mediumClassChoice = await initMediumClassSelect('mediumClassSelect');
    }

    if (document.getElementById('itemSelect')) {
        window.itemChoice = await initItemSelect('itemSelect');
    }

    // 連動プルダウンの設定
    await setupFacilityCascade();
    await setupAssetClassCascade();

    // 個体管理リストモーダル内の施設検索（マスタデータから取得）
    if (document.getElementById('facilitySearchSelect')) {
        window.facilitySearchChoice = await initFacilitySearchSelect('facilitySearchSelect');
    }

    // 登録内容修正画面のフィルター
    // 注意: filterBuilding, filterFloor, filterDepartment, filterSection, filterCategory, filterLargeClass, filterMediumClass
    // これらのIDは資産検索結果画面で使用されているため、init.jsでは初期化しない
    // 資産検索結果画面は独自の初期化処理（search-result-simple.js）を使用

    // 現有資産調査統合画面の分類情報プルダウン
    if (document.getElementById('integratedLargeClassSelect')) {
        window.integratedLargeClassChoice = await initLargeClassSelect('integratedLargeClassSelect');
    }

    if (document.getElementById('integratedMediumClassSelect')) {
        window.integratedMediumClassChoice = await initMediumClassSelect('integratedMediumClassSelect');
    }

    if (document.getElementById('integratedItemSelect')) {
        window.integratedItemChoice = await initItemSelect('integratedItemSelect');
    }

    if (document.getElementById('integratedMakerSelect')) {
        window.integratedMakerChoice = await initManufacturerSelect('integratedMakerSelect');
    }

    if (document.getElementById('integratedModelSelect')) {
        window.integratedModelChoice = await initModelSelect('integratedModelSelect');
    }

    // 現有資産調査画面のドロップダウン初期化（共通ヘルパー使用）
    const surveyFields = [
        { id: 'surveyCategorySelect', varName: 'surveyCategoryChoice' },
        { id: 'surveyBuildingSelect', varName: 'surveyBuildingChoice' },
        { id: 'surveyFloorSelect', varName: 'surveyFloorChoice' },
        { id: 'surveyDepartmentSelect', varName: 'surveyDepartmentChoice' },
        { id: 'surveySectionSelect', varName: 'surveySectionChoice' }
    ];

    if (window.ChoicesHelper) {
        surveyFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                window[field.varName] = window.ChoicesHelper.initChoicesWithFreeInput(element);
            }
        });
    }

    // Choices.js初期化後、検索画面の分類情報にマスタデータをロード
    if (typeof loadSearchMasterData === 'function') {
        await loadSearchMasterData();
    }

    // 資産情報入力画面の分類情報ドロップダウン初期化（共通ヘルパー使用）
    const assetFields = [
        { id: 'assetLargeClassSelect', varName: 'assetLargeClassChoice' },
        { id: 'assetMediumClassSelect', varName: 'assetMediumClassChoice' },
        { id: 'assetItemSelect', varName: 'assetItemChoice' },
        { id: 'assetMakerSelect', varName: 'assetMakerChoice' },
        { id: 'assetModelSelect', varName: 'assetModelChoice' }
    ];

    if (window.ChoicesHelper) {
        assetFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                window[field.varName] = window.ChoicesHelper.initChoicesWithFreeInput(element);
            }
        });
    }

    // 資産情報入力画面のマスタデータをロード
    if (typeof loadAssetInfoMasterData === 'function') {
        loadAssetInfoMasterData();
    }
}

/**
 * Escキーでモーダルを閉じる
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const listModal = document.getElementById('listModal');
        if (listModal && listModal.classList.contains('show')) {
            closeListModal();
        }
        const masterModal = document.getElementById('masterModal');
        if (masterModal && masterModal.classList.contains('show')) {
            closeMasterModal();
        }
    }
});

/**
 * モバイル用カラム選択モーダルの外クリックで閉じる
 */
window.onclick = function(event) {
    const mobileModal = document.getElementById('mobileColumnModal');
    if (event.target == mobileModal) {
        mobileModal.style.display = 'none';
    }
}

/**
 * 保存済み検索条件の読み込み
 */
document.addEventListener('DOMContentLoaded', function() {
    const loadBtn = document.querySelector('.load-btn');
    if (loadBtn) {
        loadBtn.addEventListener('click', function() {
            const select = document.querySelector('.condition-select');
            if (select && select.value) {
                alert('検索条件 "' + select.options[select.selectedIndex].text + '" を読み込みました');
            }
        });
    }

    // 検索条件の保存
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const input = document.querySelector('.save-input');
            if (input && input.value) {
                alert('検索条件 "' + input.value + '" を保存しました');
                const option = document.createElement('option');
                option.value = Date.now();
                option.text = input.value;
                const conditionSelect = document.querySelector('.condition-select');
                if (conditionSelect) {
                    conditionSelect.appendChild(option);
                }
                input.value = '';
            } else {
                alert('検索条件名を入力してください');
            }
        });
    }
});

/**
 * QRコード管理画面のチェックボックス全選択
 */
document.addEventListener('DOMContentLoaded', function() {
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.qr-table-container tbody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = this.checked);
            if (typeof updateQRActionButtons === 'function') {
                updateQRActionButtons();
            }
        });
    }

    // 各チェックボックスにイベントリスナー
    const tableCheckboxes = document.querySelectorAll('.qr-table-container tbody input[type="checkbox"]');
    tableCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            if (typeof updateQRActionButtons === 'function') {
                updateQRActionButtons();
            }
        });
    });
});

/**
 * QRコード管理画面の詳細リンクと印刷リンクにイベントを追加
 */
document.addEventListener('DOMContentLoaded', function() {
    // 詳細リンクと印刷リンクにクリックイベントを設定
    document.addEventListener('click', function(e) {
        // 詳細リンクのクリック
        if (e.target.classList.contains('qr-action-link') && e.target.textContent === '詳細') {
            e.preventDefault();
            // 同じ行のQR番号を取得
            const row = e.target.closest('tr');
            const qrNumber = row.querySelector('.qr-number').textContent;
            if (typeof showQRDetail === 'function') {
                showQRDetail(qrNumber);
            }
        }

        // 印刷リンクのクリック
        if (e.target.classList.contains('qr-action-link') && e.target.textContent === '印刷') {
            e.preventDefault();
            // 同じ行のQR番号を取得
            const row = e.target.closest('tr');
            const qrNumber = row.querySelector('.qr-number').textContent;
            window.qrPrintFromPage = 'list';
            if (typeof showQRPrint === 'function') {
                showQRPrint([qrNumber]);
            }
        }
    });
});

/**
 * Choices.jsの初期化
 * 注意: この関数はindex.htmlから画面読み込み完了後に呼び出されます
 * DOMContentLoadedイベントでは呼び出さないでください
 */

// グローバルスコープに関数を公開
window.initChoices = initChoices;
