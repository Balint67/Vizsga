# ForgeX REST API

Ez a mappa tartalmazza a vizsgaremek szerveroldali komponenset.

## Feladat

Az Express szerver REST API vegpontokon keresztul kezeli a Firestore-ban tarolt foglalasokat es ertekeleseket. A kliens Firebase Auth tokennel azonositja a bejelentkezett felhasznalot, a szerver pedig Firebase Admin SDK-val ellenorzi a tokent.

## Inditas

1. Firebase Console: Project settings -> Service accounts -> Generate new private key.
2. A letoltott fajlt tedd ide: `server/serviceAccountKey.json`.
3. Masold a `server/.env.example` fajlt `server/.env` neven.
4. Inditsd el az API-t:

```bash
npm run api
```

Az API alapertelmezett cime: `http://localhost:3000/api`.

## Vegpontok

- `GET /api/health`
- `GET /api/reviews`
- `POST /api/reviews`
- `DELETE /api/reviews/:id`
- `GET /api/bookings`
- `POST /api/bookings`
- `DELETE /api/bookings/:id`

Az iras, torles es a sajat foglalasok lekerdezese Firebase ID tokent var az `Authorization: Bearer <token>` headerben.
