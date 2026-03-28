// ============================================================
// COMERCIAL LOBATO - Sistema de Gestão
// Tipos TypeScript para todos os módulos
// ============================================================

// --- USUÁRIOS E AUTENTICAÇÃO ---
export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'gerente' | 'vendedor' | 'caixa' | 'estoquista';
  ativo: boolean;
  avatar?: string;
  filial?: string;
}

// --- ENDEREÇO ---
export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// --- CLIENTES / CRM ---
export type TipoCliente = 'pessoa_fisica' | 'pessoa_juridica';
export type SegmentoCliente = 'particular' | 'construtora' | 'empreiteira' | 'revenda' | 'prefeitura' | 'outros';
export type StatusCliente = 'ativo' | 'inativo' | 'prospecto' | 'bloqueado';

export interface Cliente {
  id: string;
  tipo: TipoCliente;
  nome: string;
  razaoSocial?: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  telefone: string;
  celular?: string;
  whatsapp?: string;
  endereco?: Endereco;
  segmento: SegmentoCliente;
  status: StatusCliente;
  limiteCredito: number;
  saldoDevedor: number;
  vendedorResponsavel?: string;
  observacoes?: string;
  dataCadastro: string;
  ultimaCompra?: string;
  totalCompras: number;
  tags?: string[];
}

export interface ContatoCRM {
  id: string;
  clienteId: string;
  tipo: 'ligacao' | 'email' | 'visita' | 'whatsapp' | 'reuniao' | 'orcamento';
  descricao: string;
  dataContato: string;
  vendedor: string;
  resultado?: string;
  proximoContato?: string;
}

export interface OportunidadeCRM {
  id: string;
  clienteId: string;
  titulo: string;
  valor: number;
  etapa: 'lead' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado_ganho' | 'fechado_perdido';
  probabilidade: number;
  dataFechamentoPrevisto: string;
  vendedor: string;
  descricao?: string;
  dataCriacao: string;
}

// --- PRODUTOS / ESTOQUE ---
export type UnidadeMedida = 'un' | 'cx' | 'kg' | 'mt' | 'm2' | 'm3' | 'lt' | 'sc' | 'pc' | 'rl' | 'fd' | 'pç';

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  parent?: string;
}

export interface Fornecedor {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email?: string;
  telefone: string;
  contato?: string;
  endereco?: Endereco;
  prazoEntrega: number;
  condicaoPagamento: string;
  ativo: boolean;
  observacoes?: string;
}

export interface Produto {
  id: string;
  codigo: string;
  codigoBarras?: string;
  nome: string;
  descricao?: string;
  categoriaId: string;
  categoria?: string;
  unidade: UnidadeMedida;
  fornecedorPrincipalId?: string;
  custoMedio: number;
  custoUltimo: number;
  precoVenda: number;
  precoAtacado?: number;
  precoObra?: number;
  markup: number;
  margem: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  localArmazenamento?: string;
  ativo: boolean;
  imagem?: string;
  ncm?: string;
  observacoes?: string;
}

export interface MovimentacaoEstoque {
  id: string;
  produtoId: string;
  produto?: string;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao' | 'transferencia';
  quantidade: number;
  custo?: number;
  motivo: string;
  documentoRef?: string;
  data: string;
  responsavel: string;
  estoqueAnterior: number;
  estoquePosterior: number;
}

// --- VENDAS ---
export type StatusVenda = 'orcamento' | 'aprovado' | 'em_separacao' | 'entregue' | 'cancelado' | 'devolvido';
export type FormaPagamento = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'cheque' | 'crediario' | 'transferencia';

export interface ItemVenda {
  id: string;
  produtoId: string;
  produto: string;
  codigo: string;
  quantidade: number;
  unidade: UnidadeMedida;
  precoUnitario: number;
  desconto: number;
  total: number;
}

export interface Venda {
  id: string;
  numero: string;
  clienteId?: string;
  cliente?: string;
  vendedor: string;
  filial: string;
  data: string;
  status: StatusVenda;
  itens: ItemVenda[];
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  formaPagamento: FormaPagamento;
  parcelas?: number;
  observacoes?: string;
  tipoEntrega: 'retirada' | 'entrega';
  dataEntregaPrevista?: string;
}

// --- ORÇAMENTOS ---
export type StatusOrcamento = 'rascunho' | 'enviado' | 'aprovado' | 'reprovado' | 'expirado' | 'convertido';

