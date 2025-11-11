/**
 * 資産調査機能
 * 現有資産調査に関する機能を提供します。
 */

/**
 * 現有資産調査画面にマスタデータをロード
 */
function loadSurveyMasterData() {
    const masterData = loadMasterDataFromStorage();

    // Choices.jsインスタンスが初期化されているか確認
    if (window.surveyCategoryChoice) {
        window.surveyCategoryChoice.clearStore();
        window.surveyCategoryChoice.setChoices(masterData.categories, 'value', 'label', true);
    }

    if (window.surveyBuildingChoice) {
        window.surveyBuildingChoice.clearStore();
        window.surveyBuildingChoice.setChoices(masterData.buildings, 'value', 'label', true);
    }

    if (window.surveyFloorChoice) {
        window.surveyFloorChoice.clearStore();
        window.surveyFloorChoice.setChoices(masterData.floors, 'value', 'label', true);
    }

    if (window.surveyDepartmentChoice) {
        window.surveyDepartmentChoice.clearStore();
        window.surveyDepartmentChoice.setChoices(masterData.departments, 'value', 'label', true);
    }

    if (window.surveySectionChoice) {
        window.surveySectionChoice.clearStore();
        window.surveySectionChoice.setChoices(masterData.sections, 'value', 'label', true);
    }
}

/**
 * 履歴カードの選択処理
 * @param {HTMLElement} card - クリックされたカード要素
 */
function selectHistoryCard(card) {
    // 全てのカードから選択状態を解除
    const parentPage = card.closest('.history-list-smartphone-page, .history-list-tablet-page');
    if (parentPage) {
        parentPage.querySelectorAll('.history-card-hl, .history-card-hlt').forEach(c => {
            c.classList.remove('selected');
        });
    }

    // クリックされたカードを選択状態にする
    card.classList.add('selected');
}

/**
 * 写真撮影画面のトグルスイッチの切り替え
 * @param {HTMLElement} element - トグルスイッチ要素
 */
function togglePhotoInputSwitch(element) {
    element.classList.toggle('active');
    const label = element.nextElementSibling;
    if (element.classList.contains('active')) {
        label.textContent = 'オン';
    } else {
        label.textContent = 'オフ';
    }
}

// グローバルスコープに関数を公開
window.loadSurveyMasterData = loadSurveyMasterData;
window.selectHistoryCard = selectHistoryCard;
window.togglePhotoInputSwitch = togglePhotoInputSwitch;
