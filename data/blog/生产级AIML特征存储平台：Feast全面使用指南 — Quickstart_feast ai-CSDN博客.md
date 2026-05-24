---
title:  生产AI/ML特征存储平台
date: '2025-07-22 19:40:29'
tags: ['Feast']
draft: false
authors: ['default']
---





生产级AI/ML特征存储平台：Feast全面使用指南 — Quickstart

> Feast（Feature Store）是一个开源特征存储平台，通过帮助团队定义、管理、验证和提供生产级AI/ML特征，助力大规模生产[机器学习](https://so.csdn.net/so/search?q=%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0&spm=1001.2101.3001.7020)系统的运营。
> 
> _文中内容仅限技术学习与代码实践参考，市场存在不确定性，技术分析需谨慎验证，不构成任何投资建议。_

![在这里插入图片描述](https://gitee.com/s2468979982/gitee_img/raw/master/b503fca7192040a893d2b8211e299075.png)

## 引言

### 什么是 Feast？

Feast（**Fea**ture **St**ore）是一个[开源](https://github.com/feast-dev/feast)特征存储平台，通过帮助团队定义、管理、验证和提供生产级AI/ML特征，助力大规模生产机器学习系统的运营。

Feast 的特征存储由两个基础组件构成：(1) 用于模型训练历史特征提取的[离线存储](https://docs.feast.dev/getting-started/components/offline-store)，以及 (2) 在生产系统和应用中提供低延迟特征服务的[在线存储](https://docs.feast.dev/getting-started/components/online-store)。

Feast 是一个可配置的运营数据系统，通过复用现有基础设施来管理和服务机器学习特征至实时模型。更多技术细节请参阅[架构说明](https://docs.feast.dev/getting-started/architecture/overview)。

具体而言，Feast 提供：

-   用于编程定义特征、实体、数据源及（可选）转换的 Python SDK
-   用于读写配置的离线/在线数据存储的 Python SDK
-   （可选）用于特征读写的[特征服务器](https://docs.feast.dev/reference/feature-servers)（支持非 Python 语言）
-   查看项目特征信息的[Web UI](https://docs.feast.dev/reference/alpha-web-ui)
-   查看和更新特征信息的[CLI 工具](https://docs.feast.dev/reference/feast-cli-commands)

Feast 帮助 ML 平台团队实现：

-   **通过管理离线存储**（处理历史数据以支持扩展批量评分或模型训练）、**低延迟在线存储**（支持实时预测）**和经过验证的特征服务器**（在线提供预计算特征），**确保训练与低延迟服务的特征一致性**
-   **避免数据泄漏**：通过生成时间点正确的特征集，使数据科学家专注于特征工程而非调试易错的数据集连接逻辑，确保训练过程中未来特征值不会泄露至模型
-   **解耦 ML 与数据基础设施**：提供统一的数据访问层，将特征存储与特征检索解耦，确保模型在从训练到服务、从批量到实时、从一种数据基础设施迁移至另一种时保持可移植性

**注意：** 当前版本 Feast 主要处理带时间戳的结构化数据

![Feast 架构图](https://gitee.com/s2468979982/gitee_img/raw/master/b476f7c598774f5db67dfe05fa43b853.png)

**注意：** Feast 采用在线服务的推送模型。这意味着特征存储将特征值主动推送至在线存储，从而降低特征检索延迟。相比拉取模型（模型服务系统需主动请求特征存储获取特征值），这种模式更高效。详见[技术文档](https://docs.feast.dev/getting-started/architecture/push-vs-pull-model)

### 目标用户

Feast 帮助具备 DevOps 经验的 ML 平台/MLOps 团队实现实时模型生产化，同时助力构建提升数据工程师、软件工程师、机器学习工程师与数据科学家协作效率的特征平台。

-   **数据科学家**：通过 Feast 可便捷定义、存储和检索用于模型开发与部署的特征，专注于构建驱动AI/ML模型的核心特征并最大化数据价值
    
-   **MLOps 工程师**：Feast 作为连接现有基础设施（在线数据库、应用服务器、微服务、分析数据库和编排工具）的桥梁，使数据科学家能通过友好 SDK 将模型特征部署至生产环境，无需处理实时生产系统的软件工程挑战，专注于维护健壮系统
    
-   **数据工程师**：Feast 提供集中式特征定义目录，维护特征数据的单一可信源，抽象化各类离线/在线数据存储的读写操作。用户可通过 Python SDK 或特征服务器服务，将数据写入在线/离线存储，并在低延迟在线场景（模型推理）或批量场景（模型训练）中读取数据
    
-   **AI 工程师**：Feast 提供可扩展AI应用的平台，通过无缝整合丰富数据和促进模型微调，在确保可扩展高效数据管道的同时优化AI模型性能
    

### Feast 的定位边界

#### 非功能范畴

-   **[ETL](https://en.wikipedia.org/wiki/Extract,_transform,_load)/[ELT](https://en.wikipedia.org/wiki/Extract,_load,_transform) 系统**：非通用数据管道系统，用户常配合 [dbt](https://www.getdbt.com/) 等工具管理上游数据转换。Feast 支持部分[特征转换](https://docs.feast.dev/getting-started/architecture/feature-transformation)
-   **数据编排工具**：不管理复杂工作流 DAG，依赖上游数据管道生成特征值，并与 [Airflow](https://airflow.apache.org/) 等工具集成确保特征可用性
-   **数据仓库替代品**：非组织级数据仓库或转换数据的唯一可信源，而是轻量级下游层，从现有数据仓库（或其他数据源）向生产模型提供数据
-   **数据库**：非数据库系统，而是帮助管理存储于其他系统（BigQuery、Snowflake、DynamoDB、Redis）的数据，确保训练/服务时的特征一致性

#### 未完全覆盖领域

-   **可复现模型训练/回溯测试/实验管理**：捕获特征和模型元数据，但不版本控制数据集/标签或管理训练/测试拆分，建议使用 [DVC](https://dvc.org/)、[MLflow](https://www.mlflow.org/)、[Kubeflow](https://www.kubeflow.org/) 等工具
-   **批量特征工程**：支持按需和流式转换，正在扩展批量转换支持
-   **原生流式特征集成**：支持推送流式特征，但不从流式源拉取或管理流式管道
-   **数据血缘**：帮助关联特征值与模型版本，非端到端血缘完整解决方案，社区提供 [DataHub](https://datahubproject.io/docs/generated/ingestion/sources/feast/) 和 [Amundsen](https://github.com/amundsen-io/amundsen/blob/4a9d60176767c4d68d1cad5b093320ea22e26a49/databuilder/databuilder/extractor/feast_extractor.py) 集成插件
-   **数据质量/漂移检测**：与 [Great Expectations](https://greatexpectations.io/) 实验性集成，非专门解决方案，需跨数据管道、服务特征值、标签和模型版本的复杂监控

### 典型用例

多家企业已使用 Feast 实现实际 ML 用例，例如：

-   通过预计算历史用户/商品特征实现在线推荐个性化
-   在线欺诈检测（对比预计算历史交易模式特征）
-   批量固定周期生成用户特征值的流失预测（离线模型）
-   使用预计算历史特征的信用评分（违约概率计算）

### 快速入门

最佳学习方式是实践。前往[快速入门指南](https://docs.feast.dev/getting-started/quickstart)立即体验！

推荐学习路径：

-   [快速入门](https://docs.feast.dev/getting-started/quickstart)：最快捷的 Feast 上手指南
-   [核心概念](https://docs.feast.dev/getting-started/concepts)：详解 Feast 关键 API 概念
-   [架构解析](https://docs.feast.dev/getting-started/architecture)：系统架构深度解读
-   [实践教程](https://docs.feast.dev/tutorials/tutorials-overview)：完整 ML 应用案例演示
-   [Snowflake/GCP/AWS 集成指南](https://docs.feast.dev/how-to-guides/feast-snowflake-gcp-aws)：生产环境深度配置指南
-   [API 参考](https://docs.feast.dev/reference/feast-cli-commands)：详细 API 和技术文档
-   [贡献指南](https://docs.feast.dev/project/contributing)：社区贡献资源说明

## 快速入门

### 什么是Feast？

Feast（Feature Store）是一个开源的特征存储系统，旨在支持批处理和实时应用场景下的机器学习特征管理与服务化。

-   **面向数据科学家**：Feast 是一个工具平台，可帮助您轻松定义、存储和检索用于模型开发和部署的特征。通过使用 Feast，您可以专注于核心工作：构建驱动 AI/ML 模型的特征并最大化数据价值。
    
-   **面向MLOps工程师**：Feast 是一个库，可连接现有基础设施（如在线数据库、应用服务器、微服务、分析数据库和编排工具），使数据科学家能够通过友好 SDK 将模型特征推送到生产环境，而无需担心实时生产系统带来的工程挑战。通过使用 Feast，您可以专注于系统稳定性维护，而非为数据科学家实现特征工程。
    
-   **面向数据工程师**：Feast 提供集中化的特征定义目录，维护特征数据的单一可信源。它为多种离线/在线数据存储提供读写抽象层。用户可通过 Python SDK 或特征服务器服务，将数据写入在线/离线存储，并在低延迟在线场景（模型推理）或批处理场景（模型训练）中读取数据。
    
-   **面向AI工程师**：Feast 提供支持 AI 应用扩展的平台，通过无缝集成更丰富的数据和促进模型微调。使用 Feast 可优化 AI 模型性能，同时确保可扩展的高效数据管道。
    

更多信息请参考 [Feast 介绍](https://docs.feast.dev/)

### 前置条件

-   确保已安装 Python（3.9 或更高版本）
    
-   推荐创建并使用虚拟环境：
    
    ```sh
    # 创建并激活虚拟环境 
    python -m venv venv/ source venv/bin/activate
    ```
    

### 概述

本教程将演示：

1.  部署使用 **Parquet文件离线存储** 和 **Sqlite在线存储** 的本地特征存储
2.  从 **Parquet文件** 构建时序特征训练数据集
3.  将批处理特征（“物化”）和流式特征（通过推送API）注入在线存储
4.  从离线存储读取最新特征进行批量评分
5.  从在线存储读取最新特征进行实时推理
6.  探索（实验性）Feast UI

_**注意**_ - Feast 提供 Python SDK 和可选 [托管服务](https://docs.feast.dev/reference/feature-servers/python-feature-server) 用于特征数据读写。后者在需要非 Python 语言支持时可能有用。

本教程将使用 Python SDK。

在本教程中，我们将使用 Feast 为共享乘车司机满意度预测模型生成训练数据并提供在线推理服务。Feast 解决了该流程中的几个常见问题：

1.  **训练-服务偏差与复杂数据连接**：特征值通常分布在多个表中，连接这些数据集可能复杂、低效且容易出错。
    
    -   Feast 使用经过验证的连接逻辑确保 _时间点正确性_，防止未来特征值泄露到模型中
2.  **在线特征可用性**：推理时模型常需要从其他数据源预计算的特征
    
    -   Feast 管理到多种在线存储（如 DynamoDB、Redis、Google Cloud Datastore）的部署，确保推理时特征 _可用_ 且 _新鲜_
3.  **特征与模型版本控制**：组织内不同团队常无法复用特征，导致重复开发。模型需要版本化的数据依赖（如A/B测试）
    
    -   Feast 支持特征发现与协作，通过 _特征服务_ 实现特征集版本控制
    -   （实验性）支持轻量级特征转换，实现跨场景/模型的转换逻辑复用

### 步骤1：安装Feast

使用 pip 安装 Feast SDK 和 CLI：

-   本教程聚焦本地部署。如需了解 Snowflake/GCP/AWS 部署，请参考 [在 Snowflake/GCP/AWS 上运行 Feast](https://docs.feast.dev/how-to-guides/feast-snowflake-gcp-aws)

```bash
pip install feast
```

### 步骤2：创建特征仓库

使用 `feast init` 命令初始化新特征仓库：

```bash
feast init my_project 
cd my_project/feature_repo
```

```bash
Creating a new Feast repository in /home/Jovyan/my_project.
```

生成的演示仓库包含：

-   `data/` 包含原始 Parquet 演示数据
-   `example_repo.py` 包含演示特征定义
-   `feature_store.yaml` 包含数据源配置
-   `test_workflow.py` 展示关键 Feast 操作（定义、检索、推送特征），可通过 `python test_workflow.py` 运行

```yaml
project: my_project
# 默认使用文件注册表（可配置为SQL注册表）
registry: data/registry.db
# 指定默认离线/在线存储及注册表存储位置
provider: local
online_store:
  type: sqlite
  path: data/online_store.db
entity_key_serialization_version: 2
```

```python
# 特征定义示例文件

from datetime import timedelta
import pandas as pd
from feast import (
    Entity,
    FeatureService,
    FeatureView,
    Field,
    FileSource,
    Project,
    PushSource,
    RequestSource,
)
from feast.on_demand_feature_view import on_demand_feature_view
from feast.types import Float32, Float64, Int64

# 定义特征仓库项目
project = Project(name="my_project", description="司机统计数据项目")

# 定义司机实体（主键）
driver = Entity(name="driver", join_keys=["driver_id"])

# 从Parquet文件读取数据（本地开发适用）
driver_stats_source = FileSource(
    name="driver_hourly_stats_source",
    path="%PARQUET_PATH%",
    timestamp_field="event_timestamp",
    created_timestamp_column="created",
)

# 定义在线服务特征视图
driver_stats_fv = FeatureView(
    name="driver_hourly_stats",
    entities=[driver],
    ttl=timedelta(days=1),
    schema=[
        Field(name="conv_rate", dtype=Float32),
        Field(name="acc_rate", dtype=Float32),
        Field(name="avg_daily_trips", dtype=Int64, description="日均行程数"),
    ],
    online=True,
    source=driver_stats_source,
    tags={"team": "driver_performance"},
)

# 定义请求时可用数据源
input_request = RequestSource(
    name="vals_to_add",
    schema=[
        Field(name="val_to_add", dtype=Int64),
        Field(name="val_to_add_2", dtype=Int64),
    ],
)

# 定义按需特征视图（实时转换）
@on_demand_feature_view(
    sources=[driver_stats_fv, input_request],
    schema=[
        Field(name="conv_rate_plus_val1", dtype=Float64),
        Field(name="conv_rate_plus_val2", dtype=Float64),
    ],
)
def transformed_conv_rate(inputs: pd.DataFrame) -> pd.DataFrame:
    df = pd.DataFrame()
    df["conv_rate_plus_val1"] = inputs["conv_rate"] + inputs["val_to_add"]
    df["conv_rate_plus_val2"] = inputs["conv_rate"] + inputs["val_to_add_2"]
    return df

# 定义特征服务版本
driver_activity_v1 = FeatureService(
    name="driver_activity_v1",
    features=[
        driver_stats_fv[["conv_rate"]],  # 选择特征子集
        transformed_conv_rate,           # 选择全部特征
    ],
)
driver_activity_v2 = FeatureService(
    name="driver_activity_v2", features=[driver_stats_fv, transformed_conv_rate]
)

# 定义特征推送源
driver_stats_push_source = PushSource(
    name="driver_stats_push_source",
    batch_source=driver_stats_source,
)

# 定义更新版特征视图（使用推送源）
driver_stats_fresh_fv = FeatureView(
    name="driver_hourly_stats_fresh",
    entities=[driver],
    ttl=timedelta(days=1),
    schema=[
        Field(name="conv_rate", dtype=Float32),
        Field(name="acc_rate", dtype=Float32),
        Field(name="avg_daily_trips", dtype=Int64),
    ],
    online=True,
    source=driver_stats_push_source,  # 修改数据源
    tags={"team": "driver_performance"},
)

# 更新版按需特征视图
@on_demand_feature_view(
    sources=[driver_stats_fresh_fv, input_request],  # 使用新特征视图
    schema=[
        Field(name="conv_rate_plus_val1", dtype=Float64),
        Field(name="conv_rate_plus_val2", dtype=Float64),
    ],
)
def transformed_conv_rate_fresh(inputs: pd.DataFrame) -> pd.DataFrame:
    df = pd.DataFrame()
    df["conv_rate_plus_val1"] = inputs["conv_rate"] + inputs["val_to_add"]
    df["conv_rate_plus_val2"] = inputs["conv_rate"] + inputs["val_to_add_2"]
    return df

driver_activity_v3 = FeatureService(
    name="driver_activity_v3",
    features=[driver_stats_fresh_fv, transformed_conv_rate_fresh],
)

```

`feature_store.yaml` 文件配置特征存储的核心架构：

-   `provider` 设置默认离线/在线存储：
    -   离线存储：提供历史数据处理计算层（生成训练数据和服务特征）
    -   在线存储：低延迟存储最新特征值（支持实时推理）

`feature_store.yaml` 中 `provider` 有效值：

-   local：使用文件注册表，默认 Dask 离线存储 + SQLite 在线存储
-   gcp：使用 BigQuery 离线存储 + Datastore 在线存储
-   aws：使用 Redshift 离线存储 + DynamoDB 在线存储

Feast 还支持 Spark、Azure、Hive 等多种存储，详见 [第三方集成](https://docs.feast.dev/getting-started/third-party-integrations)。自定义配置参考 [自定义 Feast](https://docs.feast.dev/how-to-guides/customizing-feast)。

#### 查看原始数据

原始特征数据存储在本地 Parquet 文件，包含共享乘车司机每小时统计：

```python
import pandas as pd 
pd.read_parquet("data/driver_stats.parquet")
```

![Parquet演示数据: data/driver_stats.parquet](https://gitee.com/s2468979982/gitee_img/raw/master/e30dd031d0044824b06ec119024dc440.png)

### 步骤3：运行示例工作流

`test_workflow.py` 文件展示完整工作流：

1.  通过 `feast apply` 注册特征定义
2.  生成训练数据集（使用 `get_historical_features`）
3.  生成批量评分特征（使用 `get_historical_features`）
4.  将批处理特征注入在线存储（使用 `materialize_incremental`）
5.  获取在线特征进行实时推理（使用 `get_online_features`）
6.  注入流式特征到离线/在线存储（使用 `push`）
7.  验证在线特征更新状态

#### 步骤4：注册特征定义并部署特征存储

`apply` 命令扫描当前目录的 Python 文件，注册对象并部署基础设施。本示例读取 `example_repo.py` 并创建 SQLite 在线存储表：

```bash
feast apply
```

```bash
Created entity driver
Created feature view driver_hourly_stats
Created feature view driver_hourly_stats_fresh
Created on demand feature view transformed_conv_rate
Created on demand feature view transformed_conv_rate_fresh
Created feature service driver_activity_v3
Created feature service driver_activity_v1
Created feature service driver_activity_v2

Created sqlite table my_project_driver_hourly_stats_fresh
Created sqlite table my_project_driver_hourly_stats

```

#### 步骤5：生成训练数据或批量评分

训练模型需要特征与标签数据。通常标签数据单独存储，Feast 可帮助生成对应特征向量。需要提供 **实体列表** 和 **时间戳**：

##### 生成训练数据

```python
from datetime import datetime
import pandas as pd
from feast import FeatureStore

# 实体数据框示例
entity_df = pd.DataFrame.from_dict(
    {
        "driver_id": [1001, 1002, 1003],
        "event_timestamp": [
            datetime(2021, 4, 12, 10, 59, 42),
            datetime(2021, 4, 12, 8, 12, 10),
            datetime(2021, 4, 12, 16, 40, 26),
        ],
        "label_driver_reported_satisfaction": [1, 5, 3],
        "val_to_add": [1, 2, 3],
        "val_to_add_2": [10, 20, 30],
    }
)

store = FeatureStore(repo_path=".")

training_df = store.get_historical_features(
    entity_df=entity_df,
    features=[
        "driver_hourly_stats:conv_rate",
        "driver_hourly_stats:acc_rate",
        "driver_hourly_stats:avg_daily_trips",
        "transformed_conv_rate:conv_rate_plus_val1",
        "transformed_conv_rate:conv_rate_plus_val2",
    ],
).to_df()

print("----- 特征模式 -----\n")
print(training_df.info())

print("\n----- 示例特征 -----\n")
print(training_df.head())

```

```bash
----- 特征模式 -----

<class 'pandas.core.frame.DataFrame'>
RangeIndex: 3 entries, 0 to 2
Data columns (total 10 columns):
 #   Column                              Non-Null Count  Dtype              
---  ------                              --------------  -----              
 0   driver_id                           3 non-null      int64              
 1   event_timestamp                     3 non-null      datetime64[ns, UTC]
 2   label_driver_reported_satisfaction  3 non-null      int64              
 3   val_to_add                          3 non-null      int64              
 4   val_to_add_2                        3 non-null      int64              
 5   conv_rate                           3 non-null      float32            
 6   acc_rate                            3 non-null      float32            
 7   avg_daily_trips                     3 non-null      int32              
 8   conv_rate_plus_val1                 3 non-null      float64            
 9   conv_rate_plus_val2                 3 non-null      float64            
dtypes: datetime64[ns, UTC](1), float32(2), float64(2), int32(1), int64(4)
memory usage: 336.0 bytes
None

----- 示例特征 -----

   driver_id           event_timestamp  label_driver_reported_satisfaction  
0       1001 2021-04-12 10:59:42+00:00                                   1   
1       1002 2021-04-12 08:12:10+00:00                                   5   
2       1003 2021-04-12 16:40:26+00:00                                   3   

   val_to_add  val_to_add_2  conv_rate  acc_rate  avg_daily_trips  
0           1            10   0.800648  0.265174              643  
1           2            20   0.644141  0.996602              765  
2           3            30   0.855432  0.546346              954  

   conv_rate_plus_val1  conv_rate_plus_val2  
0             1.800648            10.800648  
1             2.644141            20.644141  
2             3.855432            30.855432  

```

##### 批量离线推理

```python
entity_df["event_timestamp"] = pd.to_datetime("now", utc=True)
training_df = store.get_historical_features(
    entity_df=entity_df,
    features=[
        "driver_hourly_stats:conv_rate",
        "driver_hourly_stats:acc_rate",
        "driver_hourly_stats:avg_daily_trips",
        "transformed_conv_rate:conv_rate_plus_val1",
        "transformed_conv_rate:conv_rate_plus_val2",
    ],
).to_df()

print("\n----- 示例特征 -----\n")
print(training_df.head())

```

```bash
----- 示例特征 -----

   driver_id                  event_timestamp  
0       1001 2024-04-19 14:58:16.452895+00:00   
1       1002 2024-04-19 14:58:16.452895+00:00   
2       1003 2024-04-19 14:58:16.452895+00:00   

   label_driver_reported_satisfaction  val_to_add  val_to_add_2  conv_rate  
0                                   1           1            10   0.535773  
1                                   5           2            20   0.171976  
2                                   3           3            30   0.275669  

   acc_rate  avg_daily_trips  conv_rate_plus_val1  conv_rate_plus_val2  
0  0.689705              428             1.535773            10.535773  
1  0.737113              369             2.171976            20.171976  
2  0.156630              116             3.275669            30.275669  

```

#### 步骤6：将批处理特征注入在线存储

通过 `materialize_incremental` 序列化最新特征值到在线存储（从上次物化时间或指定时间减去 TTL）：

```bash
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S")

feast materialize-incremental $CURRENT_TIME

```

```bash
Materializing 2 feature views to 2024-04-19 10:59:58-04:00 into the sqlite online store.

driver_hourly_stats from 2024-04-18 15:00:46-04:00 to 2024-04-19 10:59:58-04:00:
100%|████████████████████████████████████████████████████████████████| 5/5 [00:00<00:00, 370.32it/s]
driver_hourly_stats_fresh from 2024-04-18 15:00:46-04:00 to 2024-04-19 10:59:58-04:00:
100%|███████████████████████████████████████████████████████████████| 5/5 [00:00<00:00, 1046.64it/s]
Materializing 2 feature views to 2024-04-19 10:59:58-04:00 into the sqlite online store.

```

#### 步骤7：获取推理特征向量

使用 `get_online_features()` 从在线存储快速读取最新特征值：

```python
from pprint import pprint
from feast import FeatureStore

store = FeatureStore(repo_path=".")

feature_vector = store.get_online_features(
    features=[
        "driver_hourly_stats:conv_rate",
        "driver_hourly_stats:acc_rate",
        "driver_hourly_stats:avg_daily_trips",
    ],
    entity_rows=[
        {"driver_id": 1004},
        {"driver_id": 1005},
    ],
).to_dict()

pprint(feature_vector)

```

```bash
{ 'acc_rate': [0.25351759791374207, 0.8949751853942871], 'avg_daily_trips': [712, 791], 'conv_rate': [0.5038306713104248, 0.9839504361152649], 'driver_id': [1004, 1005] }
```

#### 步骤8：使用特征服务获取在线特征

通过特征服务管理多个特征，解耦特征视图定义与应用需求：

```python
{
 'acc_rate': [0.25351759791374207, 0.8949751853942871],
 'avg_daily_trips': [712, 791],
 'conv_rate': [0.5038306713104248, 0.9839504361152649],
 'driver_id': [1004, 1005]
 }

```

```python
from pprint import pprint
from feast import FeatureStore
feature_store = FeatureStore('.') 

feature_service = feature_store.get_feature_service("driver_activity_v1")
feature_vector = feature_store.get_online_features(
    features=feature_service,
    entity_rows=[
        {"driver_id": 1004},
        {"driver_id": 1005},
    ],
).to_dict()
pprint(feature_vector)

```

```bash
{
 'acc_rate': [0.5732735991477966, 0.7828438878059387],
 'avg_daily_trips': [33, 984],
 'conv_rate': [0.15498852729797363, 0.6263588070869446],
 'driver_id': [1004, 1005]
}

```

### 步骤9：通过Web UI浏览特征（实验性）

使用 `feast ui` 查看所有注册特征、数据源、实体和特征服务：

```bash
feast ui
```

```bash
INFO:     Started server process [66664]
08/17/2022 01:25:49 PM uvicorn.error INFO: Started server process [66664]
INFO:     Waiting for application startup.
08/17/2022 01:25:49 PM uvicorn.error INFO: Waiting for application startup.
INFO:     Application startup complete.
08/17/2022 01:25:49 PM uvicorn.error INFO: Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8888 (Press CTRL+C to quit)
08/17/2022 01:25:49 PM uvicorn.error INFO: Uvicorn running on http://0.0.0.0:8888 (Press CTRL+C to quit)

```

![Web UI](https://gitee.com/s2468979982/gitee_img/raw/master/26f129ab5c3444ce8671220930fbe56a.png)

### 步骤10：重新查看 `test_workflow.py`

该文件展示了与 Feast 交互的多种示例流程，将在后续概念/架构/教程中详细说明。

### 后续步骤

-   阅读 [概念](https://docs.feast.dev/getting-started/concepts) 理解 Feast 数据模型
-   阅读 [架构](https://docs.feast.dev/getting-started/architecture)
-   查看 [教程](https://docs.feast.dev/tutorials/tutorials-overview) 获取更多示例
-   参考 [在 Snowflake/GCP/AWS 上运行 Feast](https://docs.feast.dev/how-to-guides/feast-snowflake-gcp-aws) 深入实践

> **风险提示与免责声明**  
> 本文内容基于公开信息研究整理，不构成任何形式的投资建议。历史表现不应作为未来收益保证，市场存在不可预见的波动风险。投资者需结合自身财务状况及风险承受能力独立决策，并自行承担交易结果。作者及发布方不对任何依据本文操作导致的损失承担法律责任。市场有风险，投资须谨慎。