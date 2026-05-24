## ElasticSearch常见问题

### 1、ElasticSearch使用内部JDK配置

#### 问题表现

cmd 警告 

```cmd
warning: ignoring JAVA_HOME=D:\tools\jvms\store\jdk-17; using ES_JAVA_HOME
```

抛出异常

```cmd
FileNotFound /lib/dt.jar 和 /lib/tools.jar
```

#### 问题原因

elasticSearch 比原生JDK多了dt.jar和tools.jar，直接使用原因JDK会抛出异常

#### 问题解决

我们可以修改环境变量$JAVA_HOME$，但是可能会导致其他项目受到影响。ES推荐我们重新设置环境变量$ES_JAVA_HOME$指向ElasticSearch内部JDK，然后编辑环境变量$CLASSPATH$，去添加/lib/dt.jar和/lib/tools.jar

```text
.;%ES_JAVA_HOME%/lib/dt.jar;%ES_JAVA_HOME%/lib/tools.jar
```





### 2、http://127.0.0.1:9200/无法访问

#### 问题表现

```
received plaintext http traffic on an https channel, closing connection Netty4HttpChannel{localAddress=/[0:0:0:0:0:0:0:1]:9200
```

#### 问题原因

原因是Elasticsearch在Windows下开启了[安全认证](https://so.csdn.net/so/search?q=安全认证&spm=1001.2101.3001.7020)，虽然started成功，但访问http://localhost:9200/失败。



#### 解决方案

找到config/目录下面的elasticsearch.yml配置文件，把安全认证开关从原先的true都改成false，实现免密登录访问即可，修改这两处都为false后：

```yml
xpack.security.enabled: false  #设置为false

xpack.security.enrollment.enabled: true

# Enable encryption for HTTP API client connections, such as Kibana, Logstash, and Agents
xpack.security.http.ssl:
  enabled: true
  keystore.path: certs/http.p12

# Enable encryption and mutual authentication between cluster nodes
xpack.security.transport.ssl:
  enabled: false
  verification_mode: certificate
  keystore.path: certs/transport.p12
  truststore.path: certs/transport.p12
# Create a new cluster with the current node only
# Additional nodes can still join the cluster later
cluster.initial_master_nodes: ["LAPTOP-M7JHAVSP"]

# Allow HTTP API connections from anywhere
# Connections are encrypted and require user authentication
http.host: 0.0.0.0

# Allow other nodes to join the cluster from anywhere
# Connections are encrypted and mutually authenticated
#transport.host: 0.0.0.0
```

