/**
 * 資産管理台帳と資産マスタ突き合わせ画面のJavaScript
 */

// Choices.jsインスタンスを管理（グローバルスコープ汚染を避ける）
const matchingChoicesInstances = {};

/**
 * 全選択切り替え
 */
function toggleSelectAll(checkbox) {
    const checkboxes = document.querySelectorAll('.row-checkbox:not(:disabled)');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
}

/**
 * AI推薦を選択
 */
function selectAIRecommendation(index, recNumber) {
    const row = document.querySelector(`.data-row-flat[data-index="${index}"]`);

    // 該当行のすべてのラジオボタンを取得
    const radios = row.querySelectorAll('.ai-select-radio');

    // 選択されたラジオボタンのデータを取得
    const selectedRadio = row.querySelector(`.ai-select-radio[value="rec${recNumber}"]`);

    if (selectedRadio && selectedRadio.checked) {
        console.log(`Row ${index}: AI推薦${recNumber}が選択されました`);

        // 選択されたAI推薦のデータを固定資産台帳の該当セルに反映
        // (実際の実装では、確定時に選択されたAI推薦を使用)
    }
}

/**
 * 編集モード切り替え（Choices.js対応）
 */
async function toggleEditMode(index) {
    const row = document.querySelector(`.data-row-flat[data-index="${index}"]`);
    if (!row) {
        console.error(`Row with index ${index} not found`);
        return;
    }

    const editBtn = row.querySelector('.edit-btn-flat');
    const isEditing = row.classList.contains('editing');

    // 編集可能なフィールド（固定資産台帳の大分類、中分類、個体管理品目のみ）
    const editableFields = ['majorCategory', 'middleCategory', 'itemManagement'];

    if (isEditing) {
        // 編集モード終了：selectをspanに戻す & Choices.jsインスタンスを破棄
        row.querySelectorAll('.td-data-matching').forEach(td => {
            const choicesContainer = td.querySelector('.choices');
            if (choicesContainer) {
                const select = choicesContainer.querySelector('select.cell-select-flat');
                if (select) {
                    const field = select.getAttribute('data-field');

                    // Choices.jsインスタンスを破棄
                    const instanceKey = `${index}-${field}`;
                    if (matchingChoicesInstances[instanceKey]) {
                        matchingChoicesInstances[instanceKey].destroy();
                        delete matchingChoicesInstances[instanceKey];
                    }

                    const span = document.createElement('span');
                    span.className = 'cell-value';
                    span.textContent = select.value || '';
                    span.setAttribute('data-field', field);
                    td.innerHTML = '';
                    td.appendChild(span);
                }
            }
        });

        row.classList.remove('editing');
        editBtn.textContent = '編集';
        editBtn.classList.remove('editing');
    } else {
        // 資産マスタをロード（既存のグローバル関数を使用）
        if (typeof window.loadAssetMaster !== 'function') {
            alert('資産マスタの読み込み関数が見つかりません');
            return;
        }

        const masterData = await window.loadAssetMaster();
        if (!masterData) {
            alert('資産マスタの読み込みに失敗しました');
            return;
        }

        console.log('Asset master loaded for editing:', masterData);

        // 編集モード開始：編集可能なフィールドのみspanをselectに変換
        row.querySelectorAll('.td-data-matching').forEach(td => {
            const span = td.querySelector('.cell-value');
            if (span) {
                const field = span.getAttribute('data-field');

                // 編集可能なフィールドのみselectに変換
                if (editableFields.includes(field)) {
                    const currentValue = span.textContent.trim();

                    // フィールドに応じた選択肢を作成
                    let choices = [];
                    if (field === 'majorCategory') {
                        choices = masterData.largeClasses.map(item => ({
                            value: item.name,
                            label: item.name
                        }));
                    } else if (field === 'middleCategory') {
                        choices = masterData.mediumClasses.map(item => ({
                            value: item.name,
                            label: item.name
                        }));
                    } else if (field === 'itemManagement') {
                        choices = masterData.items.map(item => ({
                            value: item.name,
                            label: item.name
                        }));
                    }

                    const select = document.createElement('select');
                    select.className = 'cell-select-flat';
                    select.setAttribute('data-field', field);

                    // optionを直接HTMLに追加（Choices.js初期化前）
                    select.innerHTML = '<option value="">選択してください</option>';
                    choices.forEach(choice => {
                        const option = document.createElement('option');
                        option.value = choice.value;
                        option.textContent = choice.label;
                        if (choice.value === currentValue) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });

                    td.innerHTML = '';
                    td.appendChild(select);

                    // Choices.jsを適用
                    const instanceKey = `${index}-${field}`;
                    try {
                        // フィールドごとの設定
                        let fieldConfig = {
                            searchPlaceholderValue: '検索...',
                            noResultsText: '該当なし'
                        };

                        if (field === 'majorCategory') {
                            fieldConfig.searchPlaceholderValue = '大分類を検索...';
                            fieldConfig.noResultsText = '該当する大分類が見つかりません';
                        } else if (field === 'middleCategory') {
                            fieldConfig.searchPlaceholderValue = '中分類を検索...';
                            fieldConfig.noResultsText = '該当する中分類が見つかりません';
                        } else if (field === 'itemManagement') {
                            fieldConfig.searchPlaceholderValue = '品目を検索...';
                            fieldConfig.noResultsText = '該当する品目が見つかりません';
                        }

                        // master-data-loader.jsと完全に同じオプション設定
                        const choicesInstance = new Choices(select, {
                            searchEnabled: true,
                            searchChoices: true,
                            searchFloor: 1,
                            searchResultLimit: 50,
                            searchPlaceholderValue: fieldConfig.searchPlaceholderValue,
                            itemSelectText: '',
                            noResultsText: fieldConfig.noResultsText,
                            noChoicesText: '選択肢がありません',
                            shouldSort: false,
                            removeItemButton: false,
                            position: 'auto'
                        });

                        matchingChoicesInstances[instanceKey] = choicesInstance;

                        // ドロップダウンアイテムに強制的にインラインスタイルを適用する関数
                        const applyDropdownStyles = () => {
                            const choicesContainer = select.closest('.choices');
                            if (!choicesContainer) return;

                            const dropdown = choicesContainer.querySelector('.choices__list--dropdown');
                            if (!dropdown) return;

                            const listbox = dropdown.querySelector('.choices__list[role="listbox"]');
                            const items = dropdown.querySelectorAll('.choices__item');

                            // ドロップダウン
                            dropdown.style.setProperty('display', 'block', 'important');
                            dropdown.style.setProperty('visibility', 'visible', 'important');
                            dropdown.style.setProperty('opacity', '1', 'important');

                            // リストボックス
                            if (listbox) {
                                listbox.style.setProperty('display', 'block', 'important');
                                listbox.style.setProperty('height', 'auto', 'important');
                                listbox.style.setProperty('min-height', '150px', 'important');
                                listbox.style.setProperty('max-height', '300px', 'important');
                                listbox.style.setProperty('overflow-y', 'auto', 'important');
                            }

                            // アイテム
                            items.forEach(item => {
                                item.style.setProperty('display', 'block', 'important');
                                item.style.setProperty('height', 'auto', 'important');
                                item.style.setProperty('min-height', '30px', 'important');
                                item.style.setProperty('padding', '10px 12px', 'important');
                                item.style.setProperty('color', '#333333', 'important');
                                item.style.setProperty('font-size', '14px', 'important');
                                item.style.setProperty('line-height', '1.5', 'important');
                                item.style.setProperty('background-color', 'white', 'important');
                            });
                        };

                        // ドロップダウンの位置を調整する関数（下にスペースがない場合は上に表示）
                        const adjustDropdownPosition = () => {
                            const choicesContainer = select.closest('.choices');
                            if (!choicesContainer) return;

                            const dropdown = choicesContainer.querySelector('.choices__list--dropdown');
                            if (!dropdown) return;

                            const rect = choicesContainer.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;
                            const spaceBelow = viewportHeight - rect.bottom;
                            const spaceAbove = rect.top;

                            // ドロップダウンの高さ（最大300px）
                            const dropdownHeight = 300;

                            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                                // 下にスペースがなく、上の方が広い場合は上に表示
                                dropdown.style.top = 'auto';
                                dropdown.style.bottom = '100%';
                                dropdown.style.marginTop = '0';
                                dropdown.style.marginBottom = '2px';
                            } else {
                                // デフォルトは下に表示
                                dropdown.style.top = '100%';
                                dropdown.style.bottom = 'auto';
                                dropdown.style.marginTop = '2px';
                                dropdown.style.marginBottom = '0';
                            }
                        };

                        // MutationObserverで継続的に監視・適用
                        const choicesContainer = select.closest('.choices');
                        if (choicesContainer) {
                            const observer = new MutationObserver(() => {
                                applyDropdownStyles();
                                adjustDropdownPosition();
                            });
                            observer.observe(choicesContainer, {
                                childList: true,
                                subtree: true,
                                attributes: true,
                                attributeFilter: ['style', 'class']
                            });
                        }

                        // 初期適用
                        setTimeout(() => {
                            applyDropdownStyles();
                            adjustDropdownPosition();
                        }, 100);
                        setTimeout(() => {
                            applyDropdownStyles();
                            adjustDropdownPosition();
                        }, 300);
                        setTimeout(() => {
                            applyDropdownStyles();
                            adjustDropdownPosition();
                        }, 500);

                        // ドロップダウンが開かれた時にも位置調整
                        select.addEventListener('showDropdown', () => {
                            setTimeout(() => {
                                applyDropdownStyles();
                                adjustDropdownPosition();
                            }, 10);
                        });

                        console.log(`${field} Choices.js initialized with ${choices.length} items`);
                    } catch (error) {
                        console.error(`Failed to initialize Choices.js for ${field}:`, error);
                    }
                }
            }
        });

        row.classList.add('editing');
        editBtn.textContent = '保存';
        editBtn.classList.add('editing');

        // 最初のフィールド（大分類）にフォーカスしてドロップダウンを開く
        setTimeout(() => {
            const firstInstanceKey = `${index}-majorCategory`;
            const firstInstance = matchingChoicesInstances[firstInstanceKey];
            if (firstInstance) {
                firstInstance.showDropdown();
            }
        }, 600); // スタイル適用後に実行
    }
}

