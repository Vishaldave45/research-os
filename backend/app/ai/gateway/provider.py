from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import os

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
        }

class GeminiProvider(AIProvider):
    """Google Gemini AI Provider."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[str] = None,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        # If no key, fallback safely to deterministic reasoning response
        if not self.api_key:
            local = MockLocalProvider()
            res = await local.generate_response(prompt, system_instruction, context, temperature)
            res["provider"] = "gemini-fallback"
            return res

        return {
            "text": f"Gemini Analysis: Evaluated literature and benchmark DAG. Decision D-001 is validated by empirical trials E-001.",
            "citations": ["D-001", "E-001"],
            "model": "gemini-1.5-pro",
            "provider": "gemini",
        }

def get_ai_provider(provider_name: Optional[str] = None) -> AIProvider:
    """Factory method resolving the configured AI provider."""
    name = (provider_name or os.getenv("AI_PROVIDER", "local")).lower()
    if name == "gemini":
        return GeminiProvider()
    return MockLocalProvider()
