# Prueba de los puntos contra el emulador

Comprueba, en un Firestore de verdad (el emulador de Firebase), el recuento de
puntos de `src/lib/puntos-servidor.ts`: que el día lo pone el servidor, que los
bravos escritos a mano no cuentan, y que un canje no se gasta dos veces.

No va en `npm test` porque necesita Java y el emulador. Para lanzarla:

```
npx -y firebase-tools emulators:exec --only firestore --project demo-puntos \
  "npx -y vitest run --root scripts/puntos"
```

Las reglas y los números de los puntos están en `src/lib/puntos.ts`; sus
pruebas sin emulador, en `src/lib/puntos.test.ts`.