/**
 * 行を確定
 */
function confirmRowFlat(index) {
    const row = document.querySelector(`.data-row-flat[data-index="${index}"]`);
    if (!row) {
        console.error(`Row with index ${index} not found`);
        return;
    }

    // 編集モードの場合は保存
    if (row.classList.contains('editing')) {
        toggleEditMode(index);
    }

    // 行を確定状態に変更
    row.setAttribute('data-status', 'completed');
    row.style.backgroundColor = '#e8f5e9';

    // チェックボックスを無効化
    const checkbox = row.querySelector('.row-checkbox');
    if (checkbox) {
        checkbox.disabled = true;
        checkbox.checked = false;
    }

    // 編集ボタンを無効化
    const editBtn = row.querySelector('.edit-btn-flat');
    if (editBtn) {
        editBtn.disabled = true;
    }

    // 確定ボタンを無効化
    const confirmBtn = row.querySelector('.confirm-btn-flat');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = '確定済';
    }

    // カウントを更新
    updateMatchingCounts();

    console.log(`Row ${index} confirmed`);
}

/**
 * 選択項目を一括確定
 */
function bulkConfirmSelected() {
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked:not(:disabled)');
    if (checkedBoxes.length === 0) {
        alert('確定する行を選択してください');
        return;
    }

    if (!confirm(`${checkedBoxes.length}件を一括確定しますか？`)) {
        return;
    }

    checkedBoxes.forEach(checkbox => {
        const row = checkbox.closest('.data-row-flat');
        const index = parseInt(row.getAttribute('data-index'));
        confirmRowFlat(index);
    });
}

