# Prueba de las reglas de Firestore

Comprueba en el emulador de Firebase que `firestore.rules`:

- deja hacer TODO lo que la app hace de verdad (perfil, escena del día,
  publicar, bravos, comentarios, denuncias, pedidos, panel de admin);
- y bloquea los abusos que antes estaban abiertos (escena del día reescrita,
  bravos a mano, pedidos sin cuenta, publicaciones falseadas...).

No va en `npm test` porque necesita Java y el emulador. Para lanzarla:

```
npx -y firebase-tools emulators:exec --only firestore --project demo-reglas \
  "npx -y vitest run --root scripts/reglas firestore-reglas.test.mjs"
```

(hacen falta `@firebase/rules-unit-testing` y `firebase` instalados).
