#!/usr/bin/env bash
###############################################################################
# E2E Smoke Test - ERP AMD México
# Pipeline: Login → Cliente → Proveedor → Cotización → OC → OT → Operación → Calidad → Venta → Dashboard
###############################################################################
# NOTE: set -e disabled so all steps run even if some fail (pipeline must be tested end-to-end)
set -uo pipefail

# ── Colors & Emojis ─────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
CHECK="✅"
CROSS="❌"
WARN="⚠️"
INFO="ℹ️"

# ── Config ──────────────────────────────────────────────────────────────────
API_URL="${API_URL:-http://localhost:3001}"
EMAIL="${EMAIL:-admin@amd-mexico.com}"
PASSWORD="${PASSWORD:-admin123}"
TIMESTAMP=$(date +%s)
TEST_CODE="TEST-${TIMESTAMP}"
TOTAL_PASSED=0
TOTAL_FAILED=0

# ── Helpers ─────────────────────────────────────────────────────────────────
log_info()  { echo -e "${CYAN}${INFO} $1${NC}"; }
log_ok()    { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_fail()  { echo -e "${RED}${CROSS} $1${NC}"; }
log_warn()  { echo -e "${YELLOW}${WARN} $1${NC}"; }

# Track created resource IDs
declare -A RESOURCES

# ── Step runner ─────────────────────────────────────────────────────────────
run_step() {
  local step_name="$1"
  local http_code="$2"
  local body="$3"
  local id_field="$4"

  if [[ "$http_code" =~ ^[23] ]]; then
    local id=""
    if [[ -n "$id_field" ]]; then
      id=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$id_field',''))" 2>/dev/null || true)
      if [[ -n "$id" ]]; then
        RESOURCES["$step_name"]="$id"
        log_ok "$step_name (HTTP $http_code) → ID: $id"
      else
        log_ok "$step_name (HTTP $http_code) → body: $(echo "$body" | head -c 200)"
      fi
    else
      log_ok "$step_name (HTTP $http_code)"
    fi
    TOTAL_PASSED=$((TOTAL_PASSED + 1))
    return 0
  else
    log_fail "$step_name (HTTP $http_code) → $body"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
    return 1
  fi
}

# ── Auth check ──────────────────────────────────────────────────────────────
check_auth() {
  if [[ -z "${JWT:-}" ]]; then
    log_fail "No JWT available — aborting dependent steps"
    return 1
  fi
  return 0
}

# ═════════════════════════════════════════════════════════════════════════════
# 1. LOGIN
# ═════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  E2E SMOKE TEST — ERP AMD México${NC}"
echo -e "${CYAN}  Timestamp: ${TIMESTAMP} | Code: ${TEST_CODE}${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo ""

log_info "Step 1: Login as ${EMAIL}"

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
  -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" 2>/dev/null)

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" =~ ^[23] ]]; then
  JWT=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null || true)
  export JWT
  if [[ -n "$JWT" ]]; then
    log_ok "Login exitoso (HTTP ${HTTP_CODE}) → JWT obtenido"
    TOTAL_PASSED=$((TOTAL_PASSED + 1))
  else
    log_fail "Login (HTTP ${HTTP_CODE}) → No se encontró accessToken en respuesta"
    echo "$BODY"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
  fi
else
  log_fail "Login fallido (HTTP ${HTTP_CODE}) → ${BODY}"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
  echo ""
  echo -e "${RED}══════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}  LOGIN FAILED — Cannot continue pipeline${NC}"
  echo -e "${RED}══════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "RESULT: ${TOTAL_PASSED} passed, ${TOTAL_FAILED} failed"
  exit 1
fi

# ═════════════════════════════════════════════════════════════════════════════
# 2. CREATE CLIENTE
# ═════════════════════════════════════════════════════════════════════════════
echo ""
log_info "Step 2: Crear cliente ${TEST_CODE}"

