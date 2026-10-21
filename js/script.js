// CONFIGURAÇÃO DA SUA SENHA GLOBAL
const SENHA_SITE = "lua123"; // <- Troque pela senha que preferir!

// Bloqueio imediato ao carregar o site
document.addEventListener('DOMContentLoaded', () => {
    protegerSite();
    
    // Inicializações padrão do seu site
    carregarPerfil();
    carregarPosts();
    carregarWishlist();
    carregarCursos();
    carregarLivrosNuvem();
    configurarToolbarEditor();
});

function protegerSite() {
    let acessoLiberado = sessionStorage.getItem('grimorio_acesso_liberado');

    while (acessoLiberado !== 'true') {
        const senhaDigitada = prompt("🔮 Este Grimório é protegido. Digite a senha para entrar:");

        if (senhaDigitada === SENHA_SITE) {
            sessionStorage.setItem('grimorio_acesso_liberado', 'true');
            alert("Boas-vindas ao Grimório ✦");
            acessoLiberado = 'true';
        } else if (senhaDigitada === null) {
            // Se clicar em Cancelar, esconde o conteúdo do site
            document.body.innerHTML = `
                <div style="background-color: #140d1a; color: #e6c885; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 2rem;">
                    <h1>🔒 Acesso Restrito</h1>
                    <p style="color: #f0eaee; margin-bottom: 2rem;">Você precisa da senha para visualizar este Grimório.</p>
                    <button onclick="location.reload()" style="background: transparent; border: 1px solid #e6c885; color: #e6c885; padding: 0.8rem 1.5rem; cursor: pointer; border-radius: 4px;">Tentar Novamente</button>
                </div>
            `;
            break;
        } else {
            alert("Senha incorreta!");
        }
    }
}


// VARIÁVEIS DE CONTROLE DE EDIÇÃO E NAVEGAÇÃO
let postEditandoIndex = null;
let wishlistEditandoIndex = null;
let cursoEditandoIndex = null;
let livroEditandoIndex = null;
let categoriaAtualBiblioteca = 'Todos';
let termoBuscaBiblioteca = '';

// CONFIGURAÇÃO DA SUA SENHA 
const SENHA_MEUS_ESCRITOS = "lua123"; 
let escritosDesbloqueados = false; // Guarda se você já digitou a senha nesta sessão

// 1. NAVEGAÇÃO ENTRE TELAS DO SITE (COM PROTEÇÃO SIMPLES)
function mudarSecao(idSecao) {
    const secoesProtegidas = ['meus-escritos', 'indice-livro', 'leitura-capitulo'];

    // Se a pessoa tentar acessar "Meus Escritos" e ainda não digitou a senha
    if (secoesProtegidas.includes(idSecao) && !escritosDesbloqueados) {
        const senhaDigitada = prompt("🔮 Esta área é reservada. Digite a senha para acessar Meus Escritos:");

        if (senhaDigitada === SENHA_MEUS_ESCRITOS) {
            escritosDesbloqueados = true; // Libera o acesso enquanto a aba estiver aberta
            alert("Acesso concedido ✦");
        } else if (senhaDigitada !== null) {
            alert("Senha incorreta! Acesso negado.");
            return; // Impede de abrir a tela
        } else {
            return; // Se clicar em "Cancelar"
        }
    }

    // Navegação normal
    let secoes = document.querySelectorAll('.secao');
    secoes.forEach(secao => {
        secao.classList.remove('ativa');
    });
    
    const elementoAlvo = document.getElementById(idSecao);
    if (elementoAlvo) {
        elementoAlvo.classList.add('ativa');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. INICIALIZAÇÃO E CONEXÃO DE EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    carregarPerfil();
    carregarPosts();
    carregarWishlist();
    carregarCursos();
    carregarLivrosNuvem();

    // Botões de formulários
    const btnPublicarPost = document.querySelector('#editor-post .botoes-acao button:last-child');
    if (btnPublicarPost) btnPublicarPost.addEventListener('click', salvarPost);

    const btnSalvarWishlist = document.querySelector('#novo-item-wishlist .botoes-acao button:last-child');
    if (btnSalvarWishlist) btnSalvarWishlist.addEventListener('click', salvarWishlist);

    const btnSalvarCurso = document.querySelector('#novo-curso .botoes-acao button:last-child');
    if (btnSalvarCurso) btnSalvarCurso.addEventListener('click', salvarCurso);

    configurarToolbarEditor();
});

