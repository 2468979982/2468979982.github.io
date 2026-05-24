### 一、准备工作

#### ✅ 1. 安装 Java JDK（[Kafka](https://so.csdn.net/so/search?q=Kafka&spm=1001.2101.3001.7020) 依赖 Java 运行环境）

Kafka 是基于 Java 的，必须先[安装 JDK](https://so.csdn.net/so/search?q=%E5%AE%89%E8%A3%85%20JDK&spm=1001.2101.3001.7020)。一般学到kafka的同学肯定已经安装好了JDK了，这一步我就不写了，具体可以参考其他文章。

⚠️ 注意：Kafka 3.9.0 要求本地必须安装 JDK 17 或以上版本。JDK 8 和 11 已不再被官方支持。

##### 步骤：

1.  访问官网下载 [OpenJDK](https://adoptium.net/ "OpenJDK") 或 Oracle JDK。
    
2.  推荐版本：JDK 8 ~ [JDK 17](https://so.csdn.net/so/search?q=JDK%2017&spm=1001.2101.3001.7020)（Kafka 3.x 支持到 JDK 17）
    
    ![](https://i-blog.csdnimg.cn/direct/a4fc229519524deba1995b24f6c6eb53.png)
    
    Kafka需要的JDK版本！
    
3.  安装完成后设置环境变量：
    
    -   `JAVA_HOME`：指向 JDK 安装目录，例如 `C:\Program Files\Java\jdk-17.0.1`
        
    -   `Path` 中添加 `%JAVA_HOME%\bin`
        

##### 验证是否安装成功：

```bash
java -version

javac -version
```

![](https://i-blog.csdnimg.cn/direct/b1da93c4349f40c7af7c8cdca7204828.png)

___

### 二、下载 Kafka

访问 Apache Kafka 官网下载页面：

🔗 [https://kafka.apache.org/downloads](https://kafka.apache.org/downloads "https://kafka.apache.org/downloads")

选择最新的稳定版本，例如：

![](https://i-blog.csdnimg.cn/direct/c36284b3c6f04772949c492a94223dfa.png)

```
Latest release: kafka_2.13-3.9.0.tgz
```

**Windows 用户选择 `kafka_2.13-3.9.0.tgz` 即可，Scala 版本不影响你在 Windows 上运行 Kafka。除非你自己用 Scala 编写客户端程序，否则任意版本都可以。社区推荐使用 2.13，因此建议你就选这个版本。**

> ✅ 注意：Windows 上使用的是 Kafka 自带的 `windows` 脚本，不需要 Linux 工具支持。

___

### 三、解压 Kafka

虽然 Kafka 是为 Linux 设计的，但官方提供了部分 Windows 兼容脚本（位于 `bin/windows/` 目录下），所以你可以放心地：

-   使用 `zookeeper-server-start.bat`
-   使用 `kafka-server-start.bat`
-   创建 Topic、发送和消费消息等操作都正常运行

只是要注意以下几点：

| 注意事项 | 说明 |
| --- | --- |
| 路径**不要有空格或中文** | 推荐安装路径如 `F:\kafka_2.13-3.9.0` |
| 日志文件位置 | 默认在 `logs/` 目录下 |
| 性能略差于 Linux | 本地开发没问题，生产建议用 Linux |
| 不支持某些高级功能 | 如 `log.dirs` 中使用多个磁盘路径（Windows 下可能出错） |

#### Kafka配置（kafka-logs的新建必要！！）

这个文件主要是存放分区的offerset，元文件，记录消费到哪里等等。

| 类型 | 存放内容 |
| --- | --- |
| Topic 数据 | 每个 Topic 的分区数据都存在这里 |
| Offset 信息 | 记录消费者组消费到的位置 |
| 元数据 | 分区状态、ISR（In-Sync Replicas）等 |
| 日志文件 | controller.log、kafka-request.log 等 |

第一步：一定要需要建立一个空文件夹kafka-logs在bin、config同级！！

```bash
F:\kafka_2.13-3.9.0\

├── bin/

├── config/

├── logs/

└── kafka-logs/ ← 新建这个文件夹
```

![](https://i-blog.csdnimg.cn/direct/cc0a4784348f4d82ad1c560822d3f9e3.png)

第二步：编辑\\kafka\_2.13-3.9.0\\config下的server.properties文件

```bash
log.dirs=/kafka-logs
```

除了 `log.dirs`，还有几个常用配置项也建议了解一下，其他改不改不影响基本使用：

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `broker.id` | 0 | Kafka 实例的唯一 ID，单机版保持默认即可 |
| `listeners` | PLAINTEXT://:9092 | Kafka 监听地址，默认本地访问 |
| `num.partitions` | 1 | 默认每个 topic 创建的分区数 |
| `log.retention.hours` | 168 (7天) | 消息保留时间 |
| `log.segment.bytes` | 1GB | 单个日志文件大小上限 |
| `message.max.bytes` | 1MB | 最大消息体大小（生产环境可调大） |

#### 完整配置样例（适合 Windows 单节点开发，不必要，默认也可）

```bash
broker.id=0

listeners=PLAINTEXT://:9092

advertised.listeners=PLAINTEXT://localhost:9092

log.dirs=F:/kafka_2.13-3.9.0/kafka-logs

num.partitions=1

log.retention.hours=168

log.segment.bytes=1073741824

message.max.bytes=10485880

replica.lag.time.ms=10000

offsets.topic.replication.factor=1

transaction.state.log.replication.factor=1

transaction.state.log.min.isr=1
```

### 四、启动 Kafka与关闭Kafka（比较麻烦，需要打开多窗口执行）

#### ✅ 1. 启动 ZooKeeper

Kafka 依赖 ZooKeeper 存储元数据信息。

打开 CMD，进入 Kafka 目录：

```bash
cd F:\kafka_2.13-3.9.0
```

执行以下命令启动 ZooKeeper：

```bash
.\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties
```

✅ 成功标志：看到类似 `INFO ... Starting zookeeper version...` 的日志输出。

___

#### ✅ 2. 启动 Kafka

保持上一个窗口不要关闭，**再打开一个新的 CMD 窗口**，同样进入 Kafka 目录：

执行：

```bash
.\bin\windows\kafka-server-start.bat .\config\server.properties
```

✅ 成功标志：看到 `INFO [KafkaServer id=0] started (kafka.server.KafkaServer)`

![](https://i-blog.csdnimg.cn/direct/b7365692676f4492b5890423ef5ad042.png)

成功启动kafka图

___

#### ✅ 步骤 3：关闭 Kafka

进入 Kafka 目录：

```vbscript
.\bin\windows\kafka-server-stop.bat
```

你会看到 Kafka 开始安全退出，等待几秒后自动结束。

___

#### ✅ 步骤 4：关闭 ZooKeeper

继续在当前 CMD 窗口中执行：

```vbscript
.\bin\windows\zookeeper-server-stop.bat
```

ZooKeeper 也会优雅退出。

### 五、创建 Topic

新打开一个 CMD 窗口，创建一个测试用的 Topic：

```bash
.\bin\windows\kafka-topics.bat --create --topic test-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

参数说明：

-   `--topic`：Topic 名称
    
-   `--partitions`：分区数
    
-   `--replication-factor`：副本数（本地开发设为 1 即可）
    

查看已创建的 Topic：

```bash
.\bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092
```

___

### 六、发送消息（Producer）

打开一个新 CMD 窗口，运行生产者控制台：

```bash
.\bin\windows\kafka-console-producer.bat --topic test-topic --bootstrap-server localhost:9092
```

输入任意文字后按回车即可发送消息，比如：

```bash
Hello Kafka!

This is a test message.
```

___

### 七、消费消息（Consumer）

再新开一个 CMD 窗口，运行消费者控制台：

```bash
.\bin\windows\kafka-console-consumer.bat --topic test-topic --from-beginning --bootstrap-server localhost:9092
```

你会看到刚刚发送的消息被打印出来！

___

### 八、**Windows 下如何正确启动和关闭 Kafka？**

**⚠️ 不要直接关闭 CMD 窗口也不要ctrl + c，都是强制关机！再次启动可能会有很多bug！**

**一定要使用官方的启动和关闭脚本！！！bug血泪！**

因为：

-   `Ctrl + C` 是发送 `SIGINT` 信号，Kafka 和 ZooKeeper 会尝试优雅关闭，但**不一定能完成全部清理工作**
-   如果用户误操作、窗口被意外关闭、或脚本中断，会导致：
    
    -   `.lock` 文件残留
        
    -   `controller.log` 重命名失败
        
    -   ZooKeeper 节点未清除
        
    -   Kafka Broker 状态未更新
        

___

### 九、推荐脚本（自动化启停）

为了方便你以后快速操作，我为你写好了两个批处理脚本：

**放在同级目录下即可！**

![](https://i-blog.csdnimg.cn/direct/c49b688d70cd4defb3b76b8a17e2036e.png)

___

#### ✅ 启动脚本：`start-kafka.bat`

```bash
@echo off

chcp 65001 > nul

TITLE Kafka 启动器 - kafka_2.13-3.9.0



SETLOCAL



set KAFKA_HOME=F:\kafka_2.13-3.9.0



if not exist "%KAFKA_HOME%" (

echo ❌ 错误：KAFKA_HOME 路径不存在: %KAFKA_HOME%

   pause

exit /b 1

)



cd /d %KAFKA_HOME%



:: 清理锁文件（防止上次异常退出导致冲突）

if exist "logs\*.lock" del /Q "logs\*.lock"

if exist "logs\*.pid" del /Q "logs\*.pid"



:: 启动 ZooKeeper

echo ▶️ 正在启动 ZooKeeper...

start "ZooKeeper" /D "%KAFKA_HOME%" call bin\windows\zookeeper-server-start.bat config\zookeeper.properties



:: 等待初始化完成

timeout /t 7 > NUL



:: 启动 Kafka

echo ▶️ 正在启动 Kafka Server...

call bin\windows\kafka-server-start.bat config\server.properties



echo ✅ Kafka 已成功启动！

pause
```

___

#### ✅ 关闭脚本：`stop-kafka.bat`

```bash
@echo off

chcp 65001 > nul

TITLE Kafka 关闭器 - kafka_2.13-3.9.0



SETLOCAL



set KAFKA_HOME=F:\kafka_2.13-3.9.0



if not exist "%KAFKA_HOME%" (

echo ❌ 错误：KAFKA_HOME 路径不存在: %KAFKA_HOME%

   pause

exit /b 1

)



cd /d %KAFKA_HOME%



:: 停止 Kafka

echo ⏹️ 正在尝试优雅地停止 Kafka...

call "%KAFKA_HOME%\bin\windows\kafka-server-stop.bat"



:: 等待 Kafka 进程结束

call :wait_for_process_exit "kafka" 30

if errorlevel 1 (

echo ⚠️ Kafka 进程未能在指定时间内退出，请检查日志或手动终止。

)



:: 停止 ZooKeeper

echo ⏹️ 正在尝试优雅地停止 ZooKeeper...

call "%KAFKA_HOME%\bin\windows\zookeeper-server-stop.bat"



:: 等待 ZooKeeper 进程结束

call :wait_for_process_exit "zookeeper" 30

if errorlevel 1 (

echo ⚠️ ZooKeeper 进程未能在指定时间内退出，请检查日志或手动终止。

)



echo ✅ Kafka 和 ZooKeeper 已尝试优雅关闭。

pause

exit /b 0





:: ============ 函数区 ============



:: 等待指定关键字的 Java 进程退出

:wait_for_process_exit

setlocal

set keyword=%~1

set timeout=%~2

set count=0



echo 🔍 正在等待 [%keyword%] 进程退出，最多等待 %timeout% 秒...



:loop

tasklist | findstr /i java >nul && (

   tasklist | findstr /i %keyword% >nul && (

if %count% lss %timeout% (

timeout /t 1 >nul

set /a count+=1

           goto loop

       ) else (

           endlocal

exit /b 1

       )

   )

)



endlocal

exit /b 0
```

![](https://i-blog.csdnimg.cn/direct/e82ade6a847d4f24ac98841c85b92b04.png)

优雅地关闭Kafka

### 十、常见问题与解决方案

| 问题 | 可能原因 | 解决方案 |
| --- | --- | --- |
| **`Address already in use`** | 上次未正常关闭 Kafka 或 ZooKeeper | 使用 `stop-kafka.bat` 关闭服务，或重启电脑 |
| **`Node does not exist`** | ZooKeeper 没有正确启动 | 确保 ZooKeeper 启动后再启动 Kafka |
| **`Class 'kafka.Kafka' could not be found`** | 路径错误或 JDK 版本不对 | 检查 `JAVA_HOME` 是否设置正确 |
| **`找不到或无法加载主类`** | Kafka 路径包含中文或空格 | 将 Kafka 安装到英文路径下 |

___