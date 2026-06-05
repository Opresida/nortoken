/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Flags de modo da carteira — fonte única (UI + contexto).
 */

export const WALLET_MODE = (import.meta.env.VITE_WALLET_MODE as string | undefined) ?? 'mock';
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;
/** testnet real só quando o modo é 'testnet' E há um App ID do Privy configurado. */
export const IS_TESTNET = WALLET_MODE === 'testnet' && !!PRIVY_APP_ID;
