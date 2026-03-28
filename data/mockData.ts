import {
  Cliente, Produto, Venda, Orcamento, PedidoCompra,
  ContaPagar, ContaReceber, Fornecedor, MovimentacaoEstoque,
  TabelaPreco, OportunidadeCRM, ContatoCRM
} from '../types';

// ─── CLIENTES ────────────────────────────────────────────────
export const mockClientes: Cliente[] = [
  { id:'c1', tipo:'pessoa_fisica', nome:'João Carlos Pereira', cpf:'123.456.789-00', telefone:'(85) 99811-2233', celular:'(85) 99811-2233', whatsapp:'(85) 99811-2233', segmento:'particular', status:'ativo', limiteCredito:5000, saldoDevedor:1200, vendedorResponsavel:'Carlos Lobato', dataCadastro:'2022-03-10', ultimaCompra:'2026-03-15', totalCompras:42800, endereco:{cep:'60000-000',logradouro:'Rua das Flores',numero:'120',bairro:'Aldeota',cidade:'Fortaleza',estado:'CE'} },
  { id:'c2', tipo:'pessoa_juridica', nome:'Construtora Horizonte', razaoSocial:'Horizonte Construções LTDA', cnpj:'11.222.333/0001-44', telefone:'(85) 3322-4455', segmento:'construtora', status:'ativo', limiteCredito:80000, saldoDevedor:32500, vendedorResponsavel:'Ana Lima', dataCadastro:'2020-06-15', ultimaCompra:'2026-03-18', totalCompras:385000 },
  { id:'c3', tipo:'pessoa_juridica', nome:'Empreiteira Silva & Filhos', cnpj:'22.333.444/0001-55', telefone:'(85) 9877-6655', segmento:'empreiteira', status:'ativo', limiteCredito:40000, saldoDevedor:8700, vendedorResponsavel:'Carlos Lobato', dataCadastro:'2021-01-20', ultimaCompra:'2026-03-10', totalCompras:128000 },
  { id:'c4', tipo:'pessoa_fisica', nome:'Maria Fernanda Costa', cpf:'987.654.321-00', telefone:'(85) 99700-1122', segmento:'particular', status:'ativo', limiteCredito:3000, saldoDevedor:0, vendedorResponsavel:'Ana Lima', dataCadastro:'2023-08-05', ultimaCompra:'2026-02-28', totalCompras:15600 },
  { id:'c5', tipo:'pessoa_juridica', nome:'Prefeitura Municipal de Maracanaú', cnpj:'07.963.012/0001-00', telefone:'(85) 3371-1800', segmento:'prefeitura', status:'ativo', limiteCredito:200000, saldoDevedor:45000, vendedorResponsavel:'Carlos Lobato', dataCadastro:'2019-04-01', ultimaCompra:'2026-03-20', totalCompras:920000 },
  { id:'c6', tipo:'pessoa_fisica', nome:'Roberto Alves Machado', cpf:'456.789.123-00', telefone:'(85) 98855-3344', segmento:'particular', status:'prospecto', limiteCredito:2000, saldoDevedor:0, dataCadastro:'2026-03-01', totalCompras:0 },
  { id:'c7', tipo:'pessoa_juridica', nome:'Revendas Nordeste Materiais', cnpj:'33.444.555/0001-66', telefone:'(85) 3355-7788', segmento:'revenda', status:'ativo', limiteCredito:60000, saldoDevedor:12000, vendedorResponsavel:'Pedro Santos', dataCadastro:'2020-11-10', ultimaCompra:'2026-03-17', totalCompras:245000 },
  { id:'c8', tipo:'pessoa_fisica', nome:'Francisca Bezerra Lima', cpf:'321.654.987-00', telefone:'(85) 99622-5544', segmento:'particular', status:'ativo', limiteCredito:1500, saldoDevedor:500, dataCadastro:'2024-01-15', ultimaCompra:'2026-03-12', totalCompras:8900 },
];

