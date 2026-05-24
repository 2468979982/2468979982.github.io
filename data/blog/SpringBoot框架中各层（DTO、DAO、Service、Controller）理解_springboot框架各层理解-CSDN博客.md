---
title: Springboot框架中各层
date: '2025-05-22 19:40:29'
tags: ['Springboot']
draft: false
authors: ['default']
---



1.粗略理解

[View层](https://so.csdn.net/so/search?q=View%E5%B1%82&spm=1001.2101.3001.7020)(前端视图展示层), Controller层（响应用户请求）,Service层（接口，接口实现类）,DAO层，即Mapper层（抽象类：xxxMapper.java文件，具体实现在xxxMapper.xml）, Model层（实体类：xxx.java）

2.VO，DTO，DO，PO理解

 2.1解释

```vbnet
VO：View Object，视图层，其作用是将指定页面的展示数据封装起来。

DTO：Data Transfer Object，数据传输对象

DO：Domain Object，领域对象

PO：Persistent Object，持久化对象
```

 2.2模型

```vbscript
用户发出请求（填写表单），表单的数据被展示层匹配为VO

展示层把VO转换为服务层对应方法所要求的DTO，提交给服务层

服务层先将DTO的数据构造（或重建）一个DO，调用DO的业务方法完成具体业务

服务层再将DO转换为持久层对应的PO，调用持久层的持久化方法，把PO传递持久化方法，完成持久化操
```

**3.PO，VO，BO，DTO，JavaBean，JavaBeans，POJO，DAO**

**PO：持久对象 (persistent object)**，po(persistent object)就是在Object/Relation Mapping框架中的Entity，po的每个属性基本上都对应数据库表里面的某个字段。完全是一个符合Java Bean规范的纯Java对象，没有增加别的属性和方法。持久对象是由insert数据库创建，由数据库delete删除的。基本上持久对象生命周期和数据库密切相关。

___

**VO： 表现层对象(View Object)**，主要对应展示界面显示的数据对象，用一个VO对象来封装整个界面展示所需要的对象数据，数据脱敏，去掉用户隐私数据。

___

**BO：业务对象层的缩写(Business Object)**，封装业务逻辑的java对象，通过调用DAO方法，结合PO,VO进行业务操作。具体可以看网上的一个例子：

比如一个简历，有教育经历、工作经历、社会关系等等。  
我们可以把教育经历对应一个PO，工作经历对应一个PO，社会关系对应一个PO。  
建立一个对应简历的BO对象处理简历，每个BO包含这些PO。  
这样处理业务逻辑时，我们就可以针对BO去处理。

___

**DTO：数据传输对象(Data Transfer Object)**，是一种设计模式之间传输数据的软件应用系统。数据传输目标往往是数据访问对象从数据库中检索数据。数据传输对象与数据交互对象或数据访问对象之间的差异是一个以不具有任何行为除了存储和检索的数据（访问和存取器）。简单来说，当我们需要一个对象10个字段的内容，但这个对象总共有20个字段，我们不需要把整个PO对象全部字段传输到客户端，而是可以用DTO重新封装，传递到客户端。此时，如果这个对象用来对应界面的展现，就叫VO。

___

**JavaBean:一种可重用组件**，即“一次性编写，任何地方执行，任何地方重用”。满足三个条件①类必须是具体的和公共的②具有无参构造器③提供一致性设计模式的公共方法将内部域暴露成员属性。

主要用途：可以用在 功能、处理、值、数据库访问和JSP中任何可以用Java代码创造的对象。

有两种：一种是有用户界面（UI，User Interface）的JavaBean；还有一种是没有用户界面，主要负责处理事务（如数据运算，操纵数据库）的JavaBean。JSP通常访问的是后一种JavaBean。

分类：通常有Session bean，Entity bean，MessageDrivenBean三大类

```cobol
1.Session bean会话构件，是短暂的对象，运行在服务器上，并执行一些应用逻辑处理，它由客户端应用程序建立，其数据需要自己来管理。分为无状态和有状态两种。

2.Entity bean实体构件，是持久对象，可以被其他对象调用。在建立时指定一个唯一标示的标识，并允许客户程序，根据实体bean标识来定位beans实例。多个实体可以并发访问实体bean，事务间的协调由容器来完成。

3.MessageDriven Bean消息构件，是专门用来处理JMS（Java Message System）消息的规范（EIB2.0）。JMS是一种与厂商无关的API，用来访问消息收发系统，并提供了与厂商无关的访问方法，以此来访问消息收发服务。JMS客户机可以用来发送消息而不必等待回应。
```

___

**JavaBeans:JavaBeans** 从狭义来说，指的是 JavaBeans 规范也就是位于 java.beans 包中的一组 API。从广义上来说，JavaBeans 指的是 API 集合，比如 Enterprise JavaBeans。

___

**POJO：POJO（Plain Ordinary Java Object）简单的Java对象**，实际就是普通JavaBeans，是为了避免和EJB混淆所创造的简称。通指没有使用Entity Beans的普通java对象，可以把POJO作为支持业务逻辑的协助类。

  POJO实质上可以理解为简单的实体类，顾名思义POJO类的作用是方便程序员使用数据库中的数据表，对于广大的程序员，可以很方便的将POJO类当做对象来进行使用，当然也是可以方便的调用其get,set方法。POJO类也给我们在struts框架中的配置带来了很大的方便。

```undefined
一个POJO持久化以后就是PO

直接用它传递、传递过程中就是DTO

直接用来对应表示层就是VO
```


**DAO: 数据访问对象是第一个面向对象的数据库接口**，是一个数据访问接口(Data Access Object)。它可以把POJO持久化为PO，用PO组装出来VO、DTO。  


DAO模式是标准的J2EE设计模式之一.开发人员使用这个模式把底层的数据访问操作和上层的商务逻辑分开.一个典型的DAO实现有下列几个组件：

```markdown
1. 一个DAO工厂类；

2. 一个DAO接口；

3. 一个实现DAO接口的具体类；

4. 数据传递对象（有些时候叫做值对象）.
```

具体的DAO类包含了从特定的数据源访问数据的逻辑，一般一个DAO类和一张表对应，每个操作要和事务关联。

**阿里开发手册关于应用分层的介绍**  
 ![](https://gitee.com/s2468979982/gitee_img/raw/master/52d25cd9db2349aabeed9480c6a5e7d3.png)

```cobol
1.开放接口层： 可直接封装 Service 方法暴露成 RPC 接口；通过 Web 封装成 http 接口；进行 网关安全控制、流量控制等。

2.终端显示层： 各个端的模板渲染并执行显示的层。当前主要是 velocity 渲染，JS 渲染， JSP 渲染，移动端展示等。

3.Web 层： 主要是对访问控制进行转发，各类基本参数校验，或者不复用的业务简单处理等。

4.Service 层： 相对具体的业务逻辑服务层。

5.Manager 层： 通用业务处理层，它有如下特征：

A）对第三方平台封装的层，预处理返回结果及转化异常信息；

B）对 Service 层通用能力的下沉，如缓存方案、中间件通用处理；

C）与 DAO 层交互，对多个 DAO 的组合复用。

6.DAO 层： 数据访问层，与底层 MySQL、Oracle、Hbase 等进行数据交互。

7.外部接口或第三方平台： 包括其它部门 RPC 开放接口，基础平台，其它公司的 HTTP 接口
```

 

**对于应用分层的各层次再次理解**

  **1.Dao层、Dto层**

  DTO：数据传输对象，一般是把数据库表封装成对象，表的各个字段就是该对象的各个变量。

Dao：数据访问对象，负责封装对数据库的CRUD操作，一般是mapper写接口，xml文件写sql语句的形式。

  **2.manager层、service层、biz层**

  前提： 如果是小应用，而且后续扩展的可能性不高，只需要Dao——service——controller的  
manager层： 负责将Dao层中的数据库操作组合复用，主要是一些缓存方案，中间件的处理，以及对第三方平台封装的层。

  service层： 更加关注业务逻辑，是业务处理层，将manager组合过的操作和业务逻辑组合在一起，再封装成业务操作。

  biz层： 包含service层，service层注重基础业务的处理，biz层是复杂应用层的业务层。

**3.controller层**

  主要负责接受前台的数据和请求，并且在底层处理完之后把结果返回回去，一般不能写业务逻辑在这一层，因为第一造成了不可复用，第二以后的维护困难，第三这一层没有上层，如果给用户返回了奇怪的错误信息将会非常丑陋。