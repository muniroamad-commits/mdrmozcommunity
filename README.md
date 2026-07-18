# MDR MozCommunity — Versão Estática (HTML + Firebase)

Esta é a versão 100% estática da plataforma **MDR MozCommunity** — só HTML,
CSS e JavaScript, sem servidor Node.js. Marca e cores (bordô/laranja)
alinhadas com o logótipo da ADIN (Agência de Desenvolvimento Integrado do
Norte). Os dados (reclamações, estados, histórico) ficam guardados no
**Firestore** (base de dados do Firebase) e sincronizados em tempo real
entre qualquer dispositivo. O login administrativo usa o **Firebase
Authentication** — autenticação real, não uma simulação local.

Pode ser publicada em qualquer alojamento de ficheiros estáticos: GitHub
Pages, Netlify, Vercel, Firebase Hosting, etc.

## O que está realmente funcional (não é protótipo)

- Submissão de reclamações grava a sério no Firestore, com código de
  referência e PIN gerados de forma única.
- Localização em cascata real, com três níveis: **Província → Distrito →
  Posto Administrativo**, com dados do Instituto Nacional de Estatística
  de Moçambique para Cabo Delgado, Nampula e Niassa.
- Acompanhamento de caso consulta o Firestore em tempo real.
- Login administrativo usa Firebase Authentication (crie utilizadores em
  Firebase Console → Authentication → Users).
- Painel de gestão lista, filtra, pesquisa e actualiza casos a sério —
  cada actualização fica gravada e visível imediatamente em "Acompanhar
  Preocupação" (se marcada como pública).
- Estatísticas públicas são calculadas a partir de dados reais gravados,
  não valores fixos.
- Anexos (imagens) são gravados e podem ser descarregados a partir do
  painel administrativo.


## Âmbito dos dados de referência

As províncias, distritos e componentes já vêm configurados de acordo com o
projecto do Banco Mundial **"Jobs, Social Cohesion and Community Resilience
in Northern Mozambique - Phase I"** (P514199):

- **Províncias/distritos:** Cabo Delgado, Nampula e Niassa (as três
  províncias abrangidas pelo programa), incluindo as respectivas capitais.
- **Componentes** (em vez de "projectos"):
  1. Fortalecimento da Colaboração entre Comunidades e Governo
  2. Melhoria do Acesso a Oportunidades Económicas e Emprego
  3. Melhoria do Acesso a Infraestrutura Resiliente ao Clima
  4. Gestão do Projecto, Coordenação e Agenda de Aprendizagem
  5. Resposta de Emergência Contingente (CERC)
  6. Outro / Não relacionado a uma componente específica

Para adaptar a outro projecto, edite as constantes `LOCATIONS` e `PROJECTS`
em `js/store.js`.

## Passo a passo: configurar o Firebase (gratuito)

