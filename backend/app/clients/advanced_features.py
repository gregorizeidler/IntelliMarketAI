"""
Advanced Features - Funcionalidades avançadas de análise
Sem alterar o fluxo principal
"""
import json
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from ..core.config import settings

aclient = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


# 1. Análise de Sentiment por Aspecto
async def analyze_sentiment_by_aspect(business_type: str, reviews: List[str]) -> Dict[str, Any]:
    """Analisa reviews separando por aspectos (atendimento, produto, preço, etc)"""
    prompt = f"""
Você é um analista especializado em feedback de clientes. Analise os reviews abaixo e classifique por aspectos.

**Tipo de negócio:** {business_type}

**Reviews:**
{chr(10).join([f'- {r}' for r in reviews[:50]])}

**Tarefa:** Extraia e analise os seguintes aspectos:
1. Atendimento/Serviço
2. Qualidade do Produto
3. Preço/Custo-benefício
4. Ambiente/Limpeza
5. Localização/Acesso
6. Tempo de espera/Agilidade

Para cada aspecto, retorne:
- score (0-10)
- total_mentions (quantas vezes foi mencionado)
- positive_points (lista de pontos positivos)
- negative_points (lista de pontos negativos)

Retorne em JSON com esta estrutura:
{{
  "atendimento": {{"score": 8.5, "total_mentions": 45, "positive_points": [...], "negative_points": [...]}},
  "produto": {{...}},
  "preco": {{...}},
  "ambiente": {{...}},
  "localizacao": {{...}},
  "agilidade": {{...}}
}}
"""
    
    resp = await aclient.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Você é um analista de feedback especializado."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return json.loads(resp.choices[0].message.content)


# 2. Geração de Persona de Cliente Ideal
async def generate_customer_persona(business_type: str, all_reviews: List[str], competitor_names: List[str]) -> Dict[str, Any]:
    """Gera persona detalhada do cliente ideal baseada nos reviews"""
    prompt = f"""
Você é um especialista em marketing e personas de cliente.

**Contexto:** Analisando {len(competitor_names)} concorrentes de {business_type}.

**Reviews coletados:** {len(all_reviews)} avaliações de clientes reais.

**Sample de reviews:**
{chr(10).join([f'- {r}' for r in all_reviews[:100]])}

**Tarefa:** Crie uma persona detalhada do cliente típico deste mercado.

Retorne em JSON:
{{
  "nome_persona": "Nome representativo",
  "demografia": {{
    "faixa_etaria": "ex: 25-40 anos",
    "genero_predominante": "ex: Misto",
    "nivel_renda": "ex: Média-alta",
    "ocupacao": "ex: Profissionais liberais, empresários"
  }},
  "comportamento": {{
    "frequencia_visita": "ex: 2-3x por semana",
    "horario_preferido": "ex: Manhã e almoço",
    "ticket_medio_estimado": "ex: R$ 30-50",
    "forma_pagamento": "ex: Cartão, PIX"
  }},
  "valores_prioridades": [
    "Lista de 5 valores que mais importam para este cliente"
  ],
  "dores_problemas": [
    "Lista de 5 principais dores/problemas mencionados"
  ],
  "desejos_expectativas": [
    "Lista de 5 principais desejos/expectativas"
  ]}},
  "citacoes_representativas": [
    "3 citações reais dos reviews que representam bem esta persona"
  ],
  "como_conquistar": "Parágrafo explicando como conquistar esta persona"
}}
"""
    
    resp = await aclient.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Você é um especialista em criação de personas."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return json.loads(resp.choices[0].message.content)


# 3. Análise Temporal de Reviews
async def analyze_review_trends(reviews_with_dates: List[Dict[str, Any]], business_type: str) -> Dict[str, Any]:
    """Analisa tendências ao longo do tempo"""
    # Agrupa reviews por período
    prompt = f"""
Você é um analista de tendências de mercado.

**Contexto:** Análise temporal de reviews de {business_type}.

**Reviews com datas:**
{json.dumps(reviews_with_dates[:100], indent=2, ensure_ascii=False)}

**Tarefa:** Identifique tendências ao longo do tempo.

Retorne em JSON:
{{
  "sentimento_geral": {{
    "tendencia": "Melhorando|Estável|Piorando",
    "variacao_percentual": "ex: +15% nos últimos 6 meses"
  }},
  "problemas_emergentes": [
    "Lista de problemas que começaram a aparecer recentemente"
  ],
  "melhorias_percebidas": [
    "Lista de melhorias que clientes notaram"
  ],
  "sazonalidade": {{
    "periodos_alta": ["ex: Fins de semana", "Férias"],
    "periodos_baixa": ["ex: Quartas-feiras", "Janeiro"]
  }},
  "competidores_crescendo": [
    "Nomes de concorrentes com momentum positivo"
  ],
  "competidores_declinando": [
    "Nomes de concorrentes com momentum negativo"
  ],
  "recomendacao_timing": "Melhor momento para entrar no mercado"
}}
"""
    
    resp = await aclient.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Você é um analista de tendências."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return json.loads(resp.choices[0].message.content)


