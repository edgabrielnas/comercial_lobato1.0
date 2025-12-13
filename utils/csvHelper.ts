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

  const headerLineIndex = lines.findIndex(line => 
    line.toUpperCase().includes('PACIENTE') && (line.toUpperCase().includes('MÉDICO') || line.toUpperCase().includes('MEDICO'))
  );

  if (headerLineIndex === -1) return [];

  const headers = lines[headerLineIndex].split(',').map(h => h.trim().toUpperCase());
  
  const patientIdx = headers.findIndex(h => h.includes('PACIENTE'));
  const doctorIdx = headers.findIndex(h => h.includes('MÉDICO') || h.includes('MEDICO'));
  const dateIdx = headers.findIndex(h => h.includes('DATA') && !h.includes('CARIMBO'));
  const surgeryIdx = headers.findIndex(h => h.includes('CIRURGIA'));
  const pointsIdx = headers.findIndex(h => h.includes('PONTUAÇÃO') || h.includes('PONTOS') || h.includes('PONTUACAO'));
  const obsIdx = headers.findIndex(h => h.includes('OBSERVAÇÕES') || h.includes('OBS'));
  const sourceIdx = headers.findIndex(h => h.includes('FONTE') || h.includes('CONVÊNIO') || h.includes('CONVENIO') || h.includes('AREA'));
  const insuranceIdx = headers.findIndex(h => h.includes('CONVENIO_NOME') || h.includes('OPERADORA'));
  const costIdx = headers.findIndex(h => h.includes('VALOR') || h.includes('PRECO'));

  const surgeries: Surgery[] = [];

  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    // Handle CSV lines that might contain commas inside quotes (basic handling)
    const row = lines[i].split(',');

    if (row.length < 4) continue;

    const rawDate = row[dateIdx]?.trim();
    const rawDoctor = row[doctorIdx]?.trim();
    const rawPatient = row[patientIdx]?.trim();
    const rawSurgery = row[surgeryIdx]?.trim();
    const rawPoints = row[pointsIdx]?.trim();
    const rawObs = obsIdx !== -1 ? row[obsIdx]?.trim() : '';
    const rawSource = sourceIdx !== -1 ? row[sourceIdx]?.trim() : 'Hapvida';
    const rawInsurance = insuranceIdx !== -1 ? row[insuranceIdx]?.trim() : '';
    const rawCost = costIdx !== -1 ? parseFloat(row[costIdx]) : 0;

    if (!rawDate || !rawDoctor || !rawSurgery) continue;

    let formattedDate = rawDate;
    if (rawDate.includes('/')) {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
            let year = parts[2].split(' ')[0]; // Remove time if present
            if (year === '0025') year = '2025';
            formattedDate = `${year}-${parts[1]}-${parts[0]}`;
        }
    }

    let points = parseFloat(rawPoints);
    let cost = isNaN(rawCost) ? 0 : rawCost;
    
    // Auto-fill points/cost if missing
    if (isNaN(points) || (!rawPoints && points === 0)) {
        const normSurgery = normalizeStr(rawSurgery);
        const def = definitions.find(d => d.name === normSurgery);
        if (def) {
            points = def.points;
            if (cost === 0 && rawSource === 'Venda de Serviço') {
                cost = def.basePrice || 0;
            }
        } else {
            points = 0;
        }
    }

    // Determine Source Classification if rawSource is ambiguous
    let finalSource = rawSource;
    if (finalSource.toUpperCase().includes('HAPVIDA')) finalSource = 'Hapvida';
    else if (finalSource.toUpperCase().includes('CARTA')) finalSource = 'Carta de Rede';
    // Else keep it as is (likely Venda de Serviço or specific insurance)

    surgeries.push({
      id: `imported-${i}-${Math.random().toString(36).substr(2, 9)}`,
      patientName: rawPatient || 'Desconhecido',
      date: formattedDate,
      doctorName: rawDoctor.toUpperCase(),
      surgeryType: rawSurgery,
      points: points,
      notes: rawObs,
      source: finalSource,
      healthInsurance: rawInsurance,
      cost: cost,
      isPaid: false // Default to unpaid for new imports
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

// Initialize with empty logs to avoid SyntaxError due to file truncation
export const INITIAL_LOGS_CSV = `Carimbo de data/hora,PACIENTE,DATA,MÉDICO,CIRURGIA ,OBSERVAÇÕES,FOLHA DE SALA,Pontuação,CONVÊNIO ,Endereço de e-mail`;
