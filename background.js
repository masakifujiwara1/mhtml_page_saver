// MHTML Page Saver - Background Service Worker

// デフォルト設定
const DEFAULT_OPTIONS = {
  waitTime: 1000,  // 保存前の待機時間（ミリ秒）
  filenameFormat: 'title_date_hostname',  // ファイル名形式
  showNotification: true  // 保存完了通知を表示
};

// 設定を取得
async function getOptions() {
  const result = await chrome.storage.sync.get(DEFAULT_OPTIONS);
  return result;
}

// ファイル名に使用できない文字を置換
function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 100);  // 長すぎるファイル名を防止
}

// 現在の日時をフォーマット
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// ホスト名を取得
function getHostname(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'unknown';
  }
}

// ファイル名を生成
function generateFilename(title, url, options) {
  const hostname = sanitizeFilename(getHostname(url));
  const safeTitle = sanitizeFilename(title || 'untitled');
  const dateStr = formatDate(new Date());

  switch (options.filenameFormat) {
    case 'title_only':
      return `${safeTitle}.mhtml`;
    case 'date_title':
      return `${dateStr}__${safeTitle}.mhtml`;
    case 'hostname_title':
      return `${hostname}__${safeTitle}.mhtml`;
    case 'title_date_hostname':
    default:
      return `${hostname}__${safeTitle}__${dateStr}.mhtml`;
  }
}

// 指定時間待機
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// BlobをData URLに変換
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// MHTMLとして保存
async function savePageAsMHTML(tab) {
  try {
    console.log('savePageAsMHTML開始:', tab.id, tab.url);
    const options = await getOptions();
    console.log('オプション取得完了:', options);

    // 待機時間がある場合は待つ（SPA・遅延ロード対策）
    if (options.waitTime > 0) {
      console.log(`${options.waitTime}ms 待機中...`);
      await wait(options.waitTime);
    }

    // MHTMLを取得（コールバック形式をPromiseでラップ）
    console.log('MHTML取得開始...');
    const mhtmlBlob = await new Promise((resolve, reject) => {
      chrome.pageCapture.saveAsMHTML({ tabId: tab.id }, (blob) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!blob) {
          reject(new Error('MHTMLの取得に失敗しました（空のBlob）'));
        } else {
          resolve(blob);
        }
      });
    });
    
    console.log('MHTML取得成功, サイズ:', mhtmlBlob.size);

    // BlobをData URLに変換（Service WorkerではURL.createObjectURLが使えない）
    const dataUrl = await blobToDataURL(mhtmlBlob);
    console.log('Data URL生成完了');

    // ファイル名を生成
    const filename = generateFilename(tab.title, tab.url, options);
    console.log('ファイル名:', filename);

    // ダウンロード実行
    const downloadId = await new Promise((resolve, reject) => {
      chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: false
      }, (id) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(id);
        }
      });
    });

    console.log(`保存成功: ${filename} (downloadId: ${downloadId})`);
    return { success: true, filename };
  } catch (error) {
    console.error('保存エラー:', error);
    return { success: false, error: error.message };
  }
}

// 拡張機能アイコンクリック時のハンドラ
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    console.error('タブIDが取得できません');
    return;
  }

  // chrome:// や edge:// などの特殊ページは保存不可
  if (tab.url && (tab.url.startsWith('chrome://') || 
                   tab.url.startsWith('edge://') || 
                   tab.url.startsWith('chrome-extension://'))) {
    console.error('このページは保存できません:', tab.url);
    return;
  }

  console.log(`保存開始: ${tab.title} (${tab.url})`);
  
  const result = await savePageAsMHTML(tab);
  
  if (result.success) {
    console.log('保存完了:', result.filename);
  } else {
    console.error('保存失敗:', result.error);
  }
});

// 拡張機能インストール時の初期化
chrome.runtime.onInstalled.addListener(() => {
  console.log('MHTML Page Saver がインストールされました');
});