// ─── FORNECEDORES ─────────────────────────────────────────────
export const mockFornecedores: Fornecedor[] = [
  { id:'f1', razaoSocial:'Votorantim Cimentos S.A.', nomeFantasia:'Votorantim', cnpj:'01.637.895/0001-55', telefone:'(11) 3327-3000', contato:'Gerente Comercial', prazoEntrega:3, condicaoPagamento:'30/60/90', ativo:true },
  { id:'f2', razaoSocial:'Tigre S.A. Tubos e Conexões', nomeFantasia:'Tigre', cnpj:'84.683.481/0001-40', telefone:'(47) 2101-9000', contato:'Representante CE', prazoEntrega:5, condicaoPagamento:'28/56', ativo:true },
  { id:'f3', razaoSocial:'Gerdau Aços Longos S.A.', nomeFantasia:'Gerdau', cnpj:'20.234.653/0001-48', telefone:'(51) 3323-2000', contato:'Agente Nordeste', prazoEntrega:4, condicaoPagamento:'30', ativo:true },
  { id:'f4', razaoSocial:'Eternit S.A.', nomeFantasia:'Eternit', cnpj:'60.398.138/0001-83', telefone:'(11) 4173-3000', contato:'Marcos Oliveira', prazoEntrega:7, condicaoPagamento:'30/60', ativo:true },
  { id:'f5', razaoSocial:'Distribuidora Norte Materiais LTDA', nomeFantasia:'Norte Materiais', cnpj:'15.432.876/0001-22', telefone:'(85) 3244-5566', contato:'José Freitas', prazoEntrega:2, condicaoPagamento:'15/30', ativo:true },
];

