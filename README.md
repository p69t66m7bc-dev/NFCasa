# NFCasa v5

Versió amb supermercats més subtils a la vista completa i identificació pastel per botiga.

# NFCasa · Llista de la compra familiar v3

Aplicació PWA feta amb **HTML, CSS i JavaScript Vanilla**, Firebase Authentication anònima i Cloud Firestore.

## Què inclou aquesta versió

- Afegir productes directament des de cada categoria, sense una pantalla extra.
- Productes freqüents compartits amb tota la família.
- Avís si intentes afegir un duplicat a la mateixa categoria.
- Editar nom/categoria i eliminar manualment qualsevol producte.
- Pantalla inicial amb resum de pendents per categories.
- "Fer la compra" obre directament tota la compra.
- Filtres ràpids per categoria sense sortir de la pantalla.
- Els productes marcats baixen a "Ja ho tens", però NO desapareixen.
- Comptador de pendents i marcats.
- "Finalitzar compra" només s'activa si hi ha productes marcats.
- Vibració curta en mòbils compatibles.
- Categories buides més discretes a "Tota la llista".
- L'usuari actual és visible a la capçalera.
- El Service Worker no s'activa a localhost/127.0.0.1 per evitar problemes de memòria cau durant el desenvolupament.

## Estructura

```text
llista-compra-nfc-v3/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── firestore.rules
├── firebase.json
├── branding/
│   ├── logo-nfcasa.png
│   └── logo-mark.png
├── css/
│   └── styles.css
├── icons/
│   ├── icon-64.png
│   ├── icon-192.png
│   └── icon-512.png
└── js/
    ├── app.js
    ├── auth.js
    ├── config.js
    ├── constants.js
    ├── firebase.js
    ├── helpers.js
    ├── store.js
    └── ui.js
```

## Identitat visual

Aquesta versió incorpora la nova identitat de **NFCasa**:

- `branding/logo-nfcasa.png`: logotip principal, utilitzat a la pantalla inicial.
- `branding/logo-mark.png`: símbol compacte de casa + check, utilitzat a la capçalera.
- `icons/icon-192.png` i `icons/icon-512.png`: icones PWA preparades per instal·lar l'app al mòbil.
- `icons/icon-64.png`: favicon del navegador.

Si més endavant canvies de logotip, només cal substituir aquests fitxers mantenint els mateixos noms.

## Executar a Visual Studio Code

1. Obre la carpeta del projecte a VS Code.
2. Instal·la l'extensió **Live Server** si encara no la tens.
3. Clic dret a `index.html` → **Open with Live Server**.
4. Obre `http://127.0.0.1:5500` o l'adreça que indiqui Live Server.

La primera vegada només cal seleccionar **Anna, Pau, Mama o Papa**. Aquesta selecció queda guardada al dispositiu.

## Firebase

Aquest projecte ja porta la configuració web del projecte `nfcasa-85aee` a `js/config.js`.

Cal tenir:

- Authentication → **Anònim** habilitat.
- Cloud Firestore creat.
- Les regles de `firestore.rules` publicades.

No cal crear manualment les col·leccions. L'app crearà `productes` i `suggeriments` quan sigui necessari.

## Publicar a GitHub Pages

1. Crea un repositori a GitHub, per exemple `llista-compra-nfc`.
2. Puja **el contingut de la carpeta**, amb `index.html` a l'arrel.
3. A GitHub: **Settings → Pages**.
4. Source: **Deploy from a branch**.
5. Branch: **main** i carpeta **/ (root)**.
6. Desa.

La URL serà semblant a:

```text
https://EL-TEU-USUARI.github.io/llista-compra-nfc/
```

Aquesta és la URL que pots gravar a l'etiqueta NFC.

## Nota de seguretat

La interfície no mostra cap login. Firebase crea una identitat anònima automàticament per cada navegador/dispositiu. Les regles actuals permeten accés a qualsevol sessió autenticada anònimament, per tant la URL s'ha de tractar com una app familiar privada. Si més endavant vols blindar-la més, el següent pas seria afegir Firebase App Check o una capa d'accés familiar.


## Categories actuals

- Carnisseria
- Peixateria
- Farmàcia
- Xinos
- Supermercat
  - Mercadona
  - Novavenda
  - Esclat

Els productes de supermercat es guarden associats a la botiga concreta. La vista de compra permet filtrar primer per **Supermercat** i després per **Mercadona, Novavenda o Esclat**.


## Ajust de la v5.2
- S'ha eliminat el logotip gran de la pantalla "Qui ets?".
- La icona/branding visual es reserva principalment per a la capçalera i la PWA.
