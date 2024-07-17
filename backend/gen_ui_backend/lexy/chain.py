from typing import List, Optional, TypedDict

from langchain.output_parsers.openai_tools import JsonOutputToolsParser
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from langgraph.graph.graph import CompiledGraph

from gen_ui_backend.tools.github import github_repo
from gen_ui_backend.tools.invoice import invoice_parser
from gen_ui_backend.tools.weather import weather_data


class GenerativeUIState(TypedDict, total=False):
    input: HumanMessage
    files: Optional[List[dict]]
    result: Optional[str]
    # """Plain text response if no tool was used."""
    # tool_calls: Optional[List[dict]]
    # """A list of parsed tool calls."""
    # tool_result: Optional[dict]
    # """The result of a tool call."""


def invoke_model(state: GenerativeUIState, config: RunnableConfig) -> GenerativeUIState:
    tools_parser = JsonOutputToolsParser()
    initial_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a helpful assistant. You're provided an input from the user.\n"
                + "Your job is to determine whether or not you have to create a file and respond with text or just respond with plain text. If you need more information to create a file, ask for it. To create a file, respond with a JSON object containing the file name, extension, and content.",
            ),
            MessagesPlaceholder("input"),
        ]
    )
    model = ChatOpenAI(model="gpt-4o", temperature=0, streaming=True)
    # tools = [github_repo, invoice_parser, weather_data]
    # model_with_tools = model.bind_tools(tools)
    chain = initial_prompt | model #_with_tools
    result = chain.invoke({"input": state["input"]}, config)

    if not isinstance(result, AIMessage):
        raise ValueError("Invalid result from model. Expected AIMessage.")
    return {"result": str(result.content)}
    

# Desired JSON output:
# {
#     "message": "",
#     "files": [
#         {
#             "name": "file1",
#             "extension": "txt",
#             "content": "content1"
#         }
#      ]
# }

# def parse_file_or_return(state: GenerativeUIState) -> str:
#     if "result" in state and isinstance(state["result"], str):
#         return END
#     elif "tool_calls" in state and isinstance(state["tool_calls"], list):
#         return "invoke_tools"
#     else:
#         raise ValueError("Invalid state. No result or tool calls found.")


# def invoke_tools(state: GenerativeUIState) -> GenerativeUIState:
#     tools_map = {
#         "github-repo": github_repo,
#         "invoice-parser": invoice_parser,
#         "weather-data": weather_data,
#     }

#     if state["tool_calls"] is not None:
#         tool = state["tool_calls"][0]
#         selected_tool = tools_map[tool["type"]]
#         print(tool)
#         return {"tool_result": selected_tool.invoke(tool["args"])}
#     else:
#         raise ValueError("No tool calls found in state.")


def create_graph() -> CompiledGraph:
    workflow = StateGraph(GenerativeUIState)

    workflow.add_node("invoke_model", invoke_model)  # type: ignore
    # workflow.add_node("invoke_tools", invoke_tools)
    # workflow.add_conditional_edges("invoke_model", invoke_tools_or_return)
    workflow.set_entry_point("invoke_model")
    workflow.set_finish_point("invoke_model")

    graph = workflow.compile()
    return graph