// ─── PRODUTOS ─────────────────────────────────────────────────
export const mockProdutos: Produto[] = [
  { id:'p1', codigo:'CIM001', nome:'Cimento CP II-E 50kg', categoria:'Cimentos', categoriaId:'cat1', unidade:'sc', fornecedorPrincipalId:'f1', custoMedio:32.50, custoUltimo:33.00, precoVenda:42.90, precoAtacado:40.00, precoObra:38.50, markup:32.0, margem:24.2, estoqueAtual:480, estoqueMinimo:100, estoqueMaximo:1000, localArmazenamento:'Galpão A', ativo:true },
  { id:'p2', codigo:'ARE001', nome:'Areia Média m³', categoria:'Agregados', categoriaId:'cat2', unidade:'m3', custoMedio:95.00, custoUltimo:98.00, precoVenda:130.00, markup:36.8, margem:26.9, estoqueAtual:85, estoqueMinimo:20, estoqueMaximo:200, localArmazenamento:'Pátio', ativo:true },
  { id:'p3', codigo:'BRI001', nome:'Tijolo 8 Furos (milheiro)', categoria:'Tijolos', categoriaId:'cat3', unidade:'un', custoMedio:380.00, custoUltimo:395.00, precoVenda:520.00, markup:36.8, margem:26.9, estoqueAtual:45, estoqueMinimo:10, estoqueMaximo:100, localArmazenamento:'Pátio', ativo:true },
  { id:'p4', codigo:'VAR001', nome:'Vergalhão CA-50 10mm (barra 12m)', categoria:'Ferragens', categoriaId:'cat4', unidade:'un', fornecedorPrincipalId:'f3', custoMedio:45.00, custoUltimo:46.50, precoVenda:62.00, precoObra:58.00, markup:37.8, margem:27.4, estoqueAtual:320, estoqueMinimo:50, estoqueMaximo:600, localArmazenamento:'Galpão B', ativo:true },
  { id:'p5', codigo:'TUB001', nome:'Tubo PVC 100mm 6m (esgoto)', categoria:'Tubulação', categoriaId:'cat5', unidade:'un', fornecedorPrincipalId:'f2', custoMedio:38.00, custoUltimo:39.00, precoVenda:52.00, markup:36.8, margem:26.9, estoqueAtual:95, estoqueMinimo:20, estoqueMaximo:200, localArmazenamento:'Galpão C', ativo:true },
  { id:'p6', codigo:'TIN001', nome:'Tinta Acrílica Branca 18L', categoria:'Tintas', categoriaId:'cat6', unidade:'lt', custoMedio:120.00, custoUltimo:125.00, precoVenda:165.00, markup:37.5, margem:27.3, estoqueAtual:38, estoqueMinimo:10, estoqueMaximo:80, localArmazenamento:'Loja', ativo:true },
  { id:'p7', codigo:'TIJ002', nome:'Tijolo Cerâmico 6 Furos (milheiro)', categoria:'Tijolos', categoriaId:'cat3', unidade:'un', custoMedio:310.00, custoUltimo:320.00, precoVenda:420.00, markup:35.5, margem:26.2, estoqueAtual:22, estoqueMinimo:10, estoqueMaximo:80, localArmazenamento:'Pátio', ativo:true },
  { id:'p8', codigo:'CIM002', nome:'Cimento CP III 50kg', categoria:'Cimentos', categoriaId:'cat1', unidade:'sc', fornecedorPrincipalId:'f1', custoMedio:34.00, custoUltimo:34.50, precoVenda:45.90, precoAtacado:42.00, markup:35.0, margem:25.9, estoqueAtual:7, estoqueMinimo:50, estoqueMaximo:500, localArmazenamento:'Galpão A', ativo:true },
  { id:'p9', codigo:'REG001', nome:'Régua de Alumínio 2m', categoria:'Ferramentas', categoriaId:'cat7', unidade:'un', custoMedio:28.00, custoUltimo:28.00, precoVenda:38.90, markup:38.9, margem:28.0, estoqueAtual:15, estoqueMinimo:5, estoqueMaximo:40, localArmazenamento:'Loja', ativo:true },
  { id:'p10', codigo:'LON001', nome:'Lona Plástica Preta 4x100m', categoria:'Impermeabilização', categoriaId:'cat8', unidade:'rl', custoMedio:85.00, custoUltimo:88.00, precoVenda:118.00, markup:38.8, margem:28.0, estoqueAtual:12, estoqueMinimo:5, estoqueMaximo:30, localArmazenamento:'Galpão A', ativo:true },
  { id:'p11', codigo:'CAL001', nome:'Cal Hidratada CH-III 20kg', categoria:'Cimentos', categoriaId:'cat1', unidade:'sc', custoMedio:12.50, custoUltimo:13.00, precoVenda:17.90, markup:43.2, margem:30.2, estoqueAtual:3, estoqueMinimo:30, estoqueMaximo:200, localArmazenamento:'Galpão A', ativo:true },
  { id:'p12', codigo:'TEL001', nome:'Telha Fibrocimento 2,44m (6mm)', categoria:'Coberturas', categoriaId:'cat9', unidade:'un', fornecedorPrincipalId:'f4', custoMedio:22.00, custoUltimo:22.50, precoVenda:30.50, markup:38.6, margem:27.9, estoqueAtual:180, estoqueMinimo:50, estoqueMaximo:400, localArmazenamento:'Pátio', ativo:true },
];

// ─── MOVIMENTAÇÕES DE ESTOQUE ──────────────────────────────────
export const mockMovimentacoes: MovimentacaoEstoque[] = [
  { id:'m1', produtoId:'p1', produto:'Cimento CP II-E 50kg', tipo:'saida', quantidade:50, motivo:'Venda #V2026-0318', documentoRef:'V2026-0318', data:'2026-03-18', responsavel:'Carlos Lobato', estoqueAnterior:530, estoquePosterior:480 },
  { id:'m2', produtoId:'p4', produto:'Vergalhão CA-50 10mm', tipo:'entrada', quantidade:100, custo:46.50, motivo:'Compra #PC-2026-0041', documentoRef:'PC-2026-0041', data:'2026-03-17', responsavel:'Pedro Santos', estoqueAnterior:220, estoquePosterior:320 },
  { id:'m3', produtoId:'p8', produto:'Cimento CP III 50kg', tipo:'saida', quantidade:20, motivo:'Venda #V2026-0315', documentoRef:'V2026-0315', data:'2026-03-15', responsavel:'Ana Lima', estoqueAnterior:27, estoquePosterior:7 },
  { id:'m4', produtoId:'p11', produto:'Cal Hidratada CH-III 20kg', tipo:'saida', quantidade:10, motivo:'Venda #V2026-0316', documentoRef:'V2026-0316', data:'2026-03-16', responsavel:'Carlos Lobato', estoqueAnterior:13, estoquePosterior:3 },
  { id:'m5', produtoId:'p6', produto:'Tinta Acrílica Branca 18L', tipo:'ajuste', quantidade:-2, motivo:'Quebra/Avaria', data:'2026-03-14', responsavel:'Pedro Santos', estoqueAnterior:40, estoquePosterior:38 },
];

