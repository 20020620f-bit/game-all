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
- 纸飞机射击
- 跳一跳

## 玩法参考

新增店铺玩法前检查过这些 GitHub 项目：

- `greenkg/lemonade-stand-js`：摆摊经营的库存、定价、天气、口碑模型
- `DaJoker29/cafe-sim`：咖啡店模拟方向，许可证为 GPLv2，未直接并入代码
- `jaidelikescode/MatchaMother`：顾客点单、配方制作、连击奖励的浏览器玩法
- `EduardoFontes123/capybara-bubble-tea-catcher`：奶茶题材轻小游戏方向

新增飞机射击玩法前检查过这些 GitHub 项目：

- `Jafnee/Generic-Space-Shooter`：HTML5 Canvas 横版射击游戏，MIT 许可证，代码结构和 Canvas 循环可参考
- `robertooya/sky-defender`：复古飞机射击方向，未看到明确许可证，未直接并入代码
- `rishimadhok/Space-Shooter-Game`：轻量浏览器射击方向，未看到明确许可证，未直接并入代码

新增跳一跳玩法前检查过这些 GitHub 项目：

- `Ryqsky/wechat-jump-game-js`：MIT 许可证，但项目本体是 Node/ADB 自动刷分工具，不适合作为 GitHub Pages 小游戏直接并入；当前实现只参考“距离换成长按时长”的玩法思路

未直接复制第三方代码；当前实现按本项目现有结构重写，避免许可证和依赖混入。

## 素材

店铺游戏使用项目内 SVG 素材包，路径在 `assets/game/`。素材覆盖顾客头像、奶茶机、小料、花材、夜市摊车、灯笼、商品和金币，安装成 PWA 后会通过 service worker 离线缓存。

## 存档

游戏数据保存在浏览器 `localStorage`，包括金币、每日签到、最好成绩、已解锁装扮、穿搭和桌面布置。新存档初始 600 金币，每天只能签到一次，签到奖励 1000 金币。首页提供导出/导入存档按钮，换设备或清理浏览器数据前可以手动备份。

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

烟测会用 390x844 手机视口检查首页、11 个小游戏入口、本地存档和横向滚动。
