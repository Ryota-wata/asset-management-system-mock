/**
 * 各画面のスクリーンショットを撮影するスクリプト
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const SCREENSHOT_DIR = path.join(__dirname, '../docs/screenshots');

// 撮影する画面の設定
const screens = [
    {
        name: '01_メイン画面',
        url: `${BASE_URL}/index.html`,
        selector: '#mainContainer',
        waitFor: 1000
    },
    {
        name: '02_QRコード発行画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            // メイン画面からQRコード発行画面へ遷移
            await page.evaluate(() => {
                window.goToQRIssuePage();
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '03_QRコード印刷プレビュー画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                window.goToQRIssuePage();
            });
            await page.waitForTimeout(500);
            await page.evaluate(() => {
                document.getElementById('qrIssuePrefix').value = 'R07';
                document.getElementById('qrIssueStart').value = '1';
                document.getElementById('qrIssueEnd').value = '50';
                window.goToQRPrintPreview();
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '04_資産検索結果画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                window.handleViewSearchResult();
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '05_現有資産調査画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                window.goToAssetSurveyIntegrated();
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '06_登録履歴画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                window.goToAssetSurveyIntegrated();
            });
            await page.waitForTimeout(500);
            await page.evaluate(() => {
                window.handleShowHistoryList();
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '07_申請一覧画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                window.goToApplicationList();
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '08_見積依頼一覧画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                window.goToRfqList();
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '09_見積DataBox画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                window.goToQuotationDataBoxDirect();
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '10_個体管理リスト画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                window.goToIndividualManagementList();
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '11_SHIP施設マスタ画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                window.goToShipFacilityMaster();
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '12_SHIP資産マスタ画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                window.goToShipAssetMaster();
            });
            await page.waitForTimeout(1000);
        }
    }
];

async function captureScreenshots() {
    console.log('スクリーンショット撮影を開始します...');

    // スクリーンショット保存ディレクトリを作成
    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        for (const screen of screens) {
            console.log(`撮影中: ${screen.name}...`);

            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            // ページを開く
            await page.goto(screen.url, { waitUntil: 'networkidle2' });

            // アクションがあれば実行
            if (screen.actions) {
                await screen.actions(page);
            } else if (screen.waitFor) {
                await page.waitForTimeout(screen.waitFor);
            }

            // スクリーンショットを撮影
            const screenshotPath = path.join(SCREENSHOT_DIR, `${screen.name}.png`);
            await page.screenshot({
                path: screenshotPath,
                fullPage: true
            });

            console.log(`  → 保存しました: ${screenshotPath}`);

            await page.close();
        }

        console.log('\n✓ すべてのスクリーンショットの撮影が完了しました');
        console.log(`保存先: ${SCREENSHOT_DIR}`);

    } catch (error) {
        console.error('エラーが発生しました:', error);
    } finally {
        await browser.close();
    }
}

// 実行
captureScreenshots().catch(console.error);