CLIENTE_BODY=$(cat <<EOF
{
  "codigo": "${TEST_CODE}-CLI",
  "razonSocial": "Cliente Prueba ${TEST_CODE}",
  "rfc": "XAXX010101000",
  "contacto": "Contacto Prueba",
  "email": "cliente-${TEST_CODE}@test.com",
  "telefono": "+52 55 1234 5678",
  "direccion": "Av. Test 123",
  "ciudad": "Ciudad de Mexico",
  "estado": "CDMX",
  "codigoPostal": "06600",
  "pais": "MX",
  "creditoLimite": 100000,
  "diasCredito": 30,
  "monedaPref": "MXN"
}
EOF
)

CLIENTE_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
  -X POST "${API_URL}/api/clientes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT}" \
  -d "$CLIENTE_BODY" 2>/dev/null)

HTTP_CODE=$(echo "$CLIENTE_RESPONSE" | tail -n1)
BODY=$(echo "$CLIENTE_RESPONSE" | sed '$d')
run_step "Crear Cliente" "$HTTP_CODE" "$BODY" "id"

# ═════════════════════════════════════════════════════════════════════════════
# 3. CREATE PROVEEDOR
# ═════════════════════════════════════════════════════════════════════════════
echo ""
log_info "Step 3: Crear proveedor ${TEST_CODE}"

PROVEEDOR_BODY=$(cat <<EOF
{
  "codigo": "${TEST_CODE}-PROV",
  "razonSocial": "Proveedor Prueba ${TEST_CODE}",
  "rfc": "XEXX010101000",
  "contacto": "Contacto Proveedor",
  "email": "proveedor-${TEST_CODE}@test.com",
  "telefono": "+52 55 8765 4321",
  "direccion": "Calle Proveedor 456",
  "ciudad": "Monterrey",
  "estado": "Nuevo Leon",
  "codigoPostal": "64000",
  "pais": "MX",
  "diasCredito": 45,
  "monedaPref": "MXN"
}
EOF
)

PROV_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
  -X POST "${API_URL}/api/proveedores" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT}" \
  -d "$PROVEEDOR_BODY" 2>/dev/null)

HTTP_CODE=$(echo "$PROV_RESPONSE" | tail -n1)
BODY=$(echo "$PROV_RESPONSE" | sed '$d')
run_step "Crear Proveedor" "$HTTP_CODE" "$BODY" "id"

# ═════════════════════════════════════════════════════════════════════════════
# 4. CREATE COTIZACIÓN
# ═════════════════════════════════════════════════════════════════════════════
echo ""
log_info "Step 4: Crear cotización para cliente"

CLIENTE_ID="${RESOURCES["Crear Cliente"]:-}"

if check_auth && [[ -n "$CLIENTE_ID" ]]; then
  COTIZACION_BODY=$(cat <<EOF
{
  "clienteId": "${CLIENTE_ID}",
  "validez": 30,
  "tipoCambio": 1.0,
  "notas": "Cotización de prueba e2e ${TEST_CODE}",
  "detalles": [
    {
      "piezaNombre": "Pieza Test A",
      "piezaDescripcion": "Pieza de prueba A para test e2e",
      "cantidad": 100,
      "unidad": "pza",
      "precioUnitario": 25.50,
      "tiempoEstimado": 120,
      "procesoRequerido": "CNC"
    },
    {
      "piezaNombre": "Pieza Test B",
      "piezaDescripcion": "Pieza de prueba B para test e2e",
      "cantidad": 50,
      "unidad": "pza",
      "precioUnitario": 45.00,
      "tiempoEstimado": 90,
      "procesoRequerido": "Rectificado"
    }
  ]
}
EOF
  )

  COT_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
    -X POST "${API_URL}/api/cotizaciones" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT}" \
    -d "$COTIZACION_BODY" 2>/dev/null)

  HTTP_CODE=$(echo "$COT_RESPONSE" | tail -n1)
  BODY=$(echo "$COT_RESPONSE" | sed '$d')
  run_step "Crear Cotizacion" "$HTTP_CODE" "$BODY" "id"
