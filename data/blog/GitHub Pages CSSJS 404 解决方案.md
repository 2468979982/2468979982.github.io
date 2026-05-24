## GitHub Pages CSS/JS 404 解决方案

GitHub Pages 上出现 CSS 或 JS 文件 404 错误通常由路径配置、Jekyll 处理规则或前端路由兼容性问题导致。以下是综合多个案例整理的完整解决方案：

### ⚙️ 一、禁用 Jekyll 对特殊路径的忽略（最常见原因）

GitHub Pages 默认使用 Jekyll 构建，**以 `_` 开头的目录或文件（如 `_css`, `_js`）会被忽略**，导致资源加载失败：
1. **在仓库根目录创建 `.nojekyll` 文件**  
   此文件可彻底禁用 Jekyll 处理机制。  
   **操作方式**：
   - 命令行：`touch .nojekyll`
   - Travis CI 脚本：添加 `touch {toxinidir}/.nojekyll`
   - 手动：在 GitHub 仓库根目录新建空文件，命名为 `.nojekyll`

2. **检查文件名规范**  
   避免资源文件以 `_` 开头（如 `_main.js`），Jekyll 会跳过此类文件。

---

### 📂 二、修复文件引用路径错误
路径问题是 404 的常见诱因，需从多角度验证：
- **相对路径 vs 绝对路径**  
  在 HTML 中优先使用 **相对路径**（如 `./css/style.css`），而非绝对路径（如 `/css/style.css`）。绝对路径在项目页（`username.github.io/repo`）会失效。
- **大小写敏感问题**  
  GitHub 路径**严格区分大小写**。确保引用的文件名与仓库实际文件名完全一致（如 `Main.css` ≠ `main.css`）。
- **基础路径配置（Jekyll 项目专用）**  
  在 `_config.yml` 中设置：
  ```yaml
  # 用户站点（username.github.io）
  baseurl: ""  
  url: "https://username.github.io"

  # 项目站点（username.github.io/repo）
  baseurl: "/repo-name"  
  url: "https://username.github.io"
  ```
  错误配置会导致资源路径拼接错误。

---

### 🧩 三、解决 SPA 路由刷新 404 问题（React/Vue 等框架）
GitHub Pages 未配置为支持前端路由，需额外处理：
1. **方案 1：使用 HashRouter（React Router）**  
   替换 `BrowserRouter` 为 `HashRouter`，URL 会变为 `example.com/#/about`，但可避免 404：
   ```jsx
   import { HashRouter as Router } from "react-router-dom";
   ```

2. **方案 2：添加 404.html 重定向逻辑**  
   - 复制 `index.html` 内容到 `404.html`  
   - 在 `index.html` 的 `<head>` 中加入路由重定向脚本（参考 [spa-github-pages 方案](https://github.com/rafgraph/spa-github-pages)）。

---

### 🛠️ 四、其他关键排查点
| **问题类型**         | **解决措施**                                                 | **引用依据 |
| -------------------- | ------------------------------------------------------------ | ---------- |
| **缓存导致旧文件**   | 强制刷新浏览器（Ctrl+F5），或部署时添加版本号 `style.css?v=1` |            |
| **未正确上传文件**   | 确认 CSS/JS 文件已推送至正确的分支（如 `gh-pages` 或 `main`） |            |
| **资源权限问题**     | 检查文件权限（GitHub 需设为 Public 仓库）                    |            |
| **构建输出路径错误** | 框架打包后路径需匹配（如 Vue 的 `publicPath: '/repo-name/'`） |            |

---

### 💎 解决方案速查表
| **症状**                         | **优先方案**                    | **备选方案**           |
| -------------------------------- | ------------------------------- | ---------------------- |
| `_css` 或 `_js` 目录 404         | ✅ 创建 `.nojekyll` 文件         | 重命名目录（去掉 `_`） |
| 子页面刷新 404（React/Vue）      | ✅ 改用 `HashRouter`             | 配置 404.html 重定向   |
| 本地正常，部署后资源 404         | ✅ 检查 `_config.yml` 的路径配置 | 切换为相对路径引用     |
| 部分 .js 文件 404（含 `_` 前缀） | ✅ 重命名文件避免 `_` 开头       | 移除 Jekyll 处理       |

> 若问题仍未解决，可在仓库的 **Settings > Pages** 中查看构建日志，或通过浏览器开发者工具（Network 标签页）确认资源请求的具体 URL 与服务器响应。