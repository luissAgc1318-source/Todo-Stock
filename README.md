#  Todo-Stock

Sistema SaaS de gestión de inventario en tiempo real, desarrollado como proyecto final para la materia de Ingeniería de Software 2.

---

##  ¿Qué es Todo-Stock?

Todo-Stock es una aplicación web que permite a negocios gestionar su inventario de forma sencilla y visual. Desde un dashboard centralizado puedes controlar productos, categorías, alertas de stock bajo y exportar reportes a Excel.

---

##  Funcionalidades

-  **Dashboard en tiempo real** — tarjetas con resumen de productos, stock bajo, categorías y valor total del inventario
-  **Gráfica de stock** — barras con colores dinámicos (verde/amarillo/rojo) según el nivel de cada producto
-  **CRUD de productos** — crear, editar y eliminar productos con precio, stock y categoría
-  **Gestión de categorías** — agregar y eliminar categorías con validación de productos asignados
-  **Alertas de stock bajo** — detección automática cuando un producto baja del mínimo definido
-  **Buscador en tiempo real** — filtrado instantáneo por nombre o categoría
-  **Notificaciones toast** — confirmaciones visuales de cada acción
-  **Exportar a Excel** — descarga del inventario completo en formato .xlsx

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| **Next.js 16** | Framework frontend + backend |
| **Prisma ORM** | Manejo de base de datos |
| **SQLite** | Base de datos local |
| **Tailwind CSS** | Estilos y diseño |
| **Recharts** | Gráficas interactivas |
| **react-hot-toast** | Notificaciones |
| **xlsx (SheetJS)** | Exportar a Excel |

---


##  Modelo de base de datos

```prisma
model Categoria {
  id        Int        @id @default(autoincrement())
  nombre    String
  productos Producto[]
  creadoEn  DateTime   @default(now())
}

model Producto {
  id            Int       @id @default(autoincrement())
  nombre        String
  descripcion   String?
  precio        Float
  stock         Int
  stockMinimo   Int       @default(5)
  categoria     Categoria @relation(fields: [categoriaId], references: [id])
  categoriaId   Int
  creadoEn      DateTime  @default(now())
  actualizadoEn DateTime  @updatedAt
}
```

---

##  API REST

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Lista todos los productos |
| POST | `/api/productos` | Crea un nuevo producto |
| PUT | `/api/productos/[id]` | Edita un producto |
| DELETE | `/api/productos/[id]` | Elimina un producto |
| GET | `/api/categorias` | Lista todas las categorías |
| POST | `/api/categorias` | Crea una nueva categoría |
| DELETE | `/api/categorias` | Elimina una categoría |

---

##  Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/luissAgc1318-source/Todo-Stock.git
cd Todo-Stock

# Instalar dependencias
npm install

# Crear la base de datos
npx prisma migrate dev --name init

# Iniciar el servidor
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 👨‍💻 Autor

Desarrollado por **Luis Angel Garcia** — Ingeniería de Software 2