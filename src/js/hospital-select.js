/**
 * 病院選択機能
 * 個別施設マスタ用の病院選択モーダル
 */

/**
 * 個別施設マスタボタンクリック時の処理
 * ユーザー種別に応じて動線を分岐
 */
function handleFacilityMaster() {
    // ユーザー種別を判定（実際の実装ではセッションやAPIから取得）
    const userType = getUserType();

    if (userType === 'consultant') {
        // 医療コンサルユーザー：病院選択モーダルを表示
        showHospitalSelectModal();
    } else {
        // 病院ユーザー：直接、自病院の施設マスタ画面へ遷移
        const hospitalId = getCurrentHospitalId(); // セッションから取得
        const hospitalName = getCurrentHospitalName();
        goToFacilityMaster(hospitalId, hospitalName);
    }
}

/**
 * ユーザー種別を取得（モック用）
 * @returns {string} 'consultant' または 'hospital'
 */
function getUserType() {
    // 実際の実装ではセッションストレージやAPIから取得
    // モックでは、consultant-onlyボタンの表示状態で判定
    const consultantButtons = document.querySelectorAll('.consultant-only');
    return consultantButtons.length > 0 && consultantButtons[0].offsetParent !== null
        ? 'consultant'
        : 'hospital';
}

/**
 * 現在ログイン中の病院IDを取得（モック用）
 * @returns {string} 病院ID
 */
function getCurrentHospitalId() {
    // 実際の実装ではセッションから取得
    return 'hospital1';
}

/**
 * 現在ログイン中の病院名を取得（モック用）
 * @returns {string} 病院名
 */
function getCurrentHospitalName() {
    // 実際の実装ではセッションから取得
    return 'A総合病院';
}

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
 * 病院リストをフィルタリング
 */
function filterHospitalList() {
    const searchInput = document.getElementById('hospitalSearchInput');
    const hospitalItems = document.querySelectorAll('.hospital-item');

    if (!searchInput || !hospitalItems.length) return;

    const searchTerm = searchInput.value.toLowerCase();
    let visibleCount = 0;

    hospitalItems.forEach(item => {
        const hospitalName = item.querySelector('.hospital-name')?.textContent || '';
        const hospitalDetail = item.querySelector('.hospital-detail')?.textContent || '';
        const searchText = (hospitalName + hospitalDetail).toLowerCase();

        if (searchText.includes(searchTerm)) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // 検索結果なしメッセージの表示制御
    let noResultsMsg = document.querySelector('.no-results');
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results';
            noResultsMsg.textContent = '該当する病院が見つかりませんでした';
            document.getElementById('hospitalList').appendChild(noResultsMsg);
        }
    } else {
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
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
window.handleFacilityMaster = handleFacilityMaster;
window.showHospitalSelectModal = showHospitalSelectModal;
window.closeHospitalSelectModal = closeHospitalSelectModal;
window.filterHospitalList = filterHospitalList;
window.selectHospital = selectHospital;