// 3. PERFIL & FOTO
function carregarPerfil() {
    const fotoSalva = localStorage.getItem('grimorio_foto_perfil');
    const containerFoto = document.getElementById('avatar-perfil');

    if (containerFoto) {
        if (fotoSalva && fotoSalva.trim() !== '') {
            containerFoto.innerHTML = `<img src="${fotoSalva}" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            containerFoto.innerHTML = '🔮';
        }
    }
}

function alterarFotoPerfil() {
    const fotoAtual = localStorage.getItem('grimorio_foto_perfil') || '';
    const novaUrl = prompt('Cole a URL da sua foto de perfil (link da imagem):', fotoAtual);

    if (novaUrl !== null) {
        if (novaUrl.trim() === '') {
            localStorage.removeItem('grimorio_foto_perfil');
        } else {
            localStorage.setItem('grimorio_foto_perfil', novaUrl.trim());
        }
        carregarPerfil();
    }
}

// 4. EDITOR DE TEXTO RICO
function configurarToolbarEditor() {
    const botoes = document.querySelectorAll('#editor-post .editor-btn');
    if (botoes.length >= 5) {
        botoes[0].onclick = () => formatarTexto('bold');
        botoes[1].onclick = () => formatarTexto('italic');
        botoes[2].onclick = () => formatarTexto('insertUnorderedList');
        botoes[3].onclick = () => formatarTexto('formatBlock', 'BLOCKQUOTE');
        botoes[4].onclick = () => inserirDivisor();
    }
}

function formatarTexto(comando, valor = null) {
    document.execCommand(comando, false, valor);
    const area = document.querySelector('#editor-post .editor-area');
    if (area) area.focus();
}

function inserirDivisor() {
    let htmlDivisor = '<div style="text-align: center; color: #e6c885; margin: 2rem 0; letter-spacing: 5px;">❖ ─── ✦ ─── ❖</div><br>';
    document.execCommand('insertHTML', false, htmlDivisor);
    const area = document.querySelector('#editor-post .editor-area');
    if (area) area.focus();
}

// 5. MÓDULO DE POSTS (FEED DO BLOG)
function salvarPost() {
    const container = document.getElementById('editor-post');
    const inputTitulo = container.querySelector('.grupo-campo input');
    const selectCategoria = container.querySelector('select');
    const inputTags = container.querySelectorAll('.campo input')[0];
    const areaConteudo = container.querySelector('.editor-area');

    const titulo = inputTitulo.value.trim();
    const categoria = selectCategoria.options[selectCategoria.selectedIndex].text;
    const tags = inputTags.value.trim();
    const conteudo = areaConteudo.innerHTML.trim();

    if (!titulo || areaConteudo.innerText.trim() === '') {
        alert('Por favor, preencha o título e o conteúdo do registro.');
        return;
    }

    const hoje = new Date();
    const opcoesData = { day: 'numeric', month: 'long', year: 'numeric' };
    const dataFormatada = hoje.toLocaleDateString('pt-BR', opcoesData);

    const postData = {
        titulo: titulo,
        categoria: categoria === 'Selecione...' ? 'Geral' : categoria,
        tags: tags || 'Anotações',
        conteudo: conteudo,
        data: dataFormatada
    };

    let posts = JSON.parse(localStorage.getItem('grimorio_posts')) || [];

    if (postEditandoIndex !== null) {
        posts[postEditandoIndex] = postData;
        postEditandoIndex = null;
    } else {
        posts.unshift(postData);
    }

    localStorage.setItem('grimorio_posts', JSON.stringify(posts));

    inputTitulo.value = '';
    selectCategoria.selectedIndex = 0;
    inputTags.value = '';
    areaConteudo.innerHTML = '';

    carregarPosts();
    mudarSecao('feed');
}

function carregarPosts() {
    const posts = JSON.parse(localStorage.getItem('grimorio_posts')) || [];
    const containerFeed = document.getElementById('feed');

    if (!containerFeed) return;

    if (posts.length === 0) {
        containerFeed.innerHTML = `
            <div class="post-card">
                <div class="post-meta">20 de Outubro de 2026 ✦ Feitiços ✦ Banimento</div>
                <h2 class="post-titulo">Banimento com Louro</h2>
                <p>Um ritual simples e poderoso utilizando o fogo e a fumaça do louro para limpar energias estagnadas e afastar influências indesejadas do ambiente. Ideal para ser feito na lua minguante.</p>
                <button class="btn-ler" onclick="mudarSecao('leitura-post')">Ler registro completo →</button>
            </div>
        `;
    } else {
        containerFeed.innerHTML = '';
        posts.forEach((post, index) => {
            const textoLimpo = post.conteudo.replace(/<[^>]*>?/gm, '');
            const resumo = textoLimpo.length > 180 ? textoLimpo.substring(0, 180) + '...' : textoLimpo;

            containerFeed.innerHTML += `
                <div class="post-card">
                    <div class="post-meta">${post.data} ✦ ${post.categoria} ✦ ${post.tags}</div>
                    <h2 class="post-titulo">${post.titulo}</h2>
                    <p>${resumo}</p>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                        <button class="btn-ler" style="margin-top: 0;" onclick="lerPost(${index})">Ler registro completo →</button>
                        <button class="btn-ler" style="margin-top: 0;" onclick="editarPost(${index})">✏️ Editar</button>
                        <button class="btn-ler" style="margin-top: 0; border-color: rgba(229, 115, 115, 0.5); color: #e57373;" onclick="excluirPost(${index})">🗑️ Excluir</button>
                    </div>
                </div>
            `;
        });
    }
}

function lerPost(index) {
    const posts = JSON.parse(localStorage.getItem('grimorio_posts')) || [];
    const post = posts[index];

    if (!post) return;

    const containerLeitura = document.getElementById('leitura-post');
    containerLeitura.innerHTML = `
        <div class="post-meta" style="text-align: center;">${post.data} ✦ ${post.categoria}</div>
        <h1 style="text-align: center; margin-bottom: 2rem;">${post.titulo}</h1>
        <div>${post.conteudo}</div>
        <button class="btn-ler" onclick="mudarSecao('feed')" style="margin-top: 3rem;">← Voltar para o Início</button>
    `;

    mudarSecao('leitura-post');
}

function editarPost(index) {
    const posts = JSON.parse(localStorage.getItem('grimorio_posts')) || [];
    const post = posts[index];

    if (!post) return;

    postEditandoIndex = index;

    const container = document.getElementById('editor-post');
    container.querySelector('.grupo-campo input').value = post.titulo;
    container.querySelectorAll('.campo input')[0].value = post.tags;
    container.querySelector('.editor-area').innerHTML = post.conteudo;

    const select = container.querySelector('select');
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text === post.categoria) {
            select.selectedIndex = i;
            break;
        }
    }

    mudarSecao('editor-post');
}

function excluirPost(index) {
    const posts = JSON.parse(localStorage.getItem('grimorio_posts')) || [];
    if (confirm(`Tem certeza que deseja remover o registro "${posts[index].titulo}"?`)) {
        posts.splice(index, 1);
        localStorage.setItem('grimorio_posts', JSON.stringify(posts));
        carregarPosts();
    }
}

// 6. MÓDULO DA BIBLIOTECA VIRTUAL (NUVEM, BUSCA E ETIQUETAS)
function filtrarBiblioteca(categoriaOuTag) {
    categoriaAtualBiblioteca = categoriaOuTag;

    const links = document.querySelectorAll('.cat-pdf-link');
    links.forEach(link => {
        if (link.innerText.includes(categoriaOuTag) || (categoriaOuTag === 'Todos' && link.innerText.includes('Todos'))) {
            link.style.color = 'var(--dourado)';
        } else {
            link.style.color = 'var(--texto-principal)';
        }
    });

    const tituloCat = document.getElementById('categoria-atual-titulo');
    if (tituloCat) {
        tituloCat.innerText = categoriaOuTag === 'Todos' ? 'Mostrando: Todos os PDFs' : `Mostrando: ${categoriaOuTag}`;
    }

    carregarLivrosNuvem();
}

function filtrarBibliotecaPorBusca(termo) {
    termoBuscaBiblioteca = termo.toLowerCase().trim();
    carregarLivrosNuvem();
}

function salvarLivroNuvem() {
    const titleInput = document.getElementById('pdf-title-input');
    const linkInput = document.getElementById('pdf-link-input');
    const categorySelect = document.getElementById('pdf-category-select');
    const tagInput = document.getElementById('pdf-tag-input');

    const titulo = titleInput.value.trim();
    const link = linkInput.value.trim();
    const categoria = categorySelect ? categorySelect.value : 'Geral';
    const rawTags = tagInput.value.trim();

    if (!titulo || !link) {
        alert('Por favor, preencha o título e o link do arquivo no Drive.');
        return;
    }

    const arrayTags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(t => t !== '') : [];

    const livro = {
        titulo: titulo,
        link: link,
        categoria: categoria,
        tags: arrayTags
    };

    let acervo = JSON.parse(localStorage.getItem('grimorio_livros_nuvem')) || [];

    if (livroEditandoIndex !== null) {
        acervo[livroEditandoIndex] = livro;
        livroEditandoIndex = null;
    } else {
        acervo.push(livro);
    }

    localStorage.setItem('grimorio_livros_nuvem', JSON.stringify(acervo));

    titleInput.value = '';
    linkInput.value = '';
    tagInput.value = '';
    if (categorySelect) categorySelect.selectedIndex = 0;

    carregarLivrosNuvem();
    mudarSecao('biblioteca');
}

function carregarLivrosNuvem() {
    const acervoTotal = JSON.parse(localStorage.getItem('grimorio_livros_nuvem')) || [];
    const containerLista = document.getElementById('lista-livros-pdfs');

    if (!containerLista) return;

    let acervo = acervoTotal.filter(item => {
        const ehCategoria = categoriaAtualBiblioteca === 'Todos' || 
            item.categoria === categoriaAtualBiblioteca || 
            (item.tags && item.tags.some(t => t.toLowerCase() === categoriaAtualBiblioteca.toLowerCase()));

        const bateuBusca = termoBuscaBiblioteca === '' ||
            item.titulo.toLowerCase().includes(termoBuscaBiblioteca) ||
            (item.categoria && item.categoria.toLowerCase().includes(termoBuscaBiblioteca)) ||
            (item.tags && item.tags.some(t => t.toLowerCase().includes(termoBuscaBiblioteca)));

        return ehCategoria && bateuBusca;
    });

    if (acervo.length === 0) {
        containerLista.innerHTML = `
            <div class="post-card" style="text-align: center; padding: 2rem;">
                <p style="color: var(--texto-secundario);">Nenhum livro encontrado. Tente buscar por outros termos ou troque de categoria.</p>
            </div>
        `;
    } else {
        containerLista.innerHTML = '';
        acervo.forEach((livro) => {
            const indexReal = acervoTotal.indexOf(livro);

            let tagsHtml = '';
            if (livro.tags && livro.tags.length > 0) {
                tagsHtml = livro.tags.map(tag => 
                    `<span onclick="filtrarBiblioteca('${tag.replace(/'/g, "\\'")}')" style="border: 1px solid rgba(230, 200, 133, 0.3); padding: 0.15rem 0.5rem; border-radius: 12px; font-size: 0.75rem; color: var(--dourado); cursor: pointer; display: inline-block; margin-right: 0.3rem; margin-top: 0.3rem; background: rgba(34, 22, 43, 0.6);">#${tag}</span>`
                ).join('');
            }

            containerLista.innerHTML += `
                <div class="post-card" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                    <div style="flex: 1; min-width: 200px;">
                        <h2 class="post-titulo" style="font-size: 1.4rem; margin: 0 0 0.3rem 0;">📄 ${livro.titulo}</h2>
                        <div class="post-meta" style="font-size: 0.85rem; margin: 0 0 0.5rem 0;">${livro.categoria || 'Geral'}</div>
                        <div>${tagsHtml}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-self: center;">
                        <a href="${livro.link}" target="_blank" style="text-decoration: none;">
                            <button class="btn-ler" style="margin-top: 0;">📖 Abrir PDF ↗</button>
                        </a>
                        <button class="btn-ler" style="margin-top: 0;" onclick="editarLivroNuvem(${indexReal})">✏️ Editar</button>
                        <button class="btn-ler" style="margin-top: 0; border-color: rgba(229, 115, 115, 0.5); color: #e57373;" onclick="excluirLivroNuvem(${indexReal})">🗑️ Excluir</button>
                    </div>
                </div>
            `;
        });
    }
}

