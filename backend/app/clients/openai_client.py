import json
from typing import List, Dict, Any
from openai import OpenAI, AsyncOpenAI
from ..core.config import settings

oclient = OpenAI(api_key=settings.OPENAI_API_KEY)
aclient = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

ANALYSIS_SYSTEM_PROMPT = (
    "Você é um Analista de Inteligência de Mercado altamente qualificado, "
    "especializado em identificar oportunidades de negócio a partir de feedback de clientes."
)

AGGREGATE_SYSTEM_PROMPT = (
    "Você é um Consultor de Estratégia de Negócios. Gere recomendações estratégicas claras."
)

def _build_competitor_prompt(business_type: str, reviews: List[str]) -> str:
    joined = "\n---\n".join(reviews) if reviews else "sem reviews"
    return f"""
**Contexto:** Você é um Analista de Inteligência de Mercado altamente qualificado, especializado em identificar oportunidades de negócio a partir de feedback de clientes.

**Tarefa:** Analise a lista de reviews de um estabelecimento concorrente e extraia insights estratégicos. O estabelecimento é um(a) {business_type}.

**Reviews:**
"{joined}"

**Sua Resposta:** Forneça sua análise EXCLUSIVAMENTE em formato JSON, seguindo estritamente o schema abaixo. Não inclua texto ou explicações fora do JSON.

**Schema JSON de Saída:**
{{
  "overall_sentiment_score": "Um número de 0.0 a 10.0 representando a percepção geral do público sobre este concorrente.",
  "strengths": [
    "Uma lista de 3 a 5 pontos fortes principais, mencionados recorrentemente."
  ],
  "weaknesses": [
    "Uma lista de 3 a 5 pontos fracos e reclamações recorrentes."
  ],
  "actionable_opportunities": [
    "Uma lista de 2 a 3 oportunidades de mercado claras."
  ],
  "executive_summary": "Um parágrafo curto resumindo a posição competitiva."
}}
""".strip()

async def analyze_competitor_async(business_type: str, reviews: List[str]) -> Dict[str, Any]:
    resp = await aclient.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=settings.OPENAI_TEMPERATURE,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": _build_competitor_prompt(business_type, reviews)}
        ],
    )
    content = resp.choices[0].message.content
    try:
        return json.loads(content)
    except Exception:
        start = content.find("{")
        end = content.rfind("}")
        if start >= 0 and end > start:
            return json.loads(content[start:end+1])
        raise

def _build_aggregate_prompt(business_type: str, consolidated: List[Dict[str, Any]]) -> str:
    lines = []
    for d in consolidated:
        name = d.get("name", "Concorrente")
        strengths = "; ".join(d.get("strengths", [])[:4])
        weaknesses = "; ".join(d.get("weaknesses", [])[:4])
        lines.append(f"- {name} | Forças: {strengths} | Fraquezas: {weaknesses}")
    block = "\n".join(lines)
    return f"""
**Contexto:** Você é um Consultor de Estratégia de Negócios. Você acaba de receber relatórios de análise de {len(consolidated)} concorrentes de {business_type} em uma mesma região.

**Dados Consolidados:**
"{block}"

**Tarefa Final:** Com base nestes dados agregados, gere um relatório estratégico final para um empreendedor que deseja abrir um novo {business_type} na área.

**Schema JSON de Saída:**
{{
  "market_saturation_level": "'Baixa', 'Média' ou 'Alta'.",
  "market_strengths_summary": [
    "Top 3 pontos fortes do mercado atual."
  ],
  "market_weaknesses_gaps": [
    "Top 3 lacunas recorrentes em todo o mercado."
  ],
  "strategic_recommendation": "Um parágrafo final com recomendação estratégica clara."
}}
""".strip()

async def aggregate_report_async(business_type: str, consolidated: List[Dict[str, Any]]) -> Dict[str, Any]:
    resp = await aclient.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": AGGREGATE_SYSTEM_PROMPT},
            {"role": "user", "content": _build_aggregate_prompt(business_type, consolidated)}
        ],
    )
    content = resp.choices[0].message.content
    return json.loads(content)