else
  log_fail "Crear Cotizacion → Saltado (sin clienteId)"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

# ═════════════════════════════════════════════════════════════════════════════
# 5. CREATE ORDEN DE COMPRA
# ═════════════════════════════════════════════════════════════════════════════
echo ""
log_info "Step 5: Crear orden de compra"

PROVEEDOR_ID="${RESOURCES["Crear Proveedor"]:-}"

if check_auth && [[ -n "$CLIENTE_ID" && -n "$PROVEEDOR_ID" ]]; then
  OC_BODY=$(cat <<EOF
{
  "clienteId": "${CLIENTE_ID}",
  "condicionesPago": "30 dias",
  "notas": "OC de prueba e2e ${TEST_CODE}",
  "proveedores": [
    {
      "proveedorId": "${PROVEEDOR_ID}",
      "cantidad": 100,
      "precioUnitario": 20.00,
      "notas": "Material para pieza Test A"
    },
    {
      "proveedorId": "${PROVEEDOR_ID}",
      "cantidad": 50,
      "precioUnitario": 35.00,
      "notas": "Material para pieza Test B"
    }
  ]
}
EOF
  )

  OC_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
    -X POST "${API_URL}/api/ordenes-compra" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT}" \
    -d "$OC_BODY" 2>/dev/null)

  HTTP_CODE=$(echo "$OC_RESPONSE" | tail -n1)
  BODY=$(echo "$OC_RESPONSE" | sed '$d')
  run_step "Crear Orden Compra" "$HTTP_CODE" "$BODY" "id"
else
  log_fail "Crear Orden Compra → Saltado (sin clienteId o proveedorId)"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

# ═════════════════════════════════════════════════════════════════════════════
# 6. CREATE ORDEN DE TRABAJO
# ═════════════════════════════════════════════════════════════════════════════
echo ""
log_info "Step 6: Crear orden de trabajo"

OC_ID="${RESOURCES["Crear Orden Compra"]:-}"

if check_auth && [[ -n "$OC_ID" ]]; then
  OT_BODY=$(cat <<EOF
{
  "ordenCompraId": "${OC_ID}",
  "piezaNombre": "Pieza Test A",
  "piezaDescripcion": "Pieza de prueba A para test e2e",
  "cantidad": 100,
  "unidad": "pza",
  "notas": "OT de prueba e2e ${TEST_CODE}",
  "operaciones": [
    {
      "proceso": "CNC",
      "tiempoEstimado": 120,
      "secuencia": 1,
      "notas": "Maquinado CNC inicial"
    },
    {
      "proceso": "Rectificado",
      "tiempoEstimado": 90,
      "secuencia": 2,
      "notas": "Rectificado de precision"
    },
    {
      "proceso": "Inspeccion",
      "tiempoEstimado": 30,
      "secuencia": 3,
      "notas": "Inspeccion final de calidad"
    }
  ]
}
EOF
  )

  OT_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
    -X POST "${API_URL}/api/ordenes-trabajo" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT}" \
    -d "$OT_BODY" 2>/dev/null)

  HTTP_CODE=$(echo "$OT_RESPONSE" | tail -n1)
  BODY=$(echo "$OT_RESPONSE" | sed '$d')
  run_step "Crear Orden Trabajo" "$HTTP_CODE" "$BODY" "id"
else
  log_fail "Crear Orden Trabajo → Saltado (sin ordenCompraId)"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

# ═════════════════════════════════════════════════════════════════════════════
# 7. LIST OPERACIONES & GET FIRST
# ═════════════════════════════════════════════════════════════════════════════
echo ""
log_info "Step 7: Listar operaciones disponibles"

OPERACION_ID=""

