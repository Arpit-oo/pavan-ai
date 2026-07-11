import json
from typing import Dict, Any, List, Optional
from datetime import datetime


class AgentResult:
    def __init__(self, agent_name, data, reasoning="", confidence=0.0):
        # type: (str, Dict[str, Any], str, float) -> None
        self.agent_name = agent_name
        self.data = data
        self.reasoning = reasoning
        self.confidence = confidence
        self.timestamp = datetime.now().isoformat()

    def to_dict(self):
        # type: () -> Dict[str, Any]
        return {
            "agent": self.agent_name,
            "data": self.data,
            "reasoning": self.reasoning,
            "confidence": self.confidence,
            "timestamp": self.timestamp,
        }


class BaseAgent:
    """Base for all VayuBudhi agents. Each agent has a name, system prompt, and tools."""

    name = "base"
    description = "Base agent"
    system_prompt = ""

    async def run(self, query, context=None):
        # type: (str, Optional[Dict]) -> AgentResult
        raise NotImplementedError

    def _build_context_str(self, context):
        # type: (Optional[Dict]) -> str
        if not context:
            return ""
        return "\n\nCurrent context:\n" + json.dumps(context, indent=2, default=str)