### 1. Criar o projecto
Vá a [console.firebase.google.com](https://console.firebase.google.com) →
"Adicionar projecto" → siga o assistente (pode desactivar o Google
Analytics, não é necessário).

### 2. Adicionar uma aplicação Web
No painel do projecto, clique no ícone `</>` ("Web") → dê um nome à
aplicação → **não** marque "Firebase Hosting" nesta etapa (a menos que
queira usar o Firebase Hosting para publicar o site também, o que é
opcional e igualmente gratuito).

Vai receber um bloco de código com um objecto `firebaseConfig`. Copie os
valores para `js/firebase-config.js`, substituindo os valores de exemplo.

### 3. Activar o Firestore
Menu lateral → **Compilação → Firestore Database → Criar base de dados**.
Escolha "modo de produção" (as regras de segurança fornecidas tratam do
controlo de acesso) e a região mais próxima (ex: `europe-west` se não
houver região em África).

### 4. Aplicar as regras de segurança
Separador **Regras** dentro do Firestore Database → apague o conteúdo
existente → cole o conteúdo do ficheiro `firestore.rules` → **Publicar**.

### 5. Activar a autenticação
Menu lateral → **Compilação → Authentication → Sign-in method** → active o
fornecedor **Email/Password**.

### 6. Criar o primeiro utilizador administrativo
Ainda em Authentication → separador **Users** → **Add user** → introduza o
email e a password da primeira pessoa que vai gerir os casos. Repita para
cada membro da equipa.

Pronto — a plataforma já está funcional.

## Como testar localmente

Não pode simplesmente abrir os ficheiros `.html` a fazer duplo-clique
(`file://`), porque os pedidos ao Firebase exigem que a página seja servida
por `http://`. A forma mais simples:

```bash
cd static-site-firebase
python3 -m http.server 8000
```

Depois abra `http://localhost:8000` no browser.

(Qualquer outro servidor estático simples funciona igualmente — `npx serve`,
a extensão "Live Server" do VS Code, etc.)

## Como publicar

### Opção A: GitHub Pages
1. Crie um repositório no GitHub e envie o conteúdo desta pasta.
2. Definições do repositório → **Pages** → escolha o branch `main` e a
   pasta raiz.
3. O site fica disponível em `https://<utilizador>.github.io/<repo>/`.

### Opção B: Netlify
1. Arraste esta pasta para [app.netlify.com/drop](https://app.netlify.com/drop),
   ou ligue o repositório GitHub para publicação contínua.

Em ambos os casos, não é preciso nenhuma configuração de build — são
ficheiros estáticos simples.

## Estrutura

```
static-site-firebase/
├── index.html
├── submeter.html          # Apresentar Preocupação
├── acompanhar.html        # Acompanhar Preocupação
├── estatisticas.html      # Estatísticas públicas
├── admin/
│   ├── login.html
│   └── dashboard.html     # Painel de gestão
├── css/style.css
├── js/
│   ├── firebase-config.js # ← preencha com os dados do seu projecto Firebase
│   └── store.js           # toda a lógica de dados (Firestore + Auth)
└── firestore.rules        # regras de segurança a colar no Firebase Console
```

## Limitações desta arquitectura (importante)

- **Anexos:** ficam guardados como texto (base64) dentro do próprio
  documento Firestore, que tem um limite de 1MB. Por isso o limite é baixo
  (2 ficheiros, ~250KB cada). Para anexos maiores/mais numerosos, seria
  necessário adicionar o Firebase Storage (passo adicional, requer plano
  Blaze/pré-pago do Firebase, embora com camada gratuita generosa).
- **PIN de acesso:** fica guardado em texto simples no documento da
  reclamação (não cifrado), porque as regras do Firestore não conseguem
  verificar um hash. Continua a servir como segunda barreira além do código
  de referência (que também é aleatório), mas não é equivalente à
  segurança de um backend com hashing de password.
- **Estatísticas públicas:** para evitar expor nomes/contactos, é mantida
  uma colecção espelho (`complaints_public`) só com estado, província,
  componente e datas. Isto significa duas escritas por submissão — normal
  e sem impacto perceptível para o utilizador.
- **Custos:** o Firebase tem uma camada gratuita generosa (plano Spark) —
  suficiente para uma plataforma deste porte. Se o volume crescer muito,
  pode ser necessário migrar para o plano pago (Blaze), que só cobra acima
  dos limites gratuitos.

## Gratuito para sempre?

O plano Spark (gratuito) do Firebase inclui, por dia: 50 mil leituras, 20 mil
escritas, 20 mil eliminações no Firestore, e 10 GB de tráfego de
Authentication/Hosting por mês. Para um mecanismo de reclamações comunitário
típico, isto é normalmente suficiente. Consulte
[firebase.google.com/pricing](https://firebase.google.com/pricing) para os
valores actualizados.

## Níveis de acesso (Administrador geral / Gestor provincial / Só leitura)

A plataforma tem três níveis de acesso, geridos a partir do próprio painel
(em **"Utilizadores"**, visível só para Administrador geral):

- **Administrador geral** — vê e edita todos os casos, de todas as províncias.
- **Gestor provincial** — só vê e só pode editar casos da província atribuída.
- **Só leitura** — vê todos os casos mas não pode alterar estado nem prioridade.

Estas regras são aplicadas a sério no Firestore (não só escondidas na
interface) — um "Gestor provincial" não consegue editar casos de outra
província mesmo tentando directamente pela consola do browser.

### Arranque inicial (só uma vez)

As regras de segurança exigem que exista pelo menos um "Administrador geral"
antes de conseguires gerir mais ninguém a partir do site — por isso este
primeiro utilizador tem de ser criado manualmente, directamente no Firestore:

1. Cria a tua conta de login normalmente: **Firebase Console → Authentication
   → Users → Add user**.
2. Copia o **User UID** gerado (aparece na tabela de utilizadores).
3. Vai a **Firestore Database → Dados** → clica em **"Iniciar coleção"**.
4. Nome da coleção: `admins`
5. ID do documento: cola o **User UID** que copiaste.
6. Adiciona os campos:
   - `role` (string) → `admin`
   - `name` (string) → o teu nome
   - `province` (string) → deixa vazio ou apaga o campo
7. Guarda.

A partir daqui, entra na plataforma com essa conta e usa o ecrã
**"Utilizadores"** no painel para adicionar todos os outros — já não precisas
de voltar a mexer directamente no Firestore.

### Adicionar uma nova pessoa à equipa

1. Cria a conta de login dela em Firebase Console → Authentication → Users
   → Add user (email + password).
2. Copia o User UID gerado.
3. No painel da plataforma, vai a **"Utilizadores"** → cola o UID → escolhe o
   nível de acesso (e a província, se for "Gestor provincial") → Guardar.

### Remover o acesso de alguém

No ecrã "Utilizadores", clica em "Remover acesso" — isto retira as
permissões dela na plataforma imediatamente. A conta de login continua a
existir no Firebase (para eliminar a conta por completo, faz isso em
Authentication → Users).

## Fluxo de aprovação de casos

Cada caso passa pelos seguintes estados, com acções específicas por nível de acesso:

1. **Recebida** — criada automaticamente quando alguém submete o formulário público.
2. **Registada** — a equipa provincial (ou o administrador) confirma que recebeu e regista o caso.
3. **Aprovada (Procedente) / Não Procedente** — decisão exclusiva do
   **Administrador geral**: valida se o caso deve avançar ou não.
4. **Em resolução** — depois de aprovado, a equipa provincial dá seguimento ao caso.
5. **Resolvida** — a equipa provincial marca o trabalho como concluído.
6. **Encerrada** — fecho formal do caso, exclusivo do **Administrador geral**,
   quer o caso tenha sido aprovado ou marcado como não procedente.

Estas regras são aplicadas tanto na interface (só aparecem os botões que a
pessoa pode usar) como no Firestore (mesmo que alguém tente contornar a
interface, o servidor recusa a alteração).

## Tipos de preocupação

O formulário público pede à pessoa para classificar a preocupação como:
Sugestão, Pedido de informação, Elogio, Reclamação, ou VBG/PSEA (Violência
Baseada no Género / Prevenção de Exploração e Abuso Sexual). Casos VBG/PSEA
mostram uma nota a incentivar contacto directo pela linha de emergência, dada
a sensibilidade do tema.

## Domínio

Este site está preparado para ser publicado em `adin.mdr.mz`. Quando o
domínio estiver activo:
1. Configura o domínio personalizado no serviço de alojamento escolhido
   (GitHub Pages → Settings → Pages → Custom domain).
2. Volta ao **Firebase Console → Authentication → Configurações → Domínios
   autorizados** e adiciona `adin.mdr.mz` — sem isto, o login administrativo
   não funciona nesse domínio (é o mesmo passo que fizeste para
   `muniroamad.github.io`).

## Linha de emergência

O número de telefone da linha nacional está temporariamente marcado como
`XXX` em `index.html` — substitui pelo número real assim que estiver
disponível (procura por `Linha Nacional` no ficheiro).

## Fila confidencial de VBG/PSEA

Quando alguém selecciona "VBG/PSEA" como tipo de preocupação no formulário
público, o caso:

- É gravado numa colecção Firestore **completamente separada** (`complaints_sensitive`),
  não na colecção geral de casos.
- Recebe automaticamente **prioridade urgente**.
- **Nunca aparece** na lista geral de casos do painel, nem nas estatísticas
  públicas — mesmo agregadas.
- Só é visível a quem tiver acesso explicitamente atribuído em "Gestão de
  Utilizadores" (opção "Acesso à fila confidencial de VBG/PSEA"), além do
  **Administrador geral**, que tem sempre acesso.
- Tem a sua própria página, `admin/vbg.html`, acessível pelo link "VBG/PSEA"
  (a vermelho) no menu — que só aparece para quem tem esse acesso.

A pessoa que submeteu o caso continua a poder acompanhá-lo normalmente em
"Acompanhar Preocupação", com o código de referência e o PIN — isso não
muda, independentemente do tipo de caso.

Isto é aplicado nas regras do Firestore (`allow list: if isVbgAuthorized();`
na colecção `complaints_sensitive`), não só escondido na interface.

## Nível "Gestor de Casos VBG/PSEA"

Além de Administrador geral, Gestor provincial e Só leitura, existe um
quarto nível de acesso dedicado: **Gestor de Casos VBG/PSEA**. Uma pessoa
com este nível:

- Ao entrar, é levada directamente para a fila confidencial
  (`admin/vbg.html`), não para o painel geral de casos.
- Não tem acesso ao painel geral de casos nem a "Gestão de Utilizadores".
- Pode gerir todo o fluxo dos casos VBG/PSEA (registar, aprovar/rejeitar,
  dar seguimento, encerrar).

Se preferires dar acesso à fila confidencial a alguém que também precisa de
gerir os casos normais (por exemplo, um Gestor provincial que também deve
ver os casos VBG da sua zona), usa em vez disso a opção "Dar também acesso
à fila confidencial de VBG/PSEA", que aparece por baixo do nível de acesso
no formulário de utilizadores.

## Correcção: acesso a VBG/PSEA é sempre uma marcação explícita

O acesso à fila confidencial de VBG/PSEA **não é um nível de acesso à
parte** — é uma marcação adicional ("Gestor de Casos VBG/PSEA") que se
liga a qualquer um dos três níveis (Administrador geral, Gestor provincial,
Só leitura). Isto significa:

- Uma pessoa marcada como Gestor de Casos VBG/PSEA continua a ter acesso
  aos casos normais de acordo com o seu nível de acesso principal — **não**
  fica limitada só à fila confidencial.
- O botão "Casos VBG/PSEA" só aparece para quem tiver essa marcação
  explicitamente atribuída em "Gestão de Utilizadores" — **incluindo o
  Administrador geral**, que só o vê se também lhe atribuíres essa marcação.
  Não há nenhum acesso automático por defeito para ninguém.
