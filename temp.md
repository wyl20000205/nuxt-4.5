# TopenRouter 全模型实测与来源风险报告

测试日期：2026 年 8 月 24 日

测试对象：`https://topenrouter.chinadatapay.com/console/#/console/model`

API 基址：`https://tp-api.chinadatapay.com:8000`

## 一、结论

本次从鉴权模型目录取得 44 个模型标识，全部完成了与类型相符的可用性检查。30 个文本模型最终均能获得 HTTP 200 响应，1 个嵌入模型和 1 个重排模型通过原生接口测试，12 个图像或视频模型完成目录及接口类型核验。为控制费用，媒体模型没有发起实际生成任务。

黑盒 API 测试无法签发“官方源头直连”证明。响应中的 `model` 字段由中转平台控制，模型自述也可能受到系统提示、微调和路由模板影响。当前证据可以判断兼容性和异常风险，无法单独证明每次请求落在厂商官方端点。

综合判断：平台具备真实可调用能力，但目录治理、别名透明度、输出预算控制和部分模型路由存在明显风险。`doubao-seed-2.0-code`、`kimi-k3-v1`、`qwen3.5-397b-a17b`、`qwen3.5-plus` 应暂停用于高价值生产任务，等待平台提供上游路由证据并完成复测。

## 二、关键风险

| 等级 | 对象 | 实测现象 | 判断 |
|---|---|---|---|
| 高 | `doubao-seed-2.0-code` | 两次定向身份询问分别回答 `Claude 3 Haiku / Anthropic` 和 `Claude by Anthropic` | 存在标签映射、路由或系统提示污染风险。自述仍属弱证据，暂不能直接判定替换模型 |
| 高 | `kimi-k3-v1` | 修正温度参数后返回 HTTP 200，但忽略简单指令，生成无关通用答案并耗尽 512 个完成 Token | 路由模板或别名配置异常，当前不宜投产 |
| 高 | `qwen3.5-397b-a17b` | 首轮设置 `max_tokens=96`，用量却报告 4291 个完成 Token；限额复测设置 16，仍报告 232 | 输出预算约束或用量口径异常，存在费用失控风险 |
| 高 | `qwen3.5-plus` | 限额复测设置 16，仍报告 287 个完成 Token | 输出预算约束或用量口径异常 |
| 中 | `qwen3.7-max` | 一次自述为 `Gemini / Google`，另一次自述为 `Qwen / Alibaba` | 身份输出相互矛盾，需基准对照和上游证明 |
| 中 | MiniMax 系列 | 多个型号在正文暴露 `<think>` 内容 | 响应清洗和兼容层存在问题 |
| 中 | 模型目录 | 鉴权目录 44 项，公开价格目录 33 项；有 12 个鉴权独有条目和 1 个公开独有条目 | 目录版本、别名和计费映射缺乏一致性 |
| 中 | 全平台 | 已测响应的 `system_fingerprint` 为空 | 缺少可用于追踪上游版本的技术凭据 |

## 三、目录差异

鉴权目录独有 12 项：

`doubao-seedance-2-0-260128`，`doubao-seedance-2-0-fast`，`doubao-seedance-2-0-fast-260128`，`doubao-seedance-2-0-mini-260615`，`doubao-seedance-2-5-260628`，`doubao-seedance-2.0`，`doubao-seedream-5-0-pro-260628`，`glm-5.1-sjb`，`glm-5.2-sjb`，`glm-5.3-sjb`，`kimi-k3-sjb`，`kimi-k3-v1`。

公开价格目录独有 1 项：`MiniMax-H3`。

`sjb`、`v1` 等后缀没有在平台页面中给出清晰的上游映射说明。隐藏别名本身不能证明掺水，但会增加错配和计费争议风险。

## 四、全部模型结果

风险栏描述当前异常程度。所有型号的“源头直连”状态均为未证实。