function editarLivroNuvem(index) {
    const acervo = JSON.parse(localStorage.getItem('grimorio_livros_nuvem')) || [];
    const livro = acervo[index];

    if (!livro) return;

    livroEditandoIndex = index;

    document.getElementById('pdf-title-input').value = livro.titulo;
    document.getElementById('pdf-link-input').value = livro.link;
    
    const catSelect = document.getElementById('pdf-category-select');
    if (catSelect && livro.categoria) {
        catSelect.value = livro.categoria;
    }
    
    document.getElementById('pdf-tag-input').value = livro.tags ? livro.tags.join(', ') : '';

    mudarSecao('novo-livro');
}

function excluirLivroNuvem(index) {
    const acervo = JSON.parse(localStorage.getItem('grimorio_livros_nuvem')) || [];
    if (confirm(`Remover "${acervo[index].titulo}" da estante?`)) {
        acervo.splice(index, 1);
        localStorage.setItem('grimorio_livros_nuvem', JSON.stringify(acervo));
        carregarLivrosNuvem();
    }
}

// 7. MÓDULO DE CURSOS E ESTUDOS
function salvarCurso() {
    const container = document.getElementById('novo-curso');
    const inputs = container.querySelectorAll('input');
    const select = container.querySelector('select');

    const titulo = inputs[0].value.trim();
    const instituicao = inputs[1].value.trim();
    const status = select.value;
    const descricao = inputs[2].value.trim();

    if (!titulo) {
        alert('Por favor, preencha o título do curso.');
        return;
    }

    const cursoData = {
        titulo: titulo,
        instituicao: instituicao || 'Estudo Independente',
        status: status,
        descricao: descricao || 'Anotações sobre o aprendizado.'
    };

    let cursos = JSON.parse(localStorage.getItem('grimorio_cursos')) || [];

    if (cursoEditandoIndex !== null) {
        cursos[cursoEditandoIndex] = cursoData;
        cursoEditandoIndex = null;
    } else {
        cursos.push(cursoData);
    }

    localStorage.setItem('grimorio_cursos', JSON.stringify(cursos));

    inputs.forEach(input => input.value = '');
    select.selectedIndex = 0;

    carregarCursos();
    mudarSecao('cursos');
}

