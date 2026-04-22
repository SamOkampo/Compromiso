# Feria de las Habilidades - Compromiso

SPA para explicar el valor del compromiso en administración y una página separada para activar el diagnóstico interactivo. La experiencia tiene una página informativa (`index.html`) y un simulador (`simulador.html`) con radar, reto sugerido y envío de correo mediante Resend.

## Archivos

- `index.html`: página principal informativa con teoría, impacto en gestión, dimensiones de vida y casos prácticos.
- `simulador.html`: diagnóstico interactivo 101%, gráfica radar, reinicio para la feria y formulario de correo automático.
- `api/commitment.js`: función serverless Node.js para enviar el correo con Resend.
- `.env.example`: variables necesarias para configurar el envío.
- `package.json`: dependencia de Resend y comando de desarrollo con Vercel.

## Configuración

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` a partir de `.env.example`:

```bash
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL="Feria de las Habilidades <compromiso@tudominio.edu>"
```

3. Ejecutar en local con funciones serverless:

```bash
npm run dev
```

4. Abrir la URL local que indique Vercel. La página principal es `index.html` y el botón "Ingresar al simulador" abre `simulador.html`.

Para envío real, Resend requiere una API key activa y un remitente permitido por la cuenta o dominio verificado.
