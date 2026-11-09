# Sistema de Gestión de Cuenta Bancaria Simplificada

Trabajo Práctico para la asignatura de **Ingeniería Web**  
Unidad de Desarrollo Full-Stack: **Node.js + Express + React (Vite) + MongoDB**  
**Autor:** Rodrigo Gutierrez Lazo  

---

## 📌 Descripción del Proyecto

Aplicación web *Full-Stack* desarrollada para la gestión de cuentas bancarias y operaciones financieras en tiempo real. La plataforma permite realizar consultas de saldo, depósitos en efectivo, retiros con validación estricta de fondos y transferencias inmediatas entre cuentas registradas, manteniendo un registro auditable de cada transacción en una base de datos MongoDB local.

El frontend está desarrollado con **React** empaquetado mediante **Vite**, estilizado exclusivamente con clases utilitarias de **Tailwind CSS** y estructurado de forma modular mediante componentes reutilizables y hooks reactivos (`useState`, `useEffect`).

---

## 🏛️ Arquitectura y Tecnologías

### Backend (`/server`)
- **Entorno de Ejecución:** Node.js (v18+)
- **Framework Web:** Express.js
- **Base de Datos:** MongoDB local gestionado con Mongoose (ODM)
- **Seguridad y Utilidades:** CORS, Morgan (logger de peticiones HTTP), Dotenv

### Frontend (`/client`)
- **Framework / Bundler:** React 19 + Vite
- **Lenguaje:** JavaScript moderno (ES6+) con sintaxis JSX limpia
- **Estilos:** Tailwind CSS (diseño responsivo y adaptativo para móviles, tablets y escritorio)
- **Iconografía:** Lucide React
- **Gestión de Estado:** `useState`, `useEffect` y peticiones HTTP asíncronas con Fetch API

---

## 📁 Estructura del Repositorio

El proyecto mantiene una estricta separación de responsabilidades en carpetas independientes para el servidor y el cliente:

```text
sistema-cuenta-bancaria/
│
├── server/                         # Backend (API REST Node.js + Express)
│   ├── config/
│   │   └── db.js                  # Conexión persistente a MongoDB local
│   ├── controllers/
│   │   └── cuentaController.js    # Lógica de negocio y validación de operaciones
│   ├── models/
│   │   ├── Cuenta.js              # Esquema Mongoose para cuentas bancarias
│   │   └── Transaccion.js         # Esquema Mongoose para auditoría de movimientos
│   ├── routes/
│   │   └── cuentaRoutes.js        # Definición de rutas REST estandarizadas
│   ├── seeds/
│   │   └── seed.js                # Script automatizado para poblar datos de prueba
│   ├── .env.example               # Plantilla de variables de entorno
│   ├── package.json               # Dependencias y scripts del backend
│   └── server.js                  # Punto de entrada del servidor Express
│
├── client/                         # Frontend (React + Vite + Tailwind CSS)
│   ├── public/                    # Activos estáticos y favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                 # Barra de navegación institucional y selector de cuenta
│   │   │   ├── SaldoCard.jsx              # Tarjeta virtual con saldo reactivo y copy rápido
│   │   │   ├── FormOperacion.jsx          # Pestañas de depósito, retiro y transferencias
│   │   │   ├── HistorialTransacciones.jsx # Tabla de movimientos con filtros y badges
│   │   │   └── AlertNotification.jsx      # Notificaciones flotantes tipo toast
│   │   ├── services/
│   │   │   └── api.js                     # Servicio centralizado de consumo HTTP
│   │   ├── App.jsx                        # Componente raíz y sincronización de estado
│   │   ├── index.css                      # Directivas de Tailwind CSS y tipografía
│   │   └── main.jsx                       # Montaje de la aplicación React
│   ├── index.html                         # Documento HTML base
│   ├── package.json                       # Dependencias y scripts del frontend
│   ├── postcss.config.js                  # Configuración de PostCSS
│   ├── tailwind.config.js                 # Paleta de colores e integración de Tailwind
│   └── vite.config.js                     # Configuración de Vite
│
├── .gitignore                      # Exclusiones de Git (node_modules, .env, dist)
└── README.md                       # Documentación técnica completa
```

---

## 🔌 Especificación de la API REST (`Backend`)

Todas las rutas están centralizadas bajo el prefijo `/api`:

| Método | Ruta | Descripción | Códigos HTTP |
|---|---|---|---|
| `GET` | `/api/cuentas` | Obtiene el listado de todas las cuentas registradas | `200`, `500` |
| `GET` | `/api/cuenta/:id` | Obtiene el saldo y detalles de la cuenta (`:id` = Mongo ID o `numeroCuenta`) | `200`, `404`, `500` |
| `POST` | `/api/cuenta/deposito` | Registra un depósito en efectivo y aumenta el saldo | `200`, `400`, `404`, `500` |
| `POST` | `/api/cuenta/retiro` | Efectúa un retiro validando saldo suficiente (evita negativos) | `200`, `400`, `404`, `500` |
| `POST` | `/api/cuenta/transferencia` | Transfiere saldo de una cuenta origen a destino de forma atómica | `200`, `400`, `404`, `500` |
| `GET` | `/api/cuenta/:id/historial` | Consulta el historial completo de transacciones de la cuenta | `200`, `404`, `500` |

