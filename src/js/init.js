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
    if (document.getElementById('filterBuilding')) {
        new Choices('#filterBuilding', {
            searchEnabled: true,
            searchPlaceholderValue: '棟検索',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし',
            placeholder: true,
            placeholderValue: '棟',
        });
    }

    if (document.getElementById('filterFloor')) {
        new Choices('#filterFloor', {
            searchEnabled: true,
            searchPlaceholderValue: '階検索',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし',
            placeholder: true,
            placeholderValue: '階',
        });
    }

    if (document.getElementById('filterDepartment')) {
        new Choices('#filterDepartment', {
            searchEnabled: true,
            searchPlaceholderValue: '部門検索',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし',
            placeholder: true,
            placeholderValue: '部門',
        });
    }

    if (document.getElementById('filterSection')) {
        new Choices('#filterSection', {
            searchEnabled: true,
            searchPlaceholderValue: '部署検索',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし',
            placeholder: true,
            placeholderValue: '部署',
        });
    }

    if (document.getElementById('filterCategory')) {
        new Choices('#filterCategory', {
            searchEnabled: true,
            searchPlaceholderValue: 'Category検索',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし',
            placeholder: true,
            placeholderValue: 'Category',
        });
    }

    if (document.getElementById('filterLargeClass')) {
        new Choices('#filterLargeClass', {
            searchEnabled: true,
            searchPlaceholderValue: '大分類検索',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし',
            placeholder: true,
            placeholderValue: '大分類',
        });
    }

    if (document.getElementById('filterMediumClass')) {
        new Choices('#filterMediumClass', {
            searchEnabled: true,
            searchPlaceholderValue: '中分類検索',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし',
            placeholder: true,
            placeholderValue: '中分類',
        });
    }

    // 現有資産調査画面のドロップダウン初期化
    if (document.getElementById('surveyCategorySelect')) {
        window.surveyCategoryChoice = new Choices('#surveyCategorySelect', {
            searchEnabled: true,
            searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
            noChoicesText: '選択肢がありません',
            placeholder: true,
            placeholderValue: '選択してください',
            addItems: true,
            addItemFilter: (value) => {
                // フリー入力を許可
                return value.length > 0;
            },
            removeItemButton: false,
        });
    }

    if (document.getElementById('surveyBuildingSelect')) {
        window.surveyBuildingChoice = new Choices('#surveyBuildingSelect', {
            searchEnabled: true,
            searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
            noChoicesText: '選択肢がありません',
            placeholder: true,
            placeholderValue: '選択してください',
            addItems: true,
            addItemFilter: (value) => {
                return value.length > 0;
            },
            removeItemButton: false,
        });
    }

    if (document.getElementById('surveyFloorSelect')) {
        window.surveyFloorChoice = new Choices('#surveyFloorSelect', {
            searchEnabled: true,
            searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
            noChoicesText: '選択肢がありません',
            placeholder: true,
            placeholderValue: '選択してください',
            addItems: true,
            addItemFilter: (value) => {
                return value.length > 0;
            },
            removeItemButton: false,
        });
    }

    if (document.getElementById('surveyDepartmentSelect')) {
        window.surveyDepartmentChoice = new Choices('#surveyDepartmentSelect', {
            searchEnabled: true,
            searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
            noChoicesText: '選択肢がありません',
            placeholder: true,
            placeholderValue: '選択してください',
            addItems: true,
            addItemFilter: (value) => {
                return value.length > 0;
            },
            removeItemButton: false,
        });
    }

    if (document.getElementById('surveySectionSelect')) {
        window.surveySectionChoice = new Choices('#surveySectionSelect', {
            searchEnabled: true,
            searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
            noChoicesText: '選択肢がありません',
            placeholder: true,
            placeholderValue: '選択してください',
            addItems: true,
            addItemFilter: (value) => {
                return value.length > 0;
            },
            removeItemButton: false,
        });
    }

    // Choices.js初期化後、検索画面の分類情報にマスタデータをロード
    if (typeof loadSearchMasterData === 'function') {
        loadSearchMasterData();
    }

    // 資産情報入力画面の分類情報ドロップダウン初期化（レスポンシブ統合版）
    if (document.getElementById('assetLargeClassSelect')) {
        window.assetLargeClassChoice = new Choices('#assetLargeClassSelect', {
            searchEnabled: true,
            searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
            noChoicesText: '選択肢がありません',
            placeholder: true,
            placeholderValue: '選択してください',
            addItems: true,
            addItemFilter: (value) => {
                return value.length > 0;
            },
            removeItemButton: false,
        });
    }

    if (document.getElementById('assetMediumClassSelect')) {
        window.assetMediumClassChoice = new Choices('#assetMediumClassSelect', {
            searchEnabled: true,
            searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
            noChoicesText: '選択肢がありません',
            placeholder: true,
            placeholderValue: '選択してください',
            addItems: true,
            addItemFilter: (value) => {
                return value.length > 0;
            },
            removeItemButton: false,
        });
    }

    if (document.getElementById('assetItemSelect')) {
        window.assetItemChoice = new Choices('#assetItemSelect', {
            searchEnabled: true,
            searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
            noChoicesText: '選択肢がありません',
            placeholder: true,
            placeholderValue: '選択してください',
            addItems: true,
            addItemFilter: (value) => {
                return value.length > 0;
            },
            removeItemButton: false,
        });
    }

    if (document.getElementById('assetMakerSelect')) {
        window.assetMakerChoice = new Choices('#assetMakerSelect', {
            searchEnabled: true,
            searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
            noChoicesText: '選択肢がありません',
            placeholder: true,
            placeholderValue: '選択してください',
            addItems: true,
            addItemFilter: (value) => {
                return value.length > 0;
            },
            removeItemButton: false,
        });
    }

    if (document.getElementById('assetModelSelect')) {
        window.assetModelChoice = new Choices('#assetModelSelect', {
            searchEnabled: true,
            searchPlaceholderValue: '検索またはフリー入力してEnterキーを押してください',
            shouldSort: false,
            itemSelectText: '',
            noResultsText: '該当なし。Enterキーでフリー入力として追加できます',
            noChoicesText: '選択肢がありません',
            placeholder: true,
            placeholderValue: '選択してください',
            addItems: true,
            addItemFilter: (value) => {
                return value.length > 0;
            },
            removeItemButton: false,
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