// ─── VENDAS ───────────────────────────────────────────────────
export const mockVendas: Venda[] = [
  { id:'v1', numero:'V2026-0320', clienteId:'c2', cliente:'Construtora Horizonte', vendedor:'Carlos Lobato', filial:'Matriz', data:'2026-03-20', status:'entregue', itens:[{id:'i1',produtoId:'p1',produto:'Cimento CP II-E 50kg',codigo:'CIM001',quantidade:100,unidade:'sc',precoUnitario:40.00,desconto:0,total:4000},{id:'i2',produtoId:'p4',produto:'Vergalhão CA-50 10mm',codigo:'VAR001',quantidade:50,unidade:'un',precoUnitario:58.00,desconto:0,total:2900}], subtotal:6900, desconto:0, frete:0, total:6900, formaPagamento:'boleto', parcelas:3, tipoEntrega:'entrega' },
  { id:'v2', numero:'V2026-0319', clienteId:'c1', cliente:'João Carlos Pereira', vendedor:'Ana Lima', filial:'Matriz', data:'2026-03-19', status:'entregue', itens:[{id:'i3',produtoId:'p6',produto:'Tinta Acrílica Branca 18L',codigo:'TIN001',quantidade:3,unidade:'lt',precoUnitario:165,desconto:5,total:469.75}], subtotal:495, desconto:25.25, frete:0, total:469.75, formaPagamento:'pix', tipoEntrega:'retirada' },
  { id:'v3', numero:'V2026-0318', clienteId:'c5', cliente:'Prefeitura de Maracanaú', vendedor:'Carlos Lobato', filial:'Matriz', data:'2026-03-18', status:'em_separacao', itens:[{id:'i4',produtoId:'p12',produto:'Telha Fibrocimento 2,44m',codigo:'TEL001',quantidade:500,unidade:'un',precoUnitario:28.50,desconto:0,total:14250}], subtotal:14250, desconto:0, frete:350, total:14600, formaPagamento:'transferencia', tipoEntrega:'entrega', dataEntregaPrevista:'2026-03-25' },
  { id:'v4', numero:'V2026-0317', clienteId:'c3', cliente:'Empreiteira Silva & Filhos', vendedor:'Pedro Santos', filial:'Matriz', data:'2026-03-17', status:'entregue', itens:[{id:'i5',produtoId:'p2',produto:'Areia Média m³',codigo:'ARE001',quantidade:10,unidade:'m3',precoUnitario:125,desconto:0,total:1250},{id:'i6',produtoId:'p3',produto:'Tijolo 8 Furos',codigo:'BRI001',quantidade:5,unidade:'un',precoUnitario:500,desconto:0,total:2500}], subtotal:3750, desconto:0, frete:200, total:3950, formaPagamento:'crediario', tipoEntrega:'entrega' },
  { id:'v5', numero:'V2026-0316', clienteId:'c4', cliente:'Maria Fernanda Costa', vendedor:'Ana Lima', filial:'Matriz', data:'2026-03-16', status:'entregue', itens:[{id:'i7',produtoId:'p5',produto:'Tubo PVC 100mm 6m',codigo:'TUB001',quantidade:8,unidade:'un',precoUnitario:52,desconto:0,total:416}], subtotal:416, desconto:0, frete:0, total:416, formaPagamento:'dinheiro', tipoEntrega:'retirada' },
  { id:'v6', numero:'V2026-0315', clienteId:'c7', cliente:'Revendas Nordeste', vendedor:'Carlos Lobato', filial:'Matriz', data:'2026-03-15', status:'entregue', itens:[{id:'i8',produtoId:'p1',produto:'Cimento CP II-E 50kg',codigo:'CIM001',quantidade:200,unidade:'sc',precoUnitario:40,desconto:0,total:8000},{id:'i9',produtoId:'p8',produto:'Cimento CP III 50kg',codigo:'CIM002',quantidade:20,unidade:'sc',precoUnitario:42,desconto:0,total:840}], subtotal:8840, desconto:0, frete:0, total:8840, formaPagamento:'boleto', tipoEntrega:'entrega' },
];

