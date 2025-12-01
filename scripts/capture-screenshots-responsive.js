/**
 * 各画面のスクリーンショットを複数デバイスで撮影するスクリプト
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const SCREENSHOT_DIR = path.join(__dirname, '../docs/screenshots');

// ビューポート設定
const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
];

// 撮影する画面の設定
const screens = [
    {
        name: '01_メイン画面',
        url: `${BASE_URL}/index.html`,
        waitFor: 1000
    },
    {
        name: '02_QRコード発行画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.handleQRIssueFromModal === 'function') {
                    window.handleQRIssueFromModal();
                } else if (typeof window.transitionPage === 'function') {
                    window.transitionPage('mainContainer', 'qrIssuePage');
                }
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '03_QRコード印刷プレビュー画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.handleQRIssueFromModal === 'function') {
                    window.handleQRIssueFromModal();
                } else if (typeof window.transitionPage === 'function') {
                    window.transitionPage('mainContainer', 'qrIssuePage');
                }
            });
            await page.waitForTimeout(500);
            await page.evaluate(() => {
                const prefixAlpha = document.getElementById('qrPrefixAlpha');
                const prefix2Digit = document.getElementById('qrPrefix2Digit');
                const startNumber = document.getElementById('qrStartNumber');
                const quantity = document.getElementById('qrIssueQuantity');
                if (prefixAlpha) prefixAlpha.value = 'R';
                if (prefix2Digit) prefix2Digit.value = '07';
                if (startNumber) startNumber.value = '00001';
                if (quantity) quantity.value = '50';
                if (typeof window.goToQRPrintPreview === 'function') {
                    window.goToQRPrintPreview();
                }
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '04_資産検索結果画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.handleViewSearchResult === 'function') {
                    window.handleViewSearchResult();
                }
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '05_現有資産調査画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.transitionPage === 'function') {
                    window.transitionPage('mainContainer', 'assetSurveyIntegratedPage');
                }
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '06_登録履歴画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.transitionPage === 'function') {
                    window.transitionPage('mainContainer', 'assetSurveyIntegratedPage');
                }
            });
            await page.waitForTimeout(500);
            await page.evaluate(() => {
                if (typeof window.handleShowHistoryList === 'function') {
                    window.handleShowHistoryList();
                }
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '07_申請一覧画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.goToApplicationList === 'function') {
                    window.goToApplicationList();
                }
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '08_見積依頼一覧画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.goToRfqList === 'function') {
                    window.goToRfqList();
                }
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '09_見積DataBox画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.goToQuotationDataBoxDirect === 'function') {
                    window.goToQuotationDataBoxDirect();
                }
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '10_個体管理リスト画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.goToIndividualManagementList === 'function') {
                    window.goToIndividualManagementList();
                }
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '11_SHIP施設マスタ画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.showShipFacilityMaster === 'function') {
                    window.showShipFacilityMaster();
                } else if (typeof window.transitionPage === 'function') {
                    window.transitionPage('mainContainer', 'shipFacilityMasterPage');
                }
            });
            await page.waitForTimeout(1000);
        }
    },
    {
        name: '12_SHIP資産マスタ画面',
        url: `${BASE_URL}/index.html`,
        actions: async (page) => {
            await page.evaluate(() => {
                if (typeof window.showShipAssetMaster === 'function') {
                    window.showShipAssetMaster();
                } else if (typeof window.transitionPage === 'function') {
                    window.transitionPage('mainContainer', 'shipAssetMasterPage');
                }
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
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        for (const screen of screens) {
            console.log(`\n撮影中: ${screen.name}`);

            for (const viewport of viewports) {
                console.log(`  - ${viewport.name} (${viewport.width}x${viewport.height})`);

                const page = await browser.newPage();
                await page.setViewport({ width: viewport.width, height: viewport.height });

                // ページを開く
                await page.goto(screen.url, { waitUntil: 'networkidle2' });

                // JavaScriptが完全にロードされるまで待機
                await page.waitForTimeout(1000);

                // ログイン画面をスキップ
                await page.evaluate(() => {
                    const loginPage = document.getElementById('loginPage');
                    if (loginPage && !loginPage.classList.contains('hidden')) {
                        loginPage.classList.add('hidden');
                        const mainContainer = document.getElementById('mainContainer');
                        if (mainContainer) {
                            mainContainer.classList.add('active');
                        }
                    }
                });
                await page.waitForTimeout(500);

                // アクションがあれば実行
                if (screen.actions) {
                    await screen.actions(page);
                } else if (screen.waitFor) {
                    await page.waitForTimeout(screen.waitFor);
                }

                // スクリーンショットを撮影
                const screenshotPath = path.join(SCREENSHOT_DIR, `${screen.name}_${viewport.name}.png`);
                await page.screenshot({
                    path: screenshotPath,
                    fullPage: true
                });

                console.log(`    → 保存: ${screenshotPath}`);

                await page.close();
            }
        }

        console.log('\n✓ すべてのスクリーンショットの撮影が完了しました');
        console.log(`保存先: ${SCREENSHOT_DIR}`);
        console.log(`合計: ${screens.length * viewports.length} 枚`);

    } catch (error) {
        console.error('エラーが発生しました:', error);
    } finally {
        await browser.close();
    }
}

// 実行
captureScreenshots().catch(console.error);
