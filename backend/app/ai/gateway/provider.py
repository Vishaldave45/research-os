from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import os
import httpx
import json

class AIProvider(ABC):
    """Abstract Base Class for LLM providers in ResearchOS."""
    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[str] = None,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        """Generate response from AI provider."""
        pass

class MockLocalProvider(AIProvider):
    """Deterministic local AI provider for testing and offline environments."""
    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[str] = None,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        return {
            "text": f"Grounded Synthesis: Based on active research context, the empirical evidence [R-001] strongly supports the hypothesis [H-001] for low-power edge neural compression.",
            "citations": ["R-001", "H-001", "P-001"],
            "model": "local-deterministic-mock",
            "provider": "local",
            "usage": {"prompt_tokens": 128, "completion_tokens": 42},
        }

class GeminiProvider(AIProvider):
    """Google Gemini AI Provider with live Google Generative Language API integration."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[str] = None,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        # If API key is not set, gracefully fallback to deterministic reasoning provider
        if not self.api_key:
            local = MockLocalProvider()
            res = await local.generate_response(prompt, system_instruction, context, temperature)
            res["provider"] = "gemini-fallback"
            return res

        # Real Live Gemini 1.5 Pro REST API Call using httpx
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={self.api_key}"
        
        full_prompt = f"System Context:\n{system_instruction or ''}\n\nGrounding Context:\n{context or ''}\n\nResearcher Prompt:\n{prompt}"
        
        payload = {
            "contents": [
                {
                    "parts": [{"text": full_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 2048,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_out = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        import re
                        citations = list(set(re.findall(r'\[([A-Z]+-\d+)\]', text_out)))
                        return {
                            "text": text_out,
                            "citations": citations,
                            "model": "gemini-1.5-pro",
                            "provider": "gemini",
                            "usage": data.get("usageMetadata", {}),
                        }
        except Exception:
            pass

        # Fallback if network issue or upstream rate limit
        local = MockLocalProvider()
        res = await local.generate_response(prompt, system_instruction, context, temperature)
        res["provider"] = "gemini-fallback"
        return res

def get_ai_provider(provider_name: Optional[str] = None) -> AIProvider:
    """Factory method resolving the configured AI provider."""
    name = (provider_name or os.getenv("AI_PROVIDER", "local")).lower()
    if name == "gemini":
        return GeminiProvider()
    return MockLocalProvider()
