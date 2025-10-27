# 🚩 Feature Flags System - Guia Completo

Sistema de controle remoto de funcionalidades **SEM precisar de novo build!**

Criado em: 27 de Outubro, 2025

---

## 🎯 O Que São Feature Flags?

Feature flags (ou feature toggles) permitem **ativar/desativar funcionalidades remotamente** através do banco de dados, sem precisar publicar novo build do app.

### ✅ Benefícios:

- **Rollout Gradual**: Ativar para 10%, 25%, 50%, 100% dos usuários
- **Kill Switch**: Desativar funcionalidade com problema em segundos
- **A/B Testing**: Ativar feature para usuários específicos
- **Lançamento Seguro**: TestFlight com features desligadas, ativar depois
- **Controle Total**: Gerenciar tudo via SQL, sem novo deploy

---

## 📊 Flags Disponíveis

Flags criadas automaticamente no banco de dados:

| Flag Key | Nome | Status | Descrição |
|----------|------|--------|-----------|
| `chat_enabled` | Chat Feature | ✅ ON | Liga/desliga chat completo |
| `chat_websocket_enabled` | Chat WebSocket | ✅ ON | Real-time via WebSocket (fallback: polling) |
| `chat_media_upload_enabled` | Chat Media Upload | ✅ ON | Upload de fotos/vídeos no chat |
| `chat_voice_messages_enabled` | Chat Voice Messages | ✅ ON | Mensagens de voz |
| `stories_enabled` | Stories (Weestory) | ✅ ON | Feature de stories |
| `ai_assistant_enabled` | AI Assistant (@growbot) | ❌ OFF | Chatbot AI (não implementado ainda) |

---

## 🛠️ Como Usar no Frontend

### 1. Usar o Hook `useFeatureFlags`

```tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

function MyComponent() {
  const { isFeatureEnabled, isLoading } = useFeatureFlags();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Verificar se feature está habilitada
  if (!isFeatureEnabled('chat_enabled')) {
    return <ComingSoonScreen />;
  }

  return <ChatScreen />;
}
```

### 2. Condicional Simples

```tsx
const { isFeatureEnabled } = useFeatureFlags();

return (
  <View>
    {isFeatureEnabled('chat_enabled') && <ChatButton />}
    {isFeatureEnabled('stories_enabled') && <StoriesButton />}
  </View>
);
```

### 3. Higher-Order Component

```tsx
import { withFeatureFlag } from '@/hooks/useFeatureFlags';

const ChatScreen = () => <View><Text>Chat!</Text></View>;
const ComingSoon = () => <View><Text>Em breve!</Text></View>;

// Exportar com feature flag
export default withFeatureFlag('chat_enabled', ChatScreen, ComingSoon);
```

### 4. Atualizar Manualmente

```tsx
const { refresh } = useFeatureFlags();

// Atualizar quando app volta do background
useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      refresh();
    }
  });

  return () => subscription.remove();
}, []);
```

---

## 🗄️ Como Gerenciar no Backend

### **Opção 1: SQL Direto (Recomendado)**

Conecte no banco de dados e execute SQL:

```bash
# Conectar no banco
PGPASSWORD='GrowzoneDB2025SecurePass48bba072' psql \
  -h dev1-growzone-database.cbs8g6go4hja.us-east-1.rds.amazonaws.com \
  -U dev_api \
  -d dev_growzone_database
```

#### **Ativar Feature para Todos**
```sql
UPDATE feature_flags
SET is_enabled = true
WHERE flag_key = 'chat_enabled';
```

#### **Desativar Feature** (Kill Switch)
```sql
UPDATE feature_flags
SET is_enabled = false
WHERE flag_key = 'chat_enabled';
```

#### **Rollout Gradual - 50% dos Usuários**
```sql
UPDATE feature_flags
SET is_enabled = true,
    rollout_percentage = 50
WHERE flag_key = 'ai_assistant_enabled';
```

#### **Ativar Apenas para Usuários Específicos**
```sql
UPDATE feature_flags
SET is_enabled = true,
    targeting_rules = '{"user_ids": [1, 2, 3, 100, 500]}'::jsonb
WHERE flag_key = 'ai_assistant_enabled';
```