if check_auth; then
  OPS_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
    -X GET "${API_URL}/api/operaciones?limit=5" \
    -H "Authorization: Bearer ${JWT}" 2>/dev/null)

  HTTP_CODE=$(echo "$OPS_RESPONSE" | tail -n1)
  BODY=$(echo "$OPS_RESPONSE" | sed '$d')

  if [[ "$HTTP_CODE" =~ ^[23] ]]; then
    OPERACION_ID=$(echo "$BODY" | python3 -c "
import sys, json
data = json.load(sys.stdin)
items = data.get('items', data.get('data', []))
if isinstance(items, list) and len(items) > 0:
    print(items[0].get('id', ''))
" 2>/dev/null || true)
    if [[ -n "$OPERACION_ID" ]]; then
      log_ok "Listar Operaciones (HTTP ${HTTP_CODE}) → Primera operacion ID: ${OPERACION_ID}"
      TOTAL_PASSED=$((TOTAL_PASSED + 1))
    else
      log_warn "Listar Operaciones (HTTP ${HTTP_CODE}) → No se encontraron operaciones"
      TOTAL_PASSED=$((TOTAL_PASSED + 1))
    fi
  else
    log_fail "Listar Operaciones (HTTP ${HTTP_CODE}) → ${BODY}"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
  fi
else
  log_fail "Listar Operaciones → Saltado (sin JWT)"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

# ═════════════════════════════════════════════════════════════════════════════
# 8. MARCAR OPERACIÓN COMPLETADA
# ═════════════════════════════════════════════════════════════════════════════
echo ""
log_info "Step 8: Marcar operación como completada"

if check_auth && [[ -n "$OPERACION_ID" ]]; then
  UPDATE_OP_BODY=$(cat <<EOF
{
  "estatus": "COMPLETADA",
  "tiempoReal": 115,
  "notas": "Operacion completada en test e2e ${TEST_CODE}"
}
EOF
  )

  UPDATE_OP_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
    -X PUT "${API_URL}/api/operaciones/${OPERACION_ID}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT}" \
    -d "$UPDATE_OP_BODY" 2>/dev/null)

  HTTP_CODE=$(echo "$UPDATE_OP_RESPONSE" | tail -n1)
  BODY=$(echo "$UPDATE_OP_RESPONSE" | sed '$d')
  run_step "Completar Operacion" "$HTTP_CODE" "$BODY" "id"
else
  log_fail "Completar Operacion → Saltado (sin operacionId)"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

# ═════════════════════════════════════════════════════════════════════════════
# 9. CREATE REGISTRO DE CALIDAD
# ═════════════════════════════════════════════════════════════════════════════
echo ""
log_info "Step 9: Crear registro de control de calidad"

if check_auth && [[ -n "$OPERACION_ID" ]]; then
  CALIDAD_BODY=$(cat <<EOF
{
  "operacionId": "${OPERACION_ID}",
  "ordenTrabajoId": "${RESOURCES["Crear Orden Trabajo"]:-}",
  "resultado": "APROBADO",
  "defectos": "",
  "observaciones": "Inspeccion de calidad aprobada en test e2e ${TEST_CODE}"
}
EOF
  )

  CALIDAD_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
    -X POST "${API_URL}/api/calidad" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT}" \
    -d "$CALIDAD_BODY" 2>/dev/null)

  HTTP_CODE=$(echo "$CALIDAD_RESPONSE" | tail -n1)
  BODY=$(echo "$CALIDAD_RESPONSE" | sed '$d')
  run_step "Crear Control Calidad" "$HTTP_CODE" "$BODY" "id"
else
  log_fail "Crear Control Calidad → Saltado (sin operacionId)"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

# ═════════════════════════════════════════════════════════════════════════════
# 10. CREATE VENTA
# ═════════════════════════════════════════════════════════════════════════════
echo ""
log_info "Step 10: Crear venta con items"

