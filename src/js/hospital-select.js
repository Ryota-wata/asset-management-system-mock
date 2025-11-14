/**
 * 病院選択機能
 * 個別施設マスタ用の病院選択モーダル
 */


/**
 * 病院選択モーダルを表示
 */
function showHospitalSelectModal() {
    const modal = document.getElementById('hospitalSelectModal');
    if (modal) {
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
