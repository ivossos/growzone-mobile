# 🤖 Chatbot IA - Plan de Implementação

**Data:** 21 de Outubro, 2025
**Objetivo:** Adicionar assistente de IA ao sistema de chat do Growzone

---

## 🎯 Visão Geral

Criar um chatbot assistente com IA que ajuda usuários com:
- ✅ Dúvidas sobre cultivo de plantas
- ✅ Recomendações personalizadas
- ✅ Suporte ao usuário
- ✅ Informações sobre a plataforma
- ✅ Análise de fotos de plantas (visão computacional)

---

## 🏗️ Arquitetura

```
┌─────────────────┐
│  Mobile App     │
│                 │
│  User sends     │
│  message to     │
│  @growbot       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  FastAPI Backend        │
│                         │
│  POST /chat/messages    │
│  - Detecta @growbot     │
│  - Chama AI Service     │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────┐
│  AI Service (Lambda)     │
│                          │
│  - Processa contexto     │
│  - Chama API da IA       │
│  - Retorna resposta      │
└────────┬─────────────────┘
         │
         ├─────► OpenAI API (GPT-4)
         ├─────► Anthropic API (Claude)
         └─────► Google Gemini API
                 (escolher um)
```

---

## 🔧 Opções de Providers

### Opção 1: OpenAI (GPT-4) ⭐ RECOMENDADO

**Prós:**
- ✅ Melhor qualidade de resposta
- ✅ API estável e documentada
- ✅ Suporte a visão (análise de fotos)
- ✅ Assistants API (contexto persistente)
- ✅ Fine-tuning disponível

**Contras:**
- ❌ Mais caro (~$0.01 por 1K tokens)
- ❌ Precisa moderação de conteúdo

**Custo estimado:**
- 1000 conversas/dia = ~$30-50/mês
- 10000 conversas/dia = ~$300-500/mês

**API:**
```python
import openai

openai.api_key = "sk-..."

response = openai.ChatCompletion.create(
    model="gpt-4-turbo-preview",
    messages=[
        {"role": "system", "content": "Você é GrowBot, assistente de cultivo..."},
        {"role": "user", "content": "Como cuido de tomates?"}
    ]
)
```

---

### Opção 2: Anthropic (Claude 3.5 Sonnet)

**Prós:**
- ✅ Ótima qualidade (similar ao GPT-4)
- ✅ Contexto maior (200K tokens)
- ✅ Menos alucinações
- ✅ Boa para instruções complexas

**Contras:**
- ❌ Sem visão ainda (apenas texto)
- ❌ API mais nova

**Custo:**
- Similar ao OpenAI (~$3-15 por milhão de tokens)

**API:**
```python
import anthropic

client = anthropic.Anthropic(api_key="sk-ant-...")

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Como cuido de tomates?"}
    ]
)
```

---

### Opção 3: Google Gemini

**Prós:**
- ✅ Mais barato
- ✅ Boa performance
- ✅ Free tier generoso

**Contras:**
- ❌ Qualidade inferior ao GPT-4/Claude
- ❌ API menos estável

**Custo:**
- Free: 60 req/min
- Pago: ~$0.0005 por 1K tokens (20x mais barato)

---

## 📋 Implementação - Fase 1: Backend

### Passo 1: Criar AI Service

