---
title: LangChain学习记录260203-基础知识
tags:
  - LangChain
categories:
  - GYBot制作计划
  - LangChain
abbrlink: 5d33a59b
date: 2026-02-03 23:07:15
---
为满足GYBot的更新需求，现来学习[LangChain v1.0](https://reference.langchain.com/python/langchain/ "官网传送")

### Agents  

Agents能将大模型与工具结合，让大模型经过推理，决定使用工具，来解决问题  
Agents会一直运行，直到满足停止条件——即模型输出最终结果或达到迭代次数限制。  
<img src="/postdata/LangChain学习记录260203/1.svg" alt="Agents" style="width: 200px; height: 400px;">

### 核心组件

#### 模型

即大模型，可以看成Agents的大脑

##### 静态模型

静态模型在创建Agents时配置一次，并在整个执行过程中保持不变。这是最常见且直接的方法。  
从 模型标识符字符串 初始化静态模型：  

```python
from langchain.agents import create_agent

agent = create_agent(
    "openai:gpt-5",
    tools=tools
)
```

> **提示**
> 模型标识符字符串支持自动推断（例如 "gpt-5" 将被推断为 "openai:gpt-5"）。请参考[参考文档](https://reference.langchain.com/python/langchain/models/#langchain.chat_models.init_chat_model(model_provider)) 查看完整的模型标识符字符串映射列>>表。
官方文档使用OpenAi举例：

```python
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model="gpt-5",
    temperature=0.1,
    max_tokens=1000,
    timeout=30
    # ...（其他参数）
)
agent = create_agent(model, tools=tools)
```

##### 动态模型

动态模型在运行时根据当前状态和上下文进行选择。
要使用动态模型，请使用`@wrap_model_call`装饰器创建中间件，以修改请求中的模型：

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse


basic_model = ChatOpenAI(model="gpt-4o-mini")
advanced_model = ChatOpenAI(model="gpt-4o")

@wrap_model_call
def dynamic_model_selection(request: ModelRequest, handler) -> ModelResponse:
    """根据对话复杂性选择模型。"""
    message_count = len(request.state["messages"])

    if message_count > 10:
        # 对较长的对话使用高级模型
        model = advanced_model
    else:
        model = basic_model

    # request.model = model 我自己在使用时，发现这个方法已经过时了，现在使用的是下面这种
    request=request.override(model=model)
    return handler(request)

agent = create_agent(
    model=basic_model,  # 默认模型
    tools=tools,
    middleware=[dynamic_model_selection]
)
```

#### 工具

##### 定义工具

将工具列表传递给Agents。  

```python
from langchain.tools import tool
from langchain.agents import create_agent


@tool
def search(query: str) -> str:
    """搜索信息。"""
    return f"结果：{query}"

@tool
def get_weather(location: str) -> str:
    """获取位置的天气信息。"""
    return f"{location} 的天气：晴朗，72°F"

agent = create_agent(model, tools=[search, get_weather])
```

如果提供空工具列表，Agents将仅包含一个 LLM 节点，不具备工具调用能力。  

##### 工具错误处理

要自定义工具错误的处理方式，请使用`@wrap_tool_call`装饰器创建中间件：

```python
from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call
from langchain_core.messages import ToolMessage


@wrap_tool_call
def handle_tool_errors(request, handler):
    """使用自定义消息处理工具执行错误。"""
    try:
        return handler(request)
    except Exception as e:
        # 向模型返回自定义错误消息
        return ToolMessage(
            content=f"工具错误：请检查您的输入并重试。({str(e)})",
            tool_call_id=request.tool_call["id"]
        )

agent = create_agent(
    model="openai:gpt-4o",
    tools=[search, get_weather],
    middleware=[handle_tool_errors]
)
```

当工具失败时，Agents将返回带有自定义错误消息的`ToolMessage`：

```python
[
    ...
    ToolMessage(
        content="工具错误：请检查您的输入并重试。(division by zero)",
        tool_call_id="..."
    ),
    ...
]
```

#### system_prompt

可以通过提供prompt来塑造Agents处理任务的方式。`system_prompt`参数可以作为字符串提供：

```python
agent = create_agent(
    model,
    tools,
    system_prompt="你是一个有帮助的助手。请简洁准确。"
)
```

当未提供`system_prompt`时，Agents将直接从消息中推断其任务。

##### 动态system_prompt

对于需要根据运行时上下文或Agents状态修改系统提示的高级用例，可以使用中间件。  
`@dynamic_prompt`装饰器创建中间件，根据模型请求动态生成系统提示：

```python
from typing import TypedDict

from langchain.agents import create_agent
from langchain.agents.middleware import dynamic_prompt, ModelRequest


class Context(TypedDict):
    user_role: str

@dynamic_prompt
def user_role_prompt(request: ModelRequest) -> str:
    """根据用户角色生成系统提示。"""
    user_role = request.runtime.context.get("user_role", "user")
    base_prompt = "你是一个有帮助的助手。"

    if user_role == "expert":
        return f"{base_prompt} 提供详细的技术响应。"
    elif user_role == "beginner":
        return f"{base_prompt} 简单解释概念，避免使用行话。"

    return base_prompt

agent = create_agent(
    model="openai:gpt-4o",
    tools=[web_search],
    middleware=[user_role_prompt],
    context_schema=Context
)

# 系统提示将根据上下文动态设置
result = agent.invoke(
    {"messages": [{"role": "user", "content": "解释机器学习"}]},
    context={"user_role": "expert"}
)
```
