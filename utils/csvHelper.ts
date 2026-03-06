import { Surgery, SurgeryDefinition } from '../types';

// Helper to normalize strings for comparison
const normalizeStr = (str: string) => str ? str.trim().toUpperCase() : '';

export const parseDefinitionsCSV = (csvText: string): SurgeryDefinition[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  const definitions: SurgeryDefinition[] = [];

  // Expected: NAME, POINTS, COMPLEXITY, CODE, BASE_PRICE
  lines.forEach((line, index) => {
    if (line.startsWith('---') || line.includes('PACIENTE,DATA')) return;

    const row = line.split(',');
    if (row.length < 2) return;

    const name = row[0]?.trim();
    if (!name) return;

    const points = parseFloat(row[1]);
    const basePrice = row[4] ? parseFloat(row[4]) : 0;

    definitions.push({
      id: `def-${index}-${Date.now()}`,
      name: normalizeStr(name),
      points: isNaN(points) ? 0 : points,
      complexity: row[2]?.trim() || '',
      code: row[3]?.trim(),
      basePrice: isNaN(basePrice) ? 0 : basePrice
    });
  });

  return definitions;
};

export const parseSurgeryLogCSV = (csvText: string, definitions: SurgeryDefinition[]): Surgery[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  // Encontra a linha de cabeçalho — aceita qualquer posição
  const headerLineIndex = lines.findIndex(line => {
    const upper = line.toUpperCase();
    return upper.includes('PACIENTE') && (
      upper.includes('MÉDICO') || upper.includes('MEDICO') || upper.includes('CIRURGIA')
    );
  });

  if (headerLineIndex === -1) return [];

  // Parser robusto: split por vírgula respeitando aspas
  const splitCSVRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let ci = 0; ci < row.length; ci++) {
      const ch = row[ci];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitCSVRow(lines[headerLineIndex]).map(h =>
    h.replace(/["']/g, '').trim()
      .toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos para comparação
  );

  // Índices das colunas — NOVA ORDEM: Paciente | Médico | Cirurgia | Convênio | Data do Procedimento | Observação
  const findCol = (...terms: string[]) => headers.findIndex(h => terms.some(t => h.includes(t)));

  const patientIdx = findCol('PACIENTE');
  const doctorIdx = findCol('MEDICO', 'MÉDICO');
  const surgeryIdx = findCol('CIRURGIA', 'PROCEDIMENTO');
  const sourceIdx = findCol('CONVENIO', 'CONVÊNIO', 'CONVENIOS', 'FONTE', 'AREA', 'OPERADORA');
  const dateIdx = findCol('DATA', 'DT');
  const obsIdx = findCol('OBSERVA', 'OBS', 'NOTA');
  const pointsIdx = findCol('PONTU', 'PONTOS');
  const costIdx = findCol('VALOR', 'PRECO', 'CUSTO');

  const surgeries: Surgery[] = [];

  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const row = splitCSVRow(lines[i]);
    if (row.length < 3) continue;

    const rawPatient = patientIdx >= 0 ? row[patientIdx]?.trim() : '';
    const rawDoctor = doctorIdx >= 0 ? row[doctorIdx]?.trim() : '';
    const rawSurgery = surgeryIdx >= 0 ? row[surgeryIdx]?.trim() : '';
    const rawSource = sourceIdx >= 0 ? row[sourceIdx]?.trim() : 'Hapvida';
    const rawDate = dateIdx >= 0 ? row[dateIdx]?.trim() : '';
    const rawObs = obsIdx >= 0 ? row[obsIdx]?.trim() : '';
    const rawPoints = pointsIdx >= 0 ? row[pointsIdx]?.trim() : '';
    const rawCost = costIdx >= 0 ? parseFloat(row[costIdx]) : NaN;

    // Pelo menos cirurgia e data devem existir
    if (!rawSurgery || !rawDate) continue;

    // Normalizar data: DD/MM/YYYY → YYYY-MM-DD
    let formattedDate = rawDate;
    if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        let year = parts[2].split(' ')[0];
        if (year.length === 2) year = '20' + year;
        if (year === '0025') year = '2025';
        formattedDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    // Pontos: tenta pelo CSV, senão busca na tabela de definições
    let points = parseFloat(rawPoints);
    let cost = isNaN(rawCost) ? 0 : rawCost;

    if (isNaN(points) || points === 0) {
      const normSurgery = normalizeStr(rawSurgery);
      const def = definitions.find(d => d.name === normSurgery);
      if (def) {
        points = def.points;
        if (cost === 0) cost = def.basePrice || 0;
      } else {
        points = 0;
      }
    }

    // Classificação da fonte
    let finalSource = rawSource || 'Hapvida';
    const srcUp = finalSource.toUpperCase();
    if (srcUp.includes('HAPVIDA')) finalSource = 'Hapvida';
    else if (srcUp.includes('CARTA')) finalSource = 'Carta de Rede';
    else if (srcUp.includes('VENDA') || srcUp.includes('PARTICULAR')) finalSource = 'Venda de Serviço';

    surgeries.push({
      id: crypto.randomUUID(),
      patientName: rawPatient || 'Desconhecido',
      date: formattedDate,
      doctorName: (rawDoctor || 'Desconhecido').toUpperCase(),
      surgeryType: rawSurgery,
      points,
      notes: rawObs,
      source: finalSource,
      healthInsurance: rawSource,
      cost,
      isPaid: false,
    });
  }

  return surgeries;
};

export const INITIAL_DEFINITIONS_CSV = `ABSCESSO RENAL OU PERI-RENAL - DRENAGEM CIRURGICA,3,MÉDIA,31101011
ADRENALECTOMIA LAPAROSCOPICA UNILATERAL,8,GRANDE,31101488
AMPLIACAO VESICAL,8,GRANDE,31103014
AUTOTRANSPLANTE RENAL UNILATERAL,13,GRANDE,31101062
BIOPSIA PENIANA,1,PEQUENA,31206034
CIRURGIA ESTERILIZADORA MASCULINA,1,PEQUENA,31205070
CISTECTOMIA PARCIAL LAPAROSCOPICA,8,GRANDE,31103529
CISTECTOMIA RADICAL (INCLUI PROSTATA OU UTERO),13,GRANDE,31103073
CISTECTOMIA RADICAL LAPAROSCOPICA (INCLUI PROSTATA OU UTERO),13,GRANDE,31103537
CISTO RENAL - ESCLEROTERAPIA PERCUTANEA - POR CISTO,3,MÉDIA,31101089
CISTOLITOTOMIA,3,MÉDIA,31103090
CISTOLITOTRIPSIA A LASER,3,MÉDIA,31103561
CISTOLITOTRIPSIA A LASER + RTU,5,MÉDIA,31103561
CISTOSCOPIA,1,PEQUENA,31104126
CISTOSTOMIA POR PUNCAO COM TROCATER,3,MÉDIA,31103197
COLO VESICAL - RESSECCAO ENDOSCOPICA,3,MÉDIA,31103219
COLOCAÇÃO DE CATETER DUPLO J,2,PEQUENA,31102077
DIVERTICULECTOMIA VESICAL,4,MÉDIA,31103243
DOENCA DE PEYRONIE - TRATAMENTO CIRURGICO,4,MEDIA,31206042
DRENAGEM DE ABSCESSO - EPIDIDIMO,2,PEQUENA,31204023
DRENAGEM DE ABSCESSO - ESCROTO,2,PEQUENA,31202020
ELETROCOAGULACAO DE LESOES CUTANEAS,0,PEQUENA,31206050
ENTEROCISTOPLASTIA (AMPLIACAO VESICAL),8,GRANDE,31103251
ESCROTO AGUDO - EXPLORACAO CIRURGICA,3,MÉDIA,31203035
EXERESE DE CISTO ESCROTAL,1,PEQUENA,31202047
FISTULA URETRO-VAGINAL - CORRECAO CIRURGICA,8,GRANDE,31104100
FISTULA VESICO-VAGINAL - TRATAMENTO CIRURGICO,5,MÉDIA,31103324
FRATURA DE PENIS - TRATAMENTO CIRURGICO,4,MÉDIA,31206093
HEMORRAGIA DA LOJA PROSTATICA - EVACUACAO E IRRIGACAO,3,MÉDIA,31201067
HIDROCELE UNILATERAL - CORRECAO CIRURGICA,3,MÉDIA,31203043
IMPLANTE DE PROTESE SEMI-RIGIDA (EXCLUI PROTESES INFLAVEIS),4,MÉDIA,31206140
IMPLANTE DE PROTESE TESTICULAR UNILATERAL,2,PEQUENA,31203051
INCONTINENCIA URINARIA MASCULINA -   SLING,4,MÉDIA,31104274
LOMBOTOMIA EXPLORADORA,4,MÉDIA,31101127
MEATOTOMIA URETRAL,1,PEQUENA,31104142
NEFRECTOMIA PARCIAL UNILATERAL,11,GRANDE,31101569
NEFRECTOMIA PARCIAL ,11,GRANDE,31101569
NEFRECTOMIA PARCIAL LAPAROSCOPICA UNILATERAL,11,GRANDE,
NEFRECTOMIA TOTAL UNILATERAL,10,GRANDE,31101585
NEFROLITOTRIPSIA PERCUTANEA,8,GRANDE,31101275
ORQUIDOPEXIA UNILATERAL,3,MÉDIA,31203060
ORQUIECTOMIA UNILATERAL,3,MÉDIA,31203078
PENECTOMIA,3,MÉDIA,31206018
PENIS CURVO CONGENITO - TRATAMENTO CIRURGICO,3,MÉDIA,31206182
PIELOPLASTIA LAPAROSCOPICA UNILATERAL,8,GRANDE,31101526
PLASTICA DO FREIO BALANO-PREPUCIAL,1,PEQUENA,31206212
POSTECTOMIA,1,PEQUENA,31206220
PRIAPISMO - TRATAMENTO CIRURGICO,4,MÉDIA,31206239
PROSTATAVESICULECTOMIA RADICAL,9,GRANDE,31201113
PROSTATAVESICULECTOMIA RADICAL LAPAROSCOPICA,11,GRANDE,31201148
PROSTATECTOMIA A CEU ABERTO,4,MÉDIA,31201121
PUNCAO BIOPSIA RENAL PERCUTANEA,4,MÉDIA,31101402
REIMPLANTE URETERO-VESICAL LAPAROSCOPICO UNILATERAL,8,GRANDE,31102549
RESSECCAO ENDOSCOPICA DA PROSTATA,4,MÉDIA,31201130
RETENCAO POR COAGULO - ASPIRACAO VESICAL,4,MÉDIA,31103430
TORCAO DE TESTICULO - CURA CIRURGICA,4,MÉDIA,31203108
TRATAMENTO DA HIPERATIVIDADE VESICAL INJECAO INTRAVESICAL DE TOXINA BUTOLINICA,2,PEQUENA,31103596
TUMOR DE TESTICULO - RESSECCAO,3,MÉDIA,31203116
TUMOR VESICAL - RESSECCAO ENDOSCOPICA,4,MÉDIA,31103456
URETERORRENOLITOTRIPSIA FLEXIVEL A LASER UNILATERAL,3,MÉDIA,31102360
URETERORRENOLITOTRIPSIA FLEXIVEL BILATERAL,5,MÉDIA,31102360
URETROPLASTIA POSTERIOR,5,MÉDIA,31104207
URETROTOMIA INTERNA,3,MÉDIA,31104223
VARICOCELE UNILATERAL - CORRECAO CIRURGICA,3,MÉDIA,31203124
PRESENÇA EM REUNIÕES (+ 50%),1,,
RETIRADA DE DUPLO J,1,,
ECIRS,9,,`;

// Cabeçalho de exemplo na nova ordem de colunas
export const INITIAL_LOGS_CSV = `Paciente,Médico,Cirurgia,Convênio,Data do Procedimento,Observação`;

// Exemplo de linha para download
export const EXAMPLE_LOG_ROW = `João Silva,Dr. Paulo,CISTOSCOPIA,Hapvida,01/02/2025,`;
