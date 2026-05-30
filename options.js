// MHTML Page Saver - Options Script

// デフォルト設定
const DEFAULT_OPTIONS = {
  waitTime: 1000,
  filenameFormat: 'title_date_hostname',
  showNotification: true
};

// DOM要素
const waitTimeInput = document.getElementById('waitTime');
const filenameFormatSelect = document.getElementById('filenameFormat');
const showNotificationCheckbox = document.getElementById('showNotification');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

// 設定を読み込んでUIに反映
async function loadOptions() {
  const options = await chrome.storage.sync.get(DEFAULT_OPTIONS);
  
  waitTimeInput.value = options.waitTime;
  filenameFormatSelect.value = options.filenameFormat;
  showNotificationCheckbox.checked = options.showNotification;
}

// 設定を保存
async function saveOptions() {
  const options = {
    waitTime: parseInt(waitTimeInput.value, 10) || 1000,
    filenameFormat: filenameFormatSelect.value,
    showNotification: showNotificationCheckbox.checked
  };

  try {
    await chrome.storage.sync.set(options);
    showStatus('設定を保存しました', 'success');
  } catch (error) {
    showStatus('保存に失敗しました: ' + error.message, 'error');
  }
}

// ステータスメッセージを表示
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = type;
  
  // 3秒後に非表示
  setTimeout(() => {
    statusDiv.className = '';
  }, 3000);
}

// イベントリスナー
saveButton.addEventListener('click', saveOptions);

// 初期化
document.addEventListener('DOMContentLoaded', loadOptions);
