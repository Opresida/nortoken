/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import TokenSelect from './TokenSelect';
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
  Wallet,
} from 'lucide-react';
import { ENTERPRISE_LAUNCH_PACKAGE, ENTERPRISE_TOTAL_USD, PREMIUM_SERVICES } from '../data/mockData';
import { Token, UserWallet, EnterpriseStage, PremiumService, ServiceRequest } from '../types';

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
  const [activeCheckoutService, setActiveCheckoutService] = useState<PremiumService | null>(null);
  const [form, setForm] = useState({ wallet: '', tokenId: '', discord: '', whatsapp: '' });
  const [showThankYou, setShowThankYou] = useState(false);

  const selectedToken = tokens.find(t => t.id === selectedTokenId);

  // Abre o formulário de solicitação de um serviço
  const openRequest = (serv: PremiumService) => {
    if (tokens.length === 0) {
      alert('Crie um token antes de solicitar um serviço.');
      return;
    }
    setForm({ wallet: wallet.address || '', tokenId: selectedTokenId || tokens[0].id, discord: '', whatsapp: '' });
    setActiveCheckoutService(serv);
  };

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
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case 'Wallet':
        return <Wallet className="w-6 h-6 text-cyan-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-amazon-neon" />;
    }
  };

  // Envia a solicitação → captura os dados (futuro dashboard ADMIN) + agradecimento
  const handleRequestSubmit = () => {
    if (!activeCheckoutService) return;
    if (!form.tokenId || !form.wallet.trim() || !form.discord.trim() || !form.whatsapp.trim()) {
      alert('Preencha todos os campos para enviar a solicitação.');
      return;
    }
    const tk = tokens.find(t => t.id === form.tokenId);
    const request: ServiceRequest = {
      id: 'req-' + activeCheckoutService.id + '-' + form.tokenId,
      serviceId: activeCheckoutService.id,
      serviceTitle: activeCheckoutService.title,
      tokenId: form.tokenId,
      tokenName: tk?.name || '',
      wallet: form.wallet.trim(),
      discord: form.discord.trim(),
      whatsapp: form.whatsapp.trim(),
      createdAt: new Date().toISOString(),
    };
    // TODO: enviar para o dashboard ADMIN (a construir) + persistir no banco (Neon).
    console.log('[Nortoken] Nova solicitação de serviço:', request);
    onServicePurchased(form.tokenId, activeCheckoutService.id); // marca como "Solicitado" no token
    setActiveCheckoutService(null);
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 6000);
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
                    {formatUsd(stage.totalUsd)} USDC
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
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">{formatUsd(ENTERPRISE_TOTAL_USD)} USDC</span>
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
          <TokenSelect tokens={tokens} value={selectedTokenId} onChange={setSelectedTokenId} className="ml-2" />
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
                  {serv.comingSoon ? (
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full">
                      Em Breve
                    </span>
                  ) : isPurchased ? (
                    <span className="text-[9px] font-mono font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                      SOLICITADO
                    </span>
                  ) : serv.badge ? (
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-amazon-neon text-petroleum-dark px-2.5 py-1 rounded-full">
                      {serv.badge}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-gray-100">{serv.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed min-h-[75px]">{serv.description}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-center">
                <div>
                  {serv.comingSoon ? (
                    <span className="text-sm font-bold text-amber-300 font-mono">Em Breve</span>
                  ) : (
                    <>
                      <span className="text-[10px] text-gray-400 block font-mono">VALOR ÚNICO</span>
                      <span className="text-sm font-bold text-white font-mono">{serv.priceUsd} USDC</span>
                      <span className="text-[10px] text-gray-500 block font-mono">pago on-chain</span>
                    </>
                  )}
                </div>

                {serv.comingSoon ? (
                  <span className="font-mono text-[10px] text-amber-300/70 font-bold px-3 py-2 rounded-xl border border-amber-400/20 bg-amber-400/5">
                    Em breve
                  </span>
                ) : isPurchased ? (
                  <div className="font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Em análise
                  </div>
                ) : (
                  <button
                    id={`buy-service-btn-${serv.id}`}
                    onClick={() => openRequest(serv)}
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

      {/* FORMULÁRIO DE SOLICITAÇÃO DE SERVIÇO */}
      {activeCheckoutService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-petroleum-dark/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#050e18] border border-amazon-light/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative">

            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] text-amazon-neon font-mono uppercase">Solicitar serviço</span>
                <h3 className="font-display font-bold text-lg text-white mt-1">{activeCheckoutService.title}</h3>
                <span className="text-[11px] font-mono text-emerald-400">{activeCheckoutService.priceUsd} USDC · pago on-chain</span>
              </div>
              <button
                onClick={() => setActiveCheckoutService(null)}
                className="bg-white/5 hover:bg-white/10 text-xs px-3 py-1 rounded-lg"
              >
                [X]
              </button>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Preencha seus dados. Nossa equipe entra em contato pra alinhar escopo, prazo e o pagamento on-chain.
            </p>

            <div className="space-y-3.5 text-xs">
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Carteira</span>
                <input
                  value={form.wallet}
                  onChange={(e) => setForm({ ...form, wallet: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input font-mono"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Token que você criou</span>
                <select
                  value={form.tokenId}
                  onChange={(e) => setForm({ ...form, tokenId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-petroleum-deep border border-white/10 focus:outline-none focus:border-amazon-neon text-white cursor-pointer"
                >
                  {tokens.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (${t.symbol})</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Discord</span>
                <input
                  value={form.discord}
                  onChange={(e) => setForm({ ...form, discord: e.target.value })}
                  placeholder="seu_usuario ou link do servidor"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">WhatsApp</span>
                <input
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+55 (00) 00000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input"
                />
              </label>
            </div>

            <button
              id="btn-submit-service-request"
              onClick={handleRequestSubmit}
              className="w-full py-3 bg-gradient-to-r from-amazon-green via-amazon-light to-amazon-neon text-petroleum-dark font-extrabold rounded-xl text-center text-xs cursor-pointer"
            >
              Enviar solicitação
            </button>
          </div>
        </div>
      )}

      {/* JANELA FLUTUANTE DE AGRADECIMENTO */}
      {showThankYou && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-petroleum-dark/70 backdrop-blur-sm"
          onClick={() => setShowThankYou(false)}
        >
          <div className="w-full max-w-sm bg-[#04140f] border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-xl text-white">A Nortoken agradece!</h3>
            <p className="text-sm text-gray-300 leading-relaxed">Em breve entraremos em contato. 🌿</p>
            <button
              onClick={() => setShowThankYou(false)}
              className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 hover:text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
