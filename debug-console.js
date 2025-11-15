// デバッグ用スクリプト - ブラウザコンソールで実行
console.log('=== マスタデータ読み込み状況確認 ===');

// 1. facility-master.jsonの読み込み確認
console.log('\n1. facility-master.json 読み込み確認:');
window.loadFacilityMaster().then(data => {
    console.log('✓ 施設マスタ読み込み成功');
    console.log('  - facilities件数:', data.facilities?.length || 0);
    console.log('  - 最初の施設:', data.facilities?.[0]);
    console.log('  - 最後の施設:', data.facilities?.[data.facilities?.length - 1]);
}).catch(err => {
    console.error('✗ 施設マスタ読み込み失敗:', err);
});

// 2. asset-master.jsonの読み込み確認
console.log('\n2. asset-master.json 読み込み確認:');
window.loadAssetMaster().then(data => {
    console.log('✓ 資産マスタ読み込み成功');
    console.log('  - largeClasses件数:', data.largeClasses?.length || 0);
    console.log('  - mediumClasses件数:', data.mediumClasses?.length || 0);
    console.log('  - items件数:', data.items?.length || 0);
}).catch(err => {
    console.error('✗ 資産マスタ読み込み失敗:', err);
});

// 3. Choices.jsインスタンス確認
console.log('\n3. Choices.jsインスタンス確認:');
setTimeout(() => {
    const instances = {
        'facilityNameChoice': window.facilityNameChoice,
        'departmentChoice': window.departmentChoice,
        'sectionChoice': window.sectionChoice,
        'largeClassChoice': window.largeClassChoice,
        'mediumClassChoice': window.mediumClassChoice,
        'itemChoice': window.itemChoice,
        'facilitySearchChoice': window.facilitySearchChoice
    };

    Object.entries(instances).forEach(([name, instance]) => {
        if (instance) {
            const choiceCount = instance._currentState?.choices?.length || 0;
            console.log(`✓ ${name}: 初期化済み (${choiceCount}件)`);
        } else {
            console.error(`✗ ${name}: 未初期化`);
        }
    });
}, 2000);

// 4. DOM要素確認
console.log('\n4. DOM要素確認:');
setTimeout(() => {
    const elements = [
        'facilityNameSelect',
        'departmentSelect',
        'sectionSelect',
        'largeClassSelect',
        'mediumClassSelect',
        'itemSelect',
        'facilitySearchSelect'
    ];

    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            console.log(`✓ ${id}: 存在 (option数: ${el.options.length})`);
        } else {
            console.error(`✗ ${id}: 見つからない`);
        }
    });
}, 2000);

console.log('\n処理完了まで2秒待機...');
