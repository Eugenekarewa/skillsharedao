import { createCanisterActor } from "./canisterFactory";
import { getPrincipalText, isAuthenticated, logout } from "./auth";
import { getAddressFromPrincipal } from "./marketplace";
import { idlFactory as ledgerIDL } from "../../../declarations/ledger_canister/ledger_canister.did.js";

const LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";

/**
 * Fetches the ICP balance of the authenticated user.
 *
 * @returns {Promise<string>} The ICP balance in standard format (e.g., "12.34").
 */
export async function icpBalance() {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
        return "0"; // Return zero balance if not authenticated
    }

    try {
        // Retrieve the ledger canister actor and principal information
        const canister = await getLedgerCanister();
        const principal = await getPrincipalText();

        // Convert the principal to an account address
        const account = await getAddressFromPrincipal(principal);

        // Query the ledger canister for the account balance
        const balance = await canister.account_balance_dfx({ account });

        // Convert the balance from e8s (ICPs smallest unit) to ICPs and return
        return (balance.e8s / BigInt(10 ** 8)).toString();
    } catch (err) {
        console.error("Error fetching ICP balance:", err);

        // Handle specific HTTP response errors by logging out the user
        if (err.name === "AgentHTTPResponseError") {
            logout();
        }

        return "Error fetching balance"; // Return error message for the user
    }
}

/**
 * Creates an actor for interacting with the ledger canister.
 *
 * @returns {Promise<Actor>} The actor for the ledger canister.
 */
async function getLedgerCanister() {
    return createCanisterActor(LEDGER_CANISTER_ID, ledgerIDL);
}