# 4. Recomendação de Localização Ideal
async def recommend_ideal_location(comparison_data: List[Dict[str, Any]], business_type: str) -> Dict[str, Any]:
    """Analisa múltiplas áreas e recomenda a melhor localização"""
    prompt = f"""
Você é um consultor especializado em localização de negócios.

**Contexto:** Cliente quer abrir {business_type}.

**Dados de {len(comparison_data)} áreas analisadas:**
{json.dumps(comparison_data, indent=2, ensure_ascii=False)}

**Tarefa:** Recomende a melhor localização considerando:
- Nível de concorrência
- Sentimento dos clientes
- Oportunidades identificadas
- Saturação de mercado

Retorne em JSON:
{{
  "area_recomendada": {{
    "nome": "Nome da área",
    "motivos": ["Lista de 5 motivos principais"],
    "score_atratividade": 8.5
  }},
  "ranking_areas": [
    {{"nome": "Área X", "score": 8.5, "pros": [...], "contras": [...]}},
    ...
  ],
  "fatores_decisivos": [
    "Principais fatores que levaram a esta recomendação"
  ],
  "estrategia_entrada": "Como entrar nesta área com sucesso",
  "investimento_estimado": "Estimativa qualitativa (Baixo/Médio/Alto)",
  "tempo_roi_estimado": "Tempo estimado para retorno (ex: 12-18 meses)"
}}
"""
    
    resp = await aclient.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.3,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Você é um consultor de localização de negócios."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return json.loads(resp.choices[0].message.content)


# 5. Estimativa de Ticket Médio
async def estimate_average_ticket(reviews: List[str], business_type: str) -> Dict[str, Any]:
    """Extrai menções de preços e estima ticket médio"""
    prompt = f"""
Você é um analista financeiro especializado em varejo.

**Tipo de negócio:** {business_type}

**Reviews:**
{chr(10).join([f'- {r}' for r in reviews[:100]])}

**Tarefa:** Extraia todas as menções de preços e estime o ticket médio.

Retorne em JSON:
{{
  "ticket_medio_estimado": "R$ 35-45",
  "faixa_precos": {{
    "minimo": 20,
    "maximo": 80,
    "mais_comum": "35-50"
  }},
  "produtos_mencionados": [
    {{"item": "Café", "preco_medio": "R$ 8-12"}},
    {{"item": "Almoço", "preco_medio": "R$ 25-35"}}
  ],
  "percepcao_preco": {{
    "considerado_caro": "65%",
    "considerado_justo": "30%",
    "considerado_barato": "5%"
  }},
  "sensibilidade_preco": "Alta|Média|Baixa",
  "citacoes_sobre_preco": [
    "3 citações reais mencionando preços"
  ],
  "estrategia_precificacao": "Recomendação de como precificar"
}}
"""
    
    resp = await aclient.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Você é um analista financeiro."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return json.loads(resp.choices[0].message.content)


