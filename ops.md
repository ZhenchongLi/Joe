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

**结论**：以后写文章的 `date` 字段可以用任意北京时间，`--buildFuture` 保证当天发布的文章一定出现在构建结果里。