function carregarCursos() {
    const cursos = JSON.parse(localStorage.getItem('grimorio_cursos')) || [];
    const containerLista = document.getElementById('lista-cursos');

    if (!containerLista) return;

    if (cursos.length === 0) {
        containerLista.innerHTML = `
            <div class="post-card">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 0.5rem;">
                    <h2 class="post-titulo" style="margin: 0; font-size: 1.5rem;">Desenvolvimento Web & Python</h2>
                    <span class="badge-status status-andamento">Em Andamento</span>
                </div>
                <div class="post-meta" style="margin-bottom: 1rem;">Lógica, Automações & Projetos Práticos</div>
                <p>Estudos focados na construção de aplicações web, lógica de programação backend, terminal Linux e projetos independentes.</p>
            </div>
        `;
    } else {
        containerLista.innerHTML = '';
        cursos.forEach((curso, index) => {
            let statusClass = 'status-andamento';
            let statusTexto = 'Em Andamento';

            if (curso.status === 'concluido') {
                statusClass = 'status-concluido';
                statusTexto = 'Concluído';
            } else if (curso.status === 'pausado') {
                statusClass = 'status-desejado';
                statusTexto = 'Pausado';
            }

            containerLista.innerHTML += `
                <div class="post-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 0.5rem;">
                        <h2 class="post-titulo" style="margin: 0; font-size: 1.5rem;">${curso.titulo}</h2>
                        <span class="badge-status ${statusClass}">${statusTexto}</span>
                    </div>
                    <div class="post-meta" style="margin-bottom: 1rem;">${curso.instituicao}</div>
                    <p>${curso.descricao}</p>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn-ler" style="margin-top: 0;" onclick="editarCurso(${index})">✏️ Editar</button>
                        <button class="btn-ler" style="margin-top: 0; border-color: rgba(229, 115, 115, 0.5); color: #e57373;" onclick="excluirCurso(${index})">🗑️ Excluir</button>
                    </div>
                </div>
            `;
        });
    }
}

