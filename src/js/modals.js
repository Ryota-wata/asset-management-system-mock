/**
 * モーダル制御
 * 各種モーダルの表示/非表示、ドラッグ機能などを提供します。
 */

/**
 * 個体管理リスト作成モーダルを表示
 */
function showListModal() {
    const modal = document.getElementById('listModal');
    const modalContent = document.getElementById('listModalContent');

    // モーダル位置を中央にリセット（transform等をクリア）
    if (modalContent) {
        modalContent.style.transform = '';
    }

    modal.classList.add('show');

    // モーダル外クリックで閉じる処理を設定
    setTimeout(() => {
        const handleOutsideClick = function(event) {
            if (event.target === modal) {
                closeListModal();
                modal.removeEventListener('click', handleOutsideClick);
            }
        };
        modal.addEventListener('click', handleOutsideClick);
    }, 0);
}

/**
 * 個体管理リスト作成モーダルを閉じる
 */
function closeListModal() {
    const modal = document.getElementById('listModal');
    modal.classList.remove('show');
    resetListModal();
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
 * マスター管理モーダルを表示
 */
function showMasterModal() {
    const modal = document.getElementById('masterModal');
    const modalContent = document.getElementById('masterModalContent');

    // モーダル位置を中央にリセット（transform等をクリア）
    if (modalContent) {
        modalContent.style.transform = '';
    }

    modal.classList.add('show');

    // モーダル外クリックで閉じる処理を設定
    setTimeout(() => {
        const handleOutsideClick = function(event) {
            if (event.target === modal) {
                closeMasterModal();
                modal.removeEventListener('click', handleOutsideClick);
            }
        };
        modal.addEventListener('click', handleOutsideClick);
    }, 0);
}

/**
 * マスター管理モーダルを閉じる
 */
function closeMasterModal() {
    const modal = document.getElementById('masterModal');
    modal.classList.remove('show');
}

/**
 * マスターメニュー選択処理
 * @param {string} menuName - 選択されたメニュー名
 */
function selectMasterMenu(menuName) {
    alert(`選択メニュー: ${menuName}\n\n${menuName}画面へ遷移します`);
    closeMasterModal();
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
 * 写真モーダルを表示
 * @param {string} rowId - 行ID
 */
function showPhotoModal(rowId) {
    const modal = document.getElementById('photoModal');
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
    modal.classList.add('active');

    // モーダルのドラッグ機能を初期化
    initModalDrag();
}

/**
 * 写真モーダルを閉じる
 */
function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    modal.classList.remove('active');
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
window.toggleMobileColumn = toggleMobileColumn;
window.closeMobileColumn = closeMobileColumn;
window.showPhotoModal = showPhotoModal;
window.closePhotoModal = closePhotoModal;
window.initModalDrag = initModalDrag;
window.openPhotoInNewWindow = openPhotoInNewWindow;
window.currentPhotoData = [];
