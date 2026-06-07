# 小游戏

一个面向手机端的单机小游戏合集，静态网页即可运行，适合部署到 GitHub Pages。

## 已包含小游戏

- 甜点翻牌
- 花束合成
- 包包收纳
- 下午茶找不同
- 今日穿搭
- 桌面布置
- 奶茶店
- 花店
- 摆摊店

## 玩法参考

新增店铺玩法前检查过这些 GitHub 项目：

- `greenkg/lemonade-stand-js`：摆摊经营的库存、定价、天气、口碑模型
- `DaJoker29/cafe-sim`：咖啡店模拟方向，许可证为 GPLv2，未直接并入代码
- `jaidelikescode/MatchaMother`：顾客点单、配方制作、连击奖励的浏览器玩法
- `EduardoFontes123/capybara-bubble-tea-catcher`：奶茶题材轻小游戏方向

未直接复制第三方代码；当前实现按本项目现有结构重写，避免许可证和依赖混入。

## 存档

游戏数据保存在浏览器 `localStorage`，包括金币、最好成绩、已解锁装扮、穿搭和桌面布置。首页提供导出/导入存档按钮，换设备或清理浏览器数据前可以手动备份。

## 本地运行

```powershell
powershell -ExecutionPolicy Bypass -File scripts\dev-server.ps1
```

然后打开：

```text
http://localhost:5173/
```

## 部署到 GitHub Pages

把整个项目上传到 GitHub 仓库后，在仓库设置里开启 GitHub Pages，来源选择主分支根目录即可。项目没有构建步骤，也不依赖后端服务。

## 验证

```powershell
powershell -ExecutionPolicy Bypass -File scripts\smoke-test.ps1
```

烟测会用 390x844 手机视口检查首页、6 个小游戏入口、本地存档和横向滚动。
