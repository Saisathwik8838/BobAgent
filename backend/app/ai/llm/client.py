"""Provider-agnostic LLM client supporting Ollama and OpenAI with structured JSON outputs."""

import json
import re
from typing import TypeVar

import httpx
import structlog
from pydantic import BaseModel

from app.core.config import settings

logger = structlog.get_logger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMClient:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.ollama_base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.ollama_model = settings.OLLAMA_MODEL
        self.openai_base_url = (
            settings.OPENAI_BASE_URL.rstrip("/")
            if settings.OPENAI_BASE_URL
            else "https://api.openai.com/v1"
        )
        self.openai_api_key = settings.OPENAI_API_KEY
        self.openai_model = settings.DEFAULT_MODEL

    async def chat(
        self,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
        json_mode: bool = False,
        temperature: float = 0.2,
    ) -> str:
        """Issue async chat completion to configured provider."""
        all_messages = []
        if system_prompt:
            all_messages.append({"role": "system", "content": system_prompt})
        all_messages.extend(messages)

        if self.provider == "ollama":
            return await self._call_ollama(all_messages, json_mode=json_mode, temperature=temperature)
        elif self.provider == "openai" and self.openai_api_key:
            return await self._call_openai(all_messages, json_mode=json_mode, temperature=temperature)
        else:
            # Fallback to Ollama if configured or available
            return await self._call_ollama(all_messages, json_mode=json_mode, temperature=temperature)

    async def chat_structured(
        self,
        schema: type[T],
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
    ) -> T:
        """Call LLM with instructions to return valid JSON conforming to the Pydantic schema."""
        schema_json = json.dumps(schema.model_json_schema(), indent=2)
        instruction = (
            f"\nYou must respond with pure JSON only matching this schema:\n{schema_json}\n"
            "Do not include markdown codeblocks (no ```json). Return ONLY valid JSON."
        )

        effective_system = (system_prompt or "") + instruction
        raw_text = await self.chat(
            messages=messages,
            system_prompt=effective_system,
            json_mode=True,
            temperature=0.1,
        )

        # Clean potential markdown or extra tokens
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        cleaned = cleaned.removesuffix("```")
        cleaned = cleaned.strip()

        try:
            parsed = json.loads(cleaned)
            return schema.model_validate(parsed)
        except Exception as e:
            logger.warning("Failed to parse LLM structured output, attempting json extraction regex", raw=raw_text, error=str(e))
            # Try finding first { and last }
            match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
            if match:
                parsed = json.loads(match.group(1))
                return schema.model_validate(parsed)
            raise ValueError(f"Could not parse valid {schema.__name__} from LLM response: {raw_text}") from e

    async def _call_ollama(
        self, messages: list[dict[str, str]], json_mode: bool, temperature: float
    ) -> str:
        url = f"{self.ollama_base_url}/api/chat"
        payload = {
            "model": self.ollama_model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if json_mode:
            payload["format"] = "json"

        async with httpx.AsyncClient(timeout=120.0) as client:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()
            return data["message"]["content"]

    async def _call_openai(
        self, messages: list[dict[str, str]], json_mode: bool, temperature: float
    ) -> str:
        url = f"{self.openai_base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.openai_model,
            "messages": messages,
            "temperature": temperature,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"]


llm_client = LLMClient()
