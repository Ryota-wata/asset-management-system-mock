# 医療機器管理システム 画面遷移図

## 全体画面遷移図

```mermaid
graph TB
    %% ログイン・メイン
    A[ログイン画面] --> B[資産検索画面<br/>メイン画面]

    %% メイン画面からのモーダル
    B --> C[個体管理リスト<br/>作成モーダル]
    C --> B
    B --> D[マスター管理モーダル]
    D --> B

    %% 個体管理リストからの遷移（コンサルタント向け）
    C --> E[QRコード管理画面]
    C --> F[オフライン準備画面]
    C --> G[登録内容修正画面]

    %% メイン画面から直接QR管理（病院向け）
    B --> E

    %% QRコード管理系の遷移
    E --> B
    E --> H[QRコード詳細画面]
    E --> I[QRコード印刷画面]
    E --> J[QRコード新規発行画面]
    H --> E
    H --> I
    J --> E
    I --> E
    I --> H

    %% 登録内容修正画面
    G --> B

    %% 現有品調査フロー
    F --> B
    F --> K[現有資産調査画面]
    K --> F
    K --> L[QR読取画面]
    L --> K
    L --> M[写真撮影・<br/>資産番号入力画面]
    M --> L
    M --> N[資産情報登録画面<br/>スマートフォン版]
    M --> O[資産情報登録画面<br/>タブレット版]

    %% 資産情報登録からの遷移
    N --> M
    N --> P[履歴表示画面<br/>スマートフォン版]
    N --> K
    O --> M
    O --> Q[履歴表示画面<br/>タブレット版]
    O --> K

    %% 履歴表示からの遷移
    P --> N
    Q --> O

    %% ログアウト
    B -.ログアウト.-> A
    E -.ログアウト.-> A

    %% スタイル定義
    classDef loginClass fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef mainClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef modalClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef qrClass fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef surveyClass fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef mobileClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class A loginClass
    class B mainClass
    class C,D modalClass
    class E,H,I,J qrClass
    class F,K,L,M surveyClass
    class N,O,P,Q mobileClass
    class G mainClass
```

## 画面グループ別遷移

### 1. コンサルタント向けフロー
```mermaid
graph LR
    A[ログイン] --> B[資産検索]
    B --> C[個体管理リスト<br/>作成モーダル]
    C --> D[QRコード管理]
    C --> E[現有品調査]
    C --> F[登録内容修正]

    classDef consultantClass fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    class A,B,C,D,E,F consultantClass
```

### 2. 病院担当者向けフロー
```mermaid
graph LR
    A[ログイン] --> B[資産検索]
    B --> C[QRコード管理]

    classDef hospitalClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    class A,B,C hospitalClass
```

### 3. QRコード管理フロー
```mermaid
graph TB
    A[QRコード管理<br/>一覧画面] --> B[QRコード詳細]
    A --> C[QRコード新規発行]
    A --> D[QRコード印刷]
    B --> D
    B --> A
    C --> A
    D --> A
    D --> B

    classDef qrClass fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    class A,B,C,D qrClass
```

### 4. 現有品調査フロー（モバイル対応）
```mermaid
graph TB
    A[オフライン準備] --> B[現有資産調査]
    B --> C[QR読取]
    C --> D[写真撮影・<br/>資産番号入力]
    D --> E{デバイス判定}
    E -->|スマートフォン| F[資産情報登録<br/>スマホ版]
    E -->|タブレット| G[資産情報登録<br/>タブレット版]
    F --> H[履歴表示<br/>スマホ版]
    G --> I[履歴表示<br/>タブレット版]
    H --> F
    I --> G
    F --> B
    G --> B

    classDef surveyClass fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    class A,B,C,D surveyClass
    classDef mobileClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    class E,F,G,H,I mobileClass
```

## 画面一覧

| No. | 画面ID | 画面名 | ユーザー種別 | デバイス |
|-----|--------|--------|--------------|----------|
| 1 | loginPage | ログイン画面 | 共通 | 全デバイス |
| 2 | mainContainer | 資産検索画面 | 共通 | PC/タブレット |
| 3 | listModal | 個体管理リスト作成モーダル | コンサルタント | PC/タブレット |
| 4 | masterModal | マスター管理モーダル | コンサルタント | PC/タブレット |
| 5 | qrPage | QRコード管理画面 | 共通 | PC/タブレット |
| 6 | qrDetailPage | QRコード詳細画面 | 共通 | PC/タブレット |
| 7 | qrIssuePage | QRコード新規発行画面 | 共通 | PC/タブレット |
| 8 | qrPrintPage | QRコード印刷画面 | 共通 | PC/タブレット |
| 9 | offlinePrepPage | オフライン準備画面 | コンサルタント | PC/タブレット |
| 10 | surveyPage | 現有資産調査画面 | コンサルタント | タブレット/スマホ |
| 11 | qrScanPage | QR読取画面 | コンサルタント | タブレット/スマホ |
| 12 | photoInputPage | 写真撮影・資産番号入力画面 | コンサルタント | タブレット/スマホ |
| 13 | assetInfoSmartphonePage | 資産情報登録画面（スマホ版） | コンサルタント | スマートフォン |
| 14 | assetInfoTabletPage | 資産情報登録画面（タブレット版） | コンサルタント | タブレット |
| 15 | historyListSmartphonePage | 履歴表示画面（スマホ版） | コンサルタント | スマートフォン |
| 16 | historyListTabletPage | 履歴表示画面（タブレット版） | コンサルタント | タブレット |
| 17 | registrationEditPage | 登録内容修正画面 | コンサルタント | PC/タブレット |
| 18 | mobileColumnModal | モバイルカラム選択モーダル | 共通 | スマートフォン |
| 19 | photoModal | 写真表示モーダル | 共通 | 全デバイス |

## 遷移パターン

### パターン1: 通常遷移
- 画面全体が切り替わる
- 前の画面は非表示になる
- 例: ログイン → 資産検索

### パターン2: モーダル表示
- 現在の画面の上にモーダルが表示される
- 背景の画面は見えるが操作不可
- 例: 資産検索 → 個体管理リストモーダル

### パターン3: 条件分岐遷移
- デバイスの画面サイズで遷移先が変わる
- 例: 写真撮影 → 資産情報登録（スマホ版/タブレット版）

### パターン4: 戻り遷移
- 一つ前の画面に戻る
- モーダルの場合は閉じるだけ
- 例: QRコード詳細 → QRコード管理

## 注意事項

1. **ログアウト処理**
   - 全ての画面からログイン画面に戻る
   - セッション情報はクリアされる

2. **モーダル表示時の動作**
   - 背景クリックで閉じる
   - ESCキーで閉じる
   - 閉じる際は元の画面に戻る

3. **画面遷移時のモーダル制御**
   - 登録内容修正画面から戻る場合、個体管理リストモーダルは表示しない
   - オフライン準備画面から戻る場合、個体管理リストモーダルは表示しない

4. **レスポンシブ対応**
   - PC/タブレット: 全機能利用可能
   - スマートフォン: モバイル専用画面を表示
   - 画面幅768px以下でスマホ版に切り替え
