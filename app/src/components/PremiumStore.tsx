/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle,
  Scale,
  Compass,
  LayoutTemplate,
  ShieldCheck,
  Users,
  FileText,
  ArrowRight,
  ShoppingBag,
  Coins,
  Layers,
  Code2,
  Image as ImageIcon,
  TrendingUp,
  Megaphone,
  MessageCircle,
  Info,
} from 'lucide-react';
import { ENTERPRISE_LAUNCH_PACKAGE, ENTERPRISE_TOTAL_USD, PREMIUM_SERVICES } from '../data/mockData';
import { Token, UserWallet, EnterpriseStage } from '../types';

// ─── Mapa de cor por accent das etapas enterprise ───
const ACCENT_STYLES: Record<EnterpriseStage['accent'], {
  text: string;
  bg: string;
  border: string;
  glow: string;
}> = {
  cyan:    { text: 'text-cyan-300',    bg: 'bg-cyan-400/10',    border: 'border-cyan-400/30',    glow: 'shadow-[0_0_24px_rgba(34,211,238,0.18)]' },
  amber:   { text: 'text-amber-300',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30',   glow: 'shadow-[0_0_24px_rgba(251,191,36,0.18)]' },
  emerald: { text: 'text-emerald-300', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', glow: 'shadow-[0_0_24px_rgba(52,211,153,0.18)]' },
  purple:  { text: 'text-purple-300',  bg: 'bg-purple-400/10',  border: 'border-purple-400/30',  glow: 'shadow-[0_0_24px_rgba(192,132,252,0.18)]' },
  rose:    { text: 'text-rose-300',    bg: 'bg-rose-400/10',    border: 'border-rose-400/30',    glow: 'shadow-[0_0_24px_rgba(251,113,133,0.18)]' },
};

function getStageIcon(name: EnterpriseStage['iconName'], className: string) {
  switch (name) {
    case 'Code2':       return <Code2 className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Image':       return <ImageIcon className={className} />;
    case 'TrendingUp':  return <TrendingUp className={className} />;
    case 'Megaphone':   return <Megaphone className={className} />;
  }
}

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface PremiumStoreProps {
  tokens: Token[];
  wallet: UserWallet;
  onServicePurchased: (tokenId: string, serviceId: string) => void;
}

export default function PremiumStore({ tokens, wallet, onServicePurchased }: PremiumStoreProps) {
  const [selectedTokenId, setSelectedTokenId] = useState<string>(tokens[0]?.id || '');
  const [activeCheckoutService, setActiveCheckoutService] = useState<any | null>(null);

  const selectedToken = tokens.find(t => t.id === selectedTokenId);

  // Maps icon names dynamically
  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Scale':
        return <Scale className="w-6 h-6 text-amazon-neon" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-emerald-450" />;
      case 'LayoutTemplate':
        return <LayoutTemplate className="w-6 h-6 text-cyan-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-amber-400 animate-pulse" />;
      case 'Users':
        return <Users className="w-6 h-6 text-purple-400" />;
      case 'FileText':
        return <FileText className="w-6 h-6 text-teal-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-amazon-neon" />;
    }
  };

  const handleServiceBuySubmit = () => {
    if (!selectedToken) {
      alert('Por favor, efetue o deploy de ao menos um token antes de contratar assessoria.');
      return;
    }

    if (wallet.usdcBalance < activeCheckoutService.priceUsd) {
      alert('Saldo de USDC insuficiente na carteira. Use o faucet de teste na área Administrativa.');
      return;
    }

    onServicePurchased(selectedToken.id, activeCheckoutService.id);
    setActiveCheckoutService(null);
    alert(`Sucesso! O serviço de "${activeCheckoutService.title}" foi pago em USDC e agendado para o seu token "${selectedToken.name}". Nossos especialistas entrarão em contato.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-white relative">

      {/* Visual top bar */}
      <div className="text-center space-y-4 mb-16 max-w-2xl mx-auto">
        <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-white/5 border border-white/10 px-4 py-1.5 rounded-full inline-block font-mono">
          ACELERE SEU LANÇAMENTO
        </span>
        <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tight text-white">Serviços Regulatórios & Branding</h1>
        <p className="text-gray-300 text-sm">
          A Nortoken prega tokenização básica barata. Oferecemos serviços premium modulares e opcionais para dar tração, legitimidade on-chain e estrutura regulatória nacional aos seus RWAs.
        </p>
      </div>

      {/* ════════════ PACOTE LANÇAMENTO ENTERPRISE ════════════ */}
      <div className="mb-16">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-[10px] font-black tracking-widest text-amazon-neon uppercase bg-amazon-neon/10 border border-amazon-neon/30 px-4 py-1.5 rounded-full inline-block font-mono">
            Pacote Enterprise · Opcional
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Lançamento Enterprise <span className="italic font-serif font-medium text-amazon-neon">end-to-end</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Para projetos que querem ir além do MVP simulado. Cinco etapas sequenciais com pagamento por marco —
            entregamos auditoria Certik, bot de liquidez, AMA, campanha com 33 YouTubers e listagem em agregadores.
          </p>
        </div>

        {/* Timeline horizontal das 5 etapas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {ENTERPRISE_LAUNCH_PACKAGE.map((stage) => {
            const style = ACCENT_STYLES[stage.accent];
            return (
              <div
                key={stage.id}
                className={`relative rounded-2xl border ${style.border} ${style.bg} ${style.glow} p-5 flex flex-col gap-3 transition-transform hover:scale-[1.015] hover:-translate-y-0.5`}
              >
                {/* Número da etapa + ícone */}
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] tracking-widest uppercase ${style.text} opacity-80`}>
                    Etapa {stage.number.toString().padStart(2, '0')}
                  </span>
                  <div className={`w-9 h-9 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center`}>
                    {getStageIcon(stage.iconName, `w-4 h-4 ${style.text}`)}
                  </div>
                </div>

                {/* Título + subtitle */}
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{stage.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{stage.subtitle}</p>
                </div>

                {/* Lista de sub-items */}
                <ul className="space-y-1.5 flex-1">
                  {stage.items.map((item, idx) => (
                    <li key={idx} className="text-[11px] text-gray-300 leading-snug flex items-start gap-1.5">
                      <span className={`inline-block w-1 h-1 rounded-full ${style.text} bg-current mt-1.5 shrink-0 opacity-60`} />
                      <span className="flex-1">
                        <span className="text-gray-200">{item.label}</span>
                        {item.detail && <span className="block text-gray-500 italic text-[10px] mt-0.5">{item.detail}</span>}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Total da etapa */}
                <div className={`pt-3 mt-auto border-t ${style.border} flex items-baseline justify-between`}>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500">Subtotal</span>
                  <span className={`font-mono font-bold text-base ${style.text}`}>
                    US$ {formatUsd(stage.totalUsd)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total + CTA */}
        <div className="rounded-2xl border border-amazon-neon/30 bg-gradient-to-r from-amazon-neon/5 via-amazon-light/5 to-amazon-neon/5 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex-1 text-center md:text-left">
            <div className="text-[10px] font-mono uppercase tracking-widest text-amazon-neon mb-1.5">Investimento total estimado</div>
            <div className="flex items-baseline justify-center md:justify-start gap-2.5">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">US$ {formatUsd(ENTERPRISE_TOTAL_USD)}</span>
              <span className="text-xs text-gray-400">+40% (margem de execução já inclusa)</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed max-w-xl">
              Pagamento por etapa, contra entrega validada. Valores negociáveis em consultoria comercial dedicada com a MAZARI CORP.
              Parcelamento em 2x ou 3x por etapa disponível mediante contrato.
            </p>
          </div>

          <a
            href="https://wa.me/?text=Quero%20conversar%20sobre%20o%20Lan%C3%A7amento%20Enterprise%20da%20Nortoken"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amazon-green via-amazon-light to-amazon-neon text-petroleum-dark font-extrabold text-xs uppercase tracking-widest transition-all hover:shadow-[0_0_32px_rgba(56,189,108,0.5)] hover:scale-[1.02]"
          >
            <MessageCircle className="w-4 h-4" />
            Falar com Especialista MAZARI
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Aviso de transparência */}
        <div className="mt-4 flex items-start gap-2 text-[11px] text-gray-500 leading-relaxed max-w-3xl mx-auto px-2">
          <Info className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
          <p>
            Transparência: cada etapa entrega milestones técnicos e relatórios para sua validação.
            Só avançamos após confirmação da etapa anterior. A consultoria especializada é gratuita
            para entender escopo, prazos e ajustar valores ao seu projeto.
          </p>
        </div>
      </div>

      {/* Divisor "ou monte seu próprio mix" */}
      <div className="relative my-12 flex items-center gap-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
          ou monte seu próprio mix de serviços avulsos abaixo
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Selector Token Upgrades */}
      <div className="glass-panel border border-white/10 rounded-3xl p-5 mb-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amazon-neon" />
          <span className="text-sm font-semibold select-all">Selecione o Token para Aplicar Upgrades:</span>
        </div>
        
        {tokens.length === 0 ? (
          <span className="text-xs text-red-400 font-mono">Nenhum token ativado</span>
        ) : (
          <select
            id="premium-store-token-select"
            value={selectedTokenId}
            onChange={(e) => setSelectedTokenId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-petroleum-deep border border-white/5 focus:outline-none focus:border-amazon-neon text-sm font-semibold text-white ml-2 cursor-pointer"
          >
            {tokens.map(t => (
              <option key={t.id} value={t.id}>{t.name} (${t.symbol})</option>
            ))}
          </select>
        )}
      </div>

      {/* Grid of services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PREMIUM_SERVICES.map((serv) => {
          const isPurchased = selectedToken ? selectedToken.premiumServices.includes(serv.id) : false;
          return (
            <div
              id={`service-card-${serv.id}`}
              key={serv.id}
              className={`glass-panel rounded-3xl p-6 border transition-all flex flex-col justify-between hover:scale-[1.01] ${
                isPurchased 
                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white/5 rounded-2xl h-fit">
                    {getServiceIcon(serv.iconName)}
                  </div>
                  {serv.badge && (
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-amazon-neon text-petroleum-dark px-2.5 py-1 rounded-full">
                      {serv.badge}
                    </span>
                  )}
                  {isPurchased && (
                    <span className="text-[9px] font-mono font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                      CONTRATADO
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-gray-100">{serv.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed min-h-[75px]">{serv.description}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-400 block font-mono">VALOR ÚNICO</span>
                  <span className="text-sm font-bold text-white font-mono">{serv.priceUsd} USDC</span>
                  <span className="text-[10px] text-[gray] block font-mono">pago on-chain</span>
                </div>

                {isPurchased ? (
                  <div className="font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Agendado
                  </div>
                ) : (
                  <button
                    id={`buy-service-btn-${serv.id}`}
                    onClick={() => {
                      if (!selectedToken) {
                        alert('Crie um token antes de agendar assessoria.');
                        return;
                      }
                      setActiveCheckoutService(serv);
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-amazon-neon text-white hover:text-petroleum-dark font-bold text-xs transition-all cursor-pointer"
                  >
                    Adquirir
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CHECKOUT MODAL DRAWER SIMULATOR */}
      {activeCheckoutService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-petroleum-dark/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#050e18] border border-amazon-light/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] text-amazon-neon font-mono uppercase">Checkout de Serviço</span>
                <h3 className="font-display font-bold text-lg text-white mt-1">Nortoken Marketplace Payment</h3>
              </div>
              <button
                id="close-checkout-modal"
                onClick={() => setActiveCheckoutService(null)}
                className="bg-white/5 hover:bg-white/10 text-xs px-3 py-1 rounded-lg"
              >
                [X]
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono text-gray-300">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-400 font-mono text-[10px]">SERVIÇO MODULAR:</span>
                <span className="text-sm font-bold text-white block">{activeCheckoutService.title}</span>
                <span className="text-gray-405 block">Para aplicar ao token: <strong>{selectedToken?.name}</strong></span>
              </div>

              {/* Pagamento em USDC (on-chain, self-custody) */}
              <div className="p-3 bg-amazon-forest/15 rounded-xl border border-amazon-light/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amazon-neon" /> Pagamento em USDC
                  </span>
                  <span className="text-amazon-neon font-bold text-sm">{activeCheckoutService.priceUsd} USDC</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Seu saldo</span>
                  <span className="font-mono">{wallet.usdcBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })} USDC</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-snug">
                  Você assina a transferência direto da sua carteira (self-custody). A Nortoken não custodia fundos nem
                  processa fiat.
                </p>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
                <span>Total a liquidar:</span>
                <span className="text-cyan-400 font-bold text-sm">{activeCheckoutService.priceUsd} USDC</span>
              </div>

              <button
                id="btn-confirm-checkout-store"
                onClick={handleServiceBuySubmit}
                className="w-full py-3 bg-gradient-to-r from-amazon-green via-amazon-light to-amazon-neon text-petroleum-dark font-extrabold rounded-xl text-center text-xs cursor-pointer"
              >
                Pagar {activeCheckoutService.priceUsd} USDC
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
