# SPEC: Rediseño de Pantalla de Login — SW-001

**Fecha:** 2026-05-09
**ID Idea:** sw-001
**Estado:** Aprobado por usuario

---

## 1. Resumen

Rediseñar la pantalla de inicio de sesión de la app móvil Vibra y mejorar el mecanismo de recuperación de contraseña con un flujo completo email → enlace → cambio de contraseña.

---

## 2. Problema

La pantalla de login actual (líneas 109-248, `LoginForm.tsx`) tiene:
- Diseño visual básico sin identidad de marca fuerte
- Layout centrado manualmente con `marginTop: 60` fijo
- Modal de recuperación de contraseña limitado en espacio y UX
- Sin feedback visual claro en estados de éxito/error
- No está optimizada para diferentes tamaños de pantalla

---

## 3. Solución

### 3.1 Diseño Visual — Fondo Degradado Oscuro

**Estilo:** Moderno tipo apps de streaming (Dark gradient)
**Colores:**
- Background: Degradado lineal de `#1a0a2e` (violeta oscuro) a `#0d1b2a` (azul oscuro)
- Texto principal: `#FFFFFF` (blanco)
- Acento primario: `#00D9FF` (cyan vibrante)
- Acento secundario: `#8B5CF6` (violeta)
- Superficies: `rgba(255,255,255,0.08)` con blur (glassmorphism sutil)

**Tipografía:**
- Títulos: Bold, 28-32px
- Labels: Medium, 14-16px
- Botones: Bold, 16-18px

**Fondos:**
- Eliminar `ImageBackground` con `fondo_vibra_new.jpg`
- Usar `LinearGradient` de `expo-linear-gradient`
- Logo Vibra vectorial sobre el degradado

### 3.2 Estructura — Login Card Centrada

```
┌─────────────────────────────────────┐
│         [Background Gradient]        │
│                                       │
│            ┌─────────┐                │
│            │  Logo   │                │
│            │  Vibra  │                │
│            └─────────┘                │
│                                       │
│         ┌─────────────────┐           │
│         │   Card Glass    │           │
│         │  ┌───────────┐  │           │
│         │  │   Email   │  │           │
│         │  └───────────┘  │           │
│         │  ┌───────────┐  │           │
│         │  │ Password  │  │           │
│         │  └───────────┘  │           │
│         │                 │           │
│         │ [ Conectarse ]  │           │
│         │ [ Registrarse ] │           │
│         │ [   About    ]  │           │
│         │                 │           │
│         │ ¿Olvidaste? →  │           │
│         └─────────────────┘           │
│                                       │
└─────────────────────────────────────┘
```

**Principios:**
- Card centrada verticalmente con `justifyContent: 'center'`
- Card usa efecto glassmorphism sutil (fondo semi-transparente con blur)
- Logo prominente pero no invasivo
- El `keepSessionActive` Switch se integra dentro de la card
- Inputs con bordes sutiles cyan cuando están en foco
- Botones con gradiente cyan/violeta o estilo outline

### 3.3 Flujo de Recuperación de Contraseña

**Pantalla dedicada** en vez de modal. Ruta: `/features/auth/ForgotPasswordScreen`

```
Paso 1 — Solicitar email
┌─────────────────────────────┐
│  ← Volver                   │
│                             │
│   🔒                        │
│   "¿Olvidaste tu           │
│    contraseña?"             │
│                             │
│   Ingresa tu email y        │
│   te enviaremos un          │
│   enlace para               │
│   recuperarla.              │
│                             │
│   ┌─────────────────────┐   │
│   │ correo@ejemplo.com   │   │
│   └─────────────────────┘   │
│                             │
│   [ Enviar enlace ]         │
│                             │
└─────────────────────────────┘

Paso 2 — Email enviado (confirmación)
┌─────────────────────────────┐
│  ← Volver                   │
│                             │
│   ✓                         │
│   "Revisa tu email"         │
│                             │
│   Enviamos un enlace        │
│   de recuperación a:       │
│   c***@ejemplo.com          │
│                             │
│   Haz clic en el enlace     │
│   para crear una nueva      │
│   contraseña.               │
│                             │
│   [ Volver al login ]       │
│                             │
└─────────────────────────────┘
```

**Validación:**
- Email requerido y con formato válido
- Si el email no existe en el sistema: mostrar mensaje "No encontramos esa dirección de email. Verifica o regístrate."
- Loading state mientras se envía el email
- Timeout de enlace de recuperación: 15 minutos

### 3.4 Interactividad y Estados

**Inputs:**
- Default: borde `rgba(255,255,255,0.2)`
- Foco: borde cyan `#00D9FF` con glow sutil
- Error: borde rojo `#FF3B30` con mensaje debajo
- Llenado: check icon sutil

**Botones:**
- Default: gradiente cyan/violeta
- Pressed: opacity 0.8 con scale 0.98
- Disabled: opacity 0.5, sin gradiente
- Loading: spinner interno, texto "Cargando..."

**Navegación:**
- Transiciones suaves entre pantallas (fade + slide)
- El botón "Volver" siempre visible en recuperación de contraseña
- Teclado virtual no oculta los inputs (KeyboardAvoidingView)