// ─── ORÇAMENTOS ───────────────────────────────────────────────
export const mockOrcamentos: Orcamento[] = [
  { id:'o1', numero:'ORC-2026-0088', clienteId:'c2', cliente:'Construtora Horizonte', vendedor:'Carlos Lobato', data:'2026-03-20', validade:'2026-04-20', status:'enviado', localObra:{nome:'Residencial Verdes Mares',endereco:'Av. Beira Mar, 1500 - Fortaleza/CE',responsavel:'Eng. Paulo Matos',contato:'(85) 99811-0001'}, itens:[{id:'oi1',produtoId:'p1',produto:'Cimento CP II-E 50kg',codigo:'CIM001',quantidade:500,unidade:'sc',precoUnitario:38.50,desconto:0,total:19250},{id:'oi2',produtoId:'p4',produto:'Vergalhão CA-50 10mm',codigo:'VAR001',quantidade:200,unidade:'un',precoUnitario:58,desconto:0,total:11600}], subtotal:30850, desconto:1000, frete:500, total:30350, condicaoPagamento:'30/60/90 dias', prazoEntrega:'5 dias úteis' },
  { id:'o2', numero:'ORC-2026-0087', clienteId:'c3', cliente:'Empreiteira Silva & Filhos', vendedor:'Pedro Santos', data:'2026-03-18', validade:'2026-04-18', status:'aprovado', localObra:{nome:'Conjunto Habitacional Dom Pedro',endereco:'Rua Dom Pedro, 800 - Caucaia/CE',responsavel:'Sr. Silva',contato:'(85) 9877-6655'}, itens:[{id:'oi3',produtoId:'p2',produto:'Areia Média m³',codigo:'ARE001',quantidade:50,unidade:'m3',precoUnitario:125,desconto:0,total:6250},{id:'oi4',produtoId:'p3',produto:'Tijolo 8 Furos',codigo:'BRI001',quantidade:20,unidade:'un',precoUnitario:500,desconto:0,total:10000}], subtotal:16250, desconto:500, frete:800, total:16550, condicaoPagamento:'À vista 5% desconto', prazoEntrega:'3 dias úteis' },
  { id:'o3', numero:'ORC-2026-0086', clienteId:'c1', cliente:'João Carlos Pereira', vendedor:'Ana Lima', data:'2026-03-15', validade:'2026-04-15', status:'rascunho', itens:[{id:'oi5',produtoId:'p6',produto:'Tinta Acrílica Branca 18L',codigo:'TIN001',quantidade:10,unidade:'lt',precoUnitario:165,desconto:0,total:1650},{id:'oi6',produtoId:'p10',produto:'Lona Plástica Preta 4x100m',codigo:'LON001',quantidade:2,unidade:'rl',precoUnitario:118,desconto:0,total:236}], subtotal:1886, desconto:0, frete:0, total:1886 },
];

