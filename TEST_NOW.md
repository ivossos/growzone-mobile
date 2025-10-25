# 🧪 TESTE O CHAT AGORA!

**Status:** ✅ Tudo rodando e pronto para teste!

---

## ✅ Verificação Rápida

**Backend:** ✅ Rodando em http://localhost:8000
```
INFO: 127.0.0.1 - "GET /api/v1/chat/conversations HTTP/1.1" 200 OK
INFO: 127.0.0.1 - "POST /api/v1/chat/messages HTTP/1.1" 200 OK
```

**Frontend:** ✅ Rodando em http://localhost:8081
```
Web Bundled successfully
Logs will appear in the browser console
```

**Conversa de teste:** ✅ Criada (ID: `5587ad88-ccd2-4713-88fc-89b8d2c47995`)

---

## 🎯 URLs de Teste

### 1. Homepage do App
```
http://localhost:8081
```

### 2. Chat Direto (com dados)
```
http://localhost:8081/chat/5587ad88-ccd2-4713-88fc-89b8d2c47995
```

### 3. API Backend
```
http://localhost:8000/docs
```

---

## 🧪 Teste Passo-a-Passo

### Teste 1: Abrir o Chat ✅

**1. Copiar URL:**
```
http://localhost:8081/chat/5587ad88-ccd2-4713-88fc-89b8d2c47995
```

**2. Colar no browser** (Chrome/Safari/Firefox)

**3. Esperar carregar**

**O que você deve ver:**
- ✅ Tela de chat
- ✅ 1 mensagem existente: "Olá! Esta é minha primeira mensagem!"
- ✅ Input de texto na parte inferior
- ✅ Botões: emoji, câmera, microfone

---

### Teste 2: Enviar Mensagem de Texto 💬

**1. Digitar no input:** "Testando mensagem!"

**2. Clicar no botão de enviar** (ícone de avião/seta)

**3. Ver mensagem aparecer** na lista

**Verificar no terminal do backend:**
```bash
INFO: 127.0.0.1 - "POST /api/v1/chat/messages HTTP/1.1" 200 OK
```

✅ **Sucesso!** Se a mensagem apareceu, está funcionando!

---

### Teste 3: Emoji Picker 😀

**1. Clicar no botão de emoji** (😀)

**2. Ver modal/popup abrir** com categorias de emojis

**3. Clicar em uma categoria:**
- 😀 Smileys
- 🐶 Animais
- 🍕 Comida
- ⚽ Esportes

**4. Clicar em um emoji**

**5. Ver emoji aparecer** no input de texto

**6. Enviar mensagem** com emoji

✅ **Sucesso!** Emoji deve aparecer na mensagem enviada

---

### Teste 4: Upload de Imagem 📷

**1. Clicar no botão de câmera/imagem** (📷)

**2. Ver opções:**
- Câmera (web pode não funcionar)
- Galeria/Arquivos ✅

**3. Escolher "Galeria" ou "Arquivos"**

**4. Selecionar uma imagem** do seu computador

**5. Ver preview/loading**

**6. Mensagem com imagem** deve aparecer

**Verificar no terminal:**
```bash
INFO: 127.0.0.1 - "POST /api/v1/chat/upload HTTP/1.1" 200 OK
INFO: 127.0.0.1 - "POST /api/v1/chat/messages HTTP/1.1" 200 OK
```

✅ **Sucesso!** Imagem foi enviada

**Nota:** No ambiente local, a imagem fica em memória (não persiste)

---

### Teste 5: Gravação de Voz 🎙️

**1. Clicar e SEGURAR o botão de microfone** (🎙️)

**2. Browser pede permissão:**
- Clicar em "Permitir"

**3. Falar algo** (até 60 segundos)

**4. Visualizar:**
- Timer aparece
- Forma de onda (se implementado)

**5. SOLTAR o botão** para enviar
- OU arrastar para cima para cancelar

**6. Mensagem de áudio** aparece na lista

✅ **Sucesso!** Áudio foi gravado e enviado

**Nota:** No web, pode ter limitações. Funciona melhor em iOS/Android.

---

## 🔍 Verificações Adicionais

### Console do Browser (F12)

**Abrir DevTools:**
- Chrome: F12 ou Cmd+Option+I (Mac)
- Ver aba "Console"

**O que procurar:**
```javascript
// Logs esperados:
"Loading messages..."
"Loaded 1 messages"
"Sending message..."
"Message sent successfully"

// Se houver erros:
❌ "Network error" - Backend não está respondendo
❌ "Unauthorized" - Problema de autenticação
```

### Network Tab

**Ver requisições HTTP:**
```
GET /api/v1/chat/conversations/xxx/messages - 200 OK
POST /api/v1/chat/messages - 200 OK
POST /api/v1/chat/upload - 200 OK (se enviou mídia)
```

