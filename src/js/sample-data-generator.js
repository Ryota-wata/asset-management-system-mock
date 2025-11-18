/**
 * サンプルデータ生成
 * 画面モック確認用のサンプルデータを自動生成します
 */

function generateSampleData() {
    console.log('=== Generating Sample Data ===');

    // 1. 申請データのサンプル生成（application-list.jsで既に定義されている場合はスキップ）
    if (!window.applicationListData || window.applicationListData.length === 0) {
        window.applicationListData = [
            {
                id: 'APP-001',
                applicationNo: 'APP-2025-0001',
                applicationDate: '2025-01-15',
                applicationType: '新規購入',
                status: '見積依頼中',
                asset: {
                    name: '人工呼吸器',
                    model: 'V60',
                    maker: 'フィリップス'
                },
                quantity: 2,
                facility: {
                    building: '本館',
                    floor: '3F',
                    department: 'ICU',
                    section: '集中治療室'
                },
                executionYear: '2025年度',
                freeInput: '老朽化による更新',
                rfqNo: 'RFQ-2025-0001',
                vendor: 'メディカルサプライ株式会社'
            },
            {
                id: 'APP-002',
                applicationNo: 'APP-2025-0002',
                applicationDate: '2025-01-16',
                applicationType: '新規購入',
                status: '見積依頼中',
                asset: {
                    name: 'ベッドサイドモニター',
                    model: 'BSM-2301',
                    maker: '日本光電'
                },
                quantity: 3,
                facility: {
                    building: '本館',
                    floor: '4F',
                    department: '一般病棟',
                    section: '内科'
                },
                executionYear: '2025年度',
                freeInput: '病床増設に伴う新規導入',
                rfqNo: 'RFQ-2025-0001',
                vendor: 'メディカルサプライ株式会社'
            },
            {
                id: 'APP-003',
                applicationNo: 'APP-2025-0003',
                applicationDate: '2025-01-17',
                applicationType: '新規購入',
                status: '見積依頼中',
                asset: {
                    name: '超音波診断装置',
                    model: 'Vivid T9',
                    maker: 'GEヘルスケア'
                },
                quantity: 1,
                facility: {
                    building: '本館',
                    floor: '2F',
                    department: '放射線科',
                    section: '画像診断室'
                },
                executionYear: '2025年度',
                freeInput: '高精度診断のための最新機器導入',
                rfqNo: 'RFQ-2025-0001',
                vendor: 'メディカルサプライ株式会社'
            },
            {
                id: 'APP-004',
                applicationNo: 'APP-2025-0004',
                applicationDate: '2025-01-18',
                applicationType: '新規購入',
                status: '見積依頼中',
                asset: {
                    name: '電動ベッド',
                    model: 'KA-7000',
                    maker: 'パラマウントベッド'
                },
                quantity: 10,
                facility: {
                    building: '新館',
                    floor: '5F',
                    department: '一般病棟',
                    section: '外科'
                },
                executionYear: '2025年度',
                freeInput: '病棟リニューアルに伴う一括更新',
                rfqNo: 'RFQ-2025-0001',
                vendor: 'メディカルサプライ株式会社'
            }
        ];
    }

    // 2. 見積依頼レコードのサンプル生成
    if (!window.rfqRecords || window.rfqRecords.length === 0) {
        window.rfqRecords = [
            {
                rfqNo: 'RFQ-2025-0001',
                vendor: 'メディカルサプライ株式会社',
                createdDate: '2025-01-20',
                status: '見積依頼済',
                applicationIds: ['APP-001', 'APP-002', 'APP-003', 'APP-004'],
                totalAmount: 17315000,
                orderConfirmed: false,
                orderDate: null
            },
            {
                rfqNo: 'RFQ-2025-0002',
                vendor: '医療機器商事株式会社',
                createdDate: '2025-01-22',
                status: '依頼書作成待',
                applicationIds: [],
                totalAmount: null,
                orderConfirmed: false,
                orderDate: null
            }
        ];
    }

    // 3. 見積書PDFのサンプル生成
    if (!window.quotationDocuments || window.quotationDocuments.length === 0) {
        window.quotationDocuments = [
            {
                id: 'Q-1737000000001',
                rfqNo: 'RFQ-2025-0001',
                phase: '概算',
                vendor: 'メディカルサプライ株式会社',
                quotationDate: '2025-01-25',
                uploadDate: '2025-01-26',
                filename: '概算見積書_RFQ-2025-0001.pdf',
                ocrStatus: '完了',
                ocrDate: '2025-01-26'
            },
            {
                id: 'Q-1737000000002',
                rfqNo: 'RFQ-2025-0001',
                phase: '最終',
                vendor: 'メディカルサプライ株式会社',
                quotationDate: '2025-02-01',
                uploadDate: '2025-02-02',
                filename: '最終見積書_RFQ-2025-0001.pdf',
                ocrStatus: '完了',
                ocrDate: '2025-02-02'
            },
            {
                id: 'Q-1737000000003',
                rfqNo: 'RFQ-2025-0002',
                phase: '概算',
                vendor: '医療機器商事株式会社',
                quotationDate: '2025-01-28',
                uploadDate: '2025-01-29',
                filename: '概算見積書_RFQ-2025-0002.pdf',
                ocrStatus: '未実行',
                ocrDate: null
            }
        ];
    }

    // 4. 資産マスタリスト（個体管理リスト原本）の初期化
    if (!window.assetMasterList) {
        window.assetMasterList = [];
    }

    console.log('Sample data generated:', {
        applications: window.applicationListData.length,
        rfqRecords: window.rfqRecords.length,
        quotationDocuments: window.quotationDocuments.length,
        assetMasterList: window.assetMasterList.length
    });
}

// DOMContentLoaded時に自動実行
document.addEventListener('DOMContentLoaded', function() {
    generateSampleData();
});

// グローバルに公開
window.generateSampleData = generateSampleData;