```python
# backend/api/services/ai_chatbot.py

import openai
from typing import List, Dict
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """
Você é GrowBot, o assistente inteligente do Growzone - uma plataforma social
para cultivadores de plantas.

Sua missão:
- Ajudar usuários com dúvidas sobre cultivo (tomates, ervas, flores, etc)
- Dar recomendações personalizadas baseadas no clima/região
- Suportar usuários com problemas na plataforma
- Ser amigável, educado e preciso

Limitações:
- Não invente informações que não sabe
- Sugira consultar um agrônomo para problemas sérios
- Sempre em português brasileiro
- Respostas concisas (max 200 palavras)

Contexto do Growzone:
- Rede social para cultivadores
- Usuários compartilham fotos de plantas
- Sistema de posts, comentários, curtidas
- Chat direto entre usuários
"""

class GrowBot:
    def __init__(self):
        self.model = "gpt-4-turbo-preview"
        self.max_tokens = 500

    async def get_response(
        self,
        user_message: str,
        conversation_history: List[Dict] = None,
        user_context: Dict = None
    ) -> str:
        """
        Gera resposta do chatbot

        Args:
            user_message: Mensagem do usuário
            conversation_history: Histórico de mensagens (últimas 10)
            user_context: Info do usuário (nome, localização, plantas)

        Returns:
            Resposta do bot em texto
        """

        # Construir prompt com contexto do usuário
        system_prompt = SYSTEM_PROMPT
        if user_context:
            system_prompt += f"\n\nContexto do usuário:\n"
            if user_context.get("name"):
                system_prompt += f"- Nome: {user_context['name']}\n"
            if user_context.get("location"):
                system_prompt += f"- Localização: {user_context['location']}\n"
            if user_context.get("plants"):
                system_prompt += f"- Plantas do usuário: {', '.join(user_context['plants'])}\n"

        # Construir histórico de mensagens
        messages = [{"role": "system", "content": system_prompt}]

        if conversation_history:
            for msg in conversation_history[-10:]:  # Últimas 10 msgs
                role = "assistant" if msg["sender"] == "bot" else "user"
                messages.append({
                    "role": role,
                    "content": msg["content"]
                })

        # Adicionar mensagem atual
        messages.append({"role": "user", "content": user_message})

        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=0.7,
                user=user_context.get("user_id", "unknown")  # Para tracking
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"Error calling OpenAI: {e}")
            return "Desculpe, estou com problemas técnicos no momento. Tente novamente em instantes! 🌱"

    async def analyze_plant_image(self, image_url: str) -> str:
        """
        Analisa foto de planta usando GPT-4 Vision

        Args:
            image_url: URL da imagem

        Returns:
            Análise da planta
        """

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Analise esta planta e me diga: 1) Que planta é? 2) Estado de saúde 3) Problemas visíveis 4) Recomendações"
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": image_url}
                            }
                        ]
                    }
                ],
                max_tokens=500
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Error analyzing image: {e}")
            return "Não consegui analisar a imagem. Tente novamente!"
```

---

### Passo 2: Adicionar Endpoint no FastAPI

```python
# backend/api/routers/chat.py (adicionar)

from ..services.ai_chatbot import GrowBot

bot = GrowBot()

@router.post("/chat/bot/message")
async def send_bot_message(
    payload: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enviar mensagem para o chatbot

    Fluxo:
    1. Salva mensagem do usuário
    2. Chama IA para gerar resposta
    3. Salva resposta do bot
    4. Retorna ambas
    """

    # Salvar mensagem do usuário
    user_message = Message(
        conversation_id=payload.conversation_id,
        sender_id=current_user.id,
        recipient_id=BOT_USER_ID,  # ID especial para o bot
        content_type="text",
        text_content=payload.text_content
    )
    db.add(user_message)
    db.commit()

    # Buscar histórico da conversa
    history = db.query(Message).filter(
        Message.conversation_id == payload.conversation_id
    ).order_by(Message.created_at.desc()).limit(10).all()

    conversation_history = [
        {
            "sender": "bot" if msg.sender_id == BOT_USER_ID else "user",
            "content": msg.text_content
        }
        for msg in reversed(history)
    ]

    # Contexto do usuário
    user_context = {
        "user_id": str(current_user.id),
        "name": current_user.name,
        "location": getattr(current_user, "location", None),
        # TODO: buscar plantas do usuário
    }

    # Gerar resposta do bot
    bot_response_text = await bot.get_response(
        user_message=payload.text_content,
        conversation_history=conversation_history,
        user_context=user_context
    )

    # Salvar resposta do bot
    bot_message = Message(
        conversation_id=payload.conversation_id,
        sender_id=BOT_USER_ID,
        recipient_id=current_user.id,
        content_type="text",
        text_content=bot_response_text,
        sent_at=datetime.utcnow()
    )
    db.add(bot_message)
    db.commit()

    return {
        "user_message": MessageResponse.from_orm(user_message),
        "bot_response": MessageResponse.from_orm(bot_message)
    }


@router.post("/chat/bot/analyze-plant")
async def analyze_plant_image(
    image_url: str,
    current_user: User = Depends(get_current_user)
):
    """
    Analisa foto de planta com IA
    """

    analysis = await bot.analyze_plant_image(image_url)

    return {
        "analysis": analysis,
        "image_url": image_url
    }
```

