# MHTML Page Saver

現在表示中のWebページをMHTML形式で保存するChrome拡張機能です。

## 機能

- **ワンクリック保存**: 拡張機能アイコンをクリックするだけでページをMHTML形式で保存
- **完全なページ保存**: 画像・CSS・JavaScriptを含めて1ファイルに保存
- **カスタマイズ可能**: ファイル名形式や待機時間を設定可能

## インストール方法

1. このフォルダ内のファイルをダウンロードまたはクローン
2. Chrome で `chrome://extensions` を開く
3. 右上の「デベロッパーモード」をオンにする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. このフォルダを選択

### アイコンについて

`icons/` フォルダにはSVGファイルが含まれています。PNGファイルが必要な場合は、以下のコマンドでSVGからPNGに変換してください：

```bash
# ImageMagickを使用する場合
convert icons/icon16.svg icons/icon16.png
convert icons/icon48.svg icons/icon48.png
convert icons/icon128.svg icons/icon128.png

# または rsvg-convert を使用する場合
rsvg-convert -w 16 -h 16 icons/icon16.svg -o icons/icon16.png
rsvg-convert -w 48 -h 48 icons/icon48.svg -o icons/icon48.png
rsvg-convert -w 128 -h 128 icons/icon128.svg -o icons/icon128.png
```

または、任意の16x16、48x48、128x128のPNG画像を`icons/`フォルダに配置してください。

## 使い方

1. 保存したいWebページを開く
2. ツールバーの拡張機能アイコンをクリック
3. MHTMLファイルが自動的にダウンロードされる

## 設定

拡張機能アイコンを右クリック → 「オプション」で設定画面を開けます。

- **待機時間**: ページ読み込み完了を待つ時間（SPA対策）
- **ファイル名形式**: 保存時のファイル名パターン
- **通知表示**: 保存完了時の通知オン/オフ

## ファイル構成

```
web-download/
├── manifest.json    # 拡張機能の設定ファイル
├── background.js    # Service Worker（メイン処理）
├── options.html     # 設定画面HTML
├── options.js       # 設定画面スクリプト
├── icons/           # アイコン画像
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md        # このファイル
```

## 必要な権限

- `activeTab`: 現在のタブにアクセス
- `downloads`: ファイルのダウンロード
- `pageCapture`: MHTMLの取得
- `tabs`: タブ情報の取得
- `storage`: 設定の保存

## 注意事項

- `chrome://` や `edge://` などの特殊ページは保存できません
- 動的コンテンツが多いページは待機時間を長めに設定してください

## ライセンス

MIT License