### Ejemplos de Cuerpos de Petición (Payloads JSON):

#### 1. Depósito (`POST /api/cuenta/deposito`)
```json
{
  "numeroCuenta": "CTA-1001",
  "monto": 500.00,
  "descripcion": "Depósito de sueldo quincenal"
}
```

#### 2. Retiro (`POST /api/cuenta/retiro`)
```json
{
  "numeroCuenta": "CTA-1001",
  "monto": 150.00,
  "descripcion": "Retiro para compras personales"
}
```

#### 3. Transferencia (`POST /api/cuenta/transferencia`)
```json
{
  "cuentaOrigen": "CTA-1001",
  "cuentaDestino": "CTA-1002",
  "monto": 250.00,
  "descripcion": "Pago de servicios compartidos"
}
```

---

## 👥 Cuentas de Prueba Preconfiguradas (`Seed`)

El script de población inicial incluye 3 cuentas listas para interactuar y realizar transferencias cruzadas:

| Número de Cuenta | Titular | Saldo Inicial | Tipo de Cuenta | Moneda |
|---|---|---|---|---|
| **CTA-1001** | Rodrigo Gutierrez Lazo | S/ 3,250.00 | Ahorros | PEN |
| **CTA-1002** | Maria Lopez Sanchez | S/ 1,450.00 | Corriente | PEN |
| **CTA-1003** | Carlos Perez Gomez | S/ 850.00 | Ahorros | PEN |

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** instalado (v18.0.0 o superior).
- **MongoDB** en ejecución local (`mongodb://127.0.0.1:27017`) o una instancia accesible mediante URI de conexión.

---

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/RodrigoGutierrezLazo/sistema-cuenta-bancaria.git
cd sistema-cuenta-bancaria
```

---

### Paso 2: Configurar y Levantar el Servidor Backend

1. Ingresar a la carpeta `/server`:
   ```bash
   cd server
   ```

2. Instalar las dependencias de Node.js:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Copiar el archivo de plantilla `.env.example` como `.env`:
   ```bash
   # En Windows PowerShell:
   Copy-Item .env.example .env

   # En Linux / macOS / Git Bash:
   cp .env.example .env
   ```

   Contenido por defecto de `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/cuenta_bancaria
   CLIENT_URL=http://localhost:5173
   ```

4. Ejecutar el script **Seed** para inicializar la base de datos con cuentas y movimientos de prueba:
   ```bash
   npm run seed
   ```

5. Iniciar el servidor Express:
   ```bash
   # Modo desarrollo con nodemon:
   npm run dev

   # O modo estándar:
   npm start
   ```

   *El servidor responderá en `http://localhost:5000`.*

---

### Paso 3: Configurar y Levantar el Cliente Frontend

1. Abrir una nueva terminal y navegar a la carpeta `/client`:
   ```bash
   cd client
   ```

2. Instalar las dependencias de React y Tailwind CSS:
   ```bash
   npm install
   ```

3. Iniciar el entorno de desarrollo de Vite:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador la dirección indicada por Vite (normalmente `http://localhost:5173`).

---

## 🧪 Pruebas de Requerimientos Funcionales

1. **Consulta de Saldo Dinámica:**  
   Al abrir la aplicación, se visualiza el saldo en la `SaldoCard` del titular activo. Puedes ocultar/mostrar el saldo con el botón de ojo o copiar el número de cuenta al portapapeles.
2. **Depósito:**  
   En la pestaña "Depósito", ingresa un monto positivo (ej. S/ 200). El saldo se incrementará inmediatamente sin necesidad de recargar la página.
3. **Retiro y Control de Saldos Negativos:**  
   En la pestaña "Retiro", intenta retirar un monto superior al saldo disponible; la aplicación bloqueará la acción y notificará saldo insuficiente. Si el monto es válido, se descontará al instante.
4. **Transferencias Inmediatas:**  
   En la pestaña "Transferencia", selecciona una cuenta destinataria (ej. `CTA-1002 - Maria Lopez Sanchez`) e ingresa el monto a transferir. El saldo de la cuenta activa se reducirá y la cuenta destino se acreditará. Puedes cambiar de cuenta desde el selector del `Navbar` para verificar el nuevo saldo de la destinataria.
5. **Historial de Movimientos:**  
   Cada operación genera un registro en tiempo real clasificado por tipo, fecha y hora, monto abonado/debitado y saldo restante. Se puede filtrar por categoría o buscar por concepto.

---

## 👨‍💻 Autor

- **Estudiante:** Rodrigo Gutierrez Lazo
- **Asignatura:** Ingeniería Web
- **Departamento:** Ingeniería de Sistemas y Computación
