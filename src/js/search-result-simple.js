/**
 * 資産検索結果画面のJavaScript - 完全版
 * 元ファイルから全機能を移植
 */

// ========================================
// マスタデータ管理（グローバル変数、競合回避プレフィックス付き）
// ========================================
let searchResultFilter_facilityMaster = null;
let searchResultFilter_assetMaster = null;

        // サンプルデータ
        const sampleData = [
            {
                qrCode: 'QR-2025-0001',
                no: 1,
                facility: '〇〇〇〇〇〇病院',
                building: '本館',
                floor: '2F',
                department: '手術部門',
                section: '手術',
                category: '医療機器',
                largeClass: '手術関連機器',
                mediumClass: '電気メス 双極',
                item: '手術台',
                name: '電気手術用電源装置2システム',
                maker: '医療',
                model: 'EW11 超音波吸引器',
                quantity: 1,
                width: 520,
                depth: 480,
                height: 1400,
                photos: [
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%2390caf9" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23fff" font-size="24"%3E写真1%3C/text%3E%3C/svg%3E',
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%2366bb6a" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23fff" font-size="24"%3E写真2%3C/text%3E%3C/svg%3E',
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ff7043" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23fff" font-size="24"%3E写真3%3C/text%3E%3C/svg%3E'
                ]
            },
            {
                qrCode: 'QR-2025-0002',
                no: 2,
                facility: '〇〇〇〇〇〇病院',
                building: '本館',
                floor: '2F',
                department: '手術部門',
                section: '手術',
                category: '医療機器',
                largeClass: '手術関連機器',
                mediumClass: '電気メス 双極',
                item: 'X',
                name: '医科歯科用洗浄器',
                maker: '医療',
                model: '',
                quantity: 1,
                width: '',
                depth: '',
                height: '',
                photos: [
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ab47bc" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23fff" font-size="24"%3E写真A%3C/text%3E%3C/svg%3E',
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ec407a" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23fff" font-size="24"%3E写真B%3C/text%3E%3C/svg%3E'
                ]
            },
            // さらにデータを追加
            ...Array.from({length: 18}, (_, i) => ({
                qrCode: `QR-2025-${String(i + 3).padStart(4, '0')}`,
                no: i + 3,
                facility: '〇〇〇〇〇〇病院',
                building: '本館',
                floor: '2F',
                department: '手術部門',
                section: '手術',
                category: '医療機器',
                largeClass: '手術関連機器',
                mediumClass: 'CT関連',
                item: `品目${i + 3}`,
                name: `サンプル製品${i + 3}`,
                maker: '医療機器',
                model: `MODEL-${i + 3}`,
                quantity: 1,
                width: 500 + i * 10,
                depth: 600 + i * 10,
                height: 700 + i * 10
            }))
        ];

        // カード用サンプル画像データ
        const cardImages = [
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3E画像1%3C/text%3E%3C/svg%3E',
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3E画像2%3C/text%3E%3C/svg%3E'
        ];

        let currentView = 'list'; // 'list' or 'card'
        let selectedItems = new Set();
        let selectedMasterItems = new Set();

        // 資産マスタのデータ（JSONファイルから読み込み）
        let searchResult_assetMasterData = [];

        let filteredMasterData = [];

        // ========================================
        // マスタデータ読み込み
        // ========================================
        async function loadSearchResultMasterData() {
            try {
                if (typeof window.loadFacilityMaster === 'function') {
                    searchResultFilter_facilityMaster = await window.loadFacilityMaster();
                }
                if (typeof window.loadAssetMaster === 'function') {
                    searchResultFilter_assetMaster = await window.loadAssetMaster();

                    // 資産マスタデータを構築（資産マスタモーダル用）
                    // JSONから取得したデータを使用して資産マスタ配列を構築
                    searchResult_assetMasterData = [];
                    let id = 1;

                    // 各分類の組み合わせから資産データを生成
                    if (searchResultFilter_assetMaster.items &&
                        searchResultFilter_assetMaster.manufacturers) {

                        // 品目とメーカーの組み合わせでデータを生成
                        searchResultFilter_assetMaster.items.forEach(item => {
                            searchResultFilter_assetMaster.manufacturers.forEach(maker => {
                                // 中分類IDから中分類名を取得
                                const mediumClass = searchResultFilter_assetMaster.mediumClasses?.find(
                                    mc => mc.id === item.mediumClassId
                                );

                                // 大分類IDから大分類名を取得（中分類経由）
                                const largeClass = mediumClass ?
                                    searchResultFilter_assetMaster.largeClasses?.find(
                                        lc => lc.id === mediumClass.largeClassId
                                    ) : null;

                                // モデルがある場合は最初の1つを使用
                                const models = searchResultFilter_assetMaster.models || [{ name: '' }];
                                const model = models[0] || { name: '' };

                                searchResult_assetMasterData.push({
                                    id: id++,
                                    category: largeClass?.name || '医療機器',
                                    largeClass: largeClass?.name || '',
                                    mediumClass: mediumClass?.name || '',
                                    individualItem: item.name,
                                    maker: maker.name,
                                    model: model.name
                                });
                            });
                        });
                    }

                    filteredMasterData = [...searchResult_assetMasterData];
                }
                return true;
            } catch (error) {
                console.error('Master data load error:', error);
                return false;
            }
        }

        // ========================================
        // フィルター初期化（標準selectドロップダウン、曖昧検索なし）
        // ========================================
        function initSearchResultChoices() {
            console.log('=== Initializing filter dropdowns ===');

            // アクティブな画面内の要素を取得
            const activePage = document.querySelector('.search-result-page.active');
            if (!activePage) {
                console.error('✗ Active search result page not found');
                return;
            }

            // 部門 - 施設マスタから取得
            const deptElement = activePage.querySelector('#filterDepartment');
            if (deptElement && searchResultFilter_facilityMaster?.departments) {
                // 既存のoption（すべて）以外を削除
                while (deptElement.options.length > 1) {
                    deptElement.remove(1);
                }
                // マスタデータから追加
                searchResultFilter_facilityMaster.departments.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept.id;
                    option.textContent = dept.name;
                    deptElement.appendChild(option);
                });
                console.log(`✓ Department: ${searchResultFilter_facilityMaster.departments.length} items`);
            }

            // 部署 - 施設マスタから取得
            const sectionElement = activePage.querySelector('#filterSection');
            if (sectionElement && searchResultFilter_facilityMaster?.sections) {
                // 既存のoption（すべて）以外を削除
                while (sectionElement.options.length > 1) {
                    sectionElement.remove(1);
                }
                // マスタデータから追加
                searchResultFilter_facilityMaster.sections.forEach(section => {
                    const option = document.createElement('option');
                    option.value = section.id;
                    option.textContent = section.name;
                    sectionElement.appendChild(option);
                });
                console.log(`✓ Section: ${searchResultFilter_facilityMaster.sections.length} items`);
            }

            // 大分類 - 資産マスタから取得
            const largeClassElement = activePage.querySelector('#filterLargeClass');
            if (largeClassElement && searchResultFilter_assetMaster?.largeClasses) {
                // 既存のoption（すべて）以外を削除
                while (largeClassElement.options.length > 1) {
                    largeClassElement.remove(1);
                }
                // マスタデータから追加
                searchResultFilter_assetMaster.largeClasses.forEach(largeClass => {
                    const option = document.createElement('option');
                    option.value = largeClass.id;
                    option.textContent = largeClass.name;
                    largeClassElement.appendChild(option);
                });
                console.log(`✓ Large class: ${searchResultFilter_assetMaster.largeClasses.length} items`);
            }

            // 中分類 - 資産マスタから取得
            const mediumClassElement = activePage.querySelector('#filterMediumClass');
            if (mediumClassElement && searchResultFilter_assetMaster?.mediumClasses) {
                // 既存のoption（すべて）以外を削除
                while (mediumClassElement.options.length > 1) {
                    mediumClassElement.remove(1);
                }
                // マスタデータから追加
                searchResultFilter_assetMaster.mediumClasses.forEach(mediumClass => {
                    const option = document.createElement('option');
                    option.value = mediumClass.id;
                    option.textContent = mediumClass.name;
                    mediumClassElement.appendChild(option);
                });
                console.log(`✓ Medium class: ${searchResultFilter_assetMaster.mediumClasses.length} items`);
            }
        }

        // グローバルに公開
        window.initSearchResultChoices = initSearchResultChoices;

        // 資産マスタ検索用のChoices.js初期化（共通ヘルパー使用）
        function initMasterChoices() {
            const masterSelectIds = ['masterCategory', 'masterLargeClass', 'masterMediumClass', 'masterIndividualItem', 'masterMaker', 'masterModel'];
            const instances = {};

            // 各ドロップダウンのz-index（上の行ほど高く）
            const zIndexMap = {
                'masterCategory': 100006,
                'masterLargeClass': 100006,
                'masterMediumClass': 100004,
                'masterIndividualItem': 100004,
                'masterMaker': 100002,
                'masterModel': 100002
            };

            masterSelectIds.forEach(id => {
                const element = document.getElementById(id);
                if (element && window.ChoicesHelper) {
                    // 既存のChoicesインスタンスがあれば破棄
                    if (element.choices) {
                        try {
                            element.choices.destroy();
                        } catch (e) {
                            console.log('Choices destroy error for', id, e);
                        }
                    }

                    // 個体管理品目のみフリー入力可能にする
                    const isIndividualItem = id === 'masterIndividualItem';
                    const choicesConfig = {
                        placeholder: true,
                        placeholderValue: '全て',
                        searchPlaceholderValue: isIndividualItem ? '検索 or フリー入力' : '検索...',
                        // フリー入力設定（個体管理品目のみ）
                        addItems: isIndividualItem,
                        removeItems: isIndividualItem,
                        allowHTML: false,
                        shouldSort: false,
                        noResultsText: isIndividualItem ? '該当なし。Enterで新規追加' : '該当なし',
                        itemSelectText: '選択',
                        addItemText: (value) => `Enter押下で「${value}」を追加`
                    };

                    // 共通ヘルパーを使用してChoices.jsを初期化
                    instances[id] = window.ChoicesHelper.initChoices(element, choicesConfig);

                    // 個体管理品目の場合、フリー入力後にフォーカスが外れたら自動的に値を確定
                    if (isIndividualItem) {
                        element.addEventListener('hideDropdown', () => {
                            setTimeout(() => {
                                const inputElement = instances[id]?.input?.element;
                                const inputValue = inputElement?.value?.trim();
                                const currentValue = instances[id]?.getValue(true);

                                // 入力値があり、まだ選択されていない場合、自動的に追加
                                if (inputValue && (!currentValue || currentValue === '全て')) {
                                    instances[id].setChoices([
                                        { value: inputValue, label: inputValue, selected: true }
                                    ], 'value', 'label', false);
                                }
                            }, 100);
                        });
                    }

                    // z-indexのみカスタム設定
                    element.addEventListener('showDropdown', () => {
                        setTimeout(() => {
                            const choicesContainer = element.parentElement?.querySelector('.choices');
                            if (choicesContainer) {
                                const dropdown = choicesContainer.querySelector('.choices__list--dropdown');
                                if (dropdown) {
                                    dropdown.style.zIndex = zIndexMap[id];
                                }
                            }
                        }, 10);
                    });
                }
            });

            return instances;
        }

        let masterChoicesInstances = null;

        // テーブル表示レンダリング
        function renderListView() {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';

            sampleData.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = 'clickable-row';
                tr.innerHTML = `
                    <td><input type="checkbox" class="row-checkbox" data-no="${item.no}" onchange="handleRowSelect()"></td>
                    <td>${item.no}</td>
                    <td>${item.facility}</td>
                    <td>${item.building}</td>
                    <td>${item.floor}</td>
                    <td>${item.department}</td>
                    <td>${item.section}</td>
                    <td>${item.category}</td>
                    <td>${item.largeClass}</td>
                    <td>${item.mediumClass}</td>
                    <td>${item.item}</td>
                    <td>${item.name}</td>
                    <td>${item.maker}</td>
                    <td>${item.model}</td>
                    <td>${item.quantity}</td>
                    <td>${item.width || ''}</td>
                    <td>${item.depth || ''}</td>
                    <td>${item.height || ''}</td>
                `;

                // 行クリックで詳細画面に遷移（チェックボックスクリック時は除外）
                tr.addEventListener('click', function(e) {
                    if (e.target.type !== 'checkbox') {
                        showAssetDetail(item);
                    }
                });

                tbody.appendChild(tr);
            });
        }

        // カード表示レンダリング
        function renderCardView() {
            const cardView = document.getElementById('cardView');
            cardView.innerHTML = '';

            sampleData.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'asset-card';
                card.setAttribute('data-no', item.no);

                // カードクリックで詳細画面に遷移（チェックボックスクリック時は除外）
                card.onclick = (e) => {
                    if (e.target.type !== 'checkbox') {
                        showAssetDetail(item);
                    }
                };

                const imageUrl = cardImages[index % cardImages.length];

                card.innerHTML = `
                    <input type="checkbox" class="card-checkbox" data-no="${item.no}" onclick="event.stopPropagation(); toggleCardSelection(${item.no})">
                    <img src="${imageUrl}" class="card-image" alt="資産画像">
                    <div class="card-number">シールNo: 0${150 + index}</div>
                    <div class="card-info">
                        <span class="card-label">品目:</span>
                        <span class="card-value">${item.item}</span>
                    </div>
                    <div class="card-info">
                        <span class="card-label">品名:</span>
                        <span class="card-value">${item.name}</span>
                    </div>
                    <div class="card-info">
                        <span class="card-label">メーカー:</span>
                        <span class="card-value">${item.maker}</span>
                    </div>
                    <div class="card-info">
                        <span class="card-label">型式:</span>
                        <span class="card-value">${item.model}</span>
                    </div>
                    ${item.width && item.depth && item.height ? `
                    <div class="card-dimensions">
                        <div class="card-dim">
                            <div class="card-dim-label">W</div>
                            <div class="card-dim-value">${item.width}</div>
                        </div>
                        <div class="card-dim">
                            <div class="card-dim-label">D</div>
                            <div class="card-dim-value">${item.depth}</div>
                        </div>
                        <div class="card-dim">
                            <div class="card-dim-label">H</div>
                            <div class="card-dim-value">${item.height}</div>
                        </div>
                    </div>
                    ` : ''}
                `;

                cardView.appendChild(card);
            });
        }

        // 表示切替
        function toggleView() {
            const listView = document.getElementById('listView');
            const cardView = document.getElementById('cardView');
            const viewBtn = document.getElementById('viewToggleBtn');
            const exportBtn = document.getElementById('exportBtn');
            
            if (currentView === 'list') {
                currentView = 'card';
                listView.classList.add('hidden');
                cardView.classList.add('active');
                viewBtn.textContent = '🗂️';
                exportBtn.textContent = '📄';
            } else {
                currentView = 'list';
                listView.classList.remove('hidden');
                cardView.classList.remove('active');
                viewBtn.textContent = '📋';
                exportBtn.textContent = '📊';
            }
            
            // 選択状態を同期
            syncSelections();
        }

        // 全選択（共通ヘルパー使用）
        function handleSelectAll() {
            const selectAll = document.getElementById('selectAll');

            if (window.TableHelper) {
                window.TableHelper.toggleSelectAll(selectAll, '.row-checkbox', (checkboxes, isChecked) => {
                    checkboxes.forEach(cb => {
                        const no = parseInt(cb.getAttribute('data-no'));
                        if (isChecked) {
                            selectedItems.add(no);
                        } else {
                            selectedItems.delete(no);
                        }
                    });
                });
            }

            updateSelectionInfo();
            syncSelections();
        }

        // 行選択（共通ヘルパー使用）
        function handleRowSelect() {
            const selectAll = document.getElementById('selectAll');

            if (window.TableHelper) {
                selectedItems = window.TableHelper.getSelectedRows('.row-checkbox', 'data-no');
                window.TableHelper.updateSelectAllState(selectAll, '.row-checkbox');
            }

            updateSelectionInfo();
            syncSelections();
        }

        // カード選択
        function toggleCardSelection(no) {
            if (selectedItems.has(no)) {
                selectedItems.delete(no);
            } else {
                selectedItems.add(no);
            }
            
            updateSelectionInfo();
            syncSelections();
        }

        // 選択状態の同期
        function syncSelections() {
            // テーブルの選択状態を更新
            document.querySelectorAll('.row-checkbox').forEach(cb => {
                const no = parseInt(cb.getAttribute('data-no'));
                cb.checked = selectedItems.has(no);
                const row = cb.closest('tr');
                if (selectedItems.has(no)) {
                    row.classList.add('selected');
                } else {
                    row.classList.remove('selected');
                }
            });
            
            // カードの選択状態を更新
            document.querySelectorAll('.asset-card').forEach(card => {
                const no = parseInt(card.getAttribute('data-no'));
                const checkbox = card.querySelector('.card-checkbox');
                checkbox.checked = selectedItems.has(no);
                if (selectedItems.has(no)) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
        }

        // 選択情報の更新
        function updateSelectionInfo() {
            const info = document.getElementById('selectionInfo');
            info.textContent = `${selectedItems.size}件選択中`;
            
            // ドロップダウンボタンと棚卸しボタンの有効/無効
            const hasSelection = selectedItems.size > 0;
            const purchaseBtn = document.getElementById('purchaseDropdownBtn');
            if (purchaseBtn) {
                purchaseBtn.disabled = !hasSelection;
            }
            const managementBtn = document.getElementById('managementDropdownBtn');
            if (managementBtn) {
                managementBtn.disabled = !hasSelection;
            }
            const inventoryBtn = document.getElementById('inventoryBtn');
            if (inventoryBtn) {
                inventoryBtn.disabled = !hasSelection;
            }
        }
        
        // ドロップダウンメニューの制御
        function toggleDropdown(type) {
            const btn = document.getElementById(`${type}DropdownBtn`);
            const menu = document.getElementById(`${type}DropdownMenu`);
            
            if (btn && btn.disabled) return;
            
            const isActive = menu.classList.contains('active');
            
            // 他のドロップダウンを閉じる
            closeAllDropdowns();
            
            // クリックしたドロップダウンを開閉
            if (!isActive) {
                btn.classList.add('active');
                menu.classList.add('active');
            }
        }
        
        // 全てのドロップダウンを閉じる
        function closeAllDropdowns() {
            const dropdownBtns = document.querySelectorAll('.dropdown-btn');
            const dropdownMenus = document.querySelectorAll('.dropdown-menu');
            const navMenuBtn = document.querySelector('.nav-menu-btn');
            const navMenuDropdown = document.getElementById('navMenuDropdown');
            
            dropdownBtns.forEach(btn => btn.classList.remove('active'));
            dropdownMenus.forEach(menu => menu.classList.remove('active'));
            if (navMenuBtn) navMenuBtn.classList.remove('active');
            if (navMenuDropdown) navMenuDropdown.classList.remove('active');
        }

        // ドロップダウンメニューの外側クリックで閉じる
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.dropdown-container') && !event.target.closest('.nav-menu')) {
                closeAllDropdowns();
            }
        });

        // サイドパネル切替
        function toggleSidePanel() {
            const panel = document.getElementById('sidePanel');
            panel.classList.toggle('active');
        }

        // Excel/PDF出力モーダル
        function handleExport() {
            const modal = document.getElementById('exportModal');
            const title = document.getElementById('exportModalTitle');
            
            if (currentView === 'list') {
                title.textContent = 'Excel出力項目（行）の選択';
                document.querySelector('.modal-button').textContent = 'この条件でExcel出力';
            } else {
                title.textContent = 'PDF出力項目の選択';
                document.querySelector('.modal-button').textContent = 'この条件でPDF出力';
            }
            
            modal.classList.add('active');
        }

        function closeExportModal() {
            if (window.ModalHelper) {
                window.ModalHelper.close('#exportModal');
            }
        }

        // Excel/PDF出力モーダルの枠外クリックで閉じる（共通ヘルパー使用時は不要）
        function handleExportModalOutsideClick(event) {
            if (event.target.id === 'exportModal') {
                closeExportModal();
            }
        }

        function selectExportTemplate(type) {
            console.log('テンプレート選択:', type);
            // 実装: テンプレート選択処理
        }

        function executeExport() {
            console.log('出力実行');
            alert(currentView === 'list' ? 'Excel出力を実行します' : 'PDF出力を実行します');
            closeExportModal();
        }

        function selectCustomColumns() {
            console.log('任意項目選択');
            // モーダルを閉じずにサイドパネルを開く
            const panel = document.getElementById('sidePanel');
            if (!panel.classList.contains('active')) {
                panel.classList.add('active');
            }
        }

        // 申請処理
        function handleNewPurchaseRequest() {
            // 新規購入：資産マスタから選択
            closeAllDropdowns();
            openAssetMasterModal();
        }

        function handleExpansionRequest() {
            // 増設：選択した資産で申請
            closeAllDropdowns();
            openApplicationInputModalWithType('増設購入申請');
        }

        function handleRenewalRequest() {
            // 更新：選択した資産で申請
            closeAllDropdowns();
            openApplicationInputModalWithType('更新購入申請');
        }

        function handleMoveRequest() {
            closeAllDropdowns();
            openApplicationInputModalWithType('移動・廃棄申請');
        }

        function handleRepairRequest() {
            closeAllDropdowns();
            openApplicationInputModalWithType('修理申請');
        }

        function handleMaintenanceRequest() {
            closeAllDropdowns();
            openApplicationInputModalWithType('保守申請');
        }

        function handleLendingRequest() {
            closeAllDropdowns();
            openApplicationInputModalWithType('資産貸出申請');
        }
        
        // 資産棚卸し処理
        function handleInventory() {
            closeAllDropdowns();
            if (selectedItems.size === 0) {
                alert('棚卸しを行う資産を選択してください');
                return;
            }
            
            // 棚卸しモーダルを表示（または別画面へ遷移）
            const confirmMsg = `選択した${selectedItems.size}件の資産の棚卸しを開始しますか？\n\n棚卸し内容：\n・資産の現物確認\n・設置場所の確認\n・状態の確認\n\n※廃棄・移動が必要な場合は申請画面へ遷移します`;
            
            if (confirm(confirmMsg)) {
                alert('棚卸し画面に遷移します');
                // 実装: 棚卸し画面への遷移
                // window.location.href = '/inventory?assets=' + Array.from(selectedItems).join(',');
            }
        }
        
        // 画面遷移関数
        // NOTE: goToApplicationList, goToRfqList, goToQuotationDataBox は
        // navigation.js のグローバル版を使用（PageNavigationHelper対応済み）

        function goToExecutionPendingList() {
            closeAllDropdowns();
            alert('執行待ち一覧画面に遷移します');
            // 実装: 執行待ち一覧画面へのナビゲーション
            // window.location.href = '/execution-pending-list';
        }
        
        function goToQuoteOCR() {
            closeAllDropdowns();
            alert('見積書AI-OCR画面に遷移します');
            // 実装: 見積書AI-OCR画面へのナビゲーション
            // window.location.href = '/quote-ocr';
        }

        // 資産マスタモーダル（共通ヘルパー使用）
        async function openAssetMasterModal() {
            selectedMasterItems.clear();

            // データ未読み込みの場合は読み込む
            if (searchResult_assetMasterData.length === 0) {
                console.log('Loading asset master data from JSON...');
                const loaded = await loadAssetMasterDataFromJSON();
                if (!loaded) {
                    alert('資産マスタデータの読み込みに失敗しました');
                    return;
                }
            }

            // 既存のChoices.jsインスタンスを先に破棄
            if (masterChoicesInstances) {
                Object.values(masterChoicesInstances).forEach(instance => {
                    if (instance) {
                        try {
                            instance.destroy();
                        } catch (e) {
                            console.log('Destroy error:', e);
                        }
                    }
                });
                masterChoicesInstances = null;
            }

            // モーダルを表示（直接制御）
            const modal = document.getElementById('assetMasterModal');
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';

                console.log('=== Asset Master Modal opened ===');
                console.log('Modal classes:', modal.className);

                // 少し遅延させてからドロップダウンの選択肢を生成とChoices.js初期化
                setTimeout(() => {
                    initModalContent();
                }, 150);
            } else {
                console.error('Asset Master Modal not found');
            }
        }

        // モーダルコンテンツ初期化（共通化）
        function initModalContent() {
            // 先にChoices.jsを初期化（空の状態で）
            console.log('Initializing Choices.js...');
            masterChoicesInstances = initMasterChoices();
            console.log('masterChoicesInstances created:', masterChoicesInstances);

            // 次にデータを取得して選択肢を設定
            console.log('Populating dropdowns...');
            populateMasterDropdowns();

            // 初期表示（全件表示）
            filteredMasterData = [...searchResult_assetMasterData];
            renderAssetMasterTable();

            updateMasterSelectionInfo();

            // 申請入力フォームの初期化
            renderAssetQuantityForm();
            initializeFacilityOptions();
        }

        // 資産マスタデータをJSONから読み込む
        async function loadAssetMasterDataFromJSON() {
            try {
                const cacheBuster = new Date().getTime();
                const response = await fetch(`src/data/asset-master.json?v=${cacheBuster}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                searchResult_assetMasterData = data.assets.map(asset => ({
                    id: asset.id,
                    category: asset.category,
                    largeClass: asset.largeClass,
                    mediumClass: asset.mediumClass,
                    individualItem: asset.item,
                    maker: asset.manufacturer,
                    model: asset.model
                }));
                filteredMasterData = [...searchResult_assetMasterData];
                console.log(`資産マスタ読み込み完了: ${searchResult_assetMasterData.length}件`);
                return true;
            } catch (error) {
                console.error('資産マスタの読み込みに失敗:', error);
                return false;
            }
        }

        function closeAssetMasterModal() {
            // Choices.jsインスタンスを破棄
            if (masterChoicesInstances) {
                Object.values(masterChoicesInstances).forEach(instance => {
                    if (instance) {
                        try {
                            instance.destroy();
                        } catch (e) {
                            console.log('Destroy error:', e);
                        }
                    }
                });
                masterChoicesInstances = null;
            }

            // モーダルを閉じる（直接制御）
            const modal = document.getElementById('assetMasterModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        // モーダルの枠外クリックで閉じる（共通ヘルパー使用時は不要、後方互換性のため残存）
        function handleModalOutsideClick(event) {
            if (event.target.id === 'assetMasterModal') {
                closeAssetMasterModal();
            }
        }

        // 資産マスタのドロップダウン選択肢を生成
        function populateMasterDropdowns() {
            console.log('=== populateMasterDropdowns called (from JS) ===');
            console.log('searchResult_assetMasterData.length:', searchResult_assetMasterData.length);

            // 各項目のユニークな値を取得
            const categories = [...new Set(searchResult_assetMasterData.map(item => item.category))].sort();
            const largeClasses = [...new Set(searchResult_assetMasterData.map(item => item.largeClass))].sort();
            const mediumClasses = [...new Set(searchResult_assetMasterData.map(item => item.mediumClass))].sort();
            const individualItems = [...new Set(searchResult_assetMasterData.map(item => item.individualItem))].sort();
            const makers = [...new Set(searchResult_assetMasterData.map(item => item.maker))].sort();
            const models = [...new Set(searchResult_assetMasterData.map(item => item.model))].sort();

            console.log('categories:', categories);
            console.log('largeClasses:', largeClasses);

            // 各ドロップダウンに選択肢を追加
            populateSelect('masterCategory', categories);
            populateSelect('masterLargeClass', largeClasses);
            populateSelect('masterMediumClass', mediumClasses);
            populateSelect('masterIndividualItem', individualItems);
            populateSelect('masterMaker', makers);
            populateSelect('masterModel', models);

            // Choices.jsインスタンスが存在する場合は選択肢を更新
            if (masterChoicesInstances) {
                updateChoicesOptions('masterCategory', categories);
                updateChoicesOptions('masterLargeClass', largeClasses);
                updateChoicesOptions('masterMediumClass', mediumClasses);
                updateChoicesOptions('masterIndividualItem', individualItems);
                updateChoicesOptions('masterMaker', makers);
                updateChoicesOptions('masterModel', models);
            }
        }

        // Choices.jsの選択肢を更新する関数
        function updateChoicesOptions(selectId, options) {
            console.log(`updateChoicesOptions called for ${selectId}, options: ${options.length}`);

            if (!masterChoicesInstances) {
                console.error('masterChoicesInstances is null');
                return;
            }

            if (!masterChoicesInstances[selectId]) {
                console.error(`masterChoicesInstances[${selectId}] is null`);
                return;
            }

            const instance = masterChoicesInstances[selectId];

            try {
                // clearStoreの代わりにclearChoicesを使用
                instance.clearChoices();
                const choices = [{ value: '', label: '全て', selected: true }].concat(
                    options.map(v => ({ value: v, label: v }))
                );
                instance.setChoices(choices, 'value', 'label', true);
                console.log(`Successfully updated ${selectId} with ${options.length} options`);
            } catch (e) {
                console.error(`Error updating choices for ${selectId}:`, e);
            }
        }

        // selectタグに選択肢を追加
        function populateSelect(selectId, options) {
            const select = document.getElementById(selectId);
            if (!select) return;

            // 既存のオプション（「全て」以外）をクリア
            while (select.options.length > 1) {
                select.remove(1);
            }

            // 新しいオプションを追加
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });
        }

        // フィルタリング実行
        function filterAssetMasterTable() {
            const category = document.getElementById('masterCategory')?.value || '';
            const largeClass = document.getElementById('masterLargeClass')?.value || '';
            const mediumClass = document.getElementById('masterMediumClass')?.value || '';
            const individualItem = document.getElementById('masterIndividualItem')?.value || '';
            const maker = document.getElementById('masterMaker')?.value || '';
            const model = document.getElementById('masterModel')?.value || '';

            console.log('Filtering with:', { category, largeClass, mediumClass, individualItem, maker, model });

            // プルダウンフィルター
            filteredMasterData = searchResult_assetMasterData.filter(item => {
                return (!category || item.category === category) &&
                       (!largeClass || item.largeClass === largeClass) &&
                       (!mediumClass || item.mediumClass === mediumClass) &&
                       (!individualItem || item.individualItem === individualItem) &&
                       (!maker || item.maker === maker) &&
                       (!model || item.model === model);
            });

            console.log('Filtered results:', filteredMasterData.length);
            renderAssetMasterTable();
        }

        // テーブル描画（単一選択仕様では不要 - 安全な実装）
        function renderAssetMasterTable() {
            const tbody = document.getElementById('assetMasterTableBody');
            const resultCount = document.getElementById('assetMasterResultCount');

            // テーブル要素が存在しない場合は何もしない（単一選択仕様では削除済み）
            if (!tbody || !resultCount) {
                return;
            }

            if (filteredMasterData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">検索結果がありません</td></tr>';
                resultCount.textContent = '0件';
                return;
            }

            resultCount.textContent = `${filteredMasterData.length}件`;

            // 単一選択のため、ラジオボタン形式で表示
            const selectedId = selectedMasterItems.size > 0 ? Array.from(selectedMasterItems)[0] : null;

            tbody.innerHTML = filteredMasterData.map(asset => `
                <tr style="cursor: pointer; ${selectedId === asset.id ? 'background: #e8f5e9;' : ''}"
                    onmouseover="if(${selectedId !== asset.id}) this.style.background='#f8f9fa'"
                    onmouseout="if(${selectedId !== asset.id}) this.style.background='white'"
                    onclick="handleMasterRowSelect(${asset.id})">
                    <td style="padding: 10px; text-align: center;">
                        <input type="radio" name="assetMasterRadio" value="${asset.id}"
                               ${selectedId === asset.id ? 'checked' : ''}
                               onchange="handleMasterRowSelect(${asset.id})">
                    </td>
                    <td style="padding: 8px;">${asset.category}</td>
                    <td style="padding: 8px;">${asset.largeClass}</td>
                    <td style="padding: 8px;">${asset.mediumClass}</td>
                    <td style="padding: 8px;"><strong>${asset.individualItem}</strong></td>
                    <td style="padding: 8px;">${asset.maker}</td>
                    <td style="padding: 8px;">${asset.model}</td>
                </tr>
            `).join('');
        }

        // 行選択（単一選択）
        function handleMasterRowSelect(id) {
            // 既に選択されている場合は選択解除
            if (selectedMasterItems.has(id)) {
                selectedMasterItems.clear();
            } else {
                // 他の選択を解除して、新しく選択
                selectedMasterItems.clear();
                selectedMasterItems.add(id);
            }
            updateMasterSelectionInfo();
            renderAssetQuantityForm();
            renderAssetMasterTable(); // テーブルを再描画して選択状態を反映
        }



        // 選択解除
        function removeSelectedAsset(id) {
            selectedMasterItems.clear();
            updateMasterSelectionInfo();
            renderAssetMasterTable();
            renderAssetQuantityForm();
        }

        // フィルタークリア
        function resetMasterFilter() {
            document.getElementById('masterCategory').value = '';
            document.getElementById('masterLargeClass').value = '';
            document.getElementById('masterMediumClass').value = '';
            document.getElementById('masterIndividualItem').value = '';
            document.getElementById('masterMaker').value = '';
            document.getElementById('masterModel').value = '';

            // Choices.jsインスタンスもリセット
            if (masterChoicesInstances) {
                Object.values(masterChoicesInstances).forEach(instance => {
                    if (instance) {
                        instance.setChoiceByValue('');
                    }
                });
            }
        }

        // プルダウンから選択した内容を選択済みリストに追加
        let assetIdCounter = 10000; // 新規追加用のID

        function addSelectedAssetFromDropdowns() {
            // プルダウンの値を取得（getValue(true)で文字列として取得）
            const category = masterChoicesInstances?.masterCategory?.getValue(true) || '';
            const largeClass = masterChoicesInstances?.masterLargeClass?.getValue(true) || '';
            const mediumClass = masterChoicesInstances?.masterMediumClass?.getValue(true) || '';
            const maker = masterChoicesInstances?.masterMaker?.getValue(true) || '';
            const model = masterChoicesInstances?.masterModel?.getValue(true) || '';

            // 個体管理品目：選択値 or 入力中の値（フリー入力対応）
            let individualItem = masterChoicesInstances?.masterIndividualItem?.getValue(true) || '';

            // 値が空または「全て」の場合、入力フィールドの値をチェック（フリー入力対応）
            if (!individualItem || individualItem === '全て') {
                const inputElement = masterChoicesInstances?.masterIndividualItem?.input?.element;
                const inputValue = inputElement?.value?.trim();
                if (inputValue) {
                    // 入力値をChoices.jsに選択肢として追加
                    masterChoicesInstances.masterIndividualItem.setChoices([
                        { value: inputValue, label: inputValue, selected: true }
                    ], 'value', 'label', false);
                    individualItem = inputValue;
                }
            }

            // 個体管理品目は必須（プレースホルダー値も除外）
            if (!individualItem || individualItem === '全て') {
                alert('個体管理品目を入力してください');
                return;
            }

            // 新しい資産オブジェクトを作成
            const newAsset = {
                id: assetIdCounter++,
                category: category || '未設定',
                largeClass: largeClass || '未設定',
                mediumClass: mediumClass || '未設定',
                individualItem: individualItem,
                maker: maker || '未設定',
                model: model || '未設定'
            };

            // 資産マスタデータに追加
            searchResult_assetMasterData.push(newAsset);

            // 複数選択：選択リストに追加
            selectedMasterItems.add(newAsset.id);

            // 表示を更新
            updateMasterSelectionInfo();
            renderAssetQuantityForm();

            // プルダウンをクリア
            resetMasterFilter();
        }

        // 選択した条件で資産を追加
        function addSelectedAsset() {
            const category = document.getElementById('masterCategory').value;
            const largeClass = document.getElementById('masterLargeClass').value;
            const mediumClass = document.getElementById('masterMediumClass').value;
            const individualItem = document.getElementById('masterIndividualItem').value;
            const maker = document.getElementById('masterMaker').value;
            const model = document.getElementById('masterModel').value;

            // 条件に合致する資産を検索
            const matchedAssets = searchResult_assetMasterData.filter(item => {
                return (!category || item.category === category) &&
                       (!largeClass || item.largeClass === largeClass) &&
                       (!mediumClass || item.mediumClass === mediumClass) &&
                       (!individualItem || item.individualItem === individualItem) &&
                       (!maker || item.maker === maker) &&
                       (!model || item.model === model);
            });

            // 条件が何も選択されていない場合
            if (!category && !largeClass && !mediumClass && !individualItem && !maker && !model) {
                alert('少なくとも1つの条件を選択してください');
                return;
            }

            // 複数該当した場合
            if (matchedAssets.length > 1) {
                alert(`${matchedAssets.length}件の資産が該当します。より詳細な条件を設定してください`);
                return;
            }

            // 該当なし
            if (matchedAssets.length === 0) {
                alert('該当する資産がありません');
                return;
            }

            // 1件該当：選択済みリストに追加（単一選択のため既存を置き換え）
            const asset = matchedAssets[0];

            // 既に同じ資産が選択されている場合
            if (selectedMasterItems.has(asset.id)) {
                alert('この資産は既に選択されています');
                return;
            }

            // 単一選択のため、既存の選択をクリアして新しく追加
            selectedMasterItems.clear();
            selectedMasterItems.add(asset.id);
            updateMasterSelectionInfo();
            renderAssetQuantityForm();
        }

        // 資産マスタの選択情報更新
        function updateMasterSelectionInfo() {
            const info = document.getElementById('masterSelectionInfo');
            if (info) {
                info.textContent = `${selectedMasterItems.size}件選択中`;
            }
            // 要素が存在しない場合は何もしない（単一選択仕様では不要）
        }

        // 新規購入申請の実行
        function submitNewPurchase() {
            if (selectedMasterItems.size === 0) {
                alert('資産を選択してください');
                return;
            }
            
            alert(`${selectedMasterItems.size}件の資産マスタから新規購入申請を行います`);
            closeAssetMasterModal();
        }
        
        // 数量設定フォームをレンダリング（複数資産用）
        function renderAssetQuantityForm() {
            const container = document.getElementById('assetQuantityForm');
            if (!container) return;

            if (selectedMasterItems.size === 0) {
                container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">資産が選択されていません</p>';
                return;
            }

            // 選択された資産を取得
            const selectedAssets = Array.from(selectedMasterItems).map(id =>
                searchResult_assetMasterData.find(a => a.id === id)
            ).filter(a => a);

            if (selectedAssets.length === 0) {
                container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">資産が選択されていません</p>';
                return;
            }

            // テーブル形式で表示
            container.innerHTML = `
                <div style="background: white; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #34495e; color: white;">
                                <th style="padding: 12px; text-align: left; font-size: 13px;">品目</th>
                                <th style="padding: 12px; text-align: left; font-size: 13px; width: 200px;">メーカー/型式</th>
                                <th style="padding: 12px; text-align: center; font-size: 13px; width: 120px;">数量 <span class="required">*</span></th>
                                <th style="padding: 12px; text-align: center; font-size: 13px; width: 100px;">単位 <span class="required">*</span></th>
                                <th style="padding: 12px; text-align: center; font-size: 13px; width: 60px;">削除</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selectedAssets.map((asset, index) => `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 12px;">
                                        <div style="font-weight: 600; color: #2c3e50; margin-bottom: 4px;">${asset.individualItem}</div>
                                        <div style="font-size: 11px; color: #7f8c8d;">${asset.category} > ${asset.largeClass}</div>
                                    </td>
                                    <td style="padding: 12px; font-size: 12px; color: #34495e;">
                                        ${asset.maker} / ${asset.model}
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <input type="number" id="assetQuantity_${asset.id}" value="1" min="1" max="999"
                                               style="width: 80px; padding: 6px; border: 1px solid #ccc; border-radius: 4px; text-align: center;">
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <select id="assetUnit_${asset.id}" style="width: 70px; padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
                                            <option value="台" selected>台</option>
                                            <option value="式">式</option>
                                            <option value="個">個</option>
                                        </select>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <button onclick="removeAssetFromSelection(${asset.id})"
                                                style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // 選択リストから資産を削除
        function removeAssetFromSelection(assetId) {
            selectedMasterItems.delete(assetId);
            updateMasterSelectionInfo();
            renderAssetQuantityForm();
        }

        // 設置情報の選択肢を初期化
        function initializeFacilityOptions() {
            // 施設マスタデータ（サンプル）
            const buildingOptions = ['本館', '新館', '東棟', '西棟', '診療棟'];
            const divisionOptions = ['内科', '外科', '手術部', '放射線科', '検査科', '薬剤部', '事務部'];
            const sectionOptions = {
                '内科': ['循環器内科', '消化器内科', '呼吸器内科'],
                '外科': ['一般外科', '整形外科', '脳神経外科'],
                '手術部': ['中央手術室', 'ICU', 'HCU'],
                '放射線科': ['X線撮影室', 'CT室', 'MRI室'],
                '検査科': ['検体検査室', '生理検査室', '病理検査室']
            };
            const roomRangeOptions = {
                '循環器内科': ['外来診察室', '病棟', '処置室'],
                '中央手術室': ['手術室1', '手術室2', '手術室3', 'リカバリー室']
            };

            // 棟の選択肢を設定
            const buildingSelect = document.getElementById('building');
            buildingSelect.innerHTML = '<option value="">選択してください</option>' +
                buildingOptions.map(b => `<option value="${b}">${b}</option>`).join('');

            // 部門の選択肢を設定
            const divisionSelect = document.getElementById('division');
            divisionSelect.innerHTML = '<option value="">選択してください</option>' +
                divisionOptions.map(d => `<option value="${d}">${d}</option>`).join('');
        }

        // 部門選択時に部署の選択肢を更新
        function updateSectionOptions() {
            const division = document.getElementById('division').value;
            const sectionSelect = document.getElementById('section');
            const roomRangeSelect = document.getElementById('roomRange');

            const sectionOptions = {
                '内科': ['循環器内科', '消化器内科', '呼吸器内科'],
                '外科': ['一般外科', '整形外科', '脳神経外科'],
                '手術部': ['中央手術室', 'ICU', 'HCU'],
                '放射線科': ['X線撮影室', 'CT室', 'MRI室'],
                '検査科': ['検体検査室', '生理検査室', '病理検査室']
            };

            if (division && sectionOptions[division]) {
                sectionSelect.innerHTML = '<option value="">選択してください</option>' +
                    sectionOptions[division].map(s => `<option value="${s}">${s}</option>`).join('');
            } else {
                sectionSelect.innerHTML = '<option value="">選択してください</option>';
            }

            roomRangeSelect.innerHTML = '<option value="">選択してください</option>';
        }

        // 部署選択時に諸室名範囲の選択肢を更新
        function updateRoomRangeOptions() {
            const section = document.getElementById('section').value;
            const roomRangeSelect = document.getElementById('roomRange');

            const roomRangeOptions = {
                '循環器内科': ['外来診察室', '病棟', '処置室'],
                '中央手術室': ['手術室1', '手術室2', '手術室3', 'リカバリー室'],
                'X線撮影室': ['一般撮影室', 'ポータブル撮影室', 'TV撮影室'],
                'CT室': ['CT1号機室', 'CT2号機室', '操作室']
            };

            if (section && roomRangeOptions[section]) {
                roomRangeSelect.innerHTML = '<option value="">選択してください</option>' +
                    roomRangeOptions[section].map(r => `<option value="${r}">${r}</option>`).join('');
            } else {
                roomRangeSelect.innerHTML = '<option value="">選択してください</option>';
            }
        }

        // 棟選択時（現状は何もしないが、将来的な拡張用）
        function updateDepartmentOptions() {
            // 必要に応じて棟ごとに部門を絞り込む処理を追加
        }
        
        // 申請種別を指定して申請入力モーダルを開く
        function openApplicationInputModalWithType(applicationType) {
            if (selectedItems.size === 0) {
                alert('資産を選択してください');
                return;
            }

            const modal = document.getElementById('applicationInputModal');

            // モーダルが存在しない場合（削除済み）
            if (!modal) {
                alert('この機能は現在利用できません');
                return;
            }

            // 申請種別を設定
            const titleElement = document.getElementById('applicationTypeTitle');
            const typeElement = document.getElementById('appType');
            if (titleElement) titleElement.textContent = applicationType;
            if (typeElement) typeElement.value = applicationType;

            // 現在の日付を設定
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const dateElement = document.getElementById('appDate');
            if (dateElement) dateElement.value = dateStr;

            // 選択された資産を表示（資産リストから選択されたもの）
            displaySelectedAssetsFromList();

            // 見積書フォームを初期化（1つ追加）
            quotationCount = 0;
            const quotationList = document.getElementById('quotationList');
            if (quotationList) {
                quotationList.innerHTML = '';
                addQuotationForm();
            }

            modal.classList.add('active');
        }
        
        function displaySelectedAssetsFromList() {
            const container = document.getElementById('selectedAssetsDisplay');

            // 要素が存在しない場合は何もしない
            if (!container) return;

            // サンプルデータから選択された資産を取得
            const selectedAssets = sampleData.filter(item => selectedItems.has(item.no));

            container.innerHTML = selectedAssets.map(asset => `
                <div class="selected-asset-display">
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-detail">
                        資産番号: No.${asset.no} / メーカー: ${asset.maker} / 型式: ${asset.model}<br>
                        設置場所: ${asset.building} ${asset.floor} ${asset.department} ${asset.section}
                    </div>
                </div>
            `).join('');
        }


        function displaySelectedAssets() {
            const container = document.getElementById('selectedAssetsDisplay');

            // 要素が存在しない場合は何もしない
            if (!container) return;

            const selectedAssets = searchResult_assetMasterData.filter(item => selectedMasterItems.has(item.id));

            container.innerHTML = selectedAssets.map(asset => `
                <div class="selected-asset-display">
                    <div class="asset-name">${asset.individualItem}</div>
                    <div class="asset-detail">
                        メーカー: ${asset.maker} / 型式: ${asset.model}<br>
                        分類: ${asset.category} > ${asset.largeClass} > ${asset.mediumClass}
                    </div>
                </div>
            `).join('');
        }
        
        function addQuotationForm() {
            quotationCount++;
            const quotationList = document.getElementById('quotationList');
            
            const quotationHtml = `
                <div class="quotation-item" id="quotation${quotationCount}">
                    <div class="quotation-item-header">
                        <div class="quotation-item-title">見積書${quotationCount}</div>
                        <button class="quotation-remove-btn" onclick="removeQuotation(${quotationCount})">削除</button>
                    </div>
                    <div class="quotation-fields">
                        <div>
                            <label style="font-size: 12px; color: #555; margin-bottom: 5px; display: block;">業者名 <span style="color: #e74c3c;">*</span></label>
                            <input type="text" id="vendor${quotationCount}" placeholder="例: ◯◯メディカル">
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #555; margin-bottom: 5px; display: block;">見積金額（円） <span style="color: #e74c3c;">*</span></label>
                            <input type="number" id="amount${quotationCount}" placeholder="例: 8500000">
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #555; margin-bottom: 5px; display: block;">型式</label>
                            <input type="text" id="model${quotationCount}" placeholder="例: US-3000X">
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #555; margin-bottom: 5px; display: block;">納期</label>
                            <input type="date" id="delivery${quotationCount}">
                        </div>
                        <div class="full-width">
                            <label style="font-size: 12px; color: #555; margin-bottom: 5px; display: block;">見積書ファイル <span style="color: #e74c3c;">*</span></label>
                            <div class="quotation-file-input">
                                <input type="file" id="file${quotationCount}" accept=".pdf,.jpg,.jpeg,.png" onchange="handleFileSelect(${quotationCount})">
                                <span class="quotation-file-name" id="fileName${quotationCount}"></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            quotationList.insertAdjacentHTML('beforeend', quotationHtml);
        }
        
        function removeQuotation(id) {
            const quotationItem = document.getElementById(`quotation${id}`);
            if (quotationItem) {
                quotationItem.remove();
            }
        }
        
        function handleFileSelect(id) {
            const fileInput = document.getElementById(`file${id}`);
            const fileNameSpan = document.getElementById(`fileName${id}`);
            
            if (fileInput.files.length > 0) {
                fileNameSpan.textContent = fileInput.files[0].name;
            } else {
                fileNameSpan.textContent = '';
            }
        }
        
        
        function saveDraft() {
            alert('下書きとして保存しました');
            // 実装: 下書き保存処理
        }
        
        function submitApplication() {
            // 資産選択チェック
            if (selectedMasterItems.size === 0) {
                alert('資産を選択してください');
                return;
            }

            // 選択された資産を取得
            const selectedAssets = Array.from(selectedMasterItems).map(id =>
                searchResult_assetMasterData.find(a => a.id === id)
            ).filter(a => a);

            if (selectedAssets.length === 0) {
                alert('資産情報が見つかりません');
                return;
            }

            // 各資産の数量・単位をバリデーション
            for (const asset of selectedAssets) {
                const quantity = document.getElementById(`assetQuantity_${asset.id}`)?.value;
                const unit = document.getElementById(`assetUnit_${asset.id}`)?.value;

                if (!quantity || parseInt(quantity) < 1) {
                    alert(`${asset.individualItem}の数量は1以上で入力してください`);
                    return;
                }
            }

            // 設置情報の取得（任意項目、全資産共通）
            const building = document.getElementById('building').value;
            const division = document.getElementById('division').value;
            const section = document.getElementById('section').value;
            const roomRange = document.getElementById('roomRange').value;
            const roomName = document.getElementById('roomName').value || '';
            const freeInput = document.getElementById('freeInput').value || '';
            const executionYear = document.getElementById('executionYear').value || '';

            // 申請内容の確認
            const assetList = selectedAssets.map(asset => {
                const quantity = document.getElementById(`assetQuantity_${asset.id}`)?.value;
                const unit = document.getElementById(`assetUnit_${asset.id}`)?.value;
                return `・${asset.individualItem} (${asset.maker}) × ${quantity}${unit}`;
            }).join('\n');

            const confirmMessage = `以下の内容で新規購入申請を提出します:\n\n` +
                `【資産情報】(${selectedAssets.length}件)\n` +
                `${assetList}\n\n` +
                `【設置先】\n` +
                `${building} ${division} ${section} ${roomRange}\n\n` +
                `※申請一覧では資産ごとに${selectedAssets.length}件のレコードが作成されます。\n\n` +
                `よろしいですか？`;

            if (confirm(confirmMessage)) {
                // 申請一覧にデータを追加
                if (typeof window.applicationListData !== 'undefined') {
                    const today = new Date();
                    const dateStr = today.toISOString().split('T')[0];
                    const createdApplications = [];

                    // 各資産ごとに個別の申請レコードを作成
                    selectedAssets.forEach((asset, index) => {
                        const quantity = document.getElementById(`assetQuantity_${asset.id}`)?.value;
                        const unit = document.getElementById(`assetUnit_${asset.id}`)?.value;
                        const appNo = window.IdGenerator.generateRandomApplicationNo('REQ');

                        const newApplication = {
                            id: window.applicationListData.length + 1 + index,
                            applicationNo: appNo,
                            applicationDate: dateStr,
                            applicationType: '新規購入申請',
                            asset: {
                                name: asset.individualItem,
                                model: asset.model
                            },
                            vendor: '未設定',
                            quantity: `${quantity}${unit}`,
                            rfqNo: '',
                            status: '下書き',
                            approvalProgress: {
                                current: 0,
                                total: 3
                            },
                            facility: {
                                building: building || '',
                                floor: '',
                                department: division || '',
                                section: section || ''
                            },
                            freeInput: freeInput,
                            executionYear: executionYear
                        };

                        window.applicationListData.push(newApplication);
                        createdApplications.push(newApplication);
                        console.log('申請一覧に追加しました:', newApplication);
                    });

                    const appNos = createdApplications.map(app => app.applicationNo).join(', ');
                    alert(`申請が提出されました\n\n作成された申請: ${selectedAssets.length}件\n申請番号: ${appNos}`);
                }

                closeAssetMasterModal();

                // 選択をクリア
                selectedMasterItems.clear();
            }
        }

        // 印刷
        function handlePrint() {
            window.print();
        }

        // 戻る
        function handleBack() {
            if (typeof handleBackFromSearchResult === 'function') {
                handleBackFromSearchResult();
            } else {
                // フォールバック
                document.getElementById('searchResultPage').classList.remove('active');
                document.getElementById('mainContainer').classList.add('active');
            }
        }



// ========================================
// 資産検索結果画面の初期化関数
// ========================================
let searchResultPageInitialized = false;

async function initSearchResultPage() {
    console.log('=== Initializing search result page ===');

    // DOM要素の存在確認
    const tbody = document.getElementById('tableBody');
    const filterBuilding = document.getElementById('filterBuilding');

    if (!tbody || !filterBuilding) {
        setTimeout(initSearchResultPage, 100);
        return;
    }

    // マスタデータ読み込み（初回のみ）
    if (!searchResultPageInitialized) {
        try {
            await loadSearchResultMasterData();
        } catch (e) {
            console.error('Master data load failed:', e);
        }
    }

    // フィルター初期化（毎回実行）
    if (typeof window.initSearchResultChoices === 'function') {
        try {
            window.initSearchResultChoices();
        } catch (e) {
            console.error('Filter initialization failed:', e.message);
        }
    }

    // リスト・カード表示レンダリング
    if (typeof renderListView === 'function') {
        renderListView();
    }
    if (typeof renderCardView === 'function') {
        renderCardView();
    }

    searchResultPageInitialized = true;
    console.log('=== Initialization complete ===');
}

/**
 * 資産詳細画面を表示
 * @param {Object} asset - 資産データ
 */
function showAssetDetail(asset) {
    console.log('[SearchResult] Showing asset detail:', asset);

    // 詳細画面に遷移
    PageNavigationHelper.showPage('assetDetailPage', () => {
        initAssetDetailPage(asset);
    });
}

// グローバルに公開
window.initSearchResultPage = initSearchResultPage;
window.editSelectedAssetItem = editSelectedAssetItem;
window.addSelectedAssetFromDropdowns = addSelectedAssetFromDropdowns;
window.resetMasterFilter = resetMasterFilter;
window.removeAssetFromSelection = removeAssetFromSelection;
window.showAssetDetail = showAssetDetail;
