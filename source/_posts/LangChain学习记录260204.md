---
title: LangChain学习记录260204-高级概念
tags:
  - LangChain
categories:
  - GYBot制作计划
  - LangChain
abbrlink: 315c14a9
date: 2026-02-04 15:15:54
---

### 高级概念

接下来是比基础知识高级一点的概念

### 结构化输出

LangChain通过`response_format`参数提供结构化输出策略。

#### ToolStrategy

`ToolStrategy`使用人工工具调用生成结构化输出。这适用于任何支持工具调用的模型：

```python
from pydantic import BaseModel
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy


class ContactInfo(BaseModel):
    name: str
    email: str
    phone: str

agent = create_agent(
    model="openai:gpt-4o-mini",
    tools=[search_tool],
    response_format=ToolStrategy(ContactInfo)
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "从以下内容提取联系信息：John Doe, john@example.com, (555) 123-4567"}]
})

result["structured_response"]
# ContactInfo(name='John Doe', email='john@example.com', phone='(555) 123-4567')
```

#### ProviderStrategy

`ProviderStrategy`使用模型提供商的原生结构化输出生成。这更可靠，但仅适用于支持原生结构化输出的提供商（例如 OpenAI）：

```python
from langchain.agents.structured_output import ProviderStrategy

agent = create_agent(
    model="openai:gpt-4o",
    response_format=ProviderStrategy(ContactInfo)
)
```

### 记忆

Agents通过消息状态自动维护对话历史。可以通过配置Agents使用自定义状态模式，在对话期间记住额外信息。  
存储在状态中的信息可以被视为Agents的短期记忆  
自定义状态模式必须扩展`AgentState`作为`TypedDict`。  
定义自定义状态有两种方式：

* 通过 中间件（推荐）
* 通过`create_agent`上的`state_schema`

#### 通过中间件定义状态

当自定义状态需要被特定中间件钩子和附加到该中间件的工具访问时，使用中间件定义自定义状态。

```python
from langchain.agents import AgentState
from langchain.agents.middleware import AgentMiddleware


class CustomState(AgentState):
    user_preferences: dict

class CustomMiddleware(AgentMiddleware):
    state_schema = CustomState
    tools = [tool1, tool2]

    def before_model(self, state: CustomState, runtime) -> dict[str, Any] | None:
        ...

agent = create_agent(
    model,
    tools=tools,
    middleware=[CustomMiddleware()]
)

# Agents现在可以跟踪消息之外的额外状态
result = agent.invoke({
    "messages": [{"role": "user", "content": "我更喜欢技术性解释"}],
    "user_preferences": {"style": "technical", "verbosity": "detailed"},
})
```

#### 通过`state_schema`定义状态

使用`state_schema`参数作为快捷方式，定义仅在工具中使用的自定义状态。

```python
from langchain.agents import AgentState


class CustomState(AgentState):
    user_preferences: dict

agent = create_agent(
    model,
    tools=[tool1, tool2],
    state_schema=CustomState
)
# Agents现在可以跟踪消息之外的额外状态
result = agent.invoke({
    "messages": [{"role": "user", "content": "我更喜欢技术性解释"}],
    "user_preferences": {"style": "technical", "verbosity": "detailed"},
})
```

### 流式传输

如果Agents执行多个步骤，这可能需要一段时间。为了显示中间进度，我们可以随着消息的发生而流式传回。  

```python
for chunk in agent.stream({
    "messages": [{"role": "user", "content": "搜索 AI 新闻并总结发现"}]
}, stream_mode="values"):
    # 每个块包含该时间点的完整状态
    latest_message = chunk["messages"][-1]
    if latest_message.content:
        print(f"Agents：{latest_message.content}")
    elif latest_message.tool_calls:
        print(f"正在调用工具：{[tc['name'] for tc in latest_message.tool_calls]}")
```

### 中间件

中间件 为在执行的不同阶段自定义Agents行为提供了强大的扩展性。可以使用中间件来：

* 在调用模型之前处理状态（例如消息裁剪、上下文注入）
* 修改或验证模型的响应（例如防护栏、内容过滤）
* 使用自定义逻辑处理工具执行错误
* 基于状态或上下文实现动态模型选择
* 添加自定义日志、监控或分析
中间件无缝集成到Agents的执行图中，允许在关键点拦截和修改数据流，而无需更改核心Agents逻辑。
