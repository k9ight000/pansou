# PanSou 网盘搜索API

PanSou是一个高性能的网盘资源搜索API服务，支持TG搜索和自定义插件搜索。系统设计以性能和可扩展性为核心，支持并发搜索、结果智能排序和网盘类型分类。

[//]: # (MCP服务文档: [MCP-SERVICE.md]&#40;docs/MCP-SERVICE.md&#41;)


## 特性（[详见系统设计文档](docs/%E7%B3%BB%E7%BB%9F%E5%BC%80%E5%8F%91%E8%AE%BE%E8%AE%A1%E6%96%87%E6%A1%A3.md)）

- **高性能搜索**：并发执行多个TG频道及异步插件搜索，显著提升搜索速度；工作池设计，高效管理并发任务
- **网盘类型分类**：自动识别多种网盘链接，按类型归类展示
- **智能排序**：基于插件等级、时间新鲜度和优先关键词的多维度综合排序算法
- **异步插件系统**：支持通过插件扩展搜索来源，支持"尽快响应，持续处理"的异步搜索模式，解决了某些搜索源响应时间长的问题。详情参考[**插件开发指南**](docs/插件开发指南.md)
- **二级缓存**：分片内存+分片磁盘缓存机制，大幅提升重复查询速度和并发性能  

## MCP 服务

PanSou 还提供了一个基于 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 的服务，可以将搜索功能集成到 Claude Desktop 等支持 MCP 的应用中。详情请参阅 [MCP 服务文档](docs/MCP-SERVICE.md)。

## 支持的网盘类型

百度网盘 (`baidu`)、阿里云盘 (`aliyun`)、夸克网盘 (`quark`)、天翼云盘 (`tianyi`)、UC网盘 (`uc`)、移动云盘 (`mobile`)、115网盘 (`115`)、PikPak (`pikpak`)、迅雷网盘 (`xunlei`)、123网盘 (`123`)、磁力链接 (`magnet`)、电驴链接 (`ed2k`)、其他 (`others`)

## 快速开始

在 Github 上先[![Fork me on GitHub](https://raw.githubusercontent.com/fishforks/fish2018/refs/heads/main/forkme.png)](https://github.com/fish2018/pansou/fork)
本项目，并点上 Star !!!

### 使用Docker部署


#### **1、前后端集成版**

##### 直接使用Docker命令

一键启动，开箱即用

```
docker run -d --name pansou -p 80:80 -e ENABLED_PLUGINS="labi,zhizhen,shandian,duoduo,muou,wanou" ghcr.io/fish2018/pansou-web
```

##### 使用Docker Compose（推荐）
```
# 下载配置文件
curl -o docker-compose.yml https://raw.githubusercontent.com/fish2018/pansou-web/refs/heads/main/docker-compose.yml

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

#### **2、纯后端API版**

##### 直接使用Docker命令

```bash
docker run -d --name pansou -p 8888:8888 -v pansou-cache:/app/cache -e CHANNELS="tgsearchers3,xxx" -e ENABLED_PLUGINS="labi,zhizhen,shandian,duoduo,muou,wanou" ghcr.io/fish2018/pansou:latest
```

##### 使用Docker Compose（推荐）

```bash
# 下载配置文件
curl -o docker-compose.yml  https://raw.githubusercontent.com/fish2018/pansou/refs/heads/main/docker-compose.yml

# 启动服务
docker-compose up -d

# 访问服务
http://localhost:8888
```

### 从源码安装

#### 环境要求

- Go 1.18+
- 可选：SOCKS5代理（用于访问受限地区的Telegram站点）

1. 克隆仓库

```bash
git clone https://github.com/fish2018/pansou.git
cd pansou
```

2. 配置环境变量（可选）

#### 基础配置

| 环境变量 | 描述 | 默认值 | 说明 |
|----------|------|--------|------|
| **PORT** | 服务端口 | `8888` | 修改服务监听端口 |
| **PROXY** | SOCKS5代理 | 无 | 如：`socks5://127.0.0.1:1080` |
| **CHANNELS** | 默认搜索的TG频道 | `tgsearchers3` | 多个频道用逗号分隔 |
| **ENABLED_PLUGINS** | 指定启用插件，多个插件用逗号分隔 | 无 | 必须显式指定 |

<details>
<summary>插件列表（请务必按需加载）</summary>
<pre>
export ENABLED_PLUGINS=hunhepan,jikepan,panwiki,pansearch,panta,qupansou,susu,thepiratebay,wanou,xuexizhinan,panyq,zhizhen,labi,muou,ouge,shandian,duoduo,huban,cyg,erxiao,miaoso,fox4k,pianku,clmao,wuji,cldi,xiaozhang,libvio,leijing,xb6v,xys,ddys,hdmoli,yuhuage,u3c3,javdb,clxiong,jutoushe,sdso,xiaoji,xdyh,haisou
</pre>
</details>

#### 高级配置（默认值即可）

<details>
<summary>点击展开高级配置选项（通常不需要修改）</summary>

| 环境变量 | 描述 | 默认值 |
|----------|------|--------|
| CONCURRENCY | 并发搜索数 | 自动计算 |
| CACHE_TTL | 缓存有效期（分钟） | `60` |
| CACHE_MAX_SIZE | 最大缓存大小(MB) | `100` |
| PLUGIN_TIMEOUT | 插件超时时间(秒) | `30` |
| ASYNC_RESPONSE_TIMEOUT | 快速响应超时(秒) | `4` |
| ASYNC_LOG_ENABLED | 异步插件详细日志 | `true` | 
| CACHE_PATH | 缓存文件路径 | `./cache` |
| SHARD_COUNT | 缓存分片数量 | `8` |
| CACHE_WRITE_STRATEGY | 缓存写入策略(immediate/hybrid) | `hybrid` |
| ENABLE_COMPRESSION | 是否启用压缩 | `false` |
| MIN_SIZE_TO_COMPRESS | 最小压缩阈值(字节) | `1024` |
| GC_PERCENT | Go GC触发百分比 | `50` |
| ASYNC_MAX_BACKGROUND_WORKERS | 最大后台工作者数量 | CPU核心数×5 |
| ASYNC_MAX_BACKGROUND_TASKS | 最大后台任务数量 | 工作者数×5 |
| ASYNC_CACHE_TTL_HOURS | 异步缓存有效期(小时) | `1` |
| ASYNC_PLUGIN_ENABLED | 异步插件是否启用 | `true` |
| HTTP_READ_TIMEOUT | HTTP读取超时(秒) | 自动计算 |
| HTTP_WRITE_TIMEOUT | HTTP写入超时(秒) | 自动计算 |
| HTTP_IDLE_TIMEOUT | HTTP空闲超时(秒) | `120` |
| HTTP_MAX_CONNS | HTTP最大连接数 | 自动计算 |

</details>

3. 构建

```linux
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w -extldflags '-static'" -o pansou .
```

4. 运行

```bash
./pansou
```

### 其他配置参考

<details>
<summary>点击展开 supervisor 配置参考</summary>

```
[program:pansou]
environment=PORT=8888,CHANNELS="tgsearchers3,Aliyun_4K_Movies,bdbdndn11,yunpanx,bsbdbfjfjff,yp123pan,sbsbsnsqq,yunpanxunlei,tianyifc,BaiduCloudDisk,txtyzy,peccxinpd,gotopan,PanjClub,kkxlzy,baicaoZY,MCPH01,bdwpzhpd,ysxb48,jdjdn1111,yggpan,MCPH086,zaihuayun,Q66Share,Oscar_4Kmovies,ucwpzy,shareAliyun,alyp_1,dianyingshare,Quark_Movies,XiangxiuNBB,ydypzyfx,ucquark,xx123pan,yingshifenxiang123,zyfb123,tyypzhpd,tianyirigeng,cloudtianyi,hdhhd21,Lsp115,oneonefivewpfx,qixingzhenren,taoxgzy,Channel_Shares_115,tyysypzypd,vip115hot,wp123zy,yunpan139,yunpan189,yunpanuc,yydf_hzl,leoziyuan,pikpakpan,Q_dongman,yoyokuakeduanju",ENABLED_PLUGINS="labi,zhizhen,shandian,duoduo,muou"
command=/home/work/pansou/pansou
directory=/home/work/pansou
autostart=true
autorestart=true
startsecs=5
startretries=3
exitcodes=0
stopwaitsecs=10
stopasgroup=true
killasgroup=true
```

</details>

<details>
<summary>点击展开 nginx 配置参考</summary>

```
server {
    listen 80;
    server_name pansou.252035.xyz;

    # 将 HTTP 重定向到 HTTPS
    return 301 https://$host$request_uri;
}

limit_req_zone $binary_remote_addr zone=api_limit:10m rate=60r/m;

server {
    listen 443 ssl http2;
    server_name pansou.252035.xyz;

    access_log /home/work/logs/pansou.log;

    # 证书和密钥路径
    ssl_certificate /etc/letsencrypt/live/252035.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/252035.xyz/privkey.pem;

    # 增强 SSL 安全性
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH;
    ssl_prefer_server_ciphers on;

    # 后端代理，应用限流
    location / {
        # 应用限流规则
        limit_req zone=api_limit burst=10 nodelay;
        # 当超过限制时返回 429 状态码
        limit_req_status 429;

        proxy_pass http://127.0.0.1:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

</details>

## API文档

### 搜索API

搜索网盘资源。

**接口地址**：`/api/search`  
**请求方法**：`POST` 或 `GET`  
**Content-Type**：`application/json`（POST方法）

**POST请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| kw | string | 是 | 搜索关键词 |
| channels | string[] | 否 | 搜索的频道列表，不提供则使用默认配置 |
| conc | number | 否 | 并发搜索数量，不提供则自动设置为频道数+插件数+10 |
| refresh | boolean | 否 | 强制刷新，不使用缓存，便于调试和获取最新数据 |
| res | string | 否 | 结果类型：all(返回所有结果)、results(仅返回results)、merge(仅返回merged_by_type)，默认为merge |
| src | string | 否 | 数据来源类型：all(默认，全部来源)、tg(仅Telegram)、plugin(仅插件) |
| plugins | string[] | 否 | 指定搜索的插件列表，不指定则搜索全部插件 |
| cloud_types | string[] | 否 | 指定返回的网盘类型列表，支持：baidu、aliyun、quark、tianyi、uc、mobile、115、pikpak、xunlei、123、magnet、ed2k，不指定则返回所有类型 |
| ext | object | 否 | 扩展参数，用于传递给插件的自定义参数，如{"title_en":"English Title", "is_all":true} |

**GET请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| kw | string | 是 | 搜索关键词 |
| channels | string | 否 | 搜索的频道列表，使用英文逗号分隔多个频道，不提供则使用默认配置 |
| conc | number | 否 | 并发搜索数量，不提供则自动设置为频道数+插件数+10 |
| refresh | boolean | 否 | 强制刷新，设置为"true"表示不使用缓存 |
| res | string | 否 | 结果类型：all(返回所有结果)、results(仅返回results)、merge(仅返回merged_by_type)，默认为merge |
| src | string | 否 | 数据来源类型：all(默认，全部来源)、tg(仅Telegram)、plugin(仅插件) |
| plugins | string | 否 | 指定搜索的插件列表，使用英文逗号分隔多个插件名，不指定则搜索全部插件 |
| cloud_types | string | 否 | 指定返回的网盘类型列表，使用英文逗号分隔多个类型，支持：baidu、aliyun、quark、tianyi、uc、mobile、115、pikpak、xunlei、123、magnet、ed2k，不指定则返回所有类型 |
| ext | string | 否 | JSON格式的扩展参数，用于传递给插件的自定义参数，如{"title_en":"English Title", "is_all":true} |

**POST请求示例**：

```json
{
  "kw": "速度与激情",
  "channels": ["tgsearchers3", "xxx"],
  "conc": 2,
  "refresh": true,
  "res": "merge",
  "src": "all",
  "plugins": ["jikepan"],
  "cloud_types": ["baidu", "quark"],
  "ext": {
    "title_en": "Fast and Furious",
    "is_all": true
  }
}
```

**GET请求示例**：

```
GET /api/search?kw=速度与激情&channels=tgsearchers3,xxx&conc=2&refresh=true&res=merge&src=tg&cloud_types=baidu,quark&ext={"title_en":"Fast and Furious","is_all":true}
```

**成功响应**：

```json
{
  "total": 15,
  "results": [
    {
      "message_id": "12345",
      "unique_id": "channel-12345",
      "channel": "tgsearchers3",
      "datetime": "2023-06-10T14:23:45Z",
      "title": "速度与激情全集1-10",
      "content": "速度与激情系列全集，1080P高清...",
      "links": [
        {
          "type": "baidu",
          "url": "https://pan.baidu.com/s/1abcdef",
          "password": "1234"
        }
      ],
      "tags": ["电影", "合集"],
      "images": [
        "https://cdn1.cdn-telegram.org/file/xxx.jpg"
      ]
    },
    // 更多结果...
  ],
  "merged_by_type": {
    "baidu": [
      {
        "url": "https://pan.baidu.com/s/1abcdef",
        "password": "1234",
        "note": "速度与激情全集1-10",
        "datetime": "2023-06-10T14:23:45Z",
        "source": "tg:频道名称",
        "images": [
          "https://cdn1.cdn-telegram.org/file/xxx.jpg"
        ]
      },
      // 更多百度网盘链接...
    ],
    "quark": [
      {
        "url": "https://pan.quark.cn/s/xxxx",
        "password": "",
        "note": "凡人修仙传",
        "datetime": "2023-06-10T15:30:22Z",
        "source": "plugin:插件名",
        "images": []
      }
    ],
    "aliyun": [
      // 阿里云盘链接...
    ]
    // 更多网盘类型...
  }
}
```

**字段说明**：

- `source`: 数据来源标识
  - `tg:频道名称`: 来自Telegram频道
  - `plugin:插件名`: 来自指定插件
  - `unknown`: 未知来源
- `images`: TG消息中的图片链接数组（可选字段）
  - 仅在来源为Telegram频道且消息包含图片时出现


**错误响应**：

```json
{
  "code": 400,
  "message": "关键词不能为空"
}
```

### 健康检查

检查API服务是否正常运行。

**接口地址**：`/api/health`  
**请求方法**：`GET`

**成功响应**：

```json
{
  "channels_count": 1,
  "channels": [
    "tgsearchers3"
  ],
  "plugin_count": 16,
  "plugins": [
    "pansearch",
    "panta", 
    "qupansou",
    "hunhepan",
    "jikepan",
    "pan666",
    "panyq",
    "susu",
    "xuexizhinan",
    "hdr4k",
    "labi",
    "shandian",
    "duoduo",
    "muou",
    "wanou",
    "ouge",
    "zhizhen",
    "huban"
  ],
  "plugins_enabled": true,
  "status": "ok"
}
```

## 🎮 附赠小游戏：终端版贪吃蛇

想在终端里放松一下？仓库自带了一个简易的贪吃蛇小游戏：

1. 进入 TypeScript 子项目：`cd typescript`
2. 安装依赖（首次运行需要）：`npm install`
3. 启动游戏：`npm run snake`

操作说明：方向键或 `W/A/S/D` 控制移动，空格暂停/继续，`Q` 退出。

## 📄 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## ⭐ Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=fish2018/pansou&type=Date)](https://star-history.com/#fish2018/pansou&Date)
