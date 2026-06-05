/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  UserCheck2, 
  Coins, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Globe, 
  ArrowUpRight,
  Database,
  Users
} from 'lucide-react';
import { Token, UserWallet } from '../types';

interface AdminPanelProps {
  tokens: Token[];
  wallet: UserWallet;
  onVerifyToken: (tokenId: string, verified: boolean) => void;
  onAirdropRequested: (usdcAmount: number) => void;
}

export default function AdminPanel({ 
  tokens, 
  wallet, 
  onVerifyToken, 
  onAirdropRequested 
}: AdminPanelProps) {
  
  const handleAirdropSol = () => {
    onAirdropRequested(1000);
    alert('Sucesso! +1.000 USDC de teste foram creditados na sua carteira do Simulador.');
  };

  const handleVerifySubmit = (tokenId: string, approved: boolean) => {
    onVerifyToken(tokenId, approved);
    const label = approved ? 'Verificado & Aprovado!' : 'Selo Revogado.';
    alert(`Sucesso: Ativo ambiental "${tokenId}" foi auditado e configurado como: ${label}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-white relative space-y-8">
      
      {/* Visual Bar */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] font-black tracking-widest text-[#10b981] uppercase font-mono">GOVERNANÇA & AUDITORIA</span>
          <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight mt-1 text-white">Simulação de Verificação e Grants</h1>
          <p className="text-xs text-gray-400 mt-1">
            Audite documentações do CAR, faça airdrops de tokens de teste e gerencie as aprovações on-chain.
          </p>
        </div>

        {/* Faucet wallet airdrop trigger */}
        <div className="flex gap-2">
          <button
            id="airdrop-sol-btn"
            onClick={handleAirdropSol}
            className="flex items-center gap-2 bg-amazon-forest/40 hover:bg-amazon-light/40 hover:text-white text-amazon-neon px-5 py-2.5 rounded-xl text-xs font-mono font-bold border border-amazon-light/20 transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            Solicitar Faucet de Teste (+1.000 USDC)
          </button>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Verification Queue List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck2 className="w-5 h-5 text-[#10b981]" />
            <h2 className="text-lg font-black italic uppercase text-white">Fila de Auditoria Física e CAR</h2>
          </div>

          <div className="space-y-4">
            {tokens.map((token) => (
              <div 
                id={`audit-token-card-${token.id}`}
                key={token.id} 
                className="bg-petroleum-card border border-white/5 rounded-2xl p-5 space-y-4 font-sans text-xs"
              >
                
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{token.category}</span>
                    <h3 className="font-display font-bold text-sm text-gray-200 mt-0.5">{token.name} (${token.symbol})</h3>
                    <span className="text-[10px] text-gray-400 block font-mono mt-0.5 mt-1 underline">Contrato: {token.contractAddress}</span>
                  </div>

                  <div>
                    {token.verified ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase">
                        Selo Verde Ativo
                      </span>
                    ) : (
                      <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase">
                        Investigação Pendente
                      </span>
                    )}
                  </div>
                </div>

                {/* Docs attached preview */}
                <div className="rounded-xl bg-amazon-dark/40 border border-white/5 p-4 space-y-3">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Documentos Submetidos pelo Criador:</span>
                  
                  {token.documents.length === 0 ? (
                    <span className="text-gray-450 italic">Nenhum laudo ou licença CAR informada. Ativo classificado como não verificado comercialmente.</span>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {token.documents.map((doc) => (
                        <div key={doc.id} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/5 font-mono">
                          <span className="text-gray-305 truncate max-w-[150px]">{doc.name}</span>
                          <span className="text-amazon-neon font-bold shrink-0">{doc.fileSize}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audit decisions actions */}
                <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
                  <span className="text-gray-400">Responsável pelo deploy: <strong className="font-mono text-white text-[11px]">{token.creatorWallet.substring(0,8)}...</strong></span>
                  
                  <div className="flex gap-2">
                    {token.verified ? (
                      <button
                        id={`revoke-audit-btn-${token.id}`}
                        onClick={() => handleVerifySubmit(token.id, false)}
                        className="py-1.5 px-3 bg-red-950/40 text-red-400 hover:bg-red-950 border border-red-500/20 rounded-xl transition-all font-semibold cursor-pointer"
                      >
                        Revogar Selo
                      </button>
                    ) : (
                      <button
                        id={`approve-audit-btn-${token.id}`}
                        onClick={() => handleVerifySubmit(token.id, true)}
                        className="py-1.5 px-3 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950 border border-emerald-500/20 rounded-xl transition-all font-semibold cursor-pointer"
                      >
                        Aprovar e Liberar Selo RWA
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Right column: Governance Sandbox Metrics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-lg text-white">Sandbox Web3</h2>
          </div>

          <div className="bg-petroleum-card border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-medium text-xs text-gray-300 uppercase tracking-wide border-b border-white/5 pb-2">
              Status da Rede EVM / Testnet (Simulado)
            </h3>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Tamanho da Cadeira de Blocos:</span>
                <span className="text-white"># 142.109.493</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Latência RPC Média:</span>
                <span className="text-emerald-400">14 ms (Ultra Rápida)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-450 font-mono">Controle de Gás (Base/Polygon):</span>
                <span className="text-amazon-neon font-bold">Livre de Congestionamentos</span>
              </div>
            </div>

            <div className="p-3 bg-amazon-forest/15 rounded-xl border border-amazon-light/5 text-[10px] text-gray-350 flex gap-2 leading-relaxed">
              <HelpCircle className="w-4 h-4 text-amazon-neon shrink-0" />
              <span>
                A taxa de emissão começa em <strong>39 USDC</strong> (piso) em redes L2. Use o faucet de teste no topo direito para injetar USDC na sua carteira quantas vezes precisar.
              </span>
            </div>
          </div>

          <div className="bg-petroleum-card border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-medium text-xs text-teal-400 uppercase tracking-wide border-b border-white/5 pb-2">
              Grants Globais & Captação
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              A arquitetura on-chain simplificada da Nortoken credencia pequenos produtores para o recolhimento de Grants ecológicos mundiais como ReFi (Finanças Regenerativas), Gitcoin Grants e subsídios multilaterais do Fundo Amazônia.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
