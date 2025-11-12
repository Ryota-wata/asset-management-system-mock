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
                height: 1400
            },
            {
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
                height: ''
            },
            // さらにデータを追加
            ...Array.from({length: 18}, (_, i) => ({
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

        // 資産マスタのサンプルデータ
        const searchResult_assetMasterData = [
            { id: 1, category: '医療機器', largeClass: '画像診断機器', mediumClass: 'CT関連', individualItem: 'CT装置', maker: 'GEヘルスケア', model: 'Revolution CT' },
            { id: 2, category: '医療機器', largeClass: '画像診断機器', mediumClass: 'MRI関連', individualItem: 'MRI装置', maker: 'シーメンス', model: 'MAGNETOM Vida' },
            { id: 3, category: '医療機器', largeClass: '手術機器', mediumClass: '電気メス', individualItem: '電気メス', maker: 'オリンパス', model: 'ESG-400' },
            { id: 4, category: '医療機器', largeClass: '手術機器', mediumClass: '手術台', individualItem: '手術台', maker: 'マッケ', model: 'Alphamaxx' },
            { id: 5, category: '医療機器', largeClass: '検査機器', mediumClass: '超音波', individualItem: '超音波診断装置', maker: 'キヤノンメディカル', model: 'Aplio i800' },
            { id: 6, category: '医療機器', largeClass: '検査機器', mediumClass: '心電図', individualItem: '心電計', maker: 'フクダ電子', model: 'FCP-8800' },
            { id: 7, category: '医療機器', largeClass: '生命維持装置', mediumClass: '人工呼吸器', individualItem: '人工呼吸器', maker: 'ドレーゲル', model: 'Evita V800' },
            { id: 8, category: '医療機器', largeClass: '生命維持装置', mediumClass: '透析装置', individualItem: '透析装置', maker: '日機装', model: 'DCS-200Si' },
            { id: 9, category: '什器備品', largeClass: '事務機器', mediumClass: '複合機', individualItem: '複合機', maker: 'リコー', model: 'IM C6000' },
            { id: 10, category: '什器備品', largeClass: '事務機器', mediumClass: 'プリンター', individualItem: 'プリンター', maker: 'エプソン', model: 'PX-M886FL' },
            { id: 11, category: '医療機器', largeClass: '画像診断機器', mediumClass: 'X線', individualItem: 'X線撮影装置', maker: '富士フイルム', model: 'CALNEO Smart' },
            { id: 12, category: '医療機器', largeClass: '内視鏡', mediumClass: '内視鏡システム', individualItem: '内視鏡システム', maker: 'オリンパス', model: 'EVIS X1' },
            { id: 13, category: '医療機器', largeClass: '検査機器', mediumClass: '血液検査', individualItem: '血液分析装置', maker: 'シスメックス', model: 'XN-9000' },
            { id: 14, category: '医療機器', largeClass: '治療機器', mediumClass: 'レーザー', individualItem: 'レーザー治療器', maker: 'ルミナス', model: 'M22' },
            { id: 15, category: '什器備品', largeClass: '家具', mediumClass: 'ベッド', individualItem: '病院用ベッド', maker: 'パラマウントベッド', model: 'KA-9000' }
        ];

        let filteredMasterData = [...searchResult_assetMasterData];

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

        // 資産マスタ検索用のChoices.js初期化
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
            
            // ドロップダウンリストのスタイルを強制設定する関数
            function forceDropdownStyle(element, zIndex) {
                const choicesContainer = element.parentElement.querySelector('.choices');
                if (choicesContainer) {
                    const dropdown = choicesContainer.querySelector('.choices__list--dropdown');
                    if (dropdown) {
                        dropdown.style.position = 'absolute';
                        dropdown.style.zIndex = zIndex;
                        dropdown.style.backgroundColor = 'white';
                        dropdown.style.border = '1px solid #ccc';
                        dropdown.style.borderRadius = '4px';
                    }
                }
            }
            
            masterSelectIds.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    instances[id] = new Choices(element, {
                        searchEnabled: true,
                        shouldSort: false,
                        itemSelectText: '',
                        noResultsText: '該当なし',
                        placeholder: true,
                        placeholderValue: '全て',
                        searchPlaceholderValue: '検索...',
                        removeItemButton: false
                    });
                    
                    // ドロップダウンが開いたときに強制設定
                    element.addEventListener('showDropdown', () => {
                        setTimeout(() => {
                            forceDropdownStyle(element, zIndexMap[id]);
                        }, 10);
                    });
                    
                    // MutationObserverでドロップダウン要素の生成を監視
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            mutation.addedNodes.forEach((node) => {
                                if (node.classList && node.classList.contains('choices__list--dropdown')) {
                                    node.style.position = 'absolute';
                                    node.style.zIndex = zIndexMap[id];
                                    node.style.backgroundColor = 'white';
                                    node.style.border = '1px solid #ccc';
                                    node.style.borderRadius = '4px';
                                }
                            });
                        });
                    });
                    
                    const choicesContainer = element.parentElement.querySelector('.choices');
                    if (choicesContainer) {
                        observer.observe(choicesContainer, {
                            childList: true,
                            subtree: true
                        });
                    }
                    
                    // 初期設定
                    setTimeout(() => {
                        forceDropdownStyle(element, zIndexMap[id]);
                    }, 200);
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
                card.onclick = (e) => {
                    if (e.target.type !== 'checkbox') {
                        toggleCardSelection(item.no);
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

        // 全選択
        function handleSelectAll() {
            const selectAll = document.getElementById('selectAll');
            const checkboxes = document.querySelectorAll('.row-checkbox');
            
            checkboxes.forEach(cb => {
                cb.checked = selectAll.checked;
                const no = parseInt(cb.getAttribute('data-no'));
                if (selectAll.checked) {
                    selectedItems.add(no);
                } else {
                    selectedItems.delete(no);
                }
            });
            
            updateSelectionInfo();
            syncSelections();
        }

        // 行選択
        function handleRowSelect() {
            const checkboxes = document.querySelectorAll('.row-checkbox');
            const selectAll = document.getElementById('selectAll');
            
            selectedItems.clear();
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    selectedItems.add(parseInt(cb.getAttribute('data-no')));
                }
            });
            
            selectAll.checked = checkboxes.length === selectedItems.size;
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
        
        // ナビゲーションメニューの制御
        function toggleNavMenu() {
            const btn = document.querySelector('.nav-menu-btn');
            const menu = document.getElementById('navMenuDropdown');
            
            const isActive = menu.classList.contains('active');
            
            // 他のドロップダウンを閉じる
            closeAllDropdowns();
            
            // クリックしたメニューを開閉
            if (!isActive) {
                btn.classList.add('active');
                menu.classList.add('active');
            }
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
            document.getElementById('exportModal').classList.remove('active');
        }

        // Excel/PDF出力モーダルの枠外クリックで閉じる
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
            closeExportModal();
            toggleSidePanel();
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
        function goToApplicationList() {
            closeAllDropdowns();
            alert('申請一覧画面に遷移します');
            // 実装: 申請一覧画面へのナビゲーション
            // window.location.href = '/application-list';
        }
        
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

        // 資産マスタモーダル
        function openAssetMasterModal() {
            selectedMasterItems.clear();
            
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
            
            // モーダルを表示
            document.getElementById('assetMasterModal').classList.add('active');
            
            // 少し遅延させてからドロップダウンの選択肢を生成とChoices.js初期化
            setTimeout(() => {
                populateMasterDropdowns();
                masterChoicesInstances = initMasterChoices();
                updateMasterSelectionInfo();
            }, 150);
        }

        function closeAssetMasterModal() {
            document.getElementById('assetMasterModal').classList.remove('active');
            
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
        }

        // モーダルの枠外クリックで閉じる
        function handleModalOutsideClick(event) {
            if (event.target.id === 'assetMasterModal') {
                closeAssetMasterModal();
            }
        }

        // 資産マスタのドロップダウン選択肢を生成
        function populateMasterDropdowns() {
            // 各項目のユニークな値を取得
            const categories = [...new Set(searchResult_assetMasterData.map(item => item.category))].sort();
            const largeClasses = [...new Set(searchResult_assetMasterData.map(item => item.largeClass))].sort();
            const mediumClasses = [...new Set(searchResult_assetMasterData.map(item => item.mediumClass))].sort();
            const individualItems = [...new Set(searchResult_assetMasterData.map(item => item.individualItem))].sort();
            const makers = [...new Set(searchResult_assetMasterData.map(item => item.maker))].sort();
            const models = [...new Set(searchResult_assetMasterData.map(item => item.model))].sort();

            // 各ドロップダウンに選択肢を追加
            populateSelect('masterCategory', categories);
            populateSelect('masterLargeClass', largeClasses);
            populateSelect('masterMediumClass', mediumClasses);
            populateSelect('masterIndividualItem', individualItems);
            populateSelect('masterMaker', makers);
            populateSelect('masterModel', models);
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

            // 1件該当：追加
            const asset = matchedAssets[0];
            if (!selectedMasterItems.has(asset.id)) {
                selectedMasterItems.add(asset.id);
                renderSelectedAssets();
                updateMasterSelectionInfo();
            } else {
                alert('この資産は既に選択されています');
            }
        }

        // 選択済み資産を表示
        function renderSelectedAssets() {
            const container = document.getElementById('selectedAssetsList');
            
            if (selectedMasterItems.size === 0) {
                container.innerHTML = '<p style="color: #999; text-align: center;">資産が選択されていません</p>';
                return;
            }

            const selectedAssets = searchResult_assetMasterData.filter(item => selectedMasterItems.has(item.id));
            
            container.innerHTML = selectedAssets.map(asset => `
                <div class="selected-asset-card">
                    <div class="selected-asset-info">
                        <strong>${asset.individualItem}</strong> - ${asset.maker} ${asset.model}<br>
                        <small>${asset.category} > ${asset.largeClass} > ${asset.mediumClass}</small>
                    </div>
                    <button class="selected-asset-remove" onclick="removeSelectedAsset(${asset.id})">削除</button>
                </div>
            `).join('');
        }

        // 選択済み資産を削除
        function removeSelectedAsset(id) {
            selectedMasterItems.delete(id);
            renderSelectedAssets();
            updateMasterSelectionInfo();
        }

        // 資産マスタの全選択
        // 資産マスタの選択情報更新
        function updateMasterSelectionInfo() {
            const info = document.getElementById('masterSelectionInfo');
            info.textContent = `${selectedMasterItems.size}件選択中`;
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
        
        // 申請入力モーダルへ進む
        let quotationCount = 0;
        
        function proceedToApplicationInput() {
            if (selectedMasterItems.size === 0) {
                alert('資産を選択してください');
                return;
            }
            
            // 資産マスタモーダルを閉じる
            closeAssetMasterModal();
            
            // 申請入力モーダルを開く
            openApplicationInputModal();
        }
        
        function openApplicationInputModal() {
            const modal = document.getElementById('applicationInputModal');
            
            // 現在の日付を設定
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            document.getElementById('appDate').value = dateStr;
            
            // 選択された資産を表示
            displaySelectedAssets();
            
            // 見積書フォームを初期化（1つ追加）
            quotationCount = 0;
            document.getElementById('quotationList').innerHTML = '';
            addQuotationForm();
            
            modal.classList.add('active');
        }
        
        // 申請種別を指定して申請入力モーダルを開く
        function openApplicationInputModalWithType(applicationType) {
            if (selectedItems.size === 0) {
                alert('資産を選択してください');
                return;
            }
            
            const modal = document.getElementById('applicationInputModal');
            
            // 申請種別を設定
            document.getElementById('applicationTypeTitle').textContent = applicationType;
            document.getElementById('appType').value = applicationType;
            
            // 現在の日付を設定
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            document.getElementById('appDate').value = dateStr;
            
            // 選択された資産を表示（資産リストから選択されたもの）
            displaySelectedAssetsFromList();
            
            // 見積書フォームを初期化（1つ追加）
            quotationCount = 0;
            document.getElementById('quotationList').innerHTML = '';
            addQuotationForm();
            
            modal.classList.add('active');
        }
        
        function displaySelectedAssetsFromList() {
            const container = document.getElementById('selectedAssetsDisplay');
            
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
        
        function closeApplicationInputModal() {
            const modal = document.getElementById('applicationInputModal');
            modal.classList.remove('active');
            
            // フォームをリセット
            document.getElementById('appReason').value = '';
            document.getElementById('approver1').value = '';
            document.getElementById('approver2').value = '';
            document.getElementById('approver3').value = '';
            document.getElementById('quotationList').innerHTML = '';
        }
        
        function handleApplicationInputModalOutsideClick(event) {
            if (event.target.id === 'applicationInputModal') {
                if (confirm('入力内容が失われますが、閉じてもよろしいですか？')) {
                    closeApplicationInputModal();
                }
            }
        }
        
        function displaySelectedAssets() {
            const container = document.getElementById('selectedAssetsDisplay');
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
        
        function backToAssetSelection() {
            if (confirm('入力内容が失われますが、資産選択に戻ってもよろしいですか？')) {
                closeApplicationInputModal();
                openAssetMasterModal();
            }
        }
        
        function saveDraft() {
            alert('下書きとして保存しました');
            // 実装: 下書き保存処理
        }
        
        function submitApplication() {
            // バリデーション
            const reason = document.getElementById('appReason').value;
            const approver1 = document.getElementById('approver1').value;
            const approver2 = document.getElementById('approver2').value;
            const approver3 = document.getElementById('approver3').value;
            
            if (!reason) {
                alert('申請理由を入力してください');
                return;
            }
            
            if (!approver1 || !approver2 || !approver3) {
                alert('すべての承認者を選択してください');
                return;
            }
            
            // 見積書のチェック
            const quotationItems = document.querySelectorAll('.quotation-item');
            if (quotationItems.length === 0) {
                alert('少なくとも1つの見積書を追加してください');
                return;
            }
            
            let hasValidQuotation = false;
            quotationItems.forEach((item, index) => {
                const id = item.id.replace('quotation', '');
                const vendor = document.getElementById(`vendor${id}`)?.value;
                const amount = document.getElementById(`amount${id}`)?.value;
                const file = document.getElementById(`file${id}`)?.files[0];
                
                if (vendor && amount && file) {
                    hasValidQuotation = true;
                }
            });
            
            if (!hasValidQuotation) {
                alert('見積書の必須項目（業者名、金額、ファイル）を入力してください');
                return;
            }
            
            // 申請を提出
            if (confirm('申請を提出してもよろしいですか？')) {
                alert('申請が提出されました\n申請番号: REQ-2025-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
                closeApplicationInputModal();
                
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

// グローバルに公開
window.initSearchResultPage = initSearchResultPage;