# 6. Análise de Horários de Pico
async def analyze_peak_hours(reviews: List[str], popular_times_data: Optional[Dict] = None) -> Dict[str, Any]:
    """Analisa menções de horários e movimento"""
    prompt = f"""
Você é um analista de operações e fluxo de clientes.

**Reviews:**
{chr(10).join([f'- {r}' for r in reviews[:100]])}

**Dados de Popular Times (se disponível):**
{json.dumps(popular_times_data, indent=2) if popular_times_data else "Não disponível"}

**Tarefa:** Identifique padrões de movimento e horários de pico.

Retorne em JSON:
{{
  "horarios_pico": [
    {{"periodo": "Manhã (7-10h)", "movimento": "Alto", "mencoes": 45}},
    {{"periodo": "Almoço (12-14h)", "movimento": "Muito Alto", "mencoes": 78}},
    ...
  ],
  "dias_semana": {{
    "mais_movimentados": ["Sexta", "Sábado"],
    "menos_movimentados": ["Segunda", "Terça"]
  }},
  "tempo_espera": {{
    "medio": "10-15 minutos",
    "pico": "20-30 minutos",
    "fora_pico": "5 minutos"
  }},
  "reclamacoes_espera": {{
    "total": 34,
    "percentual": "15%",
    "citacoes": ["3 citações sobre espera"]
  }},
  "oportunidades_horario": [
    "Sugestões de horários para capturar demanda não atendida"
  ],
  "recomendacao_operacao": "Como operar considerando estes padrões"
}}
"""
    
    resp = await aclient.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Você é um analista de operações."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return json.loads(resp.choices[0].message.content)


# 7. Análise de Fotos com GPT-4 Vision
async def analyze_competitor_photos(image_urls: List[str], business_type: str) -> Dict[str, Any]:
    """Analisa fotos dos concorrentes com GPT-4 Vision"""
    messages = [
        {
            "role": "system",
            "content": "Você é um designer e consultor de negócios especializado em análise visual."
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"""
Analise as fotos destes estabelecimentos de {business_type} e extraia insights visuais.

Identifique:
1. Estilo de decoração predominante
2. Esquema de cores
3. Tamanho aparente do espaço
4. Nível de movimento/ocupação
5. Estado de conservação
6. Diferenciais visuais
7. Pontos fortes do design
8. Pontos fracos do design

Retorne em JSON com análise detalhada.
"""
                },
                *[{"type": "image_url", "image_url": {"url": url}} for url in image_urls[:5]]
            ]
        }
    ]
    
    resp = await aclient.chat.completions.create(
        model="gpt-4o",  # Suporta visão
        max_tokens=2000,
        messages=messages
    )
    
    try:
        return json.loads(resp.choices[0].message.content)
    except:
        return {"raw_analysis": resp.choices[0].message.content}


# 8. Geração de Mockup/Conceito Visual
async def generate_visual_concept(
    business_type: str,
    market_analysis: Dict[str, Any],
    persona: Dict[str, Any],
    best_practices: List[str]
) -> Dict[str, Any]:
    """Gera descrição detalhada para criar mockup com DALL-E"""
    prompt = f"""
Você é um designer conceitual especializado em estabelecimentos comerciais.

**Tipo de negócio:** {business_type}

**Análise de mercado:**
{json.dumps(market_analysis, indent=2, ensure_ascii=False)}

**Persona do cliente:**
{json.dumps(persona, indent=2, ensure_ascii=False)}

**Melhores práticas identificadas:**
{chr(10).join([f'- {bp}' for bp in best_practices])}

**Tarefa:** Crie um conceito visual detalhado que:
1. Incorpore os melhores elementos dos concorrentes bem-avaliados
2. Atenda as necessidades da persona
3. Preencha as lacunas identificadas no mercado
4. Seja visualmente distinto e memorável

Retorne em JSON:
{{
  "conceito_principal": "Descrição em 2-3 frases",
  "elementos_visuais": {{
    "esquema_cores": "Paleta de cores sugerida",
    "estilo_design": "ex: Minimalista, Industrial, Acolhedor",
    "materiais": ["Lista de materiais sugeridos"],
    "iluminacao": "Tipo de iluminação"
  }},
  "layout": {{
    "area_total_estimada": "ex: 80-120m²",
    "distribuicao": "Como distribuir os espaços",
    "capacidade": "Número de clientes"
  }},
  "diferenciais": [
    "Lista de elementos únicos que vão destacar o negócio"
  ],
  "prompt_dalle": "Prompt detalhado para gerar imagem com DALL-E 3"
}}
"""
    
    resp = await aclient.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.7,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Você é um designer conceitual."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return json.loads(resp.choices[0].message.content)


# 9. Gerar imagem com DALL-E 3
async def generate_mockup_image(prompt: str) -> Dict[str, Any]:
    """Gera imagem do conceito visual com DALL-E 3"""
    try:
        response = await aclient.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        return {
            "success": True,
            "image_url": response.data[0].url,
            "revised_prompt": response.data[0].revised_prompt
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

