# GrowZone Mobile - Análise de Linhas de Código

## Resumo Geral

**Total do Projeto: ~289,293 linhas**

---

## Por Área

| Área | Linhas | Percentual |
|------|--------|------------|
| **Backend** (Python/FastAPI) | 251,719 | 87% |
| **Frontend** (React Native/TypeScript) | 37,433 | 13% |
| **Config/Root** | 141 | <1% |

---

## Frontend Detalhado (37,433 linhas)

### Por Diretório Principal

| Diretório | Linhas | Descrição |
|-----------|--------|-----------|
| `src/components` | 16,314 | Componentes React reutilizáveis |
| `src/app` | 14,150 | Páginas e rotas da aplicação |
| `src/api` | 3,092 | Integrações com API |
| `src/hooks` | 1,440 | Custom React Hooks |
| `src/lib` | 609 | Bibliotecas e utilitários |
| `src/context` | ~1,000 | Contextos React |
| Outros | ~828 | Utils, constants, storage, styles |

### Por Tipo de Arquivo

| Tipo | Linhas | Arquivos | Média por arquivo |
|------|--------|----------|-------------------|
| `.tsx` (TypeScript React) | 31,713 | 224 | 142 linhas |
| `.ts` (TypeScript) | 5,774 | 135 | 43 linhas |
| `.js` (JavaScript) | 197 | 7 | 28 linhas |

### Top 10 Maiores Arquivos Frontend

| Arquivo | Linhas |
|---------|--------|
| `src/app/test-weestory.tsx` | 906 |
| `src/app/weestory/index.tsx` | 757 |
| `src/components/weestory/ModalCamera/index.web.tsx` | 756 |
| `src/components/weestory/ModalCamera/index.tsx` | 723 |
| `src/app/(drawer)/(tabs)/search.tsx` | 694 |
| `src/components/ui/create-bottom-sheet.tsx` | 674 |
| `src/app/profile/edit.tsx` | 503 |
| `src/app/post/[id]/timeline/[userId].tsx` | 481 |
| `src/components/weestory/ModalWeestory/index.tsx` | 463 |
| `src/components/ui/reels-post.tsx` | 463 |

---

## Observações

- O projeto é **predominantemente TypeScript** (99.5% do frontend)
- O backend tem **~7x mais código** que o frontend
- A feature **Weestory** é uma das mais complexas (vários arquivos grandes)
- Média de **142 linhas por componente TSX** indica boa modularização

---

*Gerado em: 21 de Outubro de 2025*
*Branch: feature/chat-stories-ai*