| 模型 | 类型 | 可用性结果 | 风险 |
|---|---|---|---|
| `bge-reranker-v2-m3` | 重排 | `/v1/rerank` 返回 200，得到 2 项排序结果 | 低 |
| `qwen3-embedding-8b` | 嵌入 | `/v1/embeddings` 返回 200，维度 4096 | 低 |
| `deepseek-v4-flash` | 文本 | 200，基础指令通过 | 低 |
| `deepseek-v4-flash-0731` | 文本 | 200，扩展 Token 复测通过 | 低 |
| `deepseek-v4-pro` | 文本 | 200，扩展 Token 复测通过 | 低 |
| `deepseek-v4-pro-0813` | 文本 | 200，扩展 Token 复测通过 | 低 |
| `doubao-seed-2.0-code` | 文本 | 200，基础能力通过，身份自述连续指向 Claude | 高 |
| `doubao-seed-2.0-pro` | 文本 | 200，基础能力通过，自述指向豆包和字节跳动 | 低 |
| `glm-5` | 文本 | 200，基础能力通过 | 低 |
| `glm-5.1` | 文本 | 200，基础能力通过 | 低 |
| `glm-5.1-sjb` | 文本 | 200，扩展 Token 复测通过 | 中 |
| `glm-5.2` | 文本 | 200，扩展 Token 复测通过 | 低 |
| `glm-5.2-sjb` | 文本 | 200，扩展 Token 复测通过 | 中 |
| `glm-5.3` | 文本 | 200，低输出上限时可见正文为空 | 中 |
| `glm-5.3-sjb` | 文本 | 200，低输出上限时可见正文为空 | 中 |
| `kimi-k2.5` | 文本 | 200，扩展 Token 复测通过 | 低 |
| `kimi-k2.6` | 文本 | 200，扩展 Token 复测通过 | 低 |
| `kimi-k2.7-code` | 文本 | 200，扩展 Token 复测通过 | 低 |
| `kimi-k2.7-code-highspeed` | 文本 | 温度参数修正后 200 | 低 |
| `kimi-k3` | 文本 | 200，基础能力通过，自述指向 Kimi 和 Moonshot | 低 |
| `kimi-k3-sjb` | 文本 | 200，基础能力通过，自述指向 Kimi 和 Moonshot | 中 |
| `kimi-k3-v1` | 文本 | 参数修正后 200，但回答严重偏题 | 高 |
| `minimax-m2.5` | 文本 | 200，出现思考标签和截断 | 中 |
| `minimax-m2.5-highspeed` | 文本 | 200，出现思考标签和截断 | 中 |
| `minimax-m2.7` | 文本 | 200，复测通过 | 低 |
| `minimax-m2.7-highspeed` | 文本 | 200，出现思考标签 | 中 |
| `minimax-m3` | 文本 | 200，正文包含思考标签后给出正确结果 | 中 |
| `qwen3.5-397b-a17b` | 文本 | 200，完成 Token 严重超过请求上限 | 高 |
| `qwen3.5-plus` | 文本 | 首轮超时，复测 200；限额复测严重超限 | 高 |
| `qwen3.6-plus` | 文本 | 200，报告用量与短正文差距较大 | 中 |
| `qwen3.7-max` | 文本 | 200，基础能力通过，身份自述矛盾 | 中 |
| `qwen3.8-max` | 文本 | 200，基础能力通过 | 低 |
| `doubao-seedance-2-0-260128` | 视频 | 目录详情接口 200，未生成 | 未验证 |
| `doubao-seedance-2-0-fast` | 视频 | 目录详情接口 200，未生成 | 未验证 |
| `doubao-seedance-2-0-fast-260128` | 视频 | 目录详情接口 200，未生成 | 未验证 |
| `doubao-seedance-2-0-mini-260615` | 视频 | 目录详情接口 200，未生成 | 未验证 |
| `doubao-seedance-2-5-260628` | 视频 | 目录详情接口 200，未生成 | 未验证 |
| `doubao-seedance-2.0` | 视频 | 目录详情接口 200，未生成 | 未验证 |
| `happyhorse-1.0` | 视频 | 目录详情接口 200，未生成 | 未验证 |
| `happyhorse-1.1` | 视频 | 目录详情接口 200，未生成 | 未验证 |
| `kling-3.0` | 视频 | 目录详情接口 200，未生成 | 未验证 |
| `kling-3.0-omni` | 视频 | 目录详情接口 200，未生成 | 未验证 |
| `doubao-seedream-5-0-260128` | 图像 | 目录详情接口 200，未生成 | 未验证 |
| `doubao-seedream-5-0-pro-260628` | 图像 | 文本接口明确拒绝并提示 Seedream 通道不支持聊天，未生成 | 未验证 |

## 五、官方资料交叉核验

DeepSeek 官方代码中列出了 `deepseek-v4-flash` 和 `deepseek-v4-pro`，说明这两个基础型号名称具有官方依据：[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/llm/llm-deepseek/src/index.ts)。这只能证明型号名称存在，无法证明本平台请求直达 DeepSeek。

BytePlus 官方英文文档列出了 `dola-seed-2.0-code`，并将其列为 Coding Plan 支持模型：[ModelArk Coding Plan release notes](https://docs.byteplus.com/api/docs/ModelArk/2222865)。本平台使用 `doubao-seed-2.0-code` 别名。名称映射需要平台解释。该官方资料与本次模型自述 Anthropic 的现象形成明显冲突。

Moonshot 官方发布的 [Kimi Vendor Verifier](https://github.com/MoonshotAI/Kimi-Vendor-Verifier) 将参数约束、工具调用 JSON Schema、K3 特性契约、提示词 Token 精度及公开基准列为供应商验证内容。当前轻量测试已经发现 `kimi-k3-v1` 行为异常，仍需用该验证器做正式基准后才能评定 Kimi 路由的来源可信度。

本次限定使用厂商官方英文资料和官方 GitHub 组织进行检索。部分新型号及平台私有别名没有找到足以建立一一对应关系的官方条目，因此维持“未证实”结论。

## 六、判断边界与采购建议

模型自述、响应 ID 格式、延迟和 `model` 字段都属于辅助信号。它们可以发现冲突，不能独立证明来源。

正式采购前应要求平台提供模型别名到上游型号的映射表、每个请求可追溯的上游请求编号、计费前后的 Token 明细、模型版本变更记录和服务商授权或采购凭据。对 Kimi K3 应运行 Moonshot 官方验证器。对其他家族应使用官方端点建立盲测对照集，比较固定题集的得分分布、参数约束、Token 计数和工具调用行为。

在证据补齐前，建议只把低风险文本模型用于非关键试用。高风险型号应停止承载付费生产流量。媒体模型在完成实际生成质量、时延、失败重试和计费核对前，不应视为已通过测试。

## 七、密钥安全

测试密钥曾以明文发送到聊天中，已经构成泄露。应立即在平台控制台撤销该密钥并创建新密钥。后续密钥应放入环境变量或密钥管理工具，不要粘贴到聊天、文档和测试报告中。
