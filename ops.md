# 运维笔记

## Hugo + Netlify 时区问题

**现象**：同一天发布的文章在站点上 404，本地 `hugo serve` 正常，GitHub 上文件存在。

**原因**：Hugo 默认不构建"未来"日期的文章（`publishDate > now`）。Netlify 以 UTC 时区构建，北京时间（+08:00）的文章时间比 UTC 早 8 小时。如果 Netlify 构建时 UTC 时间早于文章时间，该文章被当作未来文章跳过。

例：`date = '2026-04-17T10:00:00+08:00'` = UTC `2026-04-17T02:00:00`。Netlify 若在 UTC 01:00 构建，这篇文章就消失了。

**解法**：netlify.toml 加 `--buildFuture` flag：

```toml
[build]
command = "hugo --gc --minify --buildFuture"
```

已在 commit `fc68bd3`（2026-04-17）修复。

**结论**：`--buildFuture` 在 netlify.toml 里，但 Netlify 线上构建不一定吃到（2026-04-21 实测 `17:00+08:00` 的文章被跳过）。**安全做法：发文 `date` 统一用 `09:00:00+08:00`**（= UTC 01:00，对 Netlify 任何构建时间都是过去），不依赖 `--buildFuture`。
