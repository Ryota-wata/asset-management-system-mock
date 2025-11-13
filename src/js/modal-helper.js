/**
 * モーダル管理共通ヘルパー関数
 *
 * モーダルの開閉、モーダル外クリック処理など
 * モーダル関連の共通処理を統合管理
 */

// モーダルごとのイベントリスナーを管理
const modalEventListeners = new Map();

/**
 * モーダルを開く
 * @param {string|HTMLElement} modal - モーダル要素またはセレクタ
 * @param {Object} options - オプション設定
 * @returns {HTMLElement} モーダル要素
 */
function openModal(modal, options = {}) {
    const {
        activeClass = 'active',
        showClass = 'show',
        closeOnOutsideClick = true,
        closeOnEscape = true,
        onOpen = null,
        onClose = null,
        preventScroll = true
    } = options;

    const modalElement = typeof modal === 'string' ? document.querySelector(modal) : modal;

    if (!modalElement) {
        console.error('Modal element not found:', modal);
        return null;
    }

    // モーダルを表示
    modalElement.classList.add(activeClass);
    if (showClass && showClass !== activeClass) {
        modalElement.classList.add(showClass);
    }

    // スクロール防止（オプション）
    if (preventScroll) {
        document.body.style.overflow = 'hidden';
    }

    // モーダル外クリックで閉じる処理
    if (closeOnOutsideClick) {
        const outsideClickHandler = function(event) {
            if (event.target === modalElement) {
                closeModal(modalElement, { activeClass, showClass, onClose, preventScroll });
            }
        };

        // イベントリスナーを保存（後で削除するため）
        modalEventListeners.set(modalElement, {
            outsideClick: outsideClickHandler,
            escape: null
        });

        setTimeout(() => {
            modalElement.addEventListener('click', outsideClickHandler);
        }, 0);
    }

    // Escapeキーで閉じる処理
    if (closeOnEscape) {
        const escapeHandler = function(event) {
            if (event.key === 'Escape') {
                closeModal(modalElement, { activeClass, showClass, onClose, preventScroll });
            }
        };

        const listeners = modalEventListeners.get(modalElement) || {};
        listeners.escape = escapeHandler;
        modalEventListeners.set(modalElement, listeners);

        document.addEventListener('keydown', escapeHandler);
    }

    // オープンコールバック
    if (onOpen && typeof onOpen === 'function') {
        onOpen(modalElement);
    }

    return modalElement;
}

/**
 * モーダルを閉じる
 * @param {string|HTMLElement} modal - モーダル要素またはセレクタ
 * @param {Object} options - オプション設定
 */
function closeModal(modal, options = {}) {
    const {
        activeClass = 'active',
        showClass = 'show',
        onClose = null,
        preventScroll = true
    } = options;

    const modalElement = typeof modal === 'string' ? document.querySelector(modal) : modal;

    if (!modalElement) {
        console.error('Modal element not found:', modal);
        return;
    }

    // モーダルを非表示
    modalElement.classList.remove(activeClass);
    if (showClass && showClass !== activeClass) {
        modalElement.classList.remove(showClass);
    }

    // スクロール復元（オプション）
    if (preventScroll) {
        document.body.style.overflow = '';
    }

    // イベントリスナーを削除
    const listeners = modalEventListeners.get(modalElement);
    if (listeners) {
        if (listeners.outsideClick) {
            modalElement.removeEventListener('click', listeners.outsideClick);
        }
        if (listeners.escape) {
            document.removeEventListener('keydown', listeners.escape);
        }
        modalEventListeners.delete(modalElement);
    }

    // クローズコールバック
    if (onClose && typeof onClose === 'function') {
        onClose(modalElement);
    }
}

/**
 * モーダルの開閉を切り替え
 * @param {string|HTMLElement} modal - モーダル要素またはセレクタ
 * @param {Object} options - オプション設定
 */
function toggleModal(modal, options = {}) {
    const { activeClass = 'active' } = options;
    const modalElement = typeof modal === 'string' ? document.querySelector(modal) : modal;

    if (!modalElement) {
        console.error('Modal element not found:', modal);
        return;
    }

    if (modalElement.classList.contains(activeClass)) {
        closeModal(modalElement, options);
    } else {
        openModal(modalElement, options);
    }
}

/**
 * すべてのモーダルを閉じる
 * @param {string} modalSelector - モーダルのセレクタ (default: '.modal')
 * @param {Object} options - オプション設定
 */
function closeAllModals(modalSelector = '.modal', options = {}) {
    const { activeClass = 'active', showClass = 'show' } = options;
    const modals = document.querySelectorAll(modalSelector);

    modals.forEach(modal => {
        if (modal.classList.contains(activeClass)) {
            closeModal(modal, { activeClass, showClass, ...options });
        }
    });
}

/**
 * モーダルが開いているか確認
 * @param {string|HTMLElement} modal - モーダル要素またはセレクタ
 * @param {string} activeClass - アクティブクラス名 (default: 'active')
 * @returns {boolean} 開いているかどうか
 */
function isModalOpen(modal, activeClass = 'active') {
    const modalElement = typeof modal === 'string' ? document.querySelector(modal) : modal;

    if (!modalElement) {
        return false;
    }

    return modalElement.classList.contains(activeClass);
}

/**
 * モーダル内のフォーカス可能要素を取得
 * @param {HTMLElement} modalElement - モーダル要素
 * @returns {Array} フォーカス可能要素の配列
 */
function getFocusableElements(modalElement) {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(modalElement.querySelectorAll(selector))
        .filter(el => !el.disabled && el.offsetParent !== null);
}

/**
 * モーダル内にフォーカスをトラップ（アクセシビリティ向上）
 * @param {HTMLElement} modalElement - モーダル要素
 */
function trapFocus(modalElement) {
    const focusableElements = getFocusableElements(modalElement);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 最初の要素にフォーカス
    firstElement.focus();

    const trapHandler = function(event) {
        if (event.key !== 'Tab') return;

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    };

    modalElement.addEventListener('keydown', trapHandler);

    // クリーンアップ用にリスナーを保存
    const listeners = modalEventListeners.get(modalElement) || {};
    listeners.focusTrap = trapHandler;
    modalEventListeners.set(modalElement, listeners);
}

/**
 * モーダル開閉のショートハンド（既存コードとの互換性）
 * @param {string} modalId - モーダルのID
 */
function showModal(modalId) {
    openModal(`#${modalId}`);
}

/**
 * モーダル閉じるのショートハンド（既存コードとの互換性）
 * @param {string} modalId - モーダルのID
 */
function hideModal(modalId) {
    closeModal(`#${modalId}`);
}

// グローバルに公開
window.ModalHelper = {
    open: openModal,
    close: closeModal,
    toggle: toggleModal,
    closeAll: closeAllModals,
    isOpen: isModalOpen,
    trapFocus,
    getFocusableElements,
    // 後方互換性のためのエイリアス
    showModal,
    hideModal
};
