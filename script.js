try {
  // Sons
  const sons = {
    somExplosao: new Audio('./sons/explosao.mp3'),
    somBandeira: new Audio('./sons/bandeira.wav'),
    somClique: new Audio('./sons/clique.mp3'),
    somInicio: new Audio('./sons/inicializacao.mp3'),
    somPage: new Audio('./sons/page.wav'),
  };

  const { somInicio, somExplosao, somClique, somPage, somBandeira } = sons;

  const dados = {
    spanEBombasRedor: {},
    posicoesValidas: [],
    positionsBombas: [],
    quantidadeBombas: 30,
    maxOpcoes: 170,
    quantColumns: 10,
    quantidadeCliques: 0,
    revelados: [],
    imagemBomba: 'https://cdn-icons-png.flaticon.com/512/17/17457.png',
    imagemBandeira: 'https://svgsilh.com/svg/309862.svg',
  };

  const funcoes = {
    novaBomba(id) {
      const { imagemBomba } = dados;
      const img = document.createElement('img');
      img.setAttribute('bombaId', id);
      img.setAttribute('modo', 'bomba');
      img.src = imagemBomba;
      return img;
    },

    reporAtivo(id) {
      const { spanEBombasRedor } = dados;
      const span = spanEBombasRedor[`${id}`];
      return span;
    },
  };

  //// Clique na tela e inicie o jogo ✓✓

  // Loop para criar os quadrados
  let index = 1;
  const loop = setInterval((e) => {
    const { positionsBombas } = dados;
    let div = document.createElement('div');

    // Adicionar eventos na div
    div.addEventListener('click', clique);
    div.addEventListener('touchstart', onlongClick);
    div.addEventListener('touchend', offlongClick);
    div.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      onlongClick(event);
    });

    // Adicinando atributos, id...
    div.id = index;
    div.setAttribute('opcao', 'game');
    div.classList.add('game');
    div.classList.add('animacao');

    document.querySelector('.root').appendChild(div);
    // document.body.appendChild(div);

    if (index >= dados.maxOpcoes) clearInterval(loop);

    index++;
  }, 0);

  //////////// INICIO FUNÇÃO prepararJogo

  function prepararJogo(emVoltaClique, idDiv) {
    bombasPosition([...emVoltaClique, idDiv]);

    const allElements = document.querySelectorAll("[opcao='game']");

    allElements.forEach((item, index) => {
      const id = Number(item.id);

      const numeroBombasAoRedor = quantidadeBombasAoRedor(id);

      // Se o index não conter uma bomba, então criar span com a quantidade de bombas e adicionar na div

      criarSpan(item, id, numeroBombasAoRedor);
    });

    executarAbrirEspacos(idDiv);
  }

  //////////// FIM FUNÇÃO prepararJogo

  /////////// INICIO DA FUNÇÃO PARA ABRIR ESPAÇOS
  function executarAbrirEspacos(id) {
    let history = [];
    let arr = [id];
    let atual = 0;
    let max = 30;

    do {
      atual++;
      arr = abrirEspacosVazios(arr);
      arr = arr.filter((id) => !history.includes(id));

      history.push(...arr);
    } while (arr.length > 0 && atual < max);
  }

  //////////// INICIO FUNÇÃO abrirEspacosVazios

  function abrirEspacosVazios(id) {
    // ids é um array

    const ids = [...id];
    const history = [];
    let proximo = [];
    let max = 500;
    let lat = 0;

    while (ids.length > 0 && lat < max) {
      const atual = ids.pop();
      const emVolta = indexEmVolta(atual);

      emVolta.forEach((item) => {
        const div = document.getElementById(item);
        div.setAttribute('ativo', 'true');

        // Se div.id não estiver definido, pule para o proximo loop

        if (!!div) {
          const id = Number(div.id);

          if (!div.classList.contains('active')) {
            div.classList.add('active');
            history.push(id);
          }

          if (div.firstChild) {
            div.firstChild.style.opacity = 1;
          }

          const vazio = Boolean(div.getAttribute('vazio'));

          if (vazio === true) {
            proximo.push(id);
          }
        } /// Fechamento da condicional que verifica se div.id esta definido
      });
    }

    return [...proximo];
  }

  //////////// INICIO FUNÇÃO abrirEspacosVazios

  ////////// INICIO DA FUNÇÃO CLIQUE

  function clique(event) {
    // event.preventDefault();

    const {
      positions,
      positionsBombas,
      quantidadeCliques,
      spanEBombasRedor,
      posicoesValidas,
    } = dados;

    const { novaBomba } = funcoes;

    const div = event.currentTarget;
    const filho = div.firstChild || undefined;
    const id = Number(div.id);
    const isVazio = Boolean(div.getAttribute('vazio'));
    const isBomba = positionsBombas.includes(id);
    const isValido = posicoesValidas.includes(id);
    const seJaAtivo = Boolean(div.getAttribute('ativo'));

    // PRIMEIRO CLIQUE PARA INICIAR O JOGO
    if (quantidadeCliques === 0) {
      dados.quantidadeCliques++;
      const emVoltaDoClique = indexEmVolta(id);
      prepararJogo(emVoltaDoClique, id);

      // Som inicial
      somInicio.play();

      return;
    }

    // Estourar a bomba somente se for uma bomba e se nao estiver sido estourada ainda e se nao for uma bandeira.
    const seAtivarBomba =
      positionsBombas.includes(id) &&
      !Boolean(filho.classList.contains('mostrar-bomba')) &&
      !Boolean(filho.getAttribute('modo') === 'bandeira');

    const seForBandeira = filho
      ? filho.getAttribute('modo') === 'bandeira'
      : false;

    // Verificar se o local clicado tem uma bomba
    if (seAtivarBomba) {
      filho.classList.add('mostrar-bomba');
      filho.setAttribute('explodiu', true);

      somExplosao.currentTime = 0;
      somExplosao.play();
      //alert("Você perdeu!")
    } else if (isVazio && !seJaAtivo) {
      somPage.currentTime = 0;
      somPage.play();
      executarAbrirEspacos(id);
    } else if (!seForBandeira && !seJaAtivo) {
      somClique.currentTime = 0;
      somClique.play();
      div.classList.add('active');

      // Atributo para marcar o elemento como ja visivel
      div.setAttribute('ativo', 'true');
      filho.style.opacity = 1;
    } else if (seForBandeira) {
      // Se for bandeira e foi clicada então aqui removera a bandeira e adicionara o elemento anterior.

      filho.remove();

      if (isBomba) {
        const bomba = novaBomba(id);
        div.appendChild(bomba);
      } else if (isValido) {
        const { reporAtivo } = funcoes;
        const span = reporAtivo(id);
        div.appendChild(span);
      }
    }
  }

  ///////// INÍCIO DA FUNÇÃO LONGCLICK

  let timeBandeira;

  function onlongClick(event) {
    // event.preventDefault();
    const { currentTarget, target } = event;
    const { imagemBomba, imagemBandeira } = dados;

    const { reporAtivo, novaBomba } = funcoes;

    const div = currentTarget;
    const idDiv = currentTarget.id;
    const filho = currentTarget.firstChild
      ? currentTarget.firstChild
      : undefined;
    const modo = filho ? filho.getAttribute('modo') : undefined;

    const seInserirBandeira =
      modo === 'bomba' && Boolean(filho.getAttribute('explodiu')) === false;

    const seVazio = Boolean(div.getAttribute('vazio'));

    const seJaAtivo = Boolean(div.getAttribute('ativo'));

    timeBandeira = setTimeout(() => {
      if (seInserirBandeira || modo === 'valido' || (seVazio && !seJaAtivo)) {
        somBandeira.currentTime = 0;
        somBandeira.play();

        filho.remove();
        const bombaForBand = document.createElement('img');
        bombaForBand.src = imagemBandeira;
        bombaForBand.classList.add('mostrar');
        bombaForBand.setAttribute('modo', 'bandeira');
        div.appendChild(bombaForBand);
      }
    }, 500);
  }

  function offlongClick(event) {
    // event.preventDefault();
    clearTimeout(timeBandeira);
  }

  ////////// INICIO FUNÇÃO Função para definir a posição das bombas

  function bombasPosition(emVoltaClique) {
    const { positionsBombas, quantidadeBombas, maxOpcoes } = dados;

    while (dados.positionsBombas.length < quantidadeBombas) {
      const numeroGerado = gAleatorio(1, maxOpcoes);

      // Se o numero o numero gerado não estiver ainda na lista de bombas e se for diferente do ponto de partida clicado pelo usuario
      if (
        !positionsBombas.includes(numeroGerado) &&
        !emVoltaClique.includes(numeroGerado)
      )
        positionsBombas.push(numeroGerado);
    }

    inserirImagensBomba();
  }

  ///////// INICIO FUNÇÃO INSERIR IMAGENS DA BOMBA
  function inserirImagensBomba() {
    const { positionsBombas, imagemBomba } = dados;
    const { novaBomba } = funcoes;

    positionsBombas.forEach((id) => {
      const div = document.getElementById(id);
      const img = novaBomba(id);
      div.appendChild(img);
    });
  }

  ////////// FIM FUNÇÃO Função para definir a posição das bombas

  function gAleatorio(min, max) {
    max++;
    return Math.floor(Math.random() * (min - max) + max);
  }

  ///////// INICIO DA FUNÇÃO  quantidadeBombasAoRedor

  function quantidadeBombasAoRedor(index) {
    const { positionsBombas } = dados;

    // Index de posições em volta do elemento clicado.

    const emVolta = indexEmVolta(index);

    // Obter a quantidade de bombas em volta do elemento
    let bombas = positionsBombas.reduce((acu, ele) => {
      if (emVolta.includes(ele)) return acu + 1;
      else return acu;
    }, 0);

    return bombas;
  }

  ////////// FIM DA FUNÇÃO  quantidadeBombasAoRedor

  ///////// INICIO DA FUNÇÃO indexEmVolta / Função para definir corretamente o numeros de bombas ao redor dos elementos e evitar bombas de coluna anterior

  function indexEmVolta(index) {
    const { quantColumns: colunas, maxOpcoes: max } = dados;

    // Criar array com os index das ultimas coluna, apenas para verificação nas condições if abaixo
    const ultimaColuna = [];
    let indexLoop = 0;

    while (indexLoop < max + 20) {
      ultimaColuna.push(indexLoop);
      indexLoop += colunas;
    }

    // Array com index da primeira coluna
    const primeiraColuna = ultimaColuna.map((item) => item + 1);

    // Se o item estiver na primeira, então ignorar os elementos atras dele, e se for a última, ignorsr os itens ao lado dele

    let positions;
    /*
    if (primeiraColuna.includes(index)) {
       positions = [               
        index + 1,    
        index + 10, 
        index + 11,    
        index - 10, 
        index - 9,               
      ]
            
    } else if (ultimaColuna.includes(index)) {
      positions = [
        index - 1,        
        index + 10,        
        index + 9,
        index - 10,        
        index - 11
      ]
    } else {
      positions = [
        index - 1,
        index + 1, 
        index + 10,
        index + 11,
        index + 9,
        index - 10,
        index - 9,
        index - 11
      ]
    }    */

    if (primeiraColuna.includes(index)) {
      positions = [
        index + 1,
        index + colunas,
        index + (colunas + 1),
        index - colunas,
        index - (colunas - 1),
      ];
    } else if (ultimaColuna.includes(index)) {
      positions = [
        index - 1,
        index + colunas,
        index + (colunas - 1),
        index - colunas,
        index - (colunas + 1),
      ];
    } else {
      positions = [
        index - 1,
        index + 1,
        index + colunas,
        index + (colunas + 1),
        index + (colunas - 1),
        index - colunas,
        index - (colunas - 1),
        index - (colunas + 1),
      ];
    }

    const positionsValidas = positions.filter(
      (item) => item >= 1 && item <= max
    );

    return positionsValidas;

    // essa função retorna os locais que são válidos para a contagem de bombas ao redor do elemendo
  }

  //////////// FIM FUNÇÃO indexEmVolta

  function criarSpan(div, index, numeroBombasAoRedor) {
    const { positionsBombas, spanEBombasRedor, posicoesValidas } = dados;

    if (!positionsBombas.includes(index) && numeroBombasAoRedor > 0) {
      const span = document.createElement('span');
      span.innerText = numeroBombasAoRedor;
      span.setAttribute('modo', 'valido');

      // Aplicar cores com base na quantidade de bombas ao redor

      switch (numeroBombasAoRedor) {
        case 1:
          span.style.color = 'blue';
          break;
        case 2:
          span.style.color = 'green';
          break;
        case 3:
          span.style.color = 'red';
          break;
        case 4:
          span.style.color = 'dark-blue';
          break;
        case 5:
          span.style.color = 'brown';
          break;
        case 6:
          span.style.color = 'purple';
          break;
        case 7:
          span.style.color = 'blue';
          break;
      }

      // Criando objeto com id da div como index e e o elemento span como valor;

      spanEBombasRedor[index] = span;
      div.appendChild(span);
      posicoesValidas.push(index);
    }

    if (!positionsBombas.includes(index) && numeroBombasAoRedor == 0) {
      div.setAttribute('vazio', 'true');
      div.setAttribute('modo', 'valido');
    }

    // Retornar boleano para dizer se é uma bomba ou não
    return positionsBombas.includes(index);
  }
} catch (erro) {
  console.error(erro);
}