/**
 * 進捗カウントを更新
 */
function updateMatchingCounts() {
    const allRows = document.querySelectorAll('.data-row-flat');
    const completedRows = document.querySelectorAll('.data-row-flat[data-status="completed"]');

    const progressCount = document.getElementById('progressCount');
    const completedCount = document.getElementById('completedCount');

    if (progressCount) {
        progressCount.textContent = `${completedRows.length} / ${allRows.length}`;
    }
    if (completedCount) {
        completedCount.textContent = `${completedRows.length}件`;
    }

    // フィルターボタンのカウントも更新
    updateFilterCounts();
}

/**
 * フィルターボタンのカウントを更新
 */
function updateFilterCounts() {
    const allRows = document.querySelectorAll('.data-row-flat');
    const pendingRows = document.querySelectorAll('.data-row-flat[data-status="pending"]');
    const completedRows = document.querySelectorAll('.data-row-flat[data-status="completed"]');

    const allBtn = document.querySelector('[data-filter="all"] .filter-count-matching');
    const pendingBtn = document.querySelector('[data-filter="pending"] .filter-count-matching');
    const completedBtn = document.querySelector('[data-filter="completed"] .filter-count-matching');

    if (allBtn) allBtn.textContent = `(${allRows.length})`;
    if (pendingBtn) pendingBtn.textContent = `(${pendingRows.length})`;
    if (completedBtn) completedBtn.textContent = `(${completedRows.length})`;
}

