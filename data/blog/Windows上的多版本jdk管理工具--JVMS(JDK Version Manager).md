---
title: Windows上的多版本jdk管理工具--JVMS
date: '2025-07-22 19:40:29'
tags: ['JVMS']
draft: false
authors: ['default']
---



# [Windows上的多版本jdk管理工具--JVMS(JDK Version Manager)](https://www.cnblogs.com/lkch/p/18823971)



## 前言

Java在Windows上因为版本太多导致难以管理，这个方式可以很好的解决版本的切换。(也可以自己编写脚本方式切换)

## 项目地址

[GitHub - ystyle/jvms: JDK Version Manager (JVMS) for Windows](https://github.com/ystyle/jvms)

gitHub连接不上时可以现在镜像地址

[KK](https://kkgithub.com/ystyle/jvms/blob/new/README.md)[GitHub - ystyle/jvms: JDK](https://kkgithub.com/ystyle/jvms)[ Version](https://kkgithub.com/ystyle/jvms)[ Manager (JVMS) for Windows](https://kkgithub.com/ystyle/jvms)

## 项目具体介绍

适用于 Windows 的 JDK 版本管理器 (JVMS)，在Windows上轻松的管理多Java版本。

## 使用教程

### 安装

https://github.com/ystyle/jvms/releases

备用github连接

https://kkgithub.com//ystyle/jvms/releases



### 初始化

- 从上面的链接下载完成
- 解压zip并将jvms.exe复制到你想要的路径
- 以管理员身份运行 cmd 或 powershell
- cd 到jvms.exe其中的文件夹
- 执行初始化指令 (默认JAVA_HOME是获取ProgramFile路径,可以看下面自定义设置JAVA_HOME)



```cmd
./jvms.exe init
```

#### 注意

jvms管理工具必须进行初始化，否则会发生错误：

```cmd
Switch jdk failed, symlink D:\jvms_v2.1.6_amd64\store\11.0.15.1 : The system cannot find the path specified.
```

## 常用指令

## 使用本地的jdk进行版本切换

大部分人需要jdk版本管理工具的原因都是本地已经安装了多个JDK，所以这里直接用本地的jdk进行版本切换即可。具体步骤如下：

### 新建store目录

我们下载的jvms管理工具的压缩包中是只有一个可执行文件，初始化之后也是一样的，**而想通过jvms管理jdk则必须在store下才可以，所以我们要在jvms的目录新建一个store目录**

### 复制本地jdk

找到我们本地的jdk，一般情况下都是在这个目录，如果安装不是默认路径的话，自己去安装的路径找就行了 `C:\Program Files\Java`

可以看到我的jdk版本有三个

将其复制到jvms管理工具的store目录下

![img](https://file.jishuzhan.net/article/1719722909317992450/9da3761a4c2c7231a31973ce83398484.webp)

我这里为了方便已经将jdk的名字给重命名了

### jvms本地版本列表

 jvms list 

![img](https://gitee.com/s2468979982/gitee_img/raw/master/2038137-20250413230751745-728676477.png)

 

### jvms进行版本切换

#### ls查看可用jdk版本

先使用ls指令看看我们本地的jdk
![img](https://file.jishuzhan.net/article/1719722909317992450/f03b53503e5acbc8b61ccf87fa130422.webp)

可以看到我们刚刚复制过来的jdk是可用的，接下来切换版本即可，注意这里有一个问题，你的cmd或powershell必须是以管理员模式运行的，否则jvms是没有权限写入Path的，会出现下面这种错误：

```cmd
set Environment variable JAVA_HOME failure: Please run as admin user
```

#### switch进行版本切换

先看一下当前系统的jdk版本，方便验证
![img](https://file.jishuzhan.net/article/1719722909317992450/48c0b6bd2eeb2e8ffbe96b20bb3700d9.webp)

当前系统jdk版本为17，那么我将其切换为jdk8

![img](https://gitee.com/s2468979982/gitee_img/raw/master/2038137-20250413230208917-888411822.png)

 

执行 

```cmd
jvms  s jdk-8
```

 效果如下:

![img](https://gitee.com/s2468979982/gitee_img/raw/master/2038137-20250413230445237-865751854.png)

 


![img](https://file.jishuzhan.net/article/1719722909317992450/845371c8675378bffe0d354a8cff9bd4.webp)

可以看到切换成功，现在验证版本，我们需要另外再开一个cmd窗口，原因是当前窗口的是不会刷环境变量的
![img](https://file.jishuzhan.net/article/1719722909317992450/477d94c20f34fd4f43f4b4eae4e83065.webp)

切换成功

## 使用jvms下载jdk并管理

有的师傅呢就想把之前的卸了之后全用jvms重新下载加以管理，也有点师傅刚刚入行安全，还没得及用上jdk，想直接使用jvms。所以这里也提供使用jvms下载jdk的办法

#### 列出jvms默认情况下可以下载的jdk版本

```cmd
jvms init --originalpath https://raw.githubusercontent.com/ystyle/jvms/new/jdkdlindex.json
```

程序默认是获取Profilegram默认路径作为JAVA_HOME,用户可以单独设置JAVA_HOME。运行JAVA_HOME。

![img](https://gitee.com/s2468979982/gitee_img/raw/master/2038137-20250413225456882-1011844622.png)

 

#### **自定义设置JAVA_HOME的路径**

```
jvms.exe init --java_home D:\jdk
```

　

![img](https://gitee.com/s2468979982/gitee_img/raw/master/2038137-20250413230038889-562872238.png)

 

使用rls指令列出可以安装的jdk版本

```
jvms.exe rls
```

![img](https://file.jishuzhan.net/article/1719722909317992450/24a43f78d63b7cf7551885d61a1750b2.webp)

想安装什么版本的jdk直接安装即可，如安装jdk20.0.0

```
jvms install 20.0.0
```

　　

然后等待下载即可，这里的这个json是GitHub上的，所以使用jvms下载的时候记得挂代理，不过我还是推荐本地添加而不是连接github下载。

 

### 注意: switch底层使用 Symlink 链接符实现,进行切换可能会出现

```
Switch jdk failed, symlink D:\jvms\jvms_v2.1.6_amd64\store\jdk-8 D:\jvms\jdk: A required privilege ``is` `not held ``by` `the client.　
```

 

我是通过设置开发者模式解决,暂时没找到好的方法。

- 打开 设置（Win + I）→ 隐私和安全性 → 开发者选项。
- 开启 “开发人员模式”。
- 重启电脑后重试。

### 安装包

[vms_v2.1.6_amd64.zip](https://kkgithub.com/ystyle/jvms/releases/download/v2.1.6/jvms_v2.1.6_amd64.zip)