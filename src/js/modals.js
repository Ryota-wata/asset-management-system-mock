/**
 * モーダル制御
 * 各種モーダルの表示/非表示、ドラッグ機能などを提供します。
 */

/**
 * 個体管理リスト作成モーダルを表示（共通ヘルパー使用）
 */
function showListModal() {
    const modalContent = document.getElementById('listModalContent');

    // モーダル位置を中央にリセット（transform等をクリア）
    if (modalContent) {
        modalContent.style.transform = '';
    }

    if (window.ModalHelper) {
        window.ModalHelper.open('#listModal', {
            activeClass: 'show',
            showClass: null,
            closeOnOutsideClick: true,
            closeOnEscape: true
        });
    }
}

/**
 * 個体管理リスト作成モーダルを閉じる（共通ヘルパー使用）
 */
function closeListModal() {
    resetListModal();

    if (window.ModalHelper) {
        window.ModalHelper.close('#listModal', {
            activeClass: 'show'
        });
    }
}

/**
 * 個体管理リスト作成モーダルをリセット
 */
function resetListModal() {
    const facilitySearchSelect = document.getElementById('facilitySearchSelect');
    const menuButtons = [
        document.getElementById('btn1'),
        document.getElementById('btn2'),
        document.getElementById('btn3'),
        document.getElementById('btn4'),
        document.getElementById('btn5')
    ];

    // Choices.jsでリセット
    if (facilitySearchSelect) {
        // Choices.jsのインスタンスを取得してリセット
        const choicesInstance = facilitySearchSelect.choices;
        if (choicesInstance) {
            choicesInstance.setChoiceByValue('');
        }
    }
    window.selectedFacility = null;
    menuButtons.forEach(btn => {
        if (btn) btn.disabled = true;
    });
}

/**
 * メニュー選択処理
 * @param {string} menuName - 選択されたメニュー名
 */
function selectMenu(menuName) {
    // 画面遷移処理
    if (menuName === '現有品調査') {
        // オフライン準備画面へ遷移
        closeListModal();
        document.getElementById('mainContainer').classList.remove('active');
        document.getElementById('offlinePrepPage').classList.add('active');
        return;
    } else if (menuName === 'QRコード管理') {
        // QRコード管理画面へ遷移
        closeListModal();
        document.getElementById('mainContainer').classList.remove('active');
        document.getElementById('qrPage').classList.add('active');
        return;
    } else if (menuName === '現有品調査内容修正') {
        // 登録内容修正画面へ遷移
        console.log('=== 現有品調査内容修正画面への遷移開始 ===');

        closeListModal();

        const mainContainer = document.getElementById('mainContainer');
        console.log('mainContainer:', mainContainer);
        if (mainContainer) {
            mainContainer.classList.remove('active');
            console.log('mainContainerからactiveクラスを削除しました');
        }

        const editPage = document.getElementById('registrationEditPage');
        console.log('editPage:', editPage);
        console.log('editPageのクラス（変更前）:', editPage ? editPage.className : 'null');

        if (editPage) {
            editPage.classList.add('active');
            console.log('editPageのクラス（変更後）:', editPage.className);
            console.log('editPageのdisplayスタイル:', window.getComputedStyle(editPage).display);
            console.log('editPageのz-index:', window.getComputedStyle(editPage).zIndex);
        } else {
            alert('エラー: 登録内容修正画面が見つかりません。\nページを再読み込みしてください。');
        }
        console.log('=== 遷移処理完了 ===');
        return;
    } else {
        alert(`施設: ${window.selectedFacility ? window.selectedFacility.name : ''}\n選択メニュー: ${menuName}\n\n${menuName}画面へ遷移します`);
    }
    closeListModal();
}

/**
 * マスター管理モーダルを表示（共通ヘルパー使用）
 */
function showMasterModal() {
    const modalContent = document.getElementById('masterModalContent');

    // モーダル位置を中央にリセット（transform等をクリア）
    if (modalContent) {
        modalContent.style.transform = '';
    }

    // ユーザー種別に応じてメニューを切り替え
    const consultantMenu = document.querySelector('.consultant-menu');
    const hospitalMenu = document.querySelector('.hospital-menu');
    const userType = getUserType();

    if (consultantMenu && hospitalMenu) {
        if (userType === 'consultant') {
            consultantMenu.style.display = 'block';
            hospitalMenu.style.display = 'none';
        } else {
            consultantMenu.style.display = 'none';
            hospitalMenu.style.display = 'block';
        }
    }

    if (window.ModalHelper) {
        window.ModalHelper.open('#masterModal', {
            activeClass: 'show',
            showClass: null,
            closeOnOutsideClick: true,
            closeOnEscape: true
        });
    }
}

/**
 * ユーザー種別を取得
 * @returns {string} 'consultant' または 'hospital'
 */
function getUserType() {
    // consultant-onlyボタンの表示状態で判定
    const consultantButtons = document.querySelectorAll('.consultant-only');
    return consultantButtons.length > 0 && consultantButtons[0].offsetParent !== null
        ? 'consultant'
        : 'hospital';
}

/**
 * マスター管理モーダルを閉じる（共通ヘルパー使用）
 */
function closeMasterModal() {
    if (window.ModalHelper) {
        window.ModalHelper.close('#masterModal', {
            activeClass: 'show'
        });
    }
}

