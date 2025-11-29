+++
date = '2025-11-29T15:00:00+08:00'
draft = false
title = "Ubuntu GNOME Wayland 下的终极截图方案：原生捕获 + Rust 编辑器 Satty"
description = "在 Ubuntu Wayland 环境下，结合 GNOME 原生接口和 Rust 编写的 Satty 工具，打造一套完美的截图工作流。支持区域截图、标注、马赛克、复制到剪贴板等功能。"
categories = ['Linux']
tags = ['Ubuntu', 'Wayland', 'Screenshot', 'Satty', 'Rust', 'GNOME', 'Tools']
+++

## 前言：Wayland 下的截图之痛

如果你是 Ubuntu 22.04 或 24.04 的用户，并且正在使用默认的 GNOME Wayland 桌面，你大概率经历过截图工具的痛点：

1. **系统自带工具 (Shift+PrtSc)**：虽然稳定且原生，但功能过于简陋。它只能截图，无法直接进行标注（画箭头、马赛克、文字），必须保存后用 GIMP 或其他软件打开，流程繁琐。

2. **传统神器 (Flameshot)**：在 X11 时代是王者，但在 Wayland 下水土不服。启动慢、多显示器错位、甚至无法截取窗口。

本文介绍一套结合 **GNOME 原生接口** 和 Rust 编写的 **Satty** 工具的完美截图工作流。

## 方案核心

gnome-screenshot 负责截图，Satty 负责图片编辑。

- **捕获**：`gnome-screenshot` - GNOME 官方工具，完美支持 Wayland，不会黑屏或错位
- **编辑**：**Satty** - 现代化 Rust 工具，基于 GTK4，支持箭头、文字、画笔、马赛克、剪裁

## 部署教程

### 第一步：安装依赖

```bash
sudo apt update
sudo apt install gnome-screenshot wl-clipboard
```


由于 Satty 是 Rust 项目，如果你是开发者，推荐直接用 Cargo 安装：

```bash
cargo install satty
```

*注：请确保 `~/.cargo/bin` 已加入 PATH*

