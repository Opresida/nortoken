/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API: Co-pilot for Web3 Token creation using Gemini
app.post('/api/copilot', async (req, res) => {
  const {
    assetName,
    assetCategory,
    draftDescription,
    location,
    environmentalGoal,
    copilotPersona,
    fallbackSupply,
    extraContext,
  } = req.body;

  if (!assetName || !assetCategory) {
    return res.status(400).json({ error: 'assetName e assetCategory são obrigatórios.' });
  }

  // Persona injetada pelo preset de segmento (universal por padrão; amazon/temático quando ativo).
  const persona =
    typeof copilotPersona === 'string' && copilotPersona.trim()
      ? copilotPersona.trim()
      : 'Você é o Co-Pilot de Tokenização da Nortoken, um launchpad Web3 multi-mercado. ' +
        'Transforme a ideia do usuário em um token estruturado, seguro e competitivo em redes EVM. ' +
        'Escreva em português elegante do Brasil.';

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    // Offline simulation fallback
    console.log('Running co-pilot in simulation mode (No API Key provided)');
    
    // Simulate smart generator
    const suffix = assetCategory.toUpperCase().substring(0, 3);
    const generatedSymbol = assetName.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 4) || 'NOR';
    const ticker = `${generatedSymbol}${suffix.length > 2 ? suffix : 'TKN'}`;
    
    const simulatedSupply = Number(fallbackSupply) > 0 ? Number(fallbackSupply) : 1000000;
    const mathematicalExplanation =
      'Supply sugerido com base no segmento escolhido, equilibrando liquidez, distribuição e granularidade de uso.';

    const ctx = [location, environmentalGoal, extraContext].filter(Boolean).join(' · ');

    setTimeout(() => {
      return res.json({
        recommendedSymbol: ticker.substring(0, 6),
        recommendedSupply: simulatedSupply,
        refinedDescription: draftDescription
          ? `${draftDescription} (Refinado via Co-Pilot Nortoken — token do segmento "${assetCategory}" estruturado para lançamento seguro em rede EVM${ctx ? `, contexto: ${ctx}` : ''}.)`
          : `${assetName} é um token do segmento "${assetCategory}" estruturado pela Nortoken para lançamento competitivo em rede EVM, com proteções contra sniper e MEV e tokenômica equilibrada${ctx ? ` (${ctx})` : ''}.`,
        sustainabilityScore: 85,
        mathematicalExplanation,
        mockWhitepaperSummary: {
          introduction: `Introdução ao projeto ${assetName} e sua proposta de valor on-chain.`,
          architecture: 'Token EVM com fee-on-transfer transparente (incl. fee de protocolo Nortoken), proteções de lançamento e supply controlado.',
          impact: `Tração e utilidade esperadas para o token ${ticker} dentro do seu segmento e comunidade.`,
          governance: 'Modelo de governança com holders participando das decisões e da destinação de recursos do projeto.',
        },
        mode: 'Simulado (Insira sua chave no painel Secrets se desejar IA real)',
      });
    }, 800);
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

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
      "`recommendedSymbol` (string, max 6 caracteres com o ticker sugerido), " +
      "`recommendedSupply` (número inteiro adequado ao tipo de ativo/segmento), " +
      "`refinedDescription` (narrativa profissional de marketing em português, atraente e adequada ao segmento), " +
      "`mathematicalExplanation` (explicação curta do porquê do supply sugerido), " +
      "`mockWhitepaperSummary` (objeto com as strings `introduction`, `architecture`, `impact` e `governance`) " +
      `e "sustainabilityScore" (valor de 50 a 100 ponderando a solidez/qualidade do projeto). Escreva em português elegante do Brasil.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptUser,
      config: {
        systemInstruction: systemInstruction,
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
                governance: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const dataText = response.text || '{}';
    const jsonParsed = JSON.parse(dataText.trim());
    return res.json({
      ...jsonParsed,
      mode: 'IA Ativa (Gemini)'
    });
  } catch (error: any) {
    console.error('Gemini error inside server.ts co-pilot:', error);
    return res.status(500).json({
      error: 'Falha ao se conectar com Assistente de IA.',
      details: error.message
    });
  }
});

// Configure Vite integration
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Nortoken] Servidor Express running on http://localhost:${PORT}`);
  });
}

bootstrap();