/**
 * マスターメニュー選択処理
 * @param {string} menuName - 選択されたメニュー名
 */
function selectMasterMenu(menuName) {
    closeMasterModal();

    // 「個別施設マスタ」の場合は病院選択モーダルを表示
    if (menuName === '個別施設マスタ') {
        if (typeof showHospitalSelectModal === 'function') {
            showHospitalSelectModal();
        } else {
            alert('病院選択機能が読み込まれていません');
        }
        return;
    }

    // 「施設マスタ」の場合（病院ユーザー）は直接施設マスタ画面へ
    if (menuName === '施設マスタ') {
        const hospitalId = getCurrentHospitalId();
        const hospitalName = getCurrentHospitalName();
        if (typeof goToFacilityMaster === 'function') {
            goToFacilityMaster(hospitalId, hospitalName);
        } else {
            alert(`${hospitalName}の施設マスタ画面へ遷移します\n（画面はまだ実装されていません）`);
        }
        return;
    }

    // その他のメニュー
    alert(`選択メニュー: ${menuName}\n\n${menuName}画面へ遷移します`);
}

/**
 * 現在ログイン中の病院IDを取得（モック用）
 * @returns {string} 病院ID
 */
function getCurrentHospitalId() {
    return 'hospital1';
}

/**
 * 現在ログイン中の病院名を取得（モック用）
 * @returns {string} 病院名
 */
function getCurrentHospitalName() {
    return 'A総合病院';
}

/**
 * モバイル用カラム選択モーダルを表示
 */
function toggleMobileColumn() {
    document.getElementById('mobileColumnModal').style.display = 'block';
}

/**
 * モバイル用カラム選択モーダルを閉じる
 */
function closeMobileColumn() {
    document.getElementById('mobileColumnModal').style.display = 'none';
}

/**
 * 写真モーダルを表示（共通ヘルパー使用）
 * @param {string} rowId - 行ID
 */
function showPhotoModal(rowId) {
    const modalBody = document.querySelector('.photo-grid-modal');

    // サンプル写真を表示（実際にはデータベースから取得）
    const photoCount = Math.floor(Math.random() * 6) + 1; // 1-6枚
    let photosHtml = '';
    window.currentPhotoData = [];

    for (let i = 1; i <= photoCount; i++) {
        const colors = ['3498db', '2ecc71', 'e74c3c', 'f39c12', '9b59b6', '1abc9c'];
        const color = colors[i - 1];
        const photoUrl = `https://via.placeholder.com/300x200/${color}/ffffff?text=Photo+${i}`;
        window.currentPhotoData.push(photoUrl);
        photosHtml += `
            <div class="photo-item-modal">
                <img src="${photoUrl}" alt="写真${i}">
            </div>
        `;
    }

    modalBody.innerHTML = photosHtml;

    if (window.ModalHelper) {
        window.ModalHelper.open('#photoModal', {
            closeOnOutsideClick: true,
            closeOnEscape: true,
            onOpen: () => {
                // モーダルのドラッグ機能を初期化
                initModalDrag();
            }
        });
    }
}

/**
 * 写真モーダルを閉じる（共通ヘルパー使用）
 */
function closePhotoModal() {
    if (window.ModalHelper) {
        window.ModalHelper.close('#photoModal');
    }
}

/**
 * モーダルのドラッグ機能を初期化
 */
function initModalDrag() {
    const modal = document.getElementById('photoModalContent');
    const header = document.getElementById('photoModalHeader');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target.closest('.photo-modal-close') || e.target.closest('.photo-modal-new-window')) {
            return;
        }

        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === header || header.contains(e.target)) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, modal);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
    }
}

/**
 * 別ウィンドウで写真を開く
 */
function openPhotoInNewWindow() {
    const photosHtml = window.currentPhotoData.map((url, index) => `
        <div style="margin: 10px; display: inline-block;">
            <img src="${url}" alt="写真${index + 1}" style="max-width: 300px; border: 1px solid #ddd; border-radius: 6px;">
        </div>
    `).join('');

    const newWindow = window.open('', '写真プレビュー', 'width=800,height=600,scrollbars=yes');
    if (newWindow) {
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>写真プレビュー</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    h2 {
                        color: #2c3e50;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <h2>写真プレビュー</h2>
                ${photosHtml}
            </body>
            </html>
        `);
        newWindow.document.close();
    } else {
        alert('ポップアップがブロックされました。ブラウザの設定を確認してください。');
    }
}

// グローバルスコープに関数を公開
window.showListModal = showListModal;
window.closeListModal = closeListModal;
window.resetListModal = resetListModal;
window.selectMenu = selectMenu;
window.showMasterModal = showMasterModal;
window.closeMasterModal = closeMasterModal;
window.selectMasterMenu = selectMasterMenu;
window.getUserType = getUserType;
window.getCurrentHospitalId = getCurrentHospitalId;
window.getCurrentHospitalName = getCurrentHospitalName;
window.toggleMobileColumn = toggleMobileColumn;
window.closeMobileColumn = closeMobileColumn;
window.showPhotoModal = showPhotoModal;
window.closePhotoModal = closePhotoModal;
window.initModalDrag = initModalDrag;
window.openPhotoInNewWindow = openPhotoInNewWindow;
window.currentPhotoData = [];