#### **Excluir Usuários Específicos**
```sql
UPDATE feature_flags
SET is_enabled = true,
    targeting_rules = '{"exclude_user_ids": [666, 999]}'::jsonb
WHERE flag_key = 'chat_enabled';
```

#### **Ver Status de Todas as Flags**
```sql
SELECT
  flag_key,
  flag_name,
  is_enabled,
  rollout_percentage,
  notes
FROM feature_flags
ORDER BY flag_key;
```

#### **Ver Histórico de Mudanças (Audit Log)**
```sql
SELECT
  flag_key,
  action,
  changed_by,
  changed_at
FROM feature_flag_audit_log
ORDER BY changed_at DESC
LIMIT 20;
```

### **Opção 2: API (Futuro)**

Endpoints criados em `backend/api/routers/feature_flags.py`:

```bash
# Verificar se feature está habilitada
GET /api/v1/feature-flags/check/chat_enabled?user_id=123

# Obter todas features habilitadas
GET /api/v1/feature-flags/enabled?user_id=123

# (Admin endpoints ainda não implementados - use SQL direto por enquanto)
```

---

## 🎮 Casos de Uso Práticos

### **Caso 1: Lançamento Gradual do Chat**

```sql
-- Dia 1: Ativar para 10% dos usuários
UPDATE feature_flags
SET is_enabled = true, rollout_percentage = 10
WHERE flag_key = 'chat_enabled';

-- Dia 2: Se tudo ok, aumentar para 25%
UPDATE feature_flags
SET rollout_percentage = 25
WHERE flag_key = 'chat_enabled';

-- Dia 3: 50%
UPDATE feature_flags
SET rollout_percentage = 50
WHERE flag_key = 'chat_enabled';

-- Dia 4: 100% (todos)
UPDATE feature_flags
SET rollout_percentage = 100
WHERE flag_key = 'chat_enabled';
```

### **Caso 2: Testar com Usuários Beta**

```sql
-- Ativar APENAS para testers
UPDATE feature_flags
SET is_enabled = true,
    targeting_rules = '{"user_ids": [1, 5, 10, 42, 100]}'::jsonb,
    notes = 'Beta testers only'
WHERE flag_key = 'ai_assistant_enabled';
```

### **Caso 3: Kill Switch - Desativar Feature com Bug**

```sql
-- Bug descoberto! Desativar IMEDIATAMENTE
UPDATE feature_flags
SET is_enabled = false,
    notes = 'Disabled due to bug #123 - WebSocket crash'
WHERE flag_key = 'chat_websocket_enabled';

-- App continua funcionando, mas usa polling ao invés de WebSocket
```

### **Caso 4: A/B Testing**

```sql
-- Grupo A: Sem AI (50% dos usuários)
-- Grupo B: Com AI (50% dos usuários)

UPDATE feature_flags
SET is_enabled = true,
    rollout_percentage = 50
WHERE flag_key = 'ai_assistant_enabled';

-- Usuários com user_id % 100 < 50 verão a feature
```

---

## ⚡ Fluxo de Deployment com Feature Flags

### **Fase 1: TestFlight (SEGURO)**

```sql
-- Antes de enviar para TestFlight:
-- Desligar features novas
UPDATE feature_flags
SET is_enabled = false
WHERE flag_key IN ('ai_assistant_enabled', 'chat_voice_messages_enabled');

-- Build enviado com features DESLIGADAS
-- Testers não veem ainda
```

### **Fase 2: Ativar para Testers**

```sql
-- Depois do TestFlight instalado:
-- Ativar apenas para testers
UPDATE feature_flags
SET is_enabled = true,
    targeting_rules = '{"user_ids": [1, 2, 3]}'::jsonb -- IDs dos testers
WHERE flag_key = 'ai_assistant_enabled';

-- Agora testers veem, usuários produção NÃO veem
```

### **Fase 3: App Store Aprovado → Rollout Gradual**

```sql
-- Dia 1: 5% dos usuários
UPDATE feature_flags
SET rollout_percentage = 5,
    targeting_rules = '{}'::jsonb -- Limpar targeting de testers
WHERE flag_key = 'ai_assistant_enabled';

-- Dia 3: 25%
UPDATE feature_flags
SET rollout_percentage = 25
WHERE flag_key = 'ai_assistant_enabled';

-- Dia 7: 100%
UPDATE feature_flags
SET rollout_percentage = 100
WHERE flag_key = 'ai_assistant_enabled';
```

