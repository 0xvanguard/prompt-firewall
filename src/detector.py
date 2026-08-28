"""
Prompt Injection Firewall - Motor de Detección
Detecta y bloquea intentos de inyección de prompts en LLMs
"""

import re
from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum


class ThreatLevel(Enum):
    SAFE = "safe"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class DetectionResult:
    is_safe: bool
    threat_level: ThreatLevel
    score: float  # 0-100
    patterns_found: List[str]
    recommendation: str
    sanitized_prompt: str


class PromptInjectionDetector:
    """Detector de inyección de prompts con múltiples capas de análisis"""
    
    # Patrones conocidos de inyección
    INJECTION_PATTERNS = {
        # Patrones de rol/play acting
        "role_hijack": [
            r"ignore\s+(all\s+)?previous\s+instructions",
            r"disregard\s+(all\s+)?prior",
            r"forget\s+(everything|all|previous)",
            r"new\s+instructions?:",
            r"system\s*:\s*you\s+are",
            r"act\s+as\s+if\s+you\s+(are|have)\s+no",
            r"pretend\s+(you\s+are|to\s+be)\s+",
            r"you\s+are\s+now\s+",
            r"from\s+now\s+on\s+you\s+(will|must|should)",
        ],
        
        # Patrones de extracción de información
        "extraction": [
            r"show\s+me\s+(your|the)\s+(system\s+)?prompt",
            r"what\s+(is|are)\s+your\s+(instructions?|rules?|guidelines?)",
            r"reveal\s+(your|the)\s+(system|initial)\s+",
            r"output\s+(your|the)\s+(full|complete|original)\s+",
            r"print\s+(your|the)\s+(system|initial)\s+prompt",
            r"repeat\s+(everything|all|the)\s+(above|before|from)",
            r"what\s+were\s+you\s+(told|instructed|programmed)",
        ],
        
        # Patrones de bypass de restricciones
        "bypass": [
            r"in\s+(a\s+)?hypothetical\s+(scenario|world|situation)",
            r"for\s+(educational|research|testing)\s+purposes",
            r"this\s+is\s+(just\s+)?(a\s+)?(test|simulation|exercise)",
            r"roleplay\s+as\s+",
            r"let's\s+play\s+a\s+game",
            r"imagine\s+(you\s+have\s+)?no\s+restrictions",
            r"what\s+if\s+(you|we|I)\s+(had|have)\s+no\s+(rules|limits|restrictions)",
        ],
        
        # Patrones de inyección de código/instrucciones
        "code_injection": [
            r"```.*system.*prompt.*```",
            r"<\|.*system.*\|>",
            r"\[INST\]|\[/INST\]",
            r"<\|im_start\|>|<\|im_end\|>",
            r"Human:|Assistant:|System:",
            r"<<SYS>>|<</SYS>>",
        ],
        
        # Patrones de manipulación emocional
        "emotional": [
            r"please\s+(help|do\s+this)\s+it's\s+(urgent|important|life\s+or\s+death)",
            r"my\s+(grandmother|mom|dad|friend)\s+(used\s+to|always)\s+(tell|say|read)",
            r"i'll\s+(pay|give\s+you|tip\s+you)",
            r"you\s+will\s+(be\s+fired|get\s+trouble|lose\s+your\s+job)",
            r"i\s+(am|'m)\s+(the\s+)?(admin|developer|owner|creator)",
        ],
        
        # Patrones de encoding/obfuscation
        "obfuscation": [
            r"base64[\s:=]",
            r"rot13[\s:=]",
            r"hex[\s:=]",
            r"binary[\s:=]",
            r"caesar[\s:=]",
            r"leetspeak|l33t",
            r"reverse[\s:]",
        ],
        
        # Patrones de context window manipulation
        "context_manipulation": [
            r"end\s+of\s+(prompt|instructions|context)",
            r"---+\s*",
            r"===+\s*",
            r"#+\s*new\s+(section|context|instructions?)",
            r"\[BEGIN\s+NEW\s+CONTEXT\]",
            r"<--\s*END\s*-->",
        ],
    }
    
    # Palabras clave de alto riesgo
    HIGH_RISK_KEYWORDS = [
        "override", "bypass", "jailbreak", "unlock",
        "unrestricted", "unfiltered", "uncensored",
        "developer mode", "god mode", "admin mode",
        "sudo", "root", "elevate", "escalate",
    ]
    
    def __init__(self):
        self.compiled_patterns = {}
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Pre-compila todos los patrones para mayor rendimiento"""
        for category, patterns in self.INJECTION_PATTERNS.items():
            self.compiled_patterns[category] = [
                re.compile(pattern, re.IGNORECASE) for pattern in patterns
            ]
    
    def detect(self, prompt: str) -> DetectionResult:
        """
        Analiza un prompt y retorna el resultado de detección
        
        Args:
            prompt: El prompt a analizar
            
        Returns:
            DetectionResult con el análisis completo
        """
        if not prompt or not prompt.strip():
            return DetectionResult(
                is_safe=True,
                threat_level=ThreatLevel.SAFE,
                score=0,
                patterns_found=[],
                recommendation="Prompt vacío o nulo",
                sanitized_prompt=prompt
            )
        
        patterns_found = []
        category_scores = {}
        
        # Analizar cada categoría de patrones
        for category, compiled_list in self.compiled_patterns.items():
            category_matches = []
            for pattern in compiled_list:
                if pattern.search(prompt):
                    category_matches.append(pattern.pattern)
            
            if category_matches:
                patterns_found.extend(category_matches)
                category_scores[category] = len(category_matches)
        
        # Verificar palabras clave de alto riesgo
        prompt_lower = prompt.lower()
        high_risk_found = [kw for kw in self.HIGH_RISK_KEYWORDS if kw in prompt_lower]
        if high_risk_found:
            patterns_found.extend(high_risk_found)
            category_scores["high_risk_keywords"] = len(high_risk_found)
        
        # Calcular score final (0-100)
        score = self._calculate_score(category_scores, len(patterns_found), len(prompt))
        
        # Determinar nivel de amenaza
        threat_level = self._get_threat_level(score)
        
        # Generar recomendación
        recommendation = self._get_recommendation(threat_level, patterns_found)
        
        # Sanitizar prompt si es necesario
        sanitized = self._sanitize_prompt(prompt) if threat_level.value in ["medium", "high", "critical"] else prompt
        
        return DetectionResult(
            is_safe=threat_level == ThreatLevel.SAFE,
            threat_level=threat_level,
            score=score,
            patterns_found=patterns_found,
            recommendation=recommendation,
            sanitized_prompt=sanitized
        )
    
    def _calculate_score(self, category_scores: Dict, pattern_count: int, prompt_length: int) -> float:
        """Calcula el score de riesgo basado en múltiples factores"""
        score = 0
        
        # Peso por categoría
        weights = {
            "role_hijack": 25,
            "extraction": 20,
            "bypass": 15,
            "code_injection": 30,
            "emotional": 10,
            "obfuscation": 25,
            "context_manipulation": 20,
            "high_risk_keywords": 15,
        }
        
        for category, count in category_scores.items():
            weight = weights.get(category, 10)
            score += min(count * weight, 40)  # Máximo 40 por categoría
        
        # Bonus por múltiples categorías
        if len(category_scores) > 1:
            score += len(category_scores) * 5
        
        # Bonus por muchos patrones
        if pattern_count > 3:
            score += pattern_count * 2
        
        return min(score, 100)
    
    def _get_threat_level(self, score: float) -> ThreatLevel:
        """Convierte score a nivel de amenaza"""
        if score == 0:
            return ThreatLevel.SAFE
        elif score < 25:
            return ThreatLevel.LOW
        elif score < 50:
            return ThreatLevel.MEDIUM
        elif score < 75:
            return ThreatLevel.HIGH
        else:
            return ThreatLevel.CRITICAL
    
    def _get_recommendation(self, threat_level: ThreatLevel, patterns: List[str]) -> str:
        """Genera recomendación basada en el nivel de amenaza"""
        recommendations = {
            ThreatLevel.SAFE: "✅ Prompt seguro. Proceder con el LLM.",
            ThreatLevel.LOW: "⚠️ Posible inyección menor. Proceder con caution.",
            ThreatLevel.MEDIUM: "🔶 Patrones sospechosos detectados. Revisar antes de enviar.",
            ThreatLevel.HIGH: "🔴 Inyección probable. Bloquear o sanitizar.",
            ThreatLevel.CRITICAL: "🚨 Inyección confirmada. Bloquear inmediatamente.",
        }
        return recommendations.get(threat_level, "Análisis requerido.")
    
    def _sanitize_prompt(self, prompt: str) -> str:
        """Limpia el prompt de patrones peligrosos"""
        sanitized = prompt
        
        # Remover instructiones sospechosas al inicio
        suspicious_starts = [
            r"^(ignore|disregard|forget).*?(\.|:|\n)",
            r"^(system|assistant|human)\s*:\s*",
            r"^<\|.*?\|>",
        ]
        
        for pattern in suspicious_starts:
            sanitized = re.sub(pattern, "", sanitized, flags=re.IGNORECASE)
        
        # Remover delimitadores de contexto
        sanitized = re.sub(r"---+", "", sanitized)
        sanitized = re.sub(r"===+", "", sanitized)
        sanitized = re.sub(r"\[BEGIN.*?\]", "", sanitized, flags=re.IGNORECASE)
        
        return sanitized.strip()
    
    def batch_detect(self, prompts: List[str]) -> List[DetectionResult]:
        """Analiza múltiples prompts"""
        return [self.detect(prompt) for prompt in prompts]
    
    def get_stats(self) -> Dict:
        """Retorna estadísticas del detector"""
        return {
            "total_patterns": sum(len(p) for p in self.INJECTION_PATTERNS.values()),
            "categories": list(self.INJECTION_PATTERNS.keys()),
            "high_risk_keywords": len(self.HIGH_RISK_KEYWORDS),
            "version": "1.0.0"
        }


# Instancia global del detector
detector = PromptInjectionDetector()


def analyze_prompt(prompt: str) -> DetectionResult:
    """Función de conveniencia para analizar un prompt"""
    return detector.detect(prompt)


def is_prompt_safe(prompt: str, threshold: float = 50.0) -> bool:
    """Retorna True si el prompt es seguro"""
    result = detector.detect(prompt)
    return result.score < threshold