---

### Passo 3: Criar Usuário Bot no Database

```sql
-- Criar usuário especial para o bot
INSERT INTO users (id, username, email, name, is_bot)
VALUES (
    99999,
    'growbot',
    'bot@growzone.co',
    'GrowBot 🤖',
    TRUE
);
```

---

## 📱 Implementação - Fase 2: Frontend

### Passo 1: Criar Botão "Falar com GrowBot"

```typescript
// src/components/chat/GrowBotButton.tsx

import { TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";

export function GrowBotButton() {
  const handlePress = () => {
    // Navegar para conversa com o bot
    router.push("/chat/99999"); // ID do bot
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-green-500 p-4 rounded-lg flex-row items-center"
    >
      <Text className="text-2xl mr-2">🤖</Text>
      <Text className="text-white font-bold">
        Falar com GrowBot
      </Text>
    </TouchableOpacity>
  );
}
```

---

### Passo 2: Modificar Chat Screen

```typescript
// src/app/(drawer)/chat/[id].tsx (modificar)

import { sendBotMessage } from "@/api/chat/chat-api";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const isBotChat = id === "99999"; // Verificar se é chat com bot

  const handleSendMessage = async (text: string) => {
    if (isBotChat) {
      // Enviar para endpoint do bot
      const result = await sendBotMessage({
        conversation_id: conversationId,
        text_content: text
      });

      // Adicionar mensagens à lista
      setMessages(prev => [
        ...prev,
        result.user_message,
        result.bot_response
      ]);
    } else {
      // Enviar mensagem normal
      await sendMessage({ ... });
    }
  };

  return (
    <View>
      {isBotChat && (
        <View className="bg-green-100 p-2">
          <Text>🤖 Conversando com GrowBot - Assistente IA</Text>
        </View>
      )}

      {/* ... resto do chat UI ... */}
    </View>
  );
}
```

---

### Passo 3: Adicionar API Client

```typescript
// src/api/chat/chat-api.ts (adicionar)

export async function sendBotMessage(payload: {
  conversation_id: string;
  text_content: string;
}): Promise<{ user_message: Message; bot_response: Message }> {
  const response = await socialApi.post("/chat/bot/message", payload);
  return response.data;
}

export async function analyzePlantImage(imageUrl: string): Promise<string> {
  const response = await socialApi.post("/chat/bot/analyze-plant", {
    image_url: imageUrl
  });
  return response.data.analysis;
}
```

---

## 🎨 Features Avançadas

### 1. Sugestões Rápidas

```typescript
// Botões de sugestão no chat com bot
const QUICK_SUGGESTIONS = [
  "Como cuidar de tomates? 🍅",
  "Minha planta está com folhas amarelas",
  "Quando devo regar minhas plantas?",
  "Analisar foto da minha planta 📸"
];
```

### 2. Análise de Imagem Inline

```typescript
// Adicionar botão para análise de imagem
<Button
  title="📸 Analisar Foto da Planta"
  onPress={async () => {
    const image = await pickImage();
    const analysis = await analyzePlantImage(image.uri);
    // Mostrar análise
  }}
/>
```

### 3. Contexto Inteligente

```python
# Backend busca posts do usuário automaticamente
user_plants = db.query(Post).filter(
    Post.user_id == current_user.id
).all()

user_context["plants"] = [post.description for post in user_plants]
```

---