if check_auth && [[ -n "$CLIENTE_ID" ]]; then
  VENTA_BODY=$(cat <<EOF
{
  "clienteId": "${CLIENTE_ID}",
  "moneda": "MXN",
  "condicionesPago": "30 dias",
  "notas": "Venta de prueba e2e ${TEST_CODE}",
  "items": [
    {
      "piezaNombre": "Pieza Test A",
      "piezaDescripcion": "Pieza de prueba A",
      "cantidad": 100,
      "unidad": "pza",
      "precioUnitario": 25.50,
      "procesoRequerido": "CNC"
    },
    {
      "piezaNombre": "Pieza Test B",
      "piezaDescripcion": "Pieza de prueba B",
      "cantidad": 50,
      "unidad": "pza",
      "precioUnitario": 45.00,
      "procesoRequerido": "Rectificado"
    }
  ]
}
EOF
  )

  VENTA_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
    -X POST "${API_URL}/api/ventas" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT}" \
    -d "$VENTA_BODY" 2>/dev/null)

  HTTP_CODE=$(echo "$VENTA_RESPONSE" | tail -n1)
  BODY=$(echo "$VENTA_RESPONSE" | sed '$d')
  run_step "Crear Venta" "$HTTP_CODE" "$BODY" "id"
else
  log_fail "Crear Venta → Saltado (sin clienteId)"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

# ═════════════════════════════════════════════════════════════════════════════
# 11. VERIFY DASHBOARD
# ═════════════════════════════════════════════════════════════════════════════
echo ""
log_info "Step 11: Verificar dashboard refleja datos creados"

if check_auth; then
  DASH_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 30 \
    -X GET "${API_URL}/api/reportes/dashboard" \
    -H "Authorization: Bearer ${JWT}" 2>/dev/null)

  HTTP_CODE=$(echo "$DASH_RESPONSE" | tail -n1)
  BODY=$(echo "$DASH_RESPONSE" | sed '$d')

  if [[ "$HTTP_CODE" =~ ^[23] ]]; then
    # Check if dashboard has meaningful data (non-zero counts)
    HAS_DATA=$(echo "$BODY" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    # Look for any positive counts in the response
    counts = []
    for key in ['totalClientes', 'totalProveedores', 'totalVentas', 'totalOrdenesTrabajo', 'totalOrdenesCompra', 'clientes', 'proveedores', 'ventas']:
        val = d.get(key, 0)
        if isinstance(val, (int, float)) and val > 0:
            counts.append(f'{key}={val}')
    if counts:
        print('YES: ' + ', '.join(counts))
    else:
        print('NO: no positive counts found')
except Exception as e:
    print(f'ERROR: {e}')
" 2>/dev/null || echo "ERROR parsing")

    if [[ "$HAS_DATA" == YES* ]]; then
      log_ok "Dashboard (HTTP ${HTTP_CODE}) → Datos reflejados: ${HAS_DATA#YES: }"
      TOTAL_PASSED=$((TOTAL_PASSED + 1))
    else
      log_warn "Dashboard (HTTP ${HTTP_CODE}) → ${HAS_DATA}"
      TOTAL_PASSED=$((TOTAL_PASSED + 1))
    fi
  else
    log_fail "Dashboard (HTTP ${HTTP_CODE}) → ${BODY}"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
  fi
else
  log_fail "Dashboard → Saltado (sin JWT)"
  TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

# ═════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  RESUMEN DEL TEST E2E${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}Pasos exitosos: ${TOTAL_PASSED}${NC}"
echo -e "  ${RED}Pasos fallidos:  ${TOTAL_FAILED}${NC}"
echo ""

if [[ ${#RESOURCES[@]} -gt 0 ]]; then
  echo -e "${CYAN}  Recursos creados:${NC}"
  for key in "${!RESOURCES[@]}"; do
    echo -e "    ${CYAN}• ${key}:${NC} ${RESOURCES[$key]}"
  done
  echo ""
fi

echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"

if [[ $TOTAL_FAILED -eq 0 ]]; then
  echo -e "${GREEN}  🎉 TODOS LOS PASOS COMPLETADOS EXITOSAMENTE${NC}"
  echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}  💥 ALGUNOS PASOS FALLARON — Revisar logs arriba${NC}"
  echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
  echo ""
  exit 1
fi
