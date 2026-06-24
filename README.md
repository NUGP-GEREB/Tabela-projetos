# Tabela de Projetos GEREB

Mini-aplicacao standalone em HTML, CSS e JavaScript para preservar a ideia da tabela editavel de projetos.

## Funcionalidades

- Listagem dos projetos do Painel de Projetos GEREB em tabela.
- Busca por projeto, titulo, objetivo, unidade, coordenador, instrumento e parceiro.
- Filtros por coordenacao e parceiro.
- Resumo automatico de quantidade, valor total, realizado e saldo.
- Adicao de novos projetos.
- Edicao inline por modal.
- Exclusao de registros.
- Rodape com contagem de projetos filtrados.
- Persistencia no `localStorage`.
- Restauracao da base original do painel.
- Exportacao CSV do recorte filtrado.

## Como abrir

Abra `index.html` diretamente no navegador.

## Estrutura

- `index.html`: estrutura da pagina.
- `projects-data.js`: base gerada a partir do CSV do painel.
- `styles.css`: estilos responsivos.
- `script.js`: renderizacao da tabela, filtros, CRUD e exportacao.