---

## 🔍 Monitoramento

### **Ver Quantos Usuários Veem a Feature**

```sql
-- Total de usuários
SELECT COUNT(*) FROM users;

-- Usuários que veriam a feature (aproximado)
SELECT
  flag_key,
  CASE
    WHEN rollout_percentage = 100 THEN 'Todos os usuários'
    WHEN targeting_rules ? 'user_ids' THEN 'Usuários específicos: ' || (targeting_rules->>'user_ids')
    ELSE rollout_percentage::text || '% dos usuários'
  END as coverage
FROM feature_flags
WHERE is_enabled = true;
```

---

## 🐛 Debugging

### **App Não Está Respeitando Feature Flag**

1. **Verificar cache no app:**
   ```tsx
   const { clearCache, refresh } = useFeatureFlags();

   // Limpar cache e recarregar
   await clearCache();
   await refresh();
   ```

2. **Verificar no banco:**
   ```sql
   SELECT * FROM feature_flags WHERE flag_key = 'chat_enabled';
   ```

3. **Forçar reload no app:**
   - Fechar app completamente
   - Reabrir
   - Feature flags são buscados na inicialização

### **Ver Logs de Mudanças**

```sql
SELECT
  flag_key,
  action,
  previous_value->>'is_enabled' as old_value,
  new_value->>'is_enabled' as new_value,
  changed_by,
  changed_at
FROM feature_flag_audit_log
WHERE flag_key = 'chat_enabled'
ORDER BY changed_at DESC;
```

---

## 📱 Comportamento no App

### **Cache e Performance**

- Feature flags são **cacheados por 5 minutos**
- Cache é atualizado automaticamente em background
- Se API falhar, usa cache ou valores padrão
- **Retry automático** após 30 segundos se API falhar

### **Default Behavior (Se API Indisponível)**

```typescript
const DEFAULT_FLAGS = {
  chat_enabled: true,
  chat_websocket_enabled: true,
  chat_media_upload_enabled: true,
  chat_voice_messages_enabled: true,
  stories_enabled: true,
  ai_assistant_enabled: false,  // Features novas OFF por padrão
};
```

---

## 🎯 Checklist de Lançamento

### **Antes do TestFlight:**
- [ ] Todas as flags novas em `is_enabled = false`
- [ ] Confirmar que features existentes estão ON
- [ ] Testar com mock no desenvolvimento

### **Durante TestFlight:**
- [ ] Ativar flags para IDs dos testers
- [ ] Verificar audit log de mudanças
- [ ] Monitorar comportamento do app

### **Antes da App Store:**
- [ ] Desligar todas features experimentais
- [ ] Garantir features estáveis estão ON
- [ ] Planejar rollout gradual

### **Pós-Lançamento:**
- [ ] Rollout gradual: 5% → 25% → 50% → 100%
- [ ] Monitorar crashes/bugs em cada fase
- [ ] Preparado para kill switch se necessário

---

## 🔐 Segurança

### **Quem Pode Mudar Feature Flags?**

- Acesso ao banco de dados RDS
- Ou API admin (quando implementada)

### **Auditoria**

Todas as mudanças são registradas em `feature_flag_audit_log`:

```sql
SELECT * FROM feature_flag_audit_log
WHERE changed_at > NOW() - INTERVAL '24 hours'
ORDER BY changed_at DESC;
```

---

## 📚 Referências

- **Hook:** `src/hooks/useFeatureFlags.ts`
- **API:** `backend/api/routers/feature_flags.py`
- **Models:** `backend/api/models/feature_flags.py`
- **Migration:** `backend/migrations/002_feature_flags.sql`
- **Database:** `dev_growzone_database` table `feature_flags`

---

## 🚀 Próximos Passos

1. ✅ Sistema criado e funcionando
2. ✅ Flags padrões inseridas no banco
3. ⏳ Integrar nos componentes (chat, stories)
4. ⏳ Testar no TestFlight
5. ⏳ Implementar API admin (opcional)
6. ⏳ Dashboard web para gerenciar flags (opcional)

---

**🎉 Agora você tem controle total sobre features em produção!**

Qualquer dúvida, consulte este guia ou os códigos referenciados.