如果你没有 Rust 环境，可以去 [GitHub Releases](https://github.com/gabm/satty/releases) 下载编译好的二进制文件。

### 第二步：编写"胶水"脚本

我们需要一个脚本把这两个工具串联起来：先截图，保存为临时文件，然后立即唤醒 Satty 打开它。

1. 创建脚本文件：
   ```bash
   mkdir -p ~/.local/bin
   nano ~/.local/bin/smart-shot
   ```

2. 粘贴以下内容：

   ```bash
   #!/bin/bash

   # 生成一个带时间戳的临时文件路径
   TMP_FILE="/tmp/screenshot_$(date +%s).png"

   # 1. 调用 gnome-screenshot 进行区域截图
   # -a: 区域选择模式 (Area)
   # -f: 输出到文件
   gnome-screenshot -a -f "$TMP_FILE"

   # 2. 检查文件是否存在
   # (如果用户按 Esc 取消了截图，文件就不会生成，防止 Satty 报错)
   if [ -f "$TMP_FILE" ]; then
       # 3. 用 Satty 打开图片进行编辑
       satty --filename "$TMP_FILE" --copy-command wl-copy --early-exit

       # 4. (可选) 清理临时文件
       # Satty 编辑完复制到剪贴板后，这个原图就可以删了
       rm "$TMP_FILE"
   fi
   ```

3. 赋予执行权限：
   ```bash
   chmod +x ~/.local/bin/smart-shot
   ```

### 第三步：绑定快捷键

这是最后一步，将脚本绑定到你习惯的快捷键上（比如 `Super + Shift + S` 或 `Ctrl + Alt + A`）。

#### 图形界面方式

1. 打开 Ubuntu **设置 (Settings)** → **键盘 (Keyboard)**
2. 点击 **查看及自定义快捷键 (View and Customize Shortcuts)**
3. 选择底部的 **自定义快捷键 (Custom Shortcuts)**
4. 点击添加，填写如下信息：
   - **名称**：`Smart Screenshot`
   - **命令**：`/home/你的用户名/.local/bin/smart-shot`（替换为你的实际路径）
   - **快捷键**：按下你想用的组合键

*小贴士：如果你想替换系统的 PrtSc 键，建议先去"截图"分类里禁用系统的默认快捷键，避免冲突。*

#### 命令行方式

如果你想通过命令行自动配置，可以使用 `gsettings`：

```bash
# 获取当前用户名
USERNAME=$(whoami)

# 设置自定义快捷键
gsettings set org.gnome.settings-daemon.plugins.media-keys custom-keybindings "['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/']"

# 配置快捷键详情
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ name 'Smart Screenshot'
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ command "/home/$USERNAME/.local/bin/smart-shot"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ binding '<Super><Shift>s'
```

*注：上面的命令将快捷键设置为 `Super+Shift+S`，你可以根据需要修改 `binding` 参数。*

### 第四步：进阶配置

Satty 支持配置文件，我们可以让它变得更顺手。比如：**复制后自动关闭窗口**（类似微信截图的体验）。

创建配置文件：

```bash
mkdir -p ~/.config/satty
cat > ~/.config/satty/config.toml << 'EOF'
[general]
# 启动时不全屏，只显示图片大小
fullscreen = false
# 初始工具（箭头）
initial-tool = "arrow"
# 复制命令（使用 wl-clipboard）
copy-command = "wl-copy"
# 复制后自动退出
early-exit = true
# 保存后关闭
save-after-copy = false
# 默认输出文件名模板
output-filename = "/tmp/satty-{timestamp}.png"

[font]
family = "Ubuntu"
style = "Bold"
EOF
```

## 完整自动化安装脚本

如果你想一键完成所有配置，可以使用以下脚本：

```bash
#!/bin/bash

echo "=== Ubuntu Wayland 截图方案自动安装 ==="

# 1. 安装系统依赖
echo "正在安装系统依赖..."
sudo apt update
sudo apt install -y gnome-screenshot wl-clipboard

# 2. 检查 Cargo 是否安装
if ! command -v cargo &> /dev/null; then
    echo "未检测到 Cargo，正在安装 Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# 3. 安装 Satty
echo "正在安装 Satty..."
cargo install satty

# 4. 创建脚本目录
mkdir -p ~/.local/bin

# 5. 创建 smart-shot 脚本
echo "正在创建截图脚本..."
cat > ~/.local/bin/smart-shot << 'SCRIPT_EOF'
#!/bin/bash

TMP_FILE="/tmp/screenshot_$(date +%s).png"

gnome-screenshot -a -f "$TMP_FILE"

if [ -f "$TMP_FILE" ]; then
    satty --filename "$TMP_FILE" --copy-command wl-copy --early-exit
    rm "$TMP_FILE"
fi
SCRIPT_EOF

chmod +x ~/.local/bin/smart-shot

# 6. 创建 Satty 配置
echo "正在创建 Satty 配置..."
mkdir -p ~/.config/satty
cat > ~/.config/satty/config.toml << 'CONFIG_EOF'
[general]
fullscreen = false
initial-tool = "arrow"
copy-command = "wl-copy"
early-exit = true
save-after-copy = false
output-filename = "/tmp/satty-{timestamp}.png"

[font]
family = "Ubuntu"
style = "Bold"
CONFIG_EOF

# 7. 配置快捷键
echo "正在配置快捷键 (Super+Shift+S)..."
USERNAME=$(whoami)

gsettings set org.gnome.settings-daemon.plugins.media-keys custom-keybindings "['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/']"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ name 'Smart Screenshot'
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ command "/home/$USERNAME/.local/bin/smart-shot"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ binding '<Super><Shift>s'

echo ""
echo "✅ 安装完成！"
echo ""
echo "使用方法："
echo "  - 按 Super+Shift+S 开始截图"
echo "  - 拖动鼠标选择区域"
echo "  - 使用工具栏进行标注（箭头、文字、马赛克等）"
echo "  - 按 Ctrl+C 或点击复制按钮，截图自动复制到剪贴板"
echo ""
echo "配置文件位置："
echo "  - 脚本: ~/.local/bin/smart-shot"
echo "  - 配置: ~/.config/satty/config.toml"
echo ""
```

将上面的脚本保存为 `install-screenshot.sh`，然后执行：

```bash
chmod +x install-screenshot.sh
./install-screenshot.sh
```

## 最终效果

现在，按下你设置的快捷键（`Super+Shift+S`）：

1. 鼠标光标变成十字，拖动选择区域
2. 松开鼠标，**Satty** 窗口瞬间弹出
3. 按下工具栏的箭头按钮画几个箭头，用笔刷工具给敏感信息打个马赛克
4. 按下 `Ctrl+C` 或点击复制按钮
5. 窗口自动消失，截图已在你的剪贴板中，随时可以粘贴到微信、Slack、文档等

## 常见问题

### Q: Satty 窗口无法启动？

A: 检查 Satty 是否正确安装：
```bash
which satty
satty --version
```

### Q: 快捷键不生效？

A: 检查是否与系统默认快捷键冲突：
```bash
gsettings list-recursively org.gnome.settings-daemon.plugins.media-keys | grep screenshot
```

### Q: 想要修改快捷键？

A: 修改绑定命令中的 `binding` 参数，常用快捷键格式：
- `<Super><Shift>s` = Super+Shift+S
- `<Control><Alt>a` = Ctrl+Alt+A
- `Print` = PrtSc 键

### Q: 想要保存截图到文件而不是剪贴板？

A: 修改 `~/.config/satty/config.toml`：
```toml
[general]
early-exit = false  # 不自动退出
save-after-copy = true  # 复制后也保存
output-filename = "~/Pictures/Screenshots/screenshot-{timestamp}.png"
```


## 参考资源

- [Satty GitHub](https://github.com/Satty-org/Satty)
- [gnome-screenshot GitLab](https://gitlab.gnome.org/GNOME/gnome-screenshot/)
- [gnome-screenshot man page](https://linux.die.net/man/1/gnome-screenshot)
- [Wayland Clipboard Tools](https://github.com/bugaevc/wl-clipboard)
