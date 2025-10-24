#!/usr/bin/env bash

# EAS Build Pre-Install Hook
# Configura otimizações de memória para builds Android

set -euo pipefail

echo "🔧 Configurando otimizações de build Android..."

# Criar gradle.properties com configurações de memória otimizadas
cat > gradle.properties << EOF
# Gradle memory settings
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.caching=true

# Android settings
android.useAndroidX=true
android.enableJetifier=true

# Kotlin
kotlin.incremental=true

# React Native
FLIPPER_VERSION=0.182.0

# Hermes
hermesEnabled=true
EOF

echo "✅ gradle.properties criado com otimizações de memória"

# Verificar e exibir configurações
if [ -f "gradle.properties" ]; then
    echo "📄 Configurações do Gradle:"
    cat gradle.properties
fi

echo "✅ Hook de pré-instalação concluído!"
