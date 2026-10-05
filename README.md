# 键音 / JIANYIN — 可编辑恢复版

这是根据现有网页截图与 ChatGPT 中保存的“键音 · 钢琴工作台”页面内容重新整理的可编辑版本。

## 文件
- `index.html` 主页面
- `style.css` 页面样式
- `app.js` 音频、88 键钢琴、记录与回放逻辑
- `notation.js` 音符解析
- `language.js` 中英文切换
- `credits.html` 致谢页
- `favicon.svg` 网站图标

## 本地修改
直接用代码编辑器打开这些文件即可。
要预览，可以直接打开 `index.html`；如果浏览器限制本地脚本，可以用任意静态服务器预览。

## 上传到 GitHub
把整个文件夹上传到一个 GitHub repository 即可。

## Cloudflare Pages
之后可以把 GitHub repository 连接到 Cloudflare Pages。这样每次在 GitHub 修改并提交后，网站会自动重新部署。

## 说明
Cloudflare 的“资产已上传”页面只列出部署文件，不能直接打开或编辑源码。
本恢复版不是从 Cloudflare 下载到的原始源码逐字复制，而是依据当前页面信息重新整理成可维护代码。