### 3.5 Componentes a Crear/Modificar

| Componente | Acción | Ubicación |
|------------|--------|-----------|
| `LoginScreen` | Refactorizar | `app/index.tsx` → `app/features/auth/LoginScreen.tsx` |
| `LoginCard` | Crear | `app/features/auth/components/LoginCard.tsx` |
| `GlassCard` | Crear (reusable) | `app/shared/components/GlassCard.tsx` |
| `GradientBackground` | Crear | `app/features/auth/components/GradientBackground.tsx` |
| `ForgotPasswordScreen` | Crear | `app/features/auth/ForgotPasswordScreen.tsx` |
| `AuthService.recoverPassword()` | Mantener | Ya existe en `AuthService` |
| `TailwindProvider` | Verificar | Compatibilidad con los nuevos componentes |

### 3.6 Responsividad

- Portrait: card ocupa 85% del ancho, centrado
- Landscape: card ocupa 50% del ancho, alineada a la izquierda
- Tablet (834px+): card ocupa 60% del ancho, centrado
- Safe areas respetadas en todos los dispositivos (SafeAreaView)

---

## 4. Arquitectura de Navegación

```
/                          → redirect a /features/(tabs)/one si autenticado
/features/auth/LoginScreen → pantalla principal de login
/features/auth/ForgotPasswordScreen → recuperación de contraseña
```

- El modal actual de `LoginForm` (línea 208-247) se elimina
- Se crea ruta nueva en `app/features/auth/` con expo-router
- La navegación entre login y forgot password usa `router.push()` / `router.back()`

---

## 5. Estados de Error Manejados

| Escenario | Respuesta Visual |
|-----------|-----------------|
| Email vacío | "Ingresa tu email" debajo del input |
| Email inválido | "Formato de email no válido" debajo del input |
| Email no existe | Mensaje en pantalla: "No encontramos esa cuenta" + link a registro |
| Error de red | Alert: "No pudimos enviar el email. Intenta de nuevo." |
| Código expirado | "El enlace expiró. Solicita uno nuevo." |
| Contraseña débil | Requisitos mostrados cerca del campo |

---

## 6. Testing Checklist

- [ ] Login con credenciales válidas → redirige a `/features/(tabs)/one`
- [ ] Login con credenciales inválidas → mensaje de error en pantalla
- [ ] Toggle "Mantener sesión iniciada" → persiste en AsyncStorage
- [ ] Click "¿Olvidaste?" → navega a pantalla de recuperación
- [ ] Ingresar email válido → muestra paso de "email enviado"
- [ ] Ingresar email no registrado → mensaje claro en pantalla
- [ ] Botón "Volver" en recuperación → regresa a login
- [ ] Teclado no oculta inputs
- [ ] Loading states visibles durante llamadas a API
- [ ] Diseño consistente en Android e iOS
- [ ] Dark mode/Light mode no aplica (diseño oscuro fijo)

---

## 7. Dependencias Existentes a Verificar

- `expo-linear-gradient` ✅ (ya instalado)
- `expo-secure-store` ✅ (ya instalado)
- `AuthService.recoverPassword()` ✅ (ya existe)
- `TailwindProvider` ✅ (ya instalado)
- `@react-native-async-storage/async-storage` ✅ (ya instalado)

**No se requieren nuevas dependencias.**

---

## 8. Scope

**Incluido:**
- Rediseño visual de login (fondo degradado, card glassmorphism, nuevos colores)
- Nueva pantalla de recuperación de contraseña (2 pasos)
- Navegación correcta entre pantallas
- Estados de error claros
- Responsividad en móvil/tablet

**Excluido:**
- Modificación del backend de autenticación
- Implementación de "recordarme" con cookies/persistencia avanzada
- Flujo de registro de nuevos usuarios (ya existe en `RegisterForm`)
- Notificaciones push relacionadas a auth

---

## 9.wireframes (Descripción)

**Login Screen:**
- Fondo: degradado `#1a0a2e` → `#0d1b2a`
- Logo Vibra: 120x120px, centrado arriba del card
- Card: 85% ancho, glassmorphism sutil (blur + borde translúcido)
- Inputs: 100% ancho del card, altura 52px, esquinas 12px
- Botones: 100% ancho, altura 52px, gradiente cyan/violeta
- "¿Olvidaste?" texto cyan, debajo del card, centrado

**Forgot Password — Paso 1:**
- Fondo: mismo degradado
- Flecha "← Volver" arriba izquierda
- Icono candado 48px centrado
- Título "¿Olvidaste tu contraseña?" 24px bold
- Subtítulo descriptivo
- Input email 100% ancho
- Botón "Enviar enlace" 100% ancho

**Forgot Password — Paso 2:**
- Fondo: mismo degradado
- Flecha "← Volver" arriba izquierda
- Icono check 48px centrado (cyan)
- Título "Revisa tu email" 24px bold
- Email mostrado truncado (c***@ejemplo.com)
- Botón "Volver al login" outline

---

*Documento generado mediante brainstorming — usuario aprobo el enfoque "Login Card Centrada"*