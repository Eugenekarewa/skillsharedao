import { createCanisterActor } from "./canisterFactory";
import { getPrincipal, getPrincipalText, isAuthenticated } from "./auth";
import { idlFactory as icrcIDL } from "../../../declarations/icrc1-ledger/icrc1-ledger.did.js";
import { Principal } from "@dfinity/principal";

const ICRC_CANISTER_ID = "mxzaz-hqaaa-aaaar-qaada-cai";

/**
 * Approves a spender to transfer tokens on behalf of the current user.
 *
 * @param {string} spender - Principal ID of the spender.
 * @param {string | number} amount - The amount of tokens to approve.
 * @returns {Promise<any>} Result of the approval process.
 */
export async function approve(spender: string, amount: string | number) {
    try {
        const canister = await getIcrc1Canister();
        const currentPrincipal = await getPrincipal();

        return await canister.icrc2_approve({
            spender: { owner: Principal.fromText(spender), subaccount: [] },
            from: { owner: currentPrincipal, subaccount: [] },
            amount: BigInt(amount),
            fee: [], 
            memo: [],
            from_subaccount: [],
            created_at_time: [],
            expected_allowance: [],
            expires_at: [],
        });
    } catch (error) {
        console.error("Error approving spender:", error);
        throw new Error("Approval failed. Check the spender details or network connectivity.");
    }
}

/**
 * Retrieves the token balance of the current authenticated user.
 *
 * @returns {Promise<string>} The token balance as a string.
 */
export async function tokenBalance(): Promise<string> {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        return "0";
    }

    try {
        const canister = await getIcrc1Canister();
        const principal = await getPrincipalText();

        const balance = await canister.icrc1_balance_of({
            owner: Principal.fromText(principal),
            subaccount: [],
        });

        return balance.toString();
    } catch (error) {
        console.error("Error fetching token balance:", error);
        throw new Error("Failed to fetch balance. Ensure you are authenticated and try again.");
    }
}

/**
 * Retrieves the token symbol of the ICRC-1 token.
 *
 * @returns {Promise<string>} The token symbol.
 */
export async function tokenSymbol(): Promise<string> {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        return "";
    }

    try {
        const canister = await getIcrc1Canister();
        return await canister.icrc1_symbol();
    } catch (error) {
        console.error("Error fetching token symbol:", error);
        throw new Error("Failed to fetch token symbol.");
    }
}

/**
 * Creates an actor for interacting with the ICRC-1 ledger canister.
 *
 * @returns {Promise<Actor>} The actor for the ICRC-1 ledger canister.
 */
async function getIcrc1Canister() {
    try {
        return createCanisterActor(ICRC_CANISTER_ID, icrcIDL);
    } catch (error) {
        console.error("Error creating ICRC-1 canister actor:", error);
        throw new Error("Failed to connect to ICRC-1 canister. Check your setup.");
    }
}
