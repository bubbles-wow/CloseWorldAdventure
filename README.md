# 使用教程
### 通过GitHub Pages：
  [点击这里即可开始](https://bubbles-wow.github.io/CloseWorldAdventure/)
### 使用VSCode的插件实现运行
1. 克隆仓库到本地
  ```shell
  git clone https://github.com/bubbles-wow/CloseWorldAdventure.git
  ```
2. 用VSCode打开克隆的仓库文件夹

    安装插件 [Live Preview](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server) 或 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)。
### 使用Node.js本地托管
1. 官网下载安装[Node.js](https://nodejs.org/en)
2. 克隆仓库到本地
  ```shell
  git clone https://github.com/bubbles-wow/CloseWorldAdventure.git
  ```
3. 命令行下打开克隆的目录，并运行命令安装express模块
  ```shell
  npm install express
  ```
4. 运行下面命令启动托管服务器
  ```
  node app.js
  ```
5. 启动成功，你会看到有网址显示在命令行中。浏览器打开即可体验。