export interface LocalObra {
  nome: string;
  endereco: string;
  responsavel: string;
  contato: string;
}

export interface Orcamento {
  id: string;
  numero: string;
  clienteId: string;
  cliente: string;
  vendedor: string;
  data: string;
  validade: string;
  status: StatusOrcamento;
  localObra?: LocalObra;
  itens: ItemVenda[];
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  observacoes?: string;
  condicaoPagamento?: string;
  prazoEntrega?: string;
  vendaId?: string;
}

// --- COMPRAS ---
export type StatusPedidoCompra = 'rascunho' | 'enviado' | 'confirmado' | 'recebido_parcial' | 'recebido' | 'cancelado';

export interface ItemPedidoCompra {
  id: string;
  produtoId: string;
  produto: string;
  quantidade: number;
  unidade: UnidadeMedida;
  precoUnitario: number;
  total: number;
  quantidadeRecebida?: number;
}

export interface PedidoCompra {
  id: string;
  numero: string;
  fornecedorId: string;
  fornecedor: string;
  comprador: string;
  dataEmissao: string;
  dataPrevisao: string;
  status: StatusPedidoCompra;
  itens: ItemPedidoCompra[];
  subtotal: number;
  frete: number;
  total: number;
  condicaoPagamento: string;
  observacoes?: string;
  notaFiscal?: string;
}

// --- FINANCEIRO ---
export type StatusConta = 'aberto' | 'pago' | 'vencido' | 'cancelado' | 'parcial';
export type TipoConta = 'fornecedor' | 'aluguel' | 'folha' | 'impostos' | 'servicos' | 'utilidades' | 'outros';

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedorId?: string;
  fornecedor?: string;
  tipo: TipoConta;
  valor: number;
  valorPago?: number;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  status: StatusConta;
  formaPagamento?: FormaPagamento;
  banco?: string;
  documentoRef?: string;
  parcela?: string;
  observacoes?: string;
  centrocusto?: string;
}

export interface ContaReceber {
  id: string;
  descricao: string;
  clienteId?: string;
  cliente?: string;
  vendaId?: string;
  tipo: 'venda' | 'servico' | 'outros';
  valor: number;
  valorRecebido?: number;
  dataEmissao: string;
  dataVencimento: string;
  dataRecebimento?: string;
  status: StatusConta;
  formaPagamento?: FormaPagamento;
  documentoRef?: string;
  parcela?: string;
  observacoes?: string;
}

// --- PRECIFICAÇÃO ---
export interface TabelaPreco {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'varejo' | 'atacado' | 'obra' | 'especial' | 'funcionario';
  ativa: boolean;
  dataVigencia: string;
  dataExpiracao?: string;
  markup?: number;
  desconto?: number;
}

// --- NAVIGATION ---
export type ModuloSistema =
  | 'dashboard'
  | 'vendas'
  | 'pdv'
  | 'orcamentos'
  | 'crm'
  | 'estoque'
  | 'compras'
  | 'financeiro'
  | 'precificacao'
  | 'relatorios'
  | 'whatsapp'
  | 'configuracoes';

// --- WHATSAPP AUTOMAÇÃO ---
export type GatilhoWhatsApp =
  | 'novo_cliente'
  | 'aniversario'
  | 'pos_venda'
  | 'orcamento_enviado'
  | 'conta_vencendo'
  | 'estoque_reposicao'
  | 'inatividade'
  | 'oportunidade_criada'
  | 'manual';

export interface TemplateWhatsApp {
  id: string;
  nome: string;
  categoria: 'marketing' | 'cobranca' | 'pos_venda' | 'boas_vindas' | 'orcamento' | 'outros';
  mensagem: string;
  variaveis: string[];
  ativo: boolean;
  criadoEm: string;
}

export interface AutomacaoWhatsApp {
  id: string;
  nome: string;
  descricao: string;
  gatilho: GatilhoWhatsApp;
  templateId: string;
  condicoes: {
    segmento?: string;
    diasInatividade?: number;
    diasAnteVencimento?: number;
  };
  ativo: boolean;
  execucoes: number;
  ultimaExecucao?: string;
  criadoEm: string;
}

export interface MensagemWhatsApp {
  id: string;
  clienteId: string;
  cliente: string;
  telefone: string;
  templateId?: string;
  mensagem: string;
  status: 'enviado' | 'entregue' | 'lido' | 'falhou' | 'pendente';
  automacaoId?: string;
  enviadoEm: string;
  lidoEm?: string;
}
