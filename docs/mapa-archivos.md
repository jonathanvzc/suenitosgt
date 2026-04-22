<!-- Inventario funcional del proyecto Sueñitos GT para mantenimiento, onboarding y auditoría técnica. -->

# Mapa de archivos

## Raíz

- `.env.example`: plantilla de variables de entorno públicas y privadas necesarias para Supabase y SMTP.
- `.env.local`: variables reales del entorno local; contiene secretos y no debe exponerse.
- `.gitignore`: exclusiones de Git para dependencias, builds, variables locales y archivos temporales.
- `AGENTS.md`: guía operativa para agentes o automatizaciones usadas sobre este repositorio.
- `CLAUDE.md`: documentación auxiliar de contexto y trabajo para asistentes sobre el proyecto.
- `eslint.config.mjs`: configuración de ESLint para TypeScript, Next.js y reglas del proyecto.
- `next-env.d.ts`: archivo generado por Next.js para tipos base del entorno.
- `next.config.ts`: configuración principal de Next.js.
- `package-lock.json`: lockfile de npm con versiones exactas de dependencias.
- `package.json`: manifiesto del proyecto con scripts y dependencias.
- `postcss.config.js`: configuración PostCSS heredada.
- `postcss.config.mjs`: configuración PostCSS actual para el pipeline CSS.
- `proxy.ts`: middleware o proxy auxiliar del proyecto para controlar rutas o cabeceras.
- `README.md`: descripción general del proyecto y notas de arranque.
- `tailwind.config.js`: configuración de Tailwind CSS.
- `tsconfig.json`: configuración TypeScript del proyecto.

## App

- `app/error.tsx`: pantalla global de error del App Router.
- `app/favicon.ico`: favicon del sitio.
- `app/globals.css`: estilos globales, variables y animaciones base.
- `app/HomeClient.tsx`: home del storefront con filtros, búsqueda, orden y grid de productos.
- `app/layout.tsx`: layout raíz con navbar, drawer de carrito, barra móvil y toasts.
- `app/page.tsx`: entrada server de la home usando `Suspense`.
- `app/admin/layout.tsx`: layout protegido del panel admin con validación de rol.
- `app/admin/page.tsx`: dashboard admin con KPIs y accesos rápidos.
- `app/admin/(auth)/login/page.tsx`: login del panel administrativo.
- `app/admin/catalogo/CatalogManagementClient.tsx`: gestor reutilizable para CRUD modal de categorías y subcategorías.
- `app/admin/catalogo/page.tsx`: pantalla puente del módulo catálogo.
- `app/admin/categorias/page.tsx`: pantalla dedicada al CRUD de categorías.
- `app/admin/pedidos/page.tsx`: historial y gestión visual de pedidos.
- `app/admin/productos/page.tsx`: CRUD completo de productos con tallas, galería y video.
- `app/admin/productos/components/ProductModal.tsx`: modal del formulario de producto.
- `app/admin/productos/components/ProductTable.tsx`: tabla de productos del backoffice.
- `app/admin/subcategorias/page.tsx`: pantalla dedicada al CRUD de subcategorías por categoría.
- `app/api/admin/route.ts`: endpoint auxiliar del panel admin.
- `app/api/categorias/route.ts`: API CRUD de categorías.
- `app/api/email/route.ts`: API server-only para enviar correos de pedido.
- `app/api/pedidos/route.ts`: API que valida y guarda pedidos con su detalle.
- `app/api/productos/route.ts`: API de productos para operaciones administrativas.
- `app/api/subcategorias/route.ts`: API CRUD de subcategorías.
- `app/carrito/page.tsx`: vista del carrito.
- `app/checkout/page.tsx`: checkout invitado con persistencia, email y WhatsApp.
- `app/producto/[id]/page.tsx`: detalle de producto con galería multimedia, tallas y relacionados.
- `app/wishlist/page.tsx`: listado de favoritos guardados localmente.

## Components

- `components/CartBottomBar.tsx`: barra móvil persistente para el carrito.
- `components/CartDrawer.tsx`: drawer lateral del carrito con resumen rápido.
- `components/Navbar.tsx`: navegación superior con categorías, carrito, favoritos y acceso admin.
- `components/ProductImage.tsx`: imagen tolerante a fallos con fallback “Sin imagen”.
- `components/SmartImage.tsx`: variante reutilizable para resolver imágenes con fallback.
- `components/WishlistButton.tsx`: botón para alternar favoritos.

## Lib

- `lib/admin.ts`: helpers administrativos compartidos del panel.
- `lib/adminAuth_eliminar.ts`: código legado de autenticación/admin pendiente de depuración.
- `lib/api.ts`: helpers para respuestas uniformes de API.
- `lib/auth.ts`: utilidades de autenticación cliente con Supabase.
- `lib/authClient.ts`: utilidades client-side para autenticación admin.
- `lib/cart.ts`: utilidades del carrito en `localStorage`.
- `lib/errors.ts`: normalización de errores a mensajes legibles.
- `lib/image.ts`: utilidades para URLs y resolución de imágenes.
- `lib/serverEnv.ts`: lectura segura y validada de variables sensibles del servidor.
- `lib/supabase.ts`: cliente Supabase para navegador.
- `lib/supabaseServer.ts`: cliente Supabase para servidor.
- `lib/text.ts`: utilidades de normalización de texto.
- `lib/toast.tsx`: helpers de notificaciones y confirmaciones.
- `lib/validate.tsx`: validaciones reutilizables de formularios.
- `lib/wishlist.ts`: utilidades de favoritos en `localStorage`.

## Types

- `types/producto.ts`: tipos centrales de producto, categoría, subcategoría y formularios.

## Supabase

- `supabase/migrations/20260421_order_products_updates.sql`: migración para numeración de órdenes y ajustes de pedidos/productos.
- `supabase/migrations/20260422_categories_subcategories_constraints.sql`: migración de constraints e índices entre categorías y subcategorías.

## Public

- `public/file.svg`: asset SVG de ejemplo.
- `public/globe.svg`: asset SVG de ejemplo.
- `public/next.svg`: asset SVG de Next.js.
- `public/vercel.svg`: asset SVG de Vercel.
- `public/window.svg`: asset SVG de ejemplo.
