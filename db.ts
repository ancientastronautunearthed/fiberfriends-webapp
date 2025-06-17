// server/db.ts

import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: "fiber-friends",
    private_key_id: "aa4502533369530caf39c08e0cbc241f67591a6e",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDH+apr/00vqt1S\nJj5V2PUfFXxw8n9ydWhgN+R8lLmEOaHuBxUChUqGCx67/kr6DB7/+jXOJLyhIrbT\neGjZJYS2DrJk5c9dS3E34E7M4ISo5eAKBDziLefAHkoD8ARPoRF9DqwkOxWjBdLc\n1nW2oSZFqTFbiErIwqh4b8QZvWJv0bcdnYxQRFUBr2CWjmpB7ocup30yDnwjejDU\nvw01DlQkaCSyaOAntxZTFdN1rrMFOv9NxgDhelvjKoPZ5YExgkVDnkD+6hwNccru\nElpf7UzUed4tpFsV7JlsfRN84SrIigbJUfU/mv0QyTt2euzah89/mP0drBMwXHH7\n8jmhNsdjAgMBAAECggEAHDhi8O+r1FS/++ZSuKmv2c2d7JCEJMJl0uJAV8ZjMcIy\nVFVihSMLQ8RQ94WozgWk4EnOiwNLLVApTcl5vl8ZjdmgGjYGH+vUE+cPJ8FtZypd\nhfxYHTEOOeHsXwbhjN01ixjleQ1vfbyGJ80J+pZeQMliIkEnEJLL1IctPNapjA7j\nh42CdTaYSby4raPBb6NZKOffGdZl88pV+88mQgNGXfyM34lKTX9ilINjSDsGAgpH\ndX4IRfpv4wsv0LIB8Sc4FGlYnppDysxEN8bE6FBugYccgzklKKzLgrzH533Sorrv\nVt5WA/MeduT2HgsuMyvi9KjW7Q+mYrevxQ72CKd7PQKBgQD9+pAFcWOEC4Jt/meK\nUp/pdy7V1ccpUtqECZk5EVPSFK3GX9dujNRYUclCD3xmPWY78PxbYDScMzmgzxcm\n3i9xR3DTB8cAcaPYLgbxo7lImnEnSv4p+YQkB5vxnT3Y/69CmeLQhLzzEj4dN/H9\nJvo2Z9YUn+0CIX+nC0K872el9QKBgQDJkRSVwaH0XoQElx2dFxNbwvxCR9KvYtKH\nmeo3s1wp3X2kXWL1mo/rxuwp4s3bGK1KjwcFGR65Ney9H6d1WchL1ikqe4jZZVsh\nZ2Yx6Yw5bdkaeCU4KRnFxr+YCFzwawtmAkv6omT0XKTqbUdJPKoXWsfcTQNpEiBx\ngztTIS4I9wKBgHPeexQwndEhGxkpZn1hopj1icV+qUT+CrkQU/oIILCIRJtrIDLM\nRxgf/+yGeh9+xYR1NfxOENJuQE1QDWTrGsPYbu2n768RKUm3/e0B38byxsrBWOE3\nd4SkgA2jyhKU25VL9YFh/X37haD45Aq1XJOznaR9Lbi6Ja3E4mal5ih9AoGABVk3\nLZ4cuQpFAIYt//wbxGSRIwUa3xKFOZno8B9vQ6Ef81uTA6ddSElX/OiKw9SMzJys\n+AKpoQqARKhxXhjKytBc+Uab5ADfgSxoNszWrrNuflhPzISyrV/Pt64JIUwF2mgX\nMghbG2zV526M5LGaZdI/2WWlwIT9nWV5DoSj3xMCgYBIFQQD2WaNhp/l+JpV59Fi\nGWLUDguGeqGjJYhJPT5uDbKdwc9sSifDahdt6DSyg9thKUs6JxQVem9D96KUqW/H\n/hnos4LmwhDyLDWhEg2WrwX56wmlNpEqRWE+BBB0fCpYbUxjE665AL60Rk6tu87m\nRejAF6j1VgL9aLJLD+ving==\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-fbsvc@fiber-friends.iam.gserviceaccount.com",
    client_id: "105958558658226684281",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40fiber-friends.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    projectId: "fiber-friends",
  });
}

export const adminDb = admin.firestore();