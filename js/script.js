// VARIÁVEIS DE CONTROLE DE EDIÇÃO E NAVEGAÇÃO
let postEditandoIndex = null;
let wishlistEditandoIndex = null;
let cursoEditandoIndex = null;
let livroEditandoIndex = null;
let categoriaAtualBiblioteca = 'Todos';
let termoBuscaBiblioteca = '';
let filtroFeedAtual = { tipo: 'todos', valor: '' };

// 1. NAVEGAÇÃO ENTRE TELAS DO SITE
function mudarSecao(idSecao) {
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

// 2. INICIALIZAÇÃO E EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    carregarPerfil();
    carregarPosts();
    carregarWishlist();
    carregarCursos();
    carregarLivrosNuvem();
    atualizarSubmenuFeiticos();

    const btnPublicarPost = document.querySelector('#editor-post .botoes-acao button:last-child');
    if (btnPublicarPost) btnPublicarPost.onclick = salvarPost;

    configurarToolbarEditor();
});

// 3. FOTO DE PERFIL (UPLOAD VIA CANVAS + LOCALSTORAGE)
function carregarPerfil() {
    const fotoSalva = localStorage.getItem('grimorio_foto_perfil');
    const containerFoto = document.getElementById('avatar-perfil');

    if (containerFoto) {
        if (fotoSalva && fotoSalva.trim() !== '') {
            containerFoto.innerHTML = `<img src="${fotoSalva}" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            containerFoto.innerHTML = '🔮';
        }
    }
}

function uploadFotoPerfilComputador(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const maxLado = 300;
            canvas.width = maxLado;
            canvas.height = maxLado;

            const minDim = Math.min(img.width, img.height);
            const startX = (img.width - minDim) / 2;
            const startY = (img.height - minDim) / 2;

            ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, maxLado, maxLado);

            const imagemOtimizada = canvas.toDataURL('image/jpeg', 0.85);
            localStorage.setItem('grimorio_foto_perfil', imagemOtimizada);
            
            carregarPerfil();
            alert("Foto salva com sucesso neste dispositivo! ✦");
        };
    };
    
    reader.readAsDataURL(file);
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

// 5. MÓDULO DE POSTS & NAVEGAÇÃO DE CATEGORIAS / TAGS CLICÁVEIS
function salvarPost() {
    const titulo = document.getElementById('post-titulo-input').value.trim();
    const selectCat = document.getElementById('post-categoria-select');
    const categoria = selectCat.options[selectCat.selectedIndex].text;
    const tagsRaw = document.getElementById('post-tags-input').value.trim();
    const areaConteudo = document.querySelector('#editor-post .editor-area');
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
        tags: tagsRaw || 'Anotações',
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

    document.getElementById('post-titulo-input').value = '';
    selectCat.selectedIndex = 0;
    document.getElementById('post-tags-input').value = '';
    areaConteudo.innerHTML = '';

    carregarPosts();
    atualizarSubmenuFeiticos();
    mudarSecao('feed');
}

function carregarPosts() {
    const posts = JSON.parse(localStorage.getItem('grimorio_posts')) || [];
    const containerFeed = document.getElementById('container-feed-posts');
    const btnLimpar = document.getElementById('btn-limpar-filtro-feed');
    const tituloFiltro = document.getElementById('filtro-feed-titulo');

    if (!containerFeed) return;

    let postsFiltrados = posts;

    if (filtroFeedAtual.tipo === 'categoria') {
        postsFiltrados = posts.filter(p => p.categoria.toLowerCase() === filtroFeedAtual.valor.toLowerCase());
        if (tituloFiltro) tituloFiltro.innerText = `Mostrando categoria: ${filtroFeedAtual.valor}`;
        if (btnLimpar) btnLimpar.style.display = 'inline-block';
    } else if (filtroFeedAtual.tipo === 'tag') {
        postsFiltrados = posts.filter(p => p.tags && p.tags.toLowerCase().includes(filtroFeedAtual.valor.toLowerCase()));
        if (tituloFiltro) tituloFiltro.innerText = `Mostrando tag: #${filtroFeedAtual.valor}`;
        if (btnLimpar) btnLimpar.style.display = 'inline-block';
    } else {
        if (tituloFiltro) tituloFiltro.innerText = 'Mostrando: Todos os registros';
        if (btnLimpar) btnLimpar.style.display = 'none';
    }

    if (postsFiltrados.length === 0) {
        containerFeed.innerHTML = `
            <div class="post-card" style="text-align: center; padding: 2rem;">
                <p style="color: var(--texto-secundario);">Nenhum registro encontrado nesta categoria ou tag.</p>
            </div>
        `;
        return;
    }

    containerFeed.innerHTML = '';
    postsFiltrados.forEach((post) => {
        const indexReal = posts.indexOf(post);
        const textoLimpo = post.conteudo.replace(/<[^>]*>?/gm, '');
        const resumo = textoLimpo.length > 180 ? textoLimpo.substring(0, 180) + '...' : textoLimpo;

        const tagsArray = post.tags ? post.tags.split(',').map(t => t.trim()) : [];
        const tagsHtml = tagsArray.map(tag => 
            `<span onclick="filtrarFeedPorTag('${tag.replace(/'/g, "\\'")}')" style="cursor: pointer; text-decoration: underline; color: var(--dourado); font-weight: bold;">#${tag}</span>`
        ).join(', ');

        containerFeed.innerHTML += `
            <div class="post-card">
                <div class="post-meta">
                    ${post.data} ✦ 
                    <span onclick="filtrarFeedPorCategoria('${post.categoria}')" style="cursor: pointer; text-decoration: underline; color: var(--dourado); font-weight: bold;">${post.categoria}</span> 
                    ✦ ${tagsHtml}
                </div>
                <h2 class="post-titulo">${post.titulo}</h2>
                <p>${resumo}</p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                    <button class="btn-ler" style="margin-top: 0;" onclick="lerPost(${indexReal})">Ler registro completo →</button>
                    <button class="btn-ler" style="margin-top: 0;" onclick="editarPost(${indexReal})">✏️ Editar</button>
                    <button class="btn-ler" style="margin-top: 0; border-color: rgba(229, 115, 115, 0.5); color: #e57373;" onclick="excluirPost(${indexReal})">🗑️ Excluir</button>
                </div>
            </div>
        `;
    });
}

function filtrarFeedPorCategoria(cat) {
    if (cat === 'Todos') {
        filtroFeedAtual = { tipo: 'todos', valor: '' };
    } else {
        filtroFeedAtual = { tipo: 'categoria', valor: cat };
    }
    carregarPosts();
    mudarSecao('feed');
}

function filtrarFeedPorTag(tag) {
    filtroFeedAtual = { tipo: 'tag', valor: tag };
    carregarPosts();
    mudarSecao('feed');
}

function atualizarSubmenuFeiticos() {
    const posts = JSON.parse(localStorage.getItem('grimorio_posts')) || [];
    const containerSubmenu = document.getElementById('submenu-tags-feiticos');

    if (!containerSubmenu) return;

    const postsFeiticos = posts.filter(p => p.categoria === 'Feitiços');
    let tagsSet = new Set();

    postsFeiticos.forEach(p => {
        if (p.tags) {
            p.tags.split(',').forEach(t => {
                const tagLimpa = t.trim();
                if (tagLimpa) tagsSet.add(tagLimpa);
            });
        }
    });

    if (tagsSet.size === 0) {
        containerSubmenu.innerHTML = `<a style="font-size: 0.8rem; color: var(--texto-secundario);">Nenhuma tag criada</a>`;
    } else {
        containerSubmenu.innerHTML = '';
        tagsSet.forEach(tag => {
            containerSubmenu.innerHTML += `<a onclick="filtrarFeedPorTag('${tag.replace(/'/g, "\\'")}')" style="cursor: pointer;">✦ ${tag}</a>`;
        });
    }
}

function lerPost(index) {
    const posts = JSON.parse(localStorage.getItem('grimorio_posts')) || [];
    const post = posts[index];

    if (!post) return;

    const tagsArray = post.tags ? post.tags.split(',').map(t => t.trim()) : [];
    const tagsHtml = tagsArray.map(tag => 
        `<span onclick="filtrarFeedPorTag('${tag.replace(/'/g, "\\'")}')" style="cursor: pointer; text-decoration: underline; color: var(--dourado); font-weight: bold;">#${tag}</span>`
    ).join(', ');

    const containerLeitura = document.getElementById('leitura-post');
    containerLeitura.innerHTML = `
        <div class="post-meta" style="text-align: center;">
            ${post.data} ✦ 
            <span onclick="filtrarFeedPorCategoria('${post.categoria}')" style="cursor: pointer; text-decoration: underline; color: var(--dourado); font-weight: bold;">${post.categoria}</span>
            ✦ ${tagsHtml}
        </div>
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

    document.getElementById('post-titulo-input').value = post.titulo;
    document.getElementById('post-tags-input').value = post.tags;
    document.querySelector('#editor-post .editor-area').innerHTML = post.conteudo;

    const select = document.getElementById('post-categoria-select');
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
        atualizarSubmenuFeiticos();
    }
}

// 6. MÓDULO DE CURSOS
function toggleCampoCertificado(status) {
    const box = document.getElementById('box-upload-certificado');
    if (box) {
        box.style.display = status === 'concluido' ? 'block' : 'none';
    }
}

function salvarCurso() {
    const titulo = document.getElementById('curso-titulo-input').value.trim();
    const instituicao = document.getElementById('curso-instituicao-input').value.trim();
    const status = document.getElementById('curso-status-select').value;
    const descricao = document.getElementById('curso-descricao-input').value.trim();
    const fileInput = document.getElementById('curso-certificado-file');

    if (!titulo) {
        alert('Por favor, preencha o título do curso.');
        return;
    }

    let cursos = JSON.parse(localStorage.getItem('grimorio_cursos')) || [];
    let certificadoExistente = (cursoEditandoIndex !== null && cursos[cursoEditandoIndex]) ? cursos[cursoEditandoIndex].certificado : null;

    const finalizarSalvar = (certificadoBase64) => {
        const cursoData = {
            titulo: titulo,
            instituicao: instituicao || 'Estudo Independente',
            status: status,
            descricao: descricao || 'Anotações sobre o aprendizado.',
            certificado: certificadoBase64 || certificadoExistente
        };

        if (cursoEditandoIndex !== null) {
            cursos[cursoEditandoIndex] = cursoData;
            cursoEditandoIndex = null;
        } else {
            cursos.push(cursoData);
        }

        localStorage.setItem('grimorio_cursos', JSON.stringify(cursos));

        document.getElementById('curso-titulo-input').value = '';
        document.getElementById('curso-instituicao-input').value = '';
        document.getElementById('curso-status-select').selectedIndex = 0;
        document.getElementById('curso-descricao-input').value = '';
        if (fileInput) fileInput.value = '';
        toggleCampoCertificado('andamento');

        carregarCursos();
        mudarSecao('cursos');
    };

    if (status === 'concluido' && fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            finalizarSalvar(e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finalizarSalvar(null);
    }
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
                statusTexto = 'Concluído ✨';
            } else if (curso.status === 'pausado') {
                statusClass = 'status-desejado';
                statusTexto = 'Pausado';
            }

            const certificadoBtn = (curso.status === 'concluido' && curso.certificado)
                ? `<a href="${curso.certificado}" target="_blank" download="certificado_${curso.titulo}.pdf" style="text-decoration: none;">
                    <button class="btn-ler" style="margin-top: 0; background: rgba(230, 200, 133, 0.2); color: var(--dourado);">📜 Ver Certificado</button>
                   </a>`
                : '';

            containerLista.innerHTML += `
                <div class="post-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 0.5rem;">
                        <h2 class="post-titulo" style="margin: 0; font-size: 1.5rem;">${curso.titulo}</h2>
                        <span class="badge-status ${statusClass}">${statusTexto}</span>
                    </div>
                    <div class="post-meta" style="margin-bottom: 1rem;">${curso.instituicao}</div>
                    <p>${curso.descricao}</p>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                        ${certificadoBtn}
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

    document.getElementById('curso-titulo-input').value = curso.titulo;
    document.getElementById('curso-instituicao-input').value = curso.instituicao;
    document.getElementById('curso-status-select').value = curso.status;
    document.getElementById('curso-descricao-input').value = curso.descricao;

    toggleCampoCertificado(curso.status);

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

// 7. MÓDULO DA WISHLIST
function salvarWishlist() {
    const nome = document.getElementById('wishlist-nome-input').value.trim();
    const categoria = document.getElementById('wishlist-categoria-input').value.trim();
    const linkFoto = document.getElementById('wishlist-foto-input').value.trim();
    const linkCompra = document.getElementById('wishlist-compra-input').value.trim();
    const status = document.getElementById('wishlist-status-select').value;

    if (!nome) {
        alert('Por favor, preencha o nome do item.');
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

    document.getElementById('wishlist-nome-input').value = '';
    document.getElementById('wishlist-categoria-input').value = '';
    document.getElementById('wishlist-foto-input').value = '';
    document.getElementById('wishlist-compra-input').value = '';
    document.getElementById('wishlist-status-select').selectedIndex = 0;

    carregarWishlist();
    mudarSecao('wishlist');
}

function alternarStatusWishlist(index) {
    let wishlist = JSON.parse(localStorage.getItem('grimorio_wishlist')) || [];
    if (wishlist[index]) {
        wishlist[index].status = wishlist[index].status === 'adquirido' ? 'desejado' : 'adquirido';
        localStorage.setItem('grimorio_wishlist', JSON.stringify(wishlist));
        carregarWishlist();
    }
}

function carregarWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('grimorio_wishlist')) || [];
    const containerGrid = document.getElementById('lista-wishlist-grid');

    if (!containerGrid) return;

    if (wishlist.length === 0) {
        containerGrid.innerHTML = `
            <div class="post-card" style="margin-bottom: 0; padding: 1.5rem; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="width: 100%; height: 160px; background: rgba(34, 22, 43, 0.8); border: 1px dashed var(--dourado); display: flex; align-items: center; justify-content: center; font-family: var(--fonte-detalhe); color: var(--dourado); margin-bottom: 1rem; border-radius: 4px;">[ Foto ]</div>
                    <h3 style="font-family: var(--fonte-titulo); color: var(--dourado); margin: 0 0 0.5rem 0; font-size: 1.2rem; font-weight: normal;">Bíblia Clássica do Tarot</h3>
                    <div class="post-meta" style="font-size: 0.8rem; margin-bottom: 0.8rem;">Livro Físico · Referência</div>
                </div>
                <div>
                    <span class="badge-status status-desejado" style="display: inline-block; margin-bottom: 1rem;">Desejado</span>
                </div>
            </div>
        `;
    } else {
        containerGrid.innerHTML = '';
        wishlist.forEach((item, index) => {
            const fotoHtml = item.linkFoto 
                ? `<img src="${item.linkFoto}" alt="${item.nome}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 4px; border: 1px solid var(--dourado); margin-bottom: 1rem;">`
                : `<div style="width: 100%; height: 160px; background: rgba(34, 22, 43, 0.8); border: 1px dashed var(--dourado); display: flex; align-items: center; justify-content: center; font-family: var(--fonte-detalhe); color: var(--dourado); margin-bottom: 1rem; border-radius: 4px;">[ Foto ]</div>`;

            const statusClass = item.status === 'adquirido' ? 'status-concluido' : 'status-desejado';
            const statusTexto = item.status === 'adquirido' ? 'Adquirido ✨' : 'Desejado';

            const botaoCompra = item.linkCompra && item.linkCompra !== '#'
                ? `<a href="${item.linkCompra}" target="_blank" style="text-decoration: none; display: block;">
                        <button class="btn-ler" style="width: 100%; margin-top: 0;">🛒 Onde Comprar ↗</button>
                   </a>`
                : '';

            containerGrid.innerHTML += `
                <div class="post-card" style="margin-bottom: 0; padding: 1.5rem; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        ${fotoHtml}
                        <h3 style="font-family: var(--fonte-titulo); color: var(--dourado); margin: 0 0 0.5rem 0; font-size: 1.2rem; font-weight: normal;">${item.nome}</h3>
                        <div class="post-meta" style="font-size: 0.8rem; margin-bottom: 0.8rem;">${item.categoria}</div>
                    </div>
                    <div>
                        <span class="badge-status ${statusClass}" onclick="alternarStatusWishlist(${index})" style="display: inline-block; margin-bottom: 1rem; cursor: pointer;" title="Clique para alterar status">${statusTexto}</span>
                        ${botaoCompra}
                        <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem; justify-content: center;">
                            <button class="btn-ler" style="margin-top: 0; font-size: 0.8rem; padding: 0.2rem 0.6rem;" onclick="editarWishlist(${index})">✏️ Editar</button>
                            <button class="btn-ler" style="margin-top: 0; font-size: 0.8rem; padding: 0.2rem 0.6rem; border-color: rgba(229, 115, 115, 0.5); color: #e57373;" onclick="excluirWishlist(${index})">🗑️ Remover</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
}

function editarWishlist(index) {
    const wishlist = JSON.parse(localStorage.getItem('grimorio_wishlist')) || [];
    const item = wishlist[index];

    if (!item) return;

    wishlistEditandoIndex = index;

    document.getElementById('wishlist-nome-input').value = item.nome;
    document.getElementById('wishlist-categoria-input').value = item.categoria;
    document.getElementById('wishlist-foto-input').value = item.linkFoto;
    document.getElementById('wishlist-compra-input').value = item.linkCompra;
    document.getElementById('wishlist-status-select').value = item.status;

    mudarSecao('novo-item-wishlist');
}

function excluirWishlist(index) {
    const wishlist = JSON.parse(localStorage.getItem('grimorio_wishlist')) || [];
    if (confirm(`Remover "${wishlist[index].nome}" da sua Wishlist?`)) {
        wishlist.splice(index, 1);
        localStorage.setItem('grimorio_wishlist', JSON.stringify(wishlist));
        carregarWishlist();
    }
}

// 8. MÓDULO DA BIBLIOTECA VIRTUAL
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
                <p style="color: var(--texto-secundario);">Nenhum livro encontrado.</p>
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

// 9. MÓDULO DE BACKUP
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
                atualizarSubmenuFeiticos();

                alert("Backup restaurado com sucesso! ✦");
            }
        } catch (err) {
            alert("Erro ao carregar arquivo. Certifique-se de selecionar um arquivo .json válido.");
        }
    };
    reader.readAsText(file);
}