// ─── PEDIDOS DE COMPRA ────────────────────────────────────────
export const mockPedidosCompra: PedidoCompra[] = [
  { id:'pc1', numero:'PC-2026-0045', fornecedorId:'f1', fornecedor:'Votorantim Cimentos', comprador:'Pedro Santos', dataEmissao:'2026-03-20', dataPrevisao:'2026-03-25', status:'confirmado', itens:[{id:'pci1',produtoId:'p1',produto:'Cimento CP II-E 50kg',quantidade:500,unidade:'sc',precoUnitario:33.00,total:16500},{id:'pci2',produtoId:'p8',produto:'Cimento CP III 50kg',quantidade:100,unidade:'sc',precoUnitario:34.50,total:3450}], subtotal:19950, frete:400, total:20350, condicaoPagamento:'30/60/90' },
  { id:'pc2', numero:'PC-2026-0044', fornecedorId:'f3', fornecedor:'Gerdau Aços Longos', comprador:'Carlos Lobato', dataEmissao:'2026-03-17', dataPrevisao:'2026-03-22', status:'recebido', itens:[{id:'pci3',produtoId:'p4',produto:'Vergalhão CA-50 10mm',quantidade:100,unidade:'un',precoUnitario:46.50,total:4650}], subtotal:4650, frete:200, total:4850, condicaoPagamento:'30 dias', notaFiscal:'NF 45821' },
  { id:'pc3', numero:'PC-2026-0043', fornecedorId:'f2', fornecedor:'Tigre Tubos', comprador:'Pedro Santos', dataEmissao:'2026-03-15', dataPrevisao:'2026-03-28', status:'enviado', itens:[{id:'pci4',produtoId:'p5',produto:'Tubo PVC 100mm 6m',quantidade:100,unidade:'un',precoUnitario:39.00,total:3900}], subtotal:3900, frete:150, total:4050, condicaoPagamento:'28/56 dias' },
];

// ─── CONTAS A PAGAR ───────────────────────────────────────────
export const mockContasPagar: ContaPagar[] = [
  { id:'cp1', descricao:'Fornecedor Votorantim - NF 45123', fornecedor:'Votorantim Cimentos', tipo:'fornecedor', valor:20350, dataEmissao:'2026-03-01', dataVencimento:'2026-03-31', status:'aberto', documentoRef:'NF 45123', centrocusto:'Compras' },
  { id:'cp2', descricao:'Aluguel Galpão - Março/2026', tipo:'aluguel', valor:8500, dataEmissao:'2026-03-01', dataVencimento:'2026-03-10', dataPagamento:'2026-03-09', status:'pago', formaPagamento:'transferencia', banco:'Bradesco', centrocusto:'Infraestrutura' },
  { id:'cp3', descricao:'Folha de Pagamento - Março/2026', tipo:'folha', valor:22800, dataEmissao:'2026-03-25', dataVencimento:'2026-03-31', status:'aberto', centrocusto:'RH' },
  { id:'cp4', descricao:'SIMPLES Nacional - Fev/2026', tipo:'impostos', valor:4320, dataEmissao:'2026-03-01', dataVencimento:'2026-03-20', dataPagamento:'2026-03-19', status:'pago', formaPagamento:'transferencia', centrocusto:'Fiscal' },
  { id:'cp5', descricao:'Energia Elétrica - Fev/2026', tipo:'utilidades', valor:1850, dataEmissao:'2026-03-05', dataVencimento:'2026-03-22', dataPagamento:'2026-03-22', status:'pago', formaPagamento:'boleto', centrocusto:'Infraestrutura' },
  { id:'cp6', descricao:'Fornecedor Gerdau - NF 45821', fornecedor:'Gerdau Aços Longos', tipo:'fornecedor', valor:4850, dataEmissao:'2026-03-17', dataVencimento:'2026-04-16', status:'aberto', documentoRef:'NF 45821', centrocusto:'Compras' },
  { id:'cp7', descricao:'Fornecedor Tigre - PC-2026-0043', fornecedor:'Tigre Tubos', tipo:'fornecedor', valor:4050, dataEmissao:'2026-03-15', dataVencimento:'2026-04-12', status:'aberto', centrocusto:'Compras' },
  { id:'cp8', descricao:'Internet e Telefone - Março/2026', tipo:'utilidades', valor:650, dataEmissao:'2026-03-01', dataVencimento:'2026-03-15', dataPagamento:'2026-03-14', status:'pago', formaPagamento:'debito_automatico', centrocusto:'Infraestrutura' },
  { id:'cp9', descricao:'Manutenção Caminhão', tipo:'servicos', valor:3200, dataEmissao:'2026-03-10', dataVencimento:'2026-03-25', status:'vencido', centrocusto:'Logística' },
];

