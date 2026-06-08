/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Função serverless da Vercel — Co-Pilot de Tokenização (Gemini), com fallback de
 * simulação quando não há GEMINI_API_KEY. JS puro (ESM) para a Vercel rodar direto,
 * sem passar pelo tsconfig do app (que tem noEmit:true).
 */
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const {
    assetName,
    assetCategory,
    draftDescription,
    location,
    environmentalGoal,
    copilotPersona,
    fallbackSupply,
    extraContext,
  } = req.body || {};

  if (!assetName || !assetCategory) {
    res.status(400).json({ error: 'assetName e assetCategory são obrigatórios.' });
    return;
  }

  const persona =
    typeof copilotPersona === 'string' && copilotPersona.trim()
      ? copilotPersona.trim()
      : 'Você é o Co-Pilot de Tokenização da Nortoken, um launchpad Web3 multi-mercado. ' +
        'Transforme a ideia do usuário em um token estruturado, seguro e competitivo em redes EVM. ' +
        'Escreva em português elegante do Brasil.';

  const apiKey = process.env.GEMINI_API_KEY;

  // ── Fallback: simulação (sem chave) ──
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    const suffix = String(assetCategory).toUpperCase().substring(0, 3);
    const generatedSymbol = String(assetName).replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 4) || 'NOR';
    const ticker = `${generatedSymbol}${suffix.length > 2 ? suffix : 'TKN'}`;
    const simulatedSupply = Number(fallbackSupply) > 0 ? Number(fallbackSupply) : 1000000;
    const ctx = [location, environmentalGoal, extraContext].filter(Boolean).join(' · ');

    await new Promise((r) => setTimeout(r, 500));
    res.json({
      recommendedSymbol: ticker.substring(0, 6),
      recommendedSupply: simulatedSupply,
      refinedDescription: draftDescription
        ? `${draftDescription} (Refinado via Co-Pilot Nortoken — token do segmento "${assetCategory}" estruturado para lançamento seguro em rede EVM${ctx ? `, contexto: ${ctx}` : ''}.)`
        : `${assetName} é um token do segmento "${assetCategory}" estruturado pela Nortoken para lançamento competitivo em rede EVM, com proteções contra sniper e MEV e tokenômica equilibrada${ctx ? ` (${ctx})` : ''}.`,
      sustainabilityScore: 85,
      mathematicalExplanation:
        'Supply sugerido com base no segmento escolhido, equilibrando liquidez, distribuição e granularidade de uso.',
      mockWhitepaperSummary: {
        introduction: `Introdução ao projeto ${assetName} e sua proposta de valor on-chain.`,
        architecture:
          'Token EVM com fee-on-transfer transparente (incl. fee de protocolo Nortoken), proteções de lançamento e supply controlado.',
        impact: `Tração e utilidade esperadas para o token ${ticker} dentro do seu segmento e comunidade.`,
        governance:
          'Modelo de governança com holders participando das decisões e da destinação de recursos do projeto.',
      },
      mode: 'Simulado (defina GEMINI_API_KEY na Vercel para IA real)',
    });
    return;
  }

  // ── IA real (Gemini) ──
  try {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

    const userCtx = [
      location && `Localização/contexto: "${location}"`,
      environmentalGoal && `Objetivo: "${environmentalGoal}"`,
      extraContext && `Detalhes: "${extraContext}"`,
    ]
      .filter(Boolean)
      .join('. ');

    const promptUser = `Ativo: "${assetName}" (segmento: ${assetCategory}). Descrição inicial do usuário: "${draftDescription || 'sem descrição'}". ${userCtx}`;
    const systemInstruction =
      `${persona}\n` +
      `Retorne um objeto JSON estrito com os campos: ` +
      '`recommendedSymbol` (string, max 6 caracteres com o ticker sugerido), ' +
      '`recommendedSupply` (número inteiro adequado ao tipo de ativo/segmento), ' +
      '`refinedDescription` (narrativa profissional de marketing em português, atraente e adequada ao segmento), ' +
      '`mathematicalExplanation` (explicação curta do porquê do supply sugerido), ' +
      '`mockWhitepaperSummary` (objeto com as strings `introduction`, `architecture`, `impact` e `governance`) ' +
      `e "sustainabilityScore" (valor de 50 a 100 ponderando a solidez/qualidade do projeto). Escreva em português elegante do Brasil.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptUser,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['recommendedSymbol', 'recommendedSupply', 'refinedDescription', 'mathematicalExplanation', 'mockWhitepaperSummary', 'sustainabilityScore'],
          properties: {
            recommendedSymbol: { type: Type.STRING },
            recommendedSupply: { type: Type.INTEGER },
            refinedDescription: { type: Type.STRING },
            mathematicalExplanation: { type: Type.STRING },
            sustainabilityScore: { type: Type.INTEGER },
            mockWhitepaperSummary: {
              type: Type.OBJECT,
              required: ['introduction', 'architecture', 'impact', 'governance'],
              properties: {
                introduction: { type: Type.STRING },
                architecture: { type: Type.STRING },
                impact: { type: Type.STRING },
                governance: { type: Type.STRING },
              },
            },
          },
        },
      },
    });

    const jsonParsed = JSON.parse((response.text || '{}').trim());
    res.json({ ...jsonParsed, mode: 'IA Ativa (Gemini)' });
  } catch (error) {
    console.error('Gemini error (copilot):', error);
    res.status(500).json({ error: 'Falha ao se conectar com Assistente de IA.', details: error && error.message });
  }
}
