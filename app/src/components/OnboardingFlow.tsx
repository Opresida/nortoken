/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Leaf, 
  Wallet, 
  ShieldCheck, 
  ChevronRight, 
  Award, 
  ArrowRight, 
  Terminal, 
  Coins 
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (simAddress: string) => void;
  onSkip: () => void;
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [onboardStep, setOnboardStep] = useState(1);
  const [simName, setSimName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulatedAddress, setSimulatedAddress] = useState('');

  const handleGenerateWallet = () => {
    setIsGenerating(true);
    // Simula a derivação de uma carteira EVM
    setTimeout(() => {
      const generated =
        '0x' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
      setSimulatedAddress(generated);
      setIsGenerating(false);
      setOnboardStep(3); // Go to third step
    }, 1500);
  };

  const handleFinishOnboarding = () => {
    onComplete(simulatedAddress || '0xNoRt0k3n00000000000000000000000000000aa');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02181a]/95 backdrop-blur-md text-white">
      
      {/* Decorative environment background */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-[#02181a] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Step indicator */}
        <div className="flex justify-between items-center text-[10px] font-black tracking-widest font-mono text-gray-400">
          <span className="text-emerald-450">NORTOKEN ECOSYSTEM</span>
          <span>PASSO {onboardStep} DE 3</span>
        </div>

        {/* STEP 1: WELCOME & IDENTITY */}
        {onboardStep === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 mx-auto flex items-center justify-center text-white">
                <Leaf className="w-6 h-6 text-[#02181a]" />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">Seja Bem-vindo à Nortoken</h2>
              <p className="text-sm text-gray-300 font-light leading-relaxed">
                O launchpad Web3 que lança seu token com proteções de nível institucional — anti-bot, anti-MEV e selo de confiança — em redes EVM (Base/Polygon), pagando em USDC.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-wider uppercase text-gray-300 block">Insira seu Nome ou Nome da Cooperativa:</label>
              <input
                id="onboard-name-input"
                type="text"
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                placeholder="Ex: Coop. de Melgaço ou Maria Silva"
                className="w-full px-4 py-3 rounded-xl border glass-input text-sm bg-white/5 border-white/10"
              />
            </div>

            <button
              id="onboard-step1-btn"
              onClick={() => {
                if (!simName.trim()) {
                  alert('Insira seu nome ou nome de sua associação de bioeconomia para continuar.');
                  return;
                }
                setOnboardStep(2);
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#02181a] font-black uppercase tracking-widest text-xs rounded-full sm:rounded-2xl text-center flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
            >
              Iniciar Onboarding
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: WALLET GENERATION */}
        {onboardStep === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center text-[#00f2fe]">
                <Wallet className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">Criar sua Identidade On-Chain</h2>
              <p className="text-sm text-gray-300 font-light leading-relaxed">
                Todo token precisa de uma carteira cripto para deter a propriedade e pagar em USDC com segurança (self-custody).
              </p>
            </div>

            {isGenerating ? (
              <div className="bg-black/40 border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center space-y-3">
                <Terminal className="w-7 h-7 text-emerald-400 animate-pulse" />
                <p className="text-xs font-mono text-emerald-400">
                  Derivando sua carteira EVM...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-center text-gray-400">
                  Nós cuidamos da segurança criptográfica sem complicação. Clique abaixo para gerar sua chave grátis Nortoken instantaneamente.
                </p>
                
                <button
                  id="onboard-gen-wallet-btn"
                  onClick={handleGenerateWallet}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#02181a] font-black uppercase tracking-widest text-xs rounded-full sm:rounded-2xl text-center cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                >
                  Criar Carteira Digital
                </button>
              </div>
            )}

            <div className="flex justify-between items-center text-xs pt-4 border-t border-white/10">
              <button onClick={() => setOnboardStep(1)} className="text-gray-400 hover:text-white cursor-pointer mb-1 block">Voltar</button>
              <button onClick={onSkip} className="text-gray-400 hover:text-white cursor-pointer mb-1 block">Pular Setup</button>
            </div>
          </div>
        )}

        {/* STEP 3: AIRDROP SUCCESS & SELO VERDE VERIFY */}
        {onboardStep === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tight text-emerald-400">Carteira Ativada!</h2>
              <p className="text-sm text-gray-300 font-light leading-relaxed">
                Sua carteira para o projeto {simName || 'Nortoken'} foi criada em rede EVM.
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2.5 font-mono text-xs">
              <div>
                <span className="text-gray-400 text-[9px] block uppercase">ENDEREÇO EVM GERADO:</span>
                <span className="text-emerald-400 font-semibold block text-[11px] truncate">{simulatedAddress}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 items-center">
                <span className="text-gray-400 text-[9px] uppercase">FAUCET DE TESTE:</span>
                <span className="text-emerald-400 font-bold text-[11px]">+1.000 USDC de teste</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-gray-300 flex gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Para comercializar créditos RWA livremente na Nortoken, lembre-se de enriquecer sua solicitação anexando documentos como mapas residuais ou CAR em PDFs posteriormente na plataforma.
              </span>
            </div>

            <button
              id="onboard-finish-btn"
              onClick={handleFinishOnboarding}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-[#02181a] font-black uppercase tracking-widest text-xs rounded-full sm:rounded-2xl text-center transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Entrar na Plataforma Nortoken
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