// ─── CONTAS A RECEBER ─────────────────────────────────────────
export const mockContasReceber: ContaReceber[] = [
  { id:'cr1', descricao:'Venda V2026-0318 - Prefeitura', clienteId:'c5', cliente:'Prefeitura de Maracanaú', vendaId:'v3', tipo:'venda', valor:14600, dataEmissao:'2026-03-18', dataVencimento:'2026-04-17', status:'aberto', documentoRef:'V2026-0318', parcela:'1/1' },
  { id:'cr2', descricao:'Venda V2026-0320 - Horizonte Parc 1', clienteId:'c2', cliente:'Construtora Horizonte', vendaId:'v1', tipo:'venda', valor:2300, dataEmissao:'2026-03-20', dataVencimento:'2026-04-19', status:'aberto', documentoRef:'V2026-0320', parcela:'1/3' },
  { id:'cr3', descricao:'Venda V2026-0320 - Horizonte Parc 2', clienteId:'c2', cliente:'Construtora Horizonte', vendaId:'v1', tipo:'venda', valor:2300, dataEmissao:'2026-03-20', dataVencimento:'2026-05-19', status:'aberto', documentoRef:'V2026-0320', parcela:'2/3' },
  { id:'cr4', descricao:'Venda V2026-0320 - Horizonte Parc 3', clienteId:'c2', cliente:'Construtora Horizonte', vendaId:'v1', tipo:'venda', valor:2300, dataEmissao:'2026-03-20', dataVencimento:'2026-06-18', status:'aberto', documentoRef:'V2026-0320', parcela:'3/3' },
  { id:'cr5', descricao:'Crediário V2026-0317 - Silva', clienteId:'c3', cliente:'Empreiteira Silva & Filhos', vendaId:'v4', tipo:'venda', valor:3950, dataEmissao:'2026-03-17', dataVencimento:'2026-04-16', status:'aberto', documentoRef:'V2026-0317' },
  { id:'cr6', descricao:'Venda V2026-0315 - Revendas NE Parc 1', clienteId:'c7', cliente:'Revendas Nordeste', vendaId:'v6', tipo:'venda', valor:4420, dataEmissao:'2026-03-15', dataVencimento:'2026-03-15', dataRecebimento:'2026-03-15', status:'pago', formaPagamento:'boleto', documentoRef:'V2026-0315', parcela:'1/2' },
  { id:'cr7', descricao:'Venda V2026-0315 - Revendas NE Parc 2', clienteId:'c7', cliente:'Revendas Nordeste', vendaId:'v6', tipo:'venda', valor:4420, dataEmissao:'2026-03-15', dataVencimento:'2026-04-14', status:'aberto', documentoRef:'V2026-0315', parcela:'2/2' },
  { id:'cr8', descricao:'Venda V2026-0319 - João Pereira', clienteId:'c1', cliente:'João Carlos Pereira', vendaId:'v2', tipo:'venda', valor:469.75, dataEmissao:'2026-03-19', dataVencimento:'2026-03-19', dataRecebimento:'2026-03-19', status:'pago', formaPagamento:'pix', documentoRef:'V2026-0319' },
];

// ─── OPORTUNIDADES CRM ────────────────────────────────────────
export const mockOportunidades: OportunidadeCRM[] = [
  { id:'op1', clienteId:'c2', titulo:'Fornecimento Residencial Verdes Mares - Fase 2', valor:85000, etapa:'negociacao', probabilidade:75, dataFechamentoPrevisto:'2026-04-15', vendedor:'Carlos Lobato', dataCriacao:'2026-03-01' },
  { id:'op2', clienteId:'c5', titulo:'Licitação Obras Públicas Maracanaú 2026', valor:320000, etapa:'proposta', probabilidade:50, dataFechamentoPrevisto:'2026-05-01', vendedor:'Carlos Lobato', dataCriacao:'2026-02-15' },
  { id:'op3', clienteId:'c6', titulo:'Reforma Residencial - Roberto Machado', valor:12000, etapa:'qualificado', probabilidade:60, dataFechamentoPrevisto:'2026-04-01', vendedor:'Ana Lima', dataCriacao:'2026-03-05' },
  { id:'op4', clienteId:'c7', titulo:'Contrato Anual Revendas Nordeste', valor:150000, etapa:'fechado_ganho', probabilidade:100, dataFechamentoPrevisto:'2026-03-20', vendedor:'Pedro Santos', dataCriacao:'2026-02-01' },
  { id:'op5', clienteId:'c3', titulo:'Conjunto Habitacional Dom Pedro - Fase 3', valor:65000, etapa:'proposta', probabilidade:40, dataFechamentoPrevisto:'2026-04-30', vendedor:'Pedro Santos', dataCriacao:'2026-03-10' },
];

