# 贡献指南

感谢你对花语音乐的兴趣！我们欢迎各种形式的贡献～

## 🐛 发现 Bug

如果你发现了 bug，请提一个 Issue，并包含以下信息：

- **Bug 描述**：清楚说明是什么问题
- **复现步骤**：如何复现这个 bug
- **预期行为**：你觉得应该是什么样的
- **截图**：如果方便的话，附截图更清楚
- **环境信息**：浏览器、设备、系统版本

## 💡 新功能建议

有好点子？欢迎提 Feature Request！

请说明：
- 这个功能解决了什么问题
- 你期望的实现方式
- 有没有类似的参考

## 🔧 代码贡献

### 开发环境搭建

```bash
# 1. Fork 并克隆项目
git clone https://github.com/你的用户名/huayu-music.git
cd huayu-music

# 2. 安装依赖
npm install

# 3. 复制环境变量
cp .env.example .env
# 编辑 .env 填写你的配置

# 4. 启动开发服务器
npm run dev
```

### 提交代码

1. 创建新分支：`git checkout -b feature/your-feature`
2. 提交改动：`git commit -m 'feat: add some feature'`
3. 推送到分支：`git push origin feature/your-feature`
4. 开启 Pull Request

### 代码规范

- 使用 TypeScript，尽量写类型
- 组件保持简洁，单一职责
- 样式遵循设计规范（米白 + 鼠尾草绿 + 玫瑰粉）
- 提交信息遵循 Conventional Commits 规范

## 📝 文档贡献

发现文档有错误或者不完整？也欢迎提 PR 改进！

---

再次感谢你的贡献！🌸