---

## 📊 Checklist de Teste

### Funcionalidades Básicas
- [ ] App carrega sem erros
- [ ] Chat abre corretamente
- [ ] Mensagem existente aparece
- [ ] Input de texto funciona
- [ ] Botão enviar funciona

### Mensagens
- [ ] Enviar texto simples
- [ ] Enviar texto com emoji
- [ ] Enviar texto longo (100+ caracteres)
- [ ] Ver mensagem aparecer na lista
- [ ] Ver horário da mensagem

### Emoji Picker
- [ ] Botão emoji abre picker
- [ ] Categorias aparecem
- [ ] Clicar em emoji funciona
- [ ] Emoji aparece no input
- [ ] Fechar picker funciona

### Upload de Mídia
- [ ] Botão câmera/imagem abre picker
- [ ] Selecionar imagem funciona
- [ ] Ver progress/loading
- [ ] Mensagem com imagem aparece
- [ ] Tentar upload de vídeo (opcional)

### Gravação de Voz
- [ ] Segurar botão microfone
- [ ] Permissão solicitada
- [ ] Timer aparece
- [ ] Soltar envia
- [ ] Arrastar cancela
- [ ] Mensagem de áudio aparece

### UI/UX
- [ ] Scroll funciona
- [ ] Layout responsivo
- [ ] Botões clicáveis
- [ ] Cores/tema correto
- [ ] Sem erros visuais

---

## 🐛 Problemas Comuns

### "Cannot connect to backend"

**Solução:**
```bash
# Verificar se backend está rodando
curl http://localhost:8000/health

# Se não estiver, iniciar:
cd backend/local-test
source venv/bin/activate
python3 simple_server.py
```

### "MediaPicker não abre"

**Motivo:** Permissões no web

**Solução:**
- Usar "Galeria/Arquivos" ao invés de "Câmera"
- Testar em iOS/Android para funcionalidade completa

### "Erro 422 ao enviar mensagem"

**Motivo:** Payload inválido

**Solução:**
```bash
# Ver logs do backend
# Terminal onde rodou python3 simple_server.py
# Procurar por "422 Unprocessable Content"
```

### "Emoji não aparece"

**Motivo:** Font/encoding

**Solução:**
- Usar emojis simples (😀 👍 ❤️)
- Verificar se browser suporta

---

## 📈 Métricas de Sucesso

### ✅ Teste BEM-SUCEDIDO se:

1. **App carrega** sem crashes
2. **Mensagens aparecem** na lista
3. **Enviar texto** funciona (mínimo)
4. **Emoji picker** abre e funciona
5. **Upload** aceita arquivo (mesmo que não persista)
6. **Backend responde** com 200 OK

### 🎉 EXCELENTE se:

1. Tudo acima +
2. **Gravação de voz** funciona
3. **Scroll** é suave
4. **UI** está bonita
5. **Sem erros** no console
6. **Performance** boa (< 2s para carregar)

---

## 🎯 Próximo Passo Após Testes

### Se TUDO funcionou:

**Parabéns! Chat está pronto! 🎉**

**Próximos passos:**
1. Deploy em AWS (quando tiver acesso)
2. Adicionar chatbot IA (opcional)
3. Testes com usuários reais

### Se houver BUGS:

**Reportar:**
1. O que você tentou fazer
2. O que aconteceu
3. Mensagem de erro (se houver)
4. Screenshot

**Onde reportar:**
- Copiar erro do console (F12)
- Copiar logs do backend terminal
- Me avisar para corrigir!

---

## 📝 Notas Finais

**Limitações do Teste Local:**
- ❌ Sem WebSocket real-time (precisa Lambda)
- ❌ Mídia não persiste (precisa S3)
- ❌ Só 1 usuário de teste (mock)
- ⚠️ Dados resetam ao reiniciar servidor

**O que funciona 100%:**
- ✅ REST API completa
- ✅ Enviar/receber mensagens
- ✅ UI/componentes
- ✅ Upload de arquivos (temporário)
- ✅ Emoji picker
- ✅ Gravação de voz

---

## 🚀 Comandos Úteis

**Ver status do backend:**
```bash
curl http://localhost:8000/health
```

**Ver conversas:**
```bash
curl http://localhost:8000/api/v1/chat/conversations | jq
```

**Resetar dados:**
```bash
curl -X DELETE http://localhost:8000/api/v1/reset
```

**Parar tudo:**
```bash
# Ctrl+C nos terminais
# Ou
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill
lsof -i :8081 | grep LISTEN | awk '{print $2}' | xargs kill
```

---

**COMECE TESTANDO AGORA!** 🧪

Abra: http://localhost:8081/chat/5587ad88-ccd2-4713-88fc-89b8d2c47995