// ─── CONTATOS CRM ─────────────────────────────────────────────
export const mockContatos: ContatoCRM[] = [
  { id:'ct1', clienteId:'c2', tipo:'reuniao', descricao:'Reunião para apresentação proposta Fase 2 do Residencial', dataContato:'2026-03-19', vendedor:'Carlos Lobato', resultado:'Proposta aceita, aguardando aprovação financeira', proximoContato:'2026-03-26' },
  { id:'ct2', clienteId:'c5', tipo:'visita', descricao:'Visita ao departamento de licitações da prefeitura', dataContato:'2026-03-15', vendedor:'Carlos Lobato', resultado:'Edital previsto para publicação em abril', proximoContato:'2026-04-05' },
  { id:'ct3', clienteId:'c6', tipo:'ligacao', descricao:'Ligação inicial para qualificação da oportunidade', dataContato:'2026-03-05', vendedor:'Ana Lima', resultado:'Cliente interessado em reforma de banheiros e cozinha', proximoContato:'2026-03-22' },
  { id:'ct4', clienteId:'c1', tipo:'whatsapp', descricao:'Envio de catálogo de tintas por WhatsApp', dataContato:'2026-03-18', vendedor:'Ana Lima', resultado:'Cliente solicitou orçamento para pintura da casa' },
];

// ─── TABELAS DE PREÇO ─────────────────────────────────────────
export const mockTabelasPreco: TabelaPreco[] = [
  { id:'tp1', nome:'Tabela Varejo', tipo:'varejo', ativa:true, dataVigencia:'2026-01-01', markup:35 },
  { id:'tp2', nome:'Tabela Atacado', tipo:'atacado', ativa:true, dataVigencia:'2026-01-01', markup:20 },
  { id:'tp3', nome:'Tabela Obras/Construtoras', tipo:'obra', ativa:true, dataVigencia:'2026-01-01', markup:15 },
  { id:'tp4', nome:'Tabela Especial Prefeitura', tipo:'especial', ativa:true, dataVigencia:'2026-01-01', desconto:10 },
];

// ─── DADOS DO DASHBOARD ───────────────────────────────────────
export const dadosVendasMensais = [
  { mes:'Out/25', vendas:68200, meta:65000, compras:38000 },
  { mes:'Nov/25', vendas:72400, meta:68000, compras:41000 },
  { mes:'Dez/25', vendas:85300, meta:75000, compras:48000 },
  { mes:'Jan/26', vendas:61800, meta:65000, compras:35000 },
  { mes:'Fev/26', vendas:74500, meta:70000, compras:42000 },
  { mes:'Mar/26', vendas:82600, meta:78000, compras:46000 },
];

export const dadosCategoriasVendas = [
  { name:'Cimentos', value:32 },
  { name:'Ferragens', value:21 },
  { name:'Tijolos', value:15 },
  { name:'Tintas', value:12 },
  { name:'Tubulação', value:10 },
  { name:'Outros', value:10 },
];

export const dadosFluxoCaixa = [
  { dia:'01/03', entradas:4200, saidas:2800, saldo:8500 },
  { dia:'05/03', entradas:8800, saidas:3200, saldo:14100 },
  { dia:'10/03', entradas:5600, saidas:9500, saldo:10200 },
  { dia:'15/03', entradas:12400, saidas:4100, saldo:18500 },
  { dia:'20/03', entradas:9800, saidas:5600, saldo:22700 },
  { dia:'25/03', entradas:6500, saidas:8200, saldo:21000 },
];