## 💰 Custos Estimados

### Cenário 1: 1000 usuários ativos/mês
- 100 conversas/dia com bot
- ~5 mensagens por conversa
- ~500 msgs/dia = 15K msgs/mês

**OpenAI GPT-4:**
- Input: 15K msgs × 100 tokens = 1.5M tokens
- Output: 15K msgs × 200 tokens = 3M tokens
- **Custo:** ~$45-60/mês

### Cenário 2: 10000 usuários ativos/mês
- 1000 conversas/dia
- **Custo:** ~$450-600/mês

### Alternativa: Gemini
- **Custo:** ~$30-40/mês (Cenário 1)
- **Custo:** ~$300-400/mês (Cenário 2)

---

## 📋 Roadmap

### Fase 1: MVP (1-2 semanas)
- [ ] Setup OpenAI API
- [ ] Backend endpoint básico
- [ ] UI simples (botão + chat)
- [ ] Testes básicos

### Fase 2: Melhorias (2-3 semanas)
- [ ] Análise de imagens
- [ ] Contexto do usuário
- [ ] Sugestões rápidas
- [ ] Histórico de conversas

### Fase 3: Avançado (1 mês)
- [ ] Fine-tuning do modelo
- [ ] Integração com posts/plantas
- [ ] Analytics de uso
- [ ] A/B testing de prompts

---

## 🔐 Segurança

### 1. Rate Limiting
```python
# Máximo 20 mensagens/usuário/dia
@router.post("/chat/bot/message")
@limiter.limit("20/day")
async def send_bot_message(...):
    ...
```

### 2. Content Moderation
```python
# Filtrar conteúdo inadequado
response = openai.Moderation.create(input=user_message)
if response.results[0].flagged:
    raise HTTPException(400, "Conteúdo inadequado")
```

### 3. API Key Security
```python
# Usar AWS Secrets Manager
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='openai-api-key')
openai.api_key = secret['SecretString']
```

---

## 📊 Métricas

### Tracking
- Total de conversas com bot
- Mensagens por conversa (média)
- Satisfação do usuário (thumbs up/down)
- Tópicos mais perguntados
- Taxa de erro da IA

### Dashboard
```python
# Endpoint para admin
@router.get("/admin/bot/stats")
async def get_bot_stats():
    return {
        "total_conversations": ...,
        "total_messages": ...,
        "avg_messages_per_conversation": ...,
        "satisfaction_rate": ...,
        "top_topics": [...]
    }
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Escolher provider (OpenAI/Anthropic/Gemini)
- [ ] Criar conta e obter API key
- [ ] Implementar `ai_chatbot.py`
- [ ] Adicionar endpoint `/chat/bot/message`
- [ ] Criar usuário bot no database
- [ ] Testar com curl/Postman
- [ ] Adicionar rate limiting
- [ ] Configurar secrets

### Frontend
- [ ] Criar `GrowBotButton` component
- [ ] Modificar chat screen para bot
- [ ] Adicionar `sendBotMessage` na API
- [ ] Testar envio de mensagem
- [ ] Adicionar sugestões rápidas
- [ ] UI para análise de imagem
- [ ] Feedback (thumbs up/down)

### Deploy
- [ ] Configurar variáveis de ambiente
- [ ] Deploy backend (Lambda/ECS)
- [ ] Testar em staging
- [ ] Deploy frontend
- [ ] Monitorar custos
- [ ] Analytics

---

## 🆘 Troubleshooting

### "API key invalid"
- Verificar `.env` tem `OPENAI_API_KEY`
- Verificar key não expirou

### "Rate limit exceeded"
- Adicionar rate limiting no backend
- Considerar upgrade do plano OpenAI

### "Respostas ruins"
- Melhorar SYSTEM_PROMPT
- Adicionar mais contexto
- Considerar fine-tuning

---

**Próximo Passo:** Escolher provider e começar Fase 1! 🚀

**Recomendação:** Começar com OpenAI GPT-4 Turbo (melhor custo-benefício)