/**
 * データをフィルタリング
 */
function filterMatchingData(filterType) {
    const allRows = document.querySelectorAll('.data-row-flat');
    const filterButtons = document.querySelectorAll('.filter-btn-matching');

    // ボタンのアクティブ状態を更新
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-filter') === filterType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 行の表示/非表示を切り替え
    allRows.forEach(row => {
        const status = row.getAttribute('data-status');
        if (filterType === 'all') {
            row.style.display = '';
        } else if (filterType === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * 検索機能
 */
function searchImportData(query) {
    const allRows = document.querySelectorAll('.data-row-flat');
    const searchQuery = query.toLowerCase().trim();

    allRows.forEach(row => {
        if (!searchQuery) {
            row.style.display = '';
            return;
        }

        const cells = row.querySelectorAll('.cell-value');
        let found = false;

        cells.forEach(cell => {
            const text = cell.textContent.toLowerCase();
            if (text.includes(searchQuery)) {
                found = true;
            }
        });

        row.style.display = found ? '' : 'none';
    });
}

/**
 * 資産マスタを別ウィンドウで開く
 */
function openAssetMasterWindow() {
    // 資産マスタ画面を新しいウィンドウで開く
    window.open('asset-master.html', 'AssetMaster', 'width=1200,height=800');
}

/**
 * 突き合わせ完了
 */
function completeMatching() {
    const pendingRows = document.querySelectorAll('.data-row-flat[data-status="pending"]');

    if (pendingRows.length > 0) {
        if (!confirm(`未処理の項目が${pendingRows.length}件あります。完了してよろしいですか？`)) {
            return;
        }
    }

    alert('突き合わせが完了しました');
    // 実際の実装では次の画面に遷移
}

/**
 * 前のページへ
 */
function goToPreviousPage() {
    console.log('前のページへ');
    // ページネーション処理
}

/**
 * 次のページへ
 */
function goToNextPage() {
    console.log('次のページへ');
    // ページネーション処理
}

/**
 * 戻るボタン（navigation.jsの関数を使用）
 * この関数は削除してnavigation.jsの関数を使用
 */

// グローバルに公開
window.toggleSelectAll = toggleSelectAll;
window.selectAIRecommendation = selectAIRecommendation;
window.toggleEditMode = toggleEditMode;
window.confirmRowFlat = confirmRowFlat;
window.bulkConfirmSelected = bulkConfirmSelected;
window.updateMatchingCounts = updateMatchingCounts;
window.updateFilterCounts = updateFilterCounts;
window.filterMatchingData = filterMatchingData;
window.searchImportData = searchImportData;
window.openAssetMasterWindow = openAssetMasterWindow;
window.completeMatching = completeMatching;
window.goToPreviousPage = goToPreviousPage;
window.goToNextPage = goToNextPage;
// handleBackFromMatchingはnavigation.jsで定義