function editarCurso(index) {
    const cursos = JSON.parse(localStorage.getItem('grimorio_cursos')) || [];
    const curso = cursos[index];

    if (!curso) return;

    cursoEditandoIndex = index;

    const container = document.getElementById('novo-curso');
    const inputs = container.querySelectorAll('input');
    const select = container.querySelector('select');

    inputs[0].value = curso.titulo;
    inputs[1].value = curso.instituicao;
    select.value = curso.status;
    inputs[2].value = curso.descricao;

    mudarSecao('novo-curso');
}

function excluirCurso(index) {
    const cursos = JSON.parse(localStorage.getItem('grimorio_cursos')) || [];
    if (confirm(`Remover "${cursos[index].titulo}" da lista de cursos?`)) {
        cursos.splice(index, 1);
        localStorage.setItem('grimorio_cursos', JSON.stringify(cursos));
        carregarCursos();
    }
}

// 8. MÓDULO DA WISHLIST
function salvarWishlist() {
    const container = document.getElementById('novo-item-wishlist');
    const inputs = container.querySelectorAll('input');
    const select = container.querySelector('select');

    const nome = inputs[0].value.trim();
    const categoria = inputs[1].value.trim();
    const linkFoto = inputs[2].value.trim();
    const linkCompra = inputs[3].value.trim();
    const status = select.value;

    if (!nome) {
        alert('Por favor, preencha pelo menos o nome do item.');
        return;
    }

    const itemWishlist = {
        nome: nome,
        categoria: categoria || 'Geral',
        linkFoto: linkFoto || '',
        linkCompra: linkCompra || '#',
        status: status
    };

    let wishlist = JSON.parse(localStorage.getItem('grimorio_wishlist')) || [];

    if (wishlistEditandoIndex !== null) {
        wishlist[wishlistEditandoIndex] = itemWishlist;
        wishlistEditandoIndex = null;
    } else {
        wishlist.push(itemWishlist);
    }

    localStorage.setItem('grimorio_wishlist', JSON.stringify(wishlist));

    inputs.forEach(input => input.value = '');
    select.selectedIndex = 0;

    carregarWishlist();
    mudarSecao('wishlist');
}

function carregarWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('grimorio_wishlist')) || [];
    const containerGrid = document.querySelector('#wishlist div[style*="display: grid"]');

    if (!containerGrid) return;

    if (wishlist.length === 0) {
        containerGrid.innerHTML = `
            <div class="post-card" style="margin-bottom: 0; padding: 1.5rem; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="width: 100%; height: 160px; background: rgba(34, 22, 43, 0.8); border: 1px dashed var(--dourado); display: flex; align-items: center; justify-content: center; font-family: var(--fonte-detalhe); color: var(--dourado); margin-bottom: 1rem; border-radius: 4px;">
                        [ Foto do Item ]
                    </div>
                    <h3 style="font-family: var(--fonte-titulo); color: var(--dourado); margin: 0 0 0.5rem 0; font-size: 1.2rem; font-weight: normal;">Bíblia Clássica do Tarot</h3>
                    <div class="post-meta" style="font-size: 0.8rem; margin-bottom: 0.8rem;">Livro Físico · Referência</div>
                </div>
                <div>
                    <span class="badge-status status-desejado" style="display: inline-block; margin-bottom: 1rem;">Desejado</span>
                    <a href="https://amazon.com.br" target="_blank" style="text-decoration: none; display: block;">
                        <button class="btn-ler" style="width: 100%; margin-top: 0;">🛒 Onde Comprar ↗</button>
                    </a>
                </div>
            </div>
        `;
    } else {
        containerGrid.innerHTML = '';
        wishlist.forEach((item, index) => {
            const fotoHtml = item.linkFoto 
                ? `<img src="${item.linkFoto}" alt="${item.nome}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 4px; border: 1px solid var(--dourado); margin-bottom: 1rem;">`
                : `<div style="width: 100%; height: 160px; background: rgba(34, 22, 43, 0.8); border: 1px dashed var(--dourado); display: flex; align-items: center; justify-content: center; font-family: var(--fonte-detalhe); color: var(--dourado); margin-bottom: 1rem; border-radius: 4px;">[ Foto do Item ]</div>`;

            const statusClass = item.status === 'adquirido' ? 'status-concluido' : 'status-desejado';
            const statusTexto = item.status === 'adquirido' ? 'Adquirido' : 'Desejado';

            const botaoCompra = item.linkCompra && item.linkCompra !== '#'
                ? `<a href="${item.linkCompra}" target="_blank" style="text-decoration: none; display: block;">
                        <button class="btn-ler" style="width: 100%; margin-top: 0;">🛒 Onde Comprar ↗</button>
                   </a>`
                : `<button class="btn-ler" style="width: 100%; margin-top: 0; opacity: 0.5; cursor: not-allowed;" disabled>Sem Link</button>`;

            containerGrid.innerHTML += `
                <div class="post-card" style="margin-bottom: 0; padding: 1.5rem; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        ${fotoHtml}
                        <h3 style="font-family: var(--fonte-titulo); color: var(--dourado); margin: 0 0 0.5rem 0; font-size: 1.2rem; font-weight: normal;">${item.nome}</h3>
                        <div class="post-meta" style="font-size: 0.8rem; margin-bottom: 0.8rem;">${item.categoria}</div>
                    </div>
                    <div>
                        <span class="badge-status ${statusClass}" style="display: inline-block; margin-bottom: 1rem;">${statusTexto}</span>
                        ${botaoCompra}
                        <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem; justify-content: center;">
                            <button class="btn-ler" style="margin-top: 0; font-size: 0.8rem; padding: 0.2rem 0.6rem; border-color: rgba(229, 115, 115, 0.5); color: #e57373;" onclick="excluirWishlist(${index})">🗑️ Remover</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
}

function excluirWishlist(index) {
    const wishlist = JSON.parse(localStorage.getItem('grimorio_wishlist')) || [];
    if (confirm(`Remover "${wishlist[index].nome}" da sua Wishlist?`)) {
        wishlist.splice(index, 1);
        localStorage.setItem('grimorio_wishlist', JSON.stringify(wishlist));
        carregarWishlist();
    }
}

// 9. MÓDULO DE BACKUP (EXPORTAR E IMPORTAR JSON)
function exportarBackup() {
    const dadosBackup = {
        grimorio_posts: JSON.parse(localStorage.getItem('grimorio_posts')) || [],
        grimorio_livros_nuvem: JSON.parse(localStorage.getItem('grimorio_livros_nuvem')) || [],
        grimorio_cursos: JSON.parse(localStorage.getItem('grimorio_cursos')) || [],
        grimorio_wishlist: JSON.parse(localStorage.getItem('grimorio_wishlist')) || [],
        grimorio_foto_perfil: localStorage.getItem('grimorio_foto_perfil') || ''
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dadosBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    const dataHoje = new Date().toISOString().split('T')[0];
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `grimorio_backup_${dataHoje}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importarBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (confirm("Deseja restaurar este arquivo de backup? Seus dados atuais serão atualizados.")) {
                if (dados.grimorio_posts) localStorage.setItem('grimorio_posts', JSON.stringify(dados.grimorio_posts));
                if (dados.grimorio_livros_nuvem) localStorage.setItem('grimorio_livros_nuvem', JSON.stringify(dados.grimorio_livros_nuvem));
                if (dados.grimorio_cursos) localStorage.setItem('grimorio_cursos', JSON.stringify(dados.grimorio_cursos));
                if (dados.grimorio_wishlist) localStorage.setItem('grimorio_wishlist', JSON.stringify(dados.grimorio_wishlist));
                if (dados.grimorio_foto_perfil !== undefined) localStorage.setItem('grimorio_foto_perfil', dados.grimorio_foto_perfil);

                carregarPerfil();
                carregarPosts();
                carregarWishlist();
                carregarCursos();
                carregarLivrosNuvem();

                alert("Backup restaurado com sucesso! ✦");
            }
        } catch (err) {
            alert("Erro ao carregar arquivo. Certifique-se de selecionar um arquivo .json válido.");
        }
    };
    reader.readAsText(file);
}