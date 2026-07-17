/* ============================================================
   Configuração do projecto Firebase
   ============================================================
   1. Crie um projecto gratuito em https://console.firebase.google.com
   2. Adicione uma "aplicação Web" ao projecto (ícone </>)
   3. Copie os valores fornecidos e substitua-os abaixo
   4. Active o Firestore Database (modo produção) em:
      Compilação → Firestore Database → Criar base de dados
   5. Active a Autenticação por Email/Password em:
      Compilação → Authentication → Sign-in method → Email/Password
   6. Crie o primeiro utilizador administrador em:
      Compilação → Authentication → Users → Adicionar utilizador
   7. Aplique as regras de segurança do ficheiro firestore.rules
      (Firestore Database → Regras → cole o conteúdo → Publicar)
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyDIWueDz7VcBb_TOlmPqGAtMrmsjTo5wzg",
  authDomain: "mdr-mozcommunity.firebaseapp.com",
  projectId: "mdr-mozcommunity",
  storageBucket: "mdr-mozcommunity.firebasestorage.app",
  messagingSenderId: "914554043848",
  appId: "1:914554043848:web:35ddc1c80abb84d26054fd",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
