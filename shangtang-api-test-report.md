# SenseAudio 文本与图片 API 详细测试报告

## 1. 报告信息

| 项目         | 内容                                                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 测试平台     | SenseAudio 开放平台                                                                                                                                                                                                                                                                                |
| 测试时间     | 2026-09-28 15:00 至 15:09，Asia/Shanghai                                                                                                                                                                                                                                                           |
| 上游服务地址 | `https://api.senseaudio.cn`                                                                                                                                                                                                                                                                        |
| 项目代理接口 | `POST /api/shangtang?type=text`，`POST /api/shangtang?type=image`                                                                                                                                                                                                                                  |
| 文本上游接口 | `POST https://api.senseaudio.cn/v1/chat/completions`                                                                                                                                                                                                                                               |
| 图片上游接口 | `POST https://api.senseaudio.cn/v1/image/sync`                                                                                                                                                                                                                                                     |
| 模型查询接口 | `GET https://api.senseaudio.cn/v1/models?mode=llm`，`GET https://api.senseaudio.cn/v1/models?mode=image`                                                                                                                                                                                           |
| 鉴权方式     | `Authorization: Bearer <REDACTED>`                                                                                                                                                                                                                                                                 |
| 请求格式     | `application/json; charset=utf-8`                                                                                                                                                                                                                                                                  |
| 测试脚本     | `test-shangtang-api.mjs`                                                                                                                                                                                                                                                                           |
| 官方依据     | [接口概览](https://docs.senseaudio.cn/api-reference/introduction)，[Chat API](https://docs.senseaudio.cn/api-reference/endpoint/llm/chat)，[同步图片生成](https://docs.senseaudio.cn/api-reference/endpoint/image/sync)，[模型列表](https://docs.senseaudio.cn/api-reference/endpoint/models/list) |

API Key 只从 `server/api/shangtang.ts` 读取。测试输出和本报告均未记录完整密钥。

## 2. 结论摘要

| 检查项               | 结果                             | 结论                       |
| -------------------- | -------------------------------- | -------------------------- |
| LLM 模型清单         | HTTP 200，返回 9 个模型          | 通过                       |
| 图片模型清单         | HTTP 200，返回 3 个模型          | 通过                       |
| 9 个文本模型 SSE     | 全部 HTTP 200，全部收到 `[DONE]` | 接口连通通过               |
| 3 个图片模型同步生成 | 全部 HTTP 200，全部返回 `url`    | 通过                       |
| 生成图片可访问性     | 三个资源 HEAD 均为 HTTP 200      | 通过                       |
| 未携带认证           | HTTP 401                         | 通过                       |
| 无效文本模型         | HTTP 400                         | 通过                       |
| 无效图片尺寸         | HTTP 400                         | 通过                       |
| 图片缺少 prompt      | HTTP 400                         | 通过，但响应缺少 `message` |

本轮共执行 2 次模型列表查询、18 次文本模型调用、3 次图片生成、3 次图片资源检查和 4 次失败场景测试。文本模型进行了两轮调用，第二轮用于补齐完整性能指标。

## 3. 代理调用链

### 3.1 浏览器到项目服务端

| 功能 | 浏览器请求                       | 浏览器请求头                     | 浏览器请求体          |
| ---- | -------------------------------- | -------------------------------- | --------------------- |
| 文本 | `POST /api/shangtang?type=text`  | `Content-Type: application/json` | Chat Completions JSON |
| 图片 | `POST /api/shangtang?type=image` | `Content-Type: application/json` | 图片生成 JSON         |

### 3.2 项目服务端到 SenseAudio

| 功能 | 上游请求                                             | 服务端补充请求头                  |
| ---- | ---------------------------------------------------- | --------------------------------- |
| 文本 | `POST https://api.senseaudio.cn/v1/chat/completions` | `Authorization: Bearer <API_KEY>` |
| 图片 | `POST https://api.senseaudio.cn/v1/image/sync`       | `Authorization: Bearer <API_KEY>` |

当前代理使用固定类型映射，浏览器不能传入任意上游地址。该设计可以限制开放代理风险。认证密钥不会发送到浏览器。

## 4. 实际模型清单

### 4.1 文本模型

模型列表查询耗时 155 ms，HTTP 200，`object` 为 `list`，`has_more` 为 `false`。

| 序号 | 模型 ID                    | 显示名称                 | mode  | owned_by     |
| ---: | -------------------------- | ------------------------ | ----- | ------------ |
|    1 | `senseaudio-s2`            | SenseAudio-S2            | `llm` | `senseaudio` |
|    2 | `qwen3.8-27b`              | Qwen3.8-27B              | `llm` | `senseaudio` |
|    3 | `glm-5.3-flash`            | GLM-5.3-Flash            | `llm` | `senseaudio` |
|    4 | `deepseek-v4.1-flash`      | DeepSeek-V4.1-Flash      | `llm` | `senseaudio` |
|    5 | `senseaudio-s2-lite`       | SenseAudio-S2-Lite       | `llm` | `senseaudio` |
|    6 | `senseaudio-s2-flash`      | SenseAudio-S2-Flash      | `llm` | `senseaudio` |
|    7 | `qwen3.6-35b-a3b`          | Qwen3.6-35B-A3B          | `llm` | `qwen`       |
|    8 | `deepseek-v4-flash-0731`   | DeepSeek-V4-Flash-0731   | `llm` | `senseaudio` |
|    9 | `sensenova-6.8-flash-lite` | SenseNova-6.8-Flash-Lite | `llm` | `sensenova`  |

### 4.2 图片模型

模型列表查询耗时 117 ms，HTTP 200，`object` 为 `list`，`has_more` 为 `false`。

| 序号 | 模型 ID                       | 显示名称             | mode    | owned_by     |
| ---: | ----------------------------- | -------------------- | ------- | ------------ |
|    1 | `sensenova-u1-fast`           | sensenova-u1-fast    | `image` | `sensenova`  |
|    2 | `senseaudio-image-2.0-260319` | SenseAudio-Image-2.0 | `image` | `volcengine` |
|    3 | `doubao-seedream-5-0-260128`  | Doubao-Seedream-5.0  | `image` | `volcengine` |

## 5. 文本接口规范

### 5.1 请求连接和请求头

```http
POST /v1/chat/completions HTTP/1.1
Host: api.senseaudio.cn
Authorization: Bearer <REDACTED>
Content-Type: application/json
```

流式模式建议声明 `Accept: text/event-stream`。本次实测没有显式设置该头，上游仍正确返回 SSE。

### 5.2 请求字段

| 字段                           | 类型               | 必填     | 约束或用途                                          |
| ------------------------------ | ------------------ | -------- | --------------------------------------------------- |
| `model`                        | string             | 是       | 必须是可用文本模型 ID                               |
| `messages`                     | object[]           | 是       | 历史上下文和本轮消息                                |
| `messages[].role`              | string             | 是       | `system`、`user`、`assistant`、`tool`               |
| `messages[].content`           | string 或 object[] | 是       | 文本或多模态内容                                    |
| `messages[].name`              | string             | 否       | 参与者名称                                          |
| `messages[].tool_calls`        | object[]           | 条件必填 | 助手发起的工具调用                                  |
| `messages[].tool_call_id`      | string             | 条件必填 | `role=tool` 时关联工具调用                          |
| `tools`                        | object[]           | 否       | Function Calling 工具定义                           |
| `tool_choice`                  | string 或 object   | 否       | `none`、`auto`、`required` 或指定工具               |
| `stream`                       | boolean            | 否       | `true` 时返回 SSE                                   |
| `stream_options.include_usage` | boolean            | 否       | 在结束前返回 token 统计                             |
| `response_format`              | object             | 否       | `{ "type": "text" }` 或 `{ "type": "json_object" }` |
| `max_tokens`                   | integer            | 否       | 最大输出 token 数                                   |
| `temperature`                  | number             | 否       | 取值范围 0.0 至 2.0                                 |
| `top_p`                        | number             | 否       | 取值范围 0.0 至 1.0                                 |
| `n`                            | integer            | 否       | 返回选项数量，默认 1                                |
| `stop`                         | string 或 string[] | 否       | 最多 4 个停止序列                                   |
| `frequency_penalty`            | number             | 否       | 取值范围负 2.0 至 2.0                               |
| `presence_penalty`             | number             | 否       | 取值范围负 2.0 至 2.0                               |
| `logit_bias`                   | object             | 否       | Token ID 到偏差值的映射                             |
| `logprobs`                     | boolean            | 否       | 是否返回 token 对数概率                             |
| `top_logprobs`                 | integer            | 否       | 0 至 20，需要开启 `logprobs`                        |
| `seed`                         | integer            | 否       | 尽可能提供确定性采样                                |
| `user`                         | string             | 否       | 最终用户标识                                        |

### 5.3 本轮统一实验请求体

```json
{
  "model": "<每个被测模型>",
  "messages": [
    { "role": "system", "content": "你是接口测试助手。" },
    { "role": "user", "content": "只回答 OK" }
  ],
  "temperature": 0,
  "max_tokens": 16,
  "stream": true,
  "stream_options": { "include_usage": true }
}
```

### 5.4 SSE 响应契约

响应头应包含：

| 响应头                        | 实测值                                |
| ----------------------------- | ------------------------------------- |
| `Content-Type`                | `text/event-stream; charset=utf-8`    |
| `Cache-Control`               | `no-cache`                            |
| `Transfer-Encoding`           | `chunked`                             |
| `Access-Control-Allow-Origin` | `*`                                   |
| `Strict-Transport-Security`   | `max-age=31536000; includeSubDomains` |
| `traceparent`                 | 每次请求生成独立追踪值                |

每个数据块使用 `data: <JSON>`，结束标志为 `data: [DONE]`。标准流式 JSON 字段如下：

| 字段                                               | 类型     | 说明                                                       |
| -------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `id`                                               | string   | 请求或生成标识                                             |
| `object`                                           | string   | `chat.completion.chunk`                                    |
| `created`                                          | integer  | Unix 秒时间戳                                              |
| `model`                                            | string   | 实际响应模型                                               |
| `system_fingerprint`                               | string   | 后端配置指纹，实测可为空字符串                             |
| `choices`                                          | object[] | 生成选项                                                   |
| `choices[].index`                                  | integer  | 选项下标                                                   |
| `choices[].delta.content`                          | string   | 可见文本增量                                               |
| `choices[].delta.reasoning`                        | string   | 部分推理模型的推理增量，实测存在，官方通用字段表未明确列出 |
| `choices[].delta.reasoning_details`                | object[] | 推理过程明细，实测存在                                     |
| `choices[].finish_reason`                          | string   | 常见值为 `stop`、`length`、`tool_calls`、`content_filter`  |
| `usage.prompt_tokens`                              | integer  | 输入 token 数                                              |
| `usage.completion_tokens`                          | integer  | 输出 token 数                                              |
| `usage.total_tokens`                               | integer  | 总 token 数                                                |
| `usage.completion_tokens_details.reasoning_tokens` | integer  | 部分推理模型实际返回的推理 token 数                        |

## 6. 文本模型实验数据

表中首响应时间指 `fetch` 收到响应头和首批响应的耗时。本次短响应通常只有内容块、结束块及 `[DONE]`。

| 模型                       | HTTP | 首响应 ms | 总耗时 ms | JSON 事件数 | `[DONE]` | 可见正文 | prompt tokens | completion tokens | total tokens |
| -------------------------- | ---: | --------: | --------: | ----------: | -------- | -------- | ------------: | ----------------: | -----------: |
| `senseaudio-s2`            |  200 |    13,666 |    13,733 |           2 | 是       | `OK`     |           206 |                 3 |          209 |
| `senseaudio-s2-flash`      |  200 |       329 |       357 |           2 | 是       | `OK`     |           223 |                 2 |          225 |
| `senseaudio-s2-lite`       |  200 |       265 |       283 |           2 | 是       | `OK`     |           223 |                 2 |          225 |
| `sensenova-6.8-flash-lite` |  200 |       569 |       668 |           4 | 是       | 空       |            91 |                16 |          107 |
| `deepseek-v4.1-flash`      |  200 |    31,475 |    31,593 |           8 | 是       | 空       |            38 |                16 |           54 |
| `deepseek-v4-flash-0731`   |  200 |    34,206 |    34,357 |           8 | 是       | 空       |            38 |                16 |           54 |
| `glm-5.3-flash`            |  200 |    40,148 |    40,178 |           2 | 是       | `OK`     |            21 |                 3 |           24 |
| `qwen3.8-27b`              |  200 |       291 |       319 |           2 | 是       | `OK`     |            25 |                 2 |           27 |
| `qwen3.6-35b-a3b`          |  200 |       228 |       243 |           2 | 是       | `OK`     |            25 |                 2 |           27 |

### 6.1 重复测试观察

| 模型                       | 第一轮总耗时 | 第二轮总耗时 | 观察                               |
| -------------------------- | -----------: | -----------: | ---------------------------------- |
| `senseaudio-s2`            |    79,606 ms |    13,733 ms | 波动很大，不适合用单次结果建立 SLA |
| `senseaudio-s2-flash`      |       282 ms |       357 ms | 两轮均较快                         |
| `senseaudio-s2-lite`       |       260 ms |       283 ms | 两轮均较快                         |
| `sensenova-6.8-flash-lite` |       614 ms |       668 ms | 两轮耗时接近                       |

### 6.2 推理模型的空正文现象

`sensenova-6.8-flash-lite`、`deepseek-v4.1-flash` 和 `deepseek-v4-flash-0731` 均返回 HTTP 200 和 `[DONE]`，但 `max_tokens: 16` 全部被 `reasoning_tokens` 消耗，`delta.content` 为空。

这说明前端验收不能只检查状态码，还要检查聚合后的可见正文。正式调用应去掉过小的 `max_tokens`，或为推理模型提供更高限制。当前页面默认没有设置 `max_tokens`，不会受到本测试中 16 token 限制的直接影响。

### 6.3 多轮上下文预期

多轮记忆由客户端重复发送完整 `messages` 数组实现。平台没有在 Chat Completions 接口中提供会话 ID。第二轮请求必须包含之前的 `user` 和 `assistant` 消息。验收时至少检查：

1. 第二轮请求的 `messages` 顺序保持为 `system`、历史消息、当前 `user`。
2. 清空对话后，旧消息不再出现在请求体。
3. 模型切换后，产品需要明确是否继续沿用旧上下文。当前页面会继续沿用。

## 7. 图片接口规范

### 7.1 请求连接和请求头

```http
POST /v1/image/sync HTTP/1.1
Host: api.senseaudio.cn
Authorization: Bearer <REDACTED>
Content-Type: application/json
```

### 7.2 请求字段

| 字段        | 类型    | 必填           | 约束或用途                                                     |
| ----------- | ------- | -------------- | -------------------------------------------------------------- |
| `model`     | string  | 是             | 三个图片模型之一                                               |
| `prompt`    | string  | 是             | Seedream 和 U1 最大 2000 码位，SenseAudio Image 最大 6000 码位 |
| `reference` | string  | 否             | HTTP URL、HTTPS URL 或 Data URI                                |
| `seed`      | integer | 否             | 随机种子                                                       |
| `size`      | string  | 无参考图时必填 | 必须属于模型支持的尺寸                                         |

成功响应为 HTTP 200，响应体当前只保证一个字段：

```json
{
  "url": "https://dynamic.senseaudio.cn/image/<asset-id>"
}
```

### 7.3 模型尺寸约束

| 模型                          | 官方支持尺寸                                                                                                                                                                                                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `senseaudio-image-2.0-260319` | `1024x1024`、`1024x1280`、`1280x1024`、`1536x864`、`864x1536`、`1024x1536`、`1536x1024`、`2016x864`、`864x2016`、`2048x1024`、`1024x2048`、`2048x1152`、`1152x2048`、`2048x1360`、`1360x2048`、`2688x1152`、`1536x2048`、`2048x1536`、`2688x1344`、`1344x2688`、`3136x1344` |
| `doubao-seedream-5-0-260128`  | `2304x1728`、`1728x2304`、`2496x1664`、`1664x2496`、`2048x2048`、`3136x1344`、`2848x1600`、`1600x2848`、`3456x2592`、`2592x3456`、`2496x3744`、`3744x2496`、`4096x2304`、`2304x4096`、`3072x3072`、`4704x2016`                                                              |
| `sensenova-u1-fast`           | `1664x2496`、`2496x1664`、`1760x2368`、`2368x1760`、`1824x2272`、`2272x1824`、`2048x2048`、`2752x1536`、`1536x2752`、`3072x1376`、`1344x3136`                                                                                                                               |

当前页面默认尺寸为 `1024x1024`。该尺寸只在 `senseaudio-image-2.0-260319` 的官方尺寸列表中。用户切换到另外两个模型后仍保留此默认值会触发 HTTP 400，这是现有界面的明确缺陷。页面应根据图片模型联动尺寸选项。

## 8. 图片模型实验数据

统一提示词：`A simple blue circle centered on a white background, clean test image.`

统一随机种子：`42`

| 模型                          | 测试尺寸    | HTTP |  生成耗时 | 响应字段 | 资源检查 | MIME         |    文件大小 |
| ----------------------------- | ----------- | ---: | --------: | -------- | -------- | ------------ | ----------: |
| `senseaudio-image-2.0-260319` | `1024x1024` |  200 | 35,140 ms | `url`    | HTTP 200 | `image/jpeg` |    84,915 B |
| `doubao-seedream-5-0-260128`  | `2048x2048` |  200 | 10,298 ms | `url`    | HTTP 200 | `image/jpeg` |   101,351 B |
| `sensenova-u1-fast`           | `2048x2048` |  200 | 10,174 ms | `url`    | HTTP 200 | `image/png`  | 4,190,731 B |

### 8.1 实际生成资源

| 模型                          | 资源 URL                                                                   |
| ----------------------------- | -------------------------------------------------------------------------- |
| `senseaudio-image-2.0-260319` | `https://dynamic.senseaudio.cn/image/2df974d6-9347-4b81-9fd2-9658030fca26` |
| `doubao-seedream-5-0-260128`  | `https://dynamic.senseaudio.cn/image/b40adc68-30d3-49ae-bbb8-ee4668961467` |
| `sensenova-u1-fast`           | `https://dynamic.senseaudio.cn/image/99710773-6aeb-49a9-93d3-978de8b293ad` |

资源 URL 可能受平台生命周期策略影响，长期可用性需要另行测试。图片接口响应没有返回宽高、实际 seed、文件类型、文件大小、创建时间和过期时间，这些信息不能从 API JSON 直接确认。本轮通过资源 HEAD 请求补充了 MIME 和文件大小。

## 9. 错误与负向测试

### 9.1 实际结果

| 用例            | 请求变化                                | HTTP | 实际响应                                                                               | 结论                     |
| --------------- | --------------------------------------- | ---: | -------------------------------------------------------------------------------------- | ------------------------ |
| 未携带认证      | 删除 `Authorization`                    |  401 | `{"code":"authentication_error","message":"invalid authorization"}`                    | 通过                     |
| 无效文本模型    | `model=invalid-model-for-contract-test` |  400 | `{"code":"invalid","message":"模型未找到","ref_code":400033,"ref_scope":"common"}`     | 通过                     |
| 无效图片尺寸    | `size=123x456`                          |  400 | `{"code":"invalid","message":"参数错误：size","ref_code":400000,"ref_scope":"common"}` | 通过                     |
| 图片缺少 prompt | 不发送 `prompt`                         |  400 | `{"code":"invalid"}`                                                                   | 状态码正确，错误详情不足 |

### 9.2 官方通用错误预期

| HTTP | 预期含义                                 |
| ---: | ---------------------------------------- |
|  400 | 请求字段、模型或图片尺寸不合法           |
|  401 | 缺少凭证、凭证无效、API Key 不存在或停用 |
|  403 | API Key 无接口权限或用户被禁用           |
|  429 | 配额不足或限流                           |
|  500 | 模型平台或内部服务异常                   |

接口概览称错误体包含 `code` 和 `message`。本次缺少图片 `prompt` 的实际响应只有 `code`，与该通用约定存在差异。调用方必须允许 `message` 缺失，并提供本地兜底文案。

### 9.3 前端错误解析缺口

当前 `shangtang.vue` 首选读取 `response.message` 和 `response.statusMessage`。Chat 文档的另一种错误结构可能是 `error.message`、`error.type`、`error.code`、`error.param`。前端应同时检查：

1. `message`
2. `error.message`
3. `statusMessage`
4. HTTP 状态对应的本地兜底文案

## 10. 详细测试用例

### TC MODEL 001：查询文本模型

| 项目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| 前置条件 | API Key 有效                                                       |
| 请求     | `GET /v1/models?mode=llm`                                          |
| 预期状态 | 200                                                                |
| 预期字段 | `object`、`data`、`first_id`、`last_id`、`has_more`                |
| 断言     | `object=list`，`data` 包含页面提供的 9 个模型，所有项目 `mode=llm` |
| 实际结果 | 200，9 个模型，耗时 155 ms                                         |
| 结论     | 通过                                                               |

### TC MODEL 002：查询图片模型

| 项目     | 内容                                                |
| -------- | --------------------------------------------------- |
| 前置条件 | API Key 有效                                        |
| 请求     | `GET /v1/models?mode=image`                         |
| 预期状态 | 200                                                 |
| 断言     | `data` 包含 3 个页面图片模型，所有项目 `mode=image` |
| 实际结果 | 200，3 个模型，耗时 117 ms                          |
| 结论     | 通过                                                |

### TC TEXT 001：全部文本模型流式调用

| 项目       | 内容                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| 前置条件   | API Key 有效，模型存在                                                    |
| 请求       | 对 9 个模型分别发送统一 SSE 请求体                                        |
| 预期状态   | 200                                                                       |
| 预期响应头 | `Content-Type: text/event-stream`，`Cache-Control: no-cache`              |
| 预期事件   | 至少一个 JSON 数据块，最后出现 `[DONE]`                                   |
| 预期字段   | `id`、`object`、`created`、`model`、`choices`，结束块包含 `finish_reason` |
| 实际结果   | 9 个模型全部 200，全部出现 `[DONE]`                                       |
| 结论       | 连通性通过，三个推理模型在 16 token 限制下无可见正文                      |

### TC TEXT 002：文本多轮上下文

| 项目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| 第一次消息   | 用户要求模型记住一个随机代号                               |
| 第二次消息   | 请求体包含第一次 user、assistant 和新的 user，询问代号     |
| 预期         | 第二轮回答包含代号，第二次请求的 `messages` 完整且顺序正确 |
| 页面实现     | 当前页面把历史消息追加到后续 `messages`                    |
| 本轮远程执行 | 未单独执行语义评分，只验证了接口支持消息数组和页面构造逻辑 |

### TC TEXT 003：无效文本模型

| 项目     | 内容                                        |
| -------- | ------------------------------------------- |
| 请求变化 | 使用不存在的模型 ID                         |
| 预期     | HTTP 400，返回可识别错误字段                |
| 实际     | HTTP 400，`code=invalid`，`ref_code=400033` |
| 结论     | 通过                                        |

### TC IMAGE 001：三个图片模型同步生成

| 项目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 请求     | 对三个模型分别使用有效尺寸、统一提示词和 seed                    |
| 预期状态 | 200                                                              |
| 预期字段 | `url`                                                            |
| 资源断言 | URL 可访问，Content-Type 以 `image/` 开头，Content-Length 大于 0 |
| 实际     | 三个模型全部满足                                                 |
| 结论     | 通过                                                             |

### TC IMAGE 002：无效尺寸

| 项目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| 请求变化 | `size=123x456`                                        |
| 预期     | HTTP 400                                              |
| 实际     | HTTP 400，`message=参数错误：size`，`ref_code=400000` |
| 结论     | 通过                                                  |

### TC IMAGE 003：缺少提示词

| 项目     | 内容                             |
| -------- | -------------------------------- |
| 请求变化 | 删除 `prompt`                    |
| 预期     | HTTP 400，包含可读错误说明       |
| 实际     | HTTP 400，仅返回 `code=invalid`  |
| 结论     | 状态码通过，错误字段完整性不通过 |

### TC AUTH 001：缺少认证

| 项目     | 内容                                  |
| -------- | ------------------------------------- |
| 请求变化 | 删除 `Authorization`                  |
| 预期     | HTTP 401                              |
| 实际     | HTTP 401，`code=authentication_error` |
| 结论     | 通过                                  |

## 11. Shangtang 页面验收标准

| 编号        | 验收项     | 判定标准                                                                                        |
| ----------- | ---------- | ----------------------------------------------------------------------------------------------- |
| UI TEXT 01  | 模型选择   | 下拉选项与 `/v1/models?mode=llm` 返回的 9 个 ID 一致                                            |
| UI TEXT 02  | 流式显示   | 每个 `delta.content` 到达后立即追加，无需等待 `[DONE]`                                          |
| UI TEXT 03  | 推理字段   | `delta.content` 为空时不能把 HTTP 200 显示为有效正文；可选择展示 `reasoning` 或明确提示正文为空 |
| UI TEXT 04  | 多轮上下文 | 下一次请求包含之前的用户和助手消息                                                              |
| UI TEXT 05  | 清空对话   | 清空后请求体不包含旧历史                                                                        |
| UI IMAGE 01 | 模型选择   | 下拉选项与 `/v1/models?mode=image` 返回一致                                                     |
| UI IMAGE 02 | 尺寸联动   | 切换模型时只显示该模型支持的尺寸                                                                |
| UI IMAGE 03 | 上传预览   | 选择文件后立即生成 Data URI 预览，并把该值放入 `reference`                                      |
| UI IMAGE 04 | URL 预览   | 输入 HTTP 或 HTTPS 图片 URL 后显示预览                                                          |
| UI IMAGE 05 | 结果显示   | HTTP 200 且存在 `url` 时显示生成图片                                                            |
| UI ERROR 01 | 状态码     | 保留上游 400、401、403、429、500                                                                |
| UI ERROR 02 | 错误文案   | 兼容 `message`、`error.message`、`statusMessage` 和无 message 场景                              |
| SECURITY 01 | 密钥隔离   | 浏览器网络请求中不能出现上游 API Key                                                            |
| SECURITY 02 | 代理白名单 | 代理只允许固定的 text、image、video 和 video status 目标                                        |

## 12. 已发现问题和风险

| 等级 | 问题                           | 影响                                               | 建议                                                         |
| ---- | ------------------------------ | -------------------------------------------------- | ------------------------------------------------------------ |
| 高   | 图片尺寸没有随模型联动         | Seedream 和 U1 使用页面默认 `1024x1024` 会返回 400 | 为每个模型配置尺寸下拉选项，切换模型时选择该模型首个合法尺寸 |
| 中   | 文本前端只聚合 `delta.content` | 推理阶段较长时用户可能长时间看到空白               | 增加正在推理状态，按产品需求选择是否展示 `delta.reasoning`   |
| 中   | 错误解析未覆盖 `error.message` | 部分 Chat 错误只能显示通用请求失败                 | 扩展错误字段读取顺序                                         |
| 中   | API Key 明文写入源码           | 源码泄露会直接暴露密钥                             | 部署前迁移到服务端运行时环境变量，并轮换已经公开过的密钥     |
| 低   | 图片响应缺少元数据             | 无法仅凭 JSON 确认 MIME、大小、过期时间和实际 seed | 需要时由服务端检查资源头，或由平台扩展响应字段               |
| 低   | 单次延迟波动明显               | `senseaudio-s2` 两次为 13.7 秒和 79.6 秒           | 建立多轮采样的 P50、P95 和超时策略                           |

## 13. 建议的超时和重试策略

| 接口     | 建议客户端超时 | 重试建议                                                             |
| -------- | -------------- | -------------------------------------------------------------------- |
| 模型列表 | 10 秒          | 网络错误或 5xx 最多重试 2 次                                         |
| 文本 SSE | 180 秒         | 建立连接前的网络错误可重试；已经收到内容后不要自动重放，以免重复计费 |
| 同步图片 | 600 秒         | 400、401、403 不重试；429 遵循服务端提示；5xx 可人工确认后重试       |

自动重试生成请求可能重复计费。接口没有提供幂等键字段，调用方需要谨慎处理连接中断后的未知状态。

## 14. 复现方式

在项目根目录执行全部测试：

```powershell
node test-shangtang-api.mjs
```

只复测文本模型，避免再次产生图片费用：

```powershell
node test-shangtang-api.mjs --text-only
```

测试脚本会调用真实远端接口并产生实际用量。运行前应确认账户余额、模型权限和测试环境 API Key。

## 15. 视频 API 测试补充

### 15.1 测试信息

| 项目           | 内容                                                                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 测试时间       | 2026-09-28 15:19 至 15:24，Asia/Shanghai                                                                                                                               |
| 官方文档       | [创建视频生成任务](https://docs.senseaudio.cn/api-reference/endpoint/video/create)，[查询视频生成状态](https://docs.senseaudio.cn/api-reference/endpoint/video/status) |
| 创建接口       | `POST https://api.senseaudio.cn/v1/video/create`                                                                                                                       |
| 状态接口       | `GET https://api.senseaudio.cn/v1/video/status?id=<TASK_ID>`                                                                                                           |
| 模型           | `doubao-seedance-2-0-260128`                                                                                                                                           |
| 测试模式       | 文生视频、首帧图生视频                                                                                                                                                 |
| 轮询间隔       | 5 秒                                                                                                                                                                   |
| 正向任务数     | 2                                                                                                                                                                      |
| 负向字段用例数 | 7                                                                                                                                                                      |

模型列表实测结果为 HTTP 200，耗时 224 ms，`mode=video` 仅返回一个模型：

```json
{
  "object": "list",
  "data": [
    {
      "id": "doubao-seedance-2-0-260128",
      "display_name": "Doubao-Seedance-2.0",
      "mode": "video",
      "owned_by": "volcengine"
    }
  ],
  "has_more": false
}
```

### 15.2 请求连接和请求头

创建任务：

```http
POST /v1/video/create HTTP/1.1
Host: api.senseaudio.cn
Authorization: Bearer <REDACTED>
Content-Type: application/json
```

查询状态：

```http
GET /v1/video/status?id=<TASK_ID> HTTP/1.1
Host: api.senseaudio.cn
Authorization: Bearer <REDACTED>
Content-Type: application/json
```

创建成功返回 HTTP 200 和 `task_id`。任务创建成功只说明请求进入队列，最终结果必须以状态接口的 `completed` 或 `failed` 为准。

### 15.3 顶层请求字段

| 字段                               | 类型     | 必填 | 约束或用途                              |
| ---------------------------------- | -------- | ---- | --------------------------------------- |
| `model`                            | string   | 是   | 当前仅支持 `doubao-seedance-2-0-260128` |
| `content`                          | object[] | 是   | 文本、图片、音频或视频素材列表          |
| `duration`                         | integer  | 是   | 4 至 15 秒                              |
| `resolution`                       | string   | 是   | `480p`、`720p`、`1080p`                 |
| `ratio`                            | string   | 是   | `16:9`、`4:3`、`1:1`、`3:4`、`9:16`     |
| `timeout`                          | integer  | 否   | 3600 至 172800 秒                       |
| `watermark`                        | boolean  | 否   | 默认 `true`                             |
| `provider_specific`                | object   | 否   | 厂商扩展字段                            |
| `provider_specific.generate_audio` | boolean  | 否   | 是否生成音频                            |

### 15.4 content 元素字段

| 字段        | 类型   | 使用条件     | 说明                                       |
| ----------- | ------ | ------------ | ------------------------------------------ |
| `type`      | string | 必填         | `text`、`image`、`audio`、`video`          |
| `text`      | string | `type=text`  | 提示词                                     |
| `url`       | string | `type=image` | HTTP、HTTPS 或 Data URI 图片               |
| `role`      | string | `type=image` | `first_frame`、`last_frame` 或 `reference` |
| `audio_url` | string | `type=audio` | 音频地址                                   |
| `video_url` | string | `type=video` | 视频地址                                   |

### 15.5 content 组合规则

| 模式         | 支持组合                                                              | 限制                                   |
| ------------ | --------------------------------------------------------------------- | -------------------------------------- |
| 文生视频     | 最多 1 条 `text`                                                      | 本轮已实测                             |
| 首尾帧模式   | 可选 `text`，必选 `first_frame`，可选 `last_frame`                    | `first_frame` 和 `last_frame` 角色专用 |
| 参考素材模式 | 可选 `text`，最多 9 张 `reference` 图片，最多 3 条音频，最多 3 条视频 | 首尾帧模式与参考素材模式不能混用       |
| 仅音频       | 不支持                                                                | 必须至少搭配图片或视频                 |

图片素材支持 jpeg、png、webp、bmp、tiff 和 gif。图片宽高比要求大于 0.4 且小于 2.5，宽高范围为 300 至 6000 px，单图不超过 30 MB，请求体不超过 64 MB。

音频支持 wav 和 mp3，单条 2 至 15 秒，最多 3 条，总时长不超过 15 秒，单条不超过 15 MB。

视频素材支持 mp4 和 mov，分辨率支持 480p 和 720p，单条 2 至 15 秒，最多 3 条，总时长不超过 15 秒，帧率范围为 24 至 60 FPS，单条不超过 50 MB。

## 16. 文生视频实验

### 16.1 实际请求

```json
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    {
      "type": "text",
      "text": "白色背景上的蓝色圆球缓慢旋转，固定镜头，简洁测试视频"
    }
  ],
  "duration": 4,
  "resolution": "480p",
  "ratio": "16:9",
  "timeout": 3600,
  "watermark": false,
  "provider_specific": {
    "generate_audio": false
  }
}
```

### 16.2 创建响应

| 项目         | 实际值                                 |
| ------------ | -------------------------------------- |
| HTTP 状态码  | 200                                    |
| 创建接口耗时 | 247 ms                                 |
| 响应字段     | `task_id`                              |
| task_id      | `0d101c3a-541f-4bcb-b75c-33527688f315` |

```json
{
  "task_id": "0d101c3a-541f-4bcb-b75c-33527688f315"
}
```

### 16.3 状态变化

| 轮询次数 | 已等待时间 | HTTP | status      | progress |
| -------: | ---------: | ---: | ----------- | -------: |
|        1 |      68 ms |  200 | `pending`   |        0 |
|        2 |   5,221 ms |  200 | `pending`   |       50 |
|       33 | 164,984 ms |  200 | `completed` |      100 |

轮询检测到完成共耗时 165,702 ms。平台返回的 `created_at` 与 `completed_at` 相差 157 秒。

### 16.4 最终响应

```json
{
  "id": "baac5ea9-97cc-4a30-9d32-3d13c9fa58de",
  "model": "doubao-seedance-2-0-260128",
  "task_id": "0d101c3a-541f-4bcb-b75c-33527688f315",
  "status": "completed",
  "progress": 100,
  "video_url": "https://dynamic.senseaudio.cn/video/5bf65768-ad45-44ff-ab0f-eb6c77f00e63",
  "duration": 4,
  "is_new": true,
  "created_at": 1790579946,
  "completed_at": 1790580103,
  "prompt": "",
  "resolution": "480p",
  "content": [
    {
      "type": "text",
      "text": "白色背景上的蓝色圆球缓慢旋转，固定镜头，简洁测试视频"
    }
  ],
  "ratio": "16:9",
  "provider_specific": {
    "generate_audio": false
  }
}
```

资源检查结果：HTTP 200，`Content-Type: video/mp4`，`Content-Length: 432020`。

## 17. 图生视频实验

### 17.1 实际请求

本用例使用前一轮图片模型测试生成的图片作为 `first_frame`。

```json
{
  "model": "doubao-seedance-2-0-260128",
  "content": [
    {
      "type": "text",
      "text": "蓝色圆球轻微旋转，镜头缓慢靠近"
    },
    {
      "type": "image",
      "url": "https://dynamic.senseaudio.cn/image/2df974d6-9347-4b81-9fd2-9658030fca26",
      "role": "first_frame"
    }
  ],
  "duration": 4,
  "resolution": "480p",
  "ratio": "1:1",
  "watermark": true,
  "provider_specific": {
    "generate_audio": true
  }
}
```

### 17.2 创建响应

| 项目         | 实际值                                 |
| ------------ | -------------------------------------- |
| HTTP 状态码  | 200                                    |
| 创建接口耗时 | 412 ms                                 |
| 响应字段     | `task_id`                              |
| task_id      | `c2a03710-1d2b-4b6e-aee1-1e3f7c707b26` |

### 17.3 状态变化

| 轮询次数 | 已等待时间 | HTTP | status      | progress |
| -------: | ---------: | ---: | ----------- | -------: |
|        1 |     145 ms |  200 | `pending`   |        0 |
|       14 |  66,862 ms |  200 | `pending`   |       50 |
|       26 | 128,454 ms |  200 | `completed` |      100 |

轮询检测到完成共耗时 128,651 ms。平台返回的 `created_at` 与 `completed_at` 相差 100 秒。

### 17.4 最终响应

```json
{
  "id": "f8311d7f-9bed-41a6-b152-aaab75b945aa",
  "model": "doubao-seedance-2-0-260128",
  "task_id": "c2a03710-1d2b-4b6e-aee1-1e3f7c707b26",
  "status": "completed",
  "progress": 100,
  "video_url": "https://dynamic.senseaudio.cn/video_add_watermark/d8424692-ba7e-4679-bf0e-1e1491c20ad7/d8424692-ba7e-4679-bf0e-1e1491c20ad7.mp4",
  "duration": 4,
  "is_new": true,
  "created_at": 1790580113,
  "completed_at": 1790580213,
  "prompt": "",
  "resolution": "480p",
  "content": [
    {
      "type": "text",
      "text": "蓝色圆球轻微旋转，镜头缓慢靠近"
    },
    {
      "type": "image",
      "url": "https://dynamic.senseaudio.cn/image/2df974d6-9347-4b81-9fd2-9658030fca26",
      "role": "first_frame"
    }
  ],
  "ratio": "1:1",
  "provider_specific": {
    "generate_audio": true,
    "watermark_url": "https://dynamic.senseaudio.cn/dfdfe538-91d6-4409-9337-fcd0f7ca5e69/a0936177-742a-4087-9e6f-ef5bf16c4836/logo2.png"
  }
}
```

资源检查结果：HTTP 200，`Content-Type: video/mp4`，`Content-Length: 942388`。开启水印后，最终视频使用 `video_add_watermark` 路径，响应额外出现 `provider_specific.watermark_url`。

## 18. 视频状态响应字段

| 字段                | 类型     | 出现条件或说明                                 |
| ------------------- | -------- | ---------------------------------------------- |
| `id`                | string   | 平台记录 ID                                    |
| `model`             | string   | 模型 ID                                        |
| `task_id`           | string   | 创建接口返回的任务 ID                          |
| `status`            | string   | `pending`、`processing`、`completed`、`failed` |
| `progress`          | integer  | 0 至 100 的进度值                              |
| `video_url`         | string   | 完成后返回                                     |
| `duration`          | integer  | 实际视频秒数                                   |
| `is_new`            | boolean  | 是否为新视频                                   |
| `error_message`     | string   | 失败时返回                                     |
| `created_at`        | integer  | 创建时间戳                                     |
| `completed_at`      | integer  | 完成时间戳                                     |
| `prompt`            | string   | 提示词字段，两个实测结果均为空字符串           |
| `resolution`        | string   | 实际分辨率                                     |
| `ratio`             | string   | 实际画幅                                       |
| `content`           | object[] | 原始内容数组                                   |
| `provider_specific` | object   | 厂商扩展结果                                   |

本轮轮询只观察到 `pending` 和 `completed`。官方还定义了 `processing` 与 `failed`。客户端必须支持全部四种状态，不能依赖本轮观测到的两种状态。

## 19. 视频字段负向测试

| 用例             | 修改字段                    | HTTP | code               | message                | ref_code | 判定               |
| ---------------- | --------------------------- | ---: | ------------------ | ---------------------- | -------: | ------------------ |
| 无效模型         | `model=invalid-video-model` |  500 | `internal`         | `服务繁忙，请稍后再试` |   500000 | 平台错误分类不合理 |
| 时长低于下限     | `duration=3`                |  400 | `不支持的视频时长` | `不支持的视频时长`     |   400000 | 通过               |
| 时长高于上限     | `duration=16`               |  400 | `不支持的视频时长` | `不支持的视频时长`     |   400000 | 通过               |
| 无效分辨率       | `resolution=360p`           |  400 | `invalid`          | `参数错误：resolution` |   400000 | 通过               |
| 无效画幅         | `ratio=2:1`                 |  400 | `invalid`          | `参数错误：ratio`      |   400000 | 通过               |
| timeout 低于下限 | `timeout=3599`              |  400 | `不支持的超时时间` | `不支持的超时时间`     |   400000 | 通过               |
| content 为空     | `content=[]`                |  400 | `内容不能为空`     | `内容不能为空`         |   400000 | 通过               |

无效模型属于客户端请求错误，合理状态码应为 HTTP 400。平台实际返回 HTTP 500 和“服务繁忙”，会误导调用方执行无意义重试，也会污染服务端故障率统计。这是本轮视频测试发现的上游契约缺陷。

## 20. 视频详细测试用例

### TC VIDEO 001：查询视频模型

| 项目 | 内容                                                |
| ---- | --------------------------------------------------- |
| 请求 | `GET /v1/models?mode=video`                         |
| 预期 | HTTP 200，返回唯一模型 `doubao-seedance-2-0-260128` |
| 实际 | HTTP 200，1 个模型，耗时 224 ms                     |
| 结论 | 通过                                                |

### TC VIDEO 002：文生视频

| 项目     | 内容                                         |
| -------- | -------------------------------------------- |
| 输入     | 纯文本，4 秒，480p，16:9，无水印，不生成音频 |
| 创建预期 | HTTP 200，存在非空 `task_id`                 |
| 轮询预期 | 最终为 `completed` 或 `failed`               |
| 成功预期 | `progress=100`，`video_url` 非空，资源为 MP4 |
| 实际     | 165.7 秒完成，MP4 为 432,020 B               |
| 结论     | 通过                                         |

### TC VIDEO 003：首帧图生视频

| 项目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| 输入     | 文本加 `first_frame`，4 秒，480p，1:1，开启水印和音频    |
| 创建预期 | HTTP 200，存在非空 `task_id`                             |
| 成功预期 | 最终为 `completed`，返回可访问 MP4                       |
| 实际     | 128.7 秒完成，MP4 为 942,388 B，响应包含 `watermark_url` |
| 结论     | 通过                                                     |

### TC VIDEO 004：时长边界

| 项目     | 内容                                |
| -------- | ----------------------------------- |
| 有效边界 | 4 和 15                             |
| 无效边界 | 3 和 16                             |
| 本轮实测 | 4 成功，3 和 16 均返回 HTTP 400     |
| 待补充   | 15 秒正向任务费用较高，本轮没有执行 |

### TC VIDEO 005：分辨率枚举

| 项目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 有效值   | `480p`、`720p`、`1080p`                                                  |
| 无效值   | `360p`                                                                   |
| 本轮实测 | `480p` 成功，`360p` 返回 HTTP 400                                        |
| 待补充   | `720p` 和 `1080p` 正向生成会增加实际费用，本轮依据官方枚举保留为后续用例 |

### TC VIDEO 006：画幅枚举

| 项目     | 内容                                       |
| -------- | ------------------------------------------ |
| 有效值   | `16:9`、`4:3`、`1:1`、`3:4`、`9:16`        |
| 无效值   | `2:1`                                      |
| 本轮实测 | `16:9` 和 `1:1` 成功，`2:1` 返回 HTTP 400  |
| 待补充   | 其余三个有效画幅依据官方枚举保留为后续用例 |

### TC VIDEO 007：timeout 边界

| 项目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| 有效范围 | 3600 至 172800                                        |
| 本轮实测 | 3600 创建成功，3599 返回 HTTP 400                     |
| 待补充   | 172800 上边界不影响内容结果，本轮没有额外创建计费任务 |

### TC VIDEO 008：水印和音频开关

| 项目             | 文生视频        | 图生视频                                     |
| ---------------- | --------------- | -------------------------------------------- |
| `watermark`      | false           | true                                         |
| `generate_audio` | false           | true                                         |
| 任务结果         | completed       | completed                                    |
| 特有结果         | 普通 video 路径 | `video_add_watermark` 路径和 `watermark_url` |

## 21. 视频页面验收和现有问题

| 等级 | 检查项       | 当前情况                               | 建议                                                 |
| ---- | ------------ | -------------------------------------- | ---------------------------------------------------- |
| 高   | 时长输入范围 | 页面只设置 `min=1`                     | 改为 `min=4`、`max=15`、`step=1`                     |
| 中   | 分辨率选项   | 页面有 `720p`、`1080p`，缺少 `480p`    | 增加 `480p`                                          |
| 中   | 画幅选项     | 页面有 `16:9`、`9:16`、`1:1`           | 增加 `4:3` 和 `3:4`                                  |
| 中   | 轮询状态     | 已按 5 秒查询                          | 保持，增加明确的 progress 百分比显示                 |
| 中   | 失败信息     | 已读取 `error_message`                 | 同时保留任务 ID，便于平台排查                        |
| 低   | timeout      | 页面没有普通控件，可通过附加 JSON 设置 | 普通用户需要长任务控制时再增加                       |
| 低   | 参考素材模式 | 页面目前只支持一个 `first_frame`       | 需要参考图、多素材、首尾帧时再扩展多文件和 role 选择 |

## 22. 视频测试复现

只执行视频模型测试：

```powershell
node test-shangtang-api.mjs --video-only
```

该命令会创建两个真实视频任务并产生实际费用。脚本最多轮询 180 次，每次间隔 5 秒，单个任务最长等待约 15 分钟。
