/**
 * 病院選択機能
 * 個別施設マスタ用の病院選択モーダル
 */

// 施設マスタデータ
let hospitalListData = [];

/**
 * 病院選択モーダルを表示
 */
async function showHospitalSelectModal() {
    const modal = document.getElementById('hospitalSelectModal');
    if (modal) {
        // 施設マスタデータを読み込み
        await loadHospitalListData();

        // テーブルに反映
        renderHospitalTable();

        modal.classList.add('show');
        // 検索入力をクリア
        const searchInput = document.getElementById('hospitalSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        // 全病院を表示
        filterHospitalList();
    }
}

/**
 * 施設マスタからユニークな病院リストを取得
 */
async function loadHospitalListData() {
    try {
        const facilityMaster = await window.loadFacilityMaster();
        if (!facilityMaster || !facilityMaster.facilities) {
            console.error('施設マスタデータの取得に失敗しました');
            return;
        }

        // facilityCodeごとにユニークな施設を抽出
        const uniqueFacilities = new Map();
        facilityMaster.facilities.forEach(facility => {
            if (!uniqueFacilities.has(facility.facilityCode)) {
                uniqueFacilities.set(facility.facilityCode, {
                    code: facility.facilityCode,
                    name: facility.facilityName,
                    department: facility.department || '',
                    section: facility.section || '',
                    beds: '-' // 病床規模はfacility-master.jsonに含まれていないためダミー
                });
            }
        });

        hospitalListData = Array.from(uniqueFacilities.values());
        console.log('病院リストデータを読み込みました:', hospitalListData.length, '件');
    } catch (error) {
        console.error('施設マスタの読み込みに失敗:', error);
        hospitalListData = [];
    }
}

/**
 * 病院テーブルを動的に生成
 */
function renderHospitalTable() {
    const tbody = document.getElementById('hospitalTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    hospitalListData.forEach((hospital, index) => {
        const tr = document.createElement('tr');

        // 施設コード
        const tdCode = document.createElement('td');
        tdCode.textContent = hospital.code;
        tr.appendChild(tdCode);

        // 施設名
        const tdName = document.createElement('td');
        tdName.textContent = hospital.name;
        tr.appendChild(tdName);

        // 部門
        const tdDepartment = document.createElement('td');
        tdDepartment.textContent = hospital.department || '-';
        tr.appendChild(tdDepartment);

        // 部署
        const tdSection = document.createElement('td');
        tdSection.textContent = hospital.section || '-';
        tr.appendChild(tdSection);

        // 操作ボタン
        const tdAction = document.createElement('td');
        const button = document.createElement('button');
        button.className = 'asset-master-select-btn';
        button.textContent = '選択';
        button.onclick = () => selectHospital(hospital.code, hospital.name);
        tdAction.appendChild(button);
        tr.appendChild(tdAction);

        tbody.appendChild(tr);
    });

    // 件数表示を更新
    updateHospitalCount(hospitalListData.length);
}

/**
 * 病院件数を更新
 * @param {number} count - 件数
 */
function updateHospitalCount(count) {
    const pageInfo = document.querySelector('#hospitalSelectModal .asset-master-page-info');
    if (pageInfo) {
        pageInfo.textContent = `全 ${count} 件`;
    }
}

/**
 * 病院選択モーダルを閉じる
 */
function closeHospitalSelectModal() {
    const modal = document.getElementById('hospitalSelectModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * 病院リストをフィルタリング（テーブル形式）
 */
function filterHospitalList() {
    const searchInput = document.getElementById('hospitalSearchInput');
    const tableBody = document.getElementById('hospitalTableBody');
    const rows = tableBody?.querySelectorAll('tr');

    if (!searchInput || !rows) return;

    const searchTerm = searchInput.value.toLowerCase();
    let visibleCount = 0;

    rows.forEach(row => {
        // 各セルのテキストを取得
        const cells = row.querySelectorAll('td');
        let rowText = '';
        cells.forEach(cell => {
            rowText += cell.textContent + ' ';
        });

        // 検索語が含まれているかチェック
        if (rowText.toLowerCase().includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // 件数表示を更新
    const pageInfo = document.querySelector('#hospitalSelectModal .asset-master-page-info');
    if (pageInfo) {
        pageInfo.textContent = `全 ${visibleCount} 件`;
    }
}

/**
 * 病院を選択して施設マスタ画面へ遷移
 * @param {string} hospitalId - 病院ID
 * @param {string} hospitalName - 病院名
 */
function selectHospital(hospitalId, hospitalName) {
    // モーダルを閉じる
    closeHospitalSelectModal();

    // 施設マスタ画面へ遷移
    goToFacilityMaster(hospitalId, hospitalName);
}

/**
 * 施設マスタ画面へ遷移
 * @param {string} hospitalId - 病院ID
 * @param {string} hospitalName - 病院名
 */
function goToFacilityMaster(hospitalId, hospitalName) {
    console.log(`施設マスタ画面へ遷移: ${hospitalName} (ID: ${hospitalId})`);

    // 実際の実装では、施設マスタ画面への遷移処理を実装
    // 例: window.location.href = `/facility-master?hospitalId=${hospitalId}`;
    // または、SPAの場合は画面切り替え処理

    alert(`${hospitalName}の施設マスタ画面へ遷移します\n（画面はまだ実装されていません）`);
}

// モーダル外クリックで閉じる
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('hospitalSelectModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeHospitalSelectModal();
            }
        });
    }
});

// グローバルに公開
window.showHospitalSelectModal = showHospitalSelectModal;
window.closeHospitalSelectModal = closeHospitalSelectModal;
window.filterHospitalList = filterHospitalList;
window.selectHospital = selectHospital;
window.goToFacilityMaster = goToFacilityMaster;
