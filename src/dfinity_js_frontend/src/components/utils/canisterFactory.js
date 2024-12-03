import { HttpAgent, Actor } from "@dfinity/agent";
import { getAuthClient } from "./auth";

const HOST = window.location.origin; // Use the current origin for agent host

/**
 * Creates an actor for interacting with a specified canister.
 *
 * @param {string} canisterId - The ID of the canister to interact with.
 * @param {IDL.InterfaceFactory} idl - The Interface Description Language (IDL) for the canister.
 * @returns {Promise<Actor>} The created actor for interacting with the canister.
 */
export async function createCanisterActor(canisterId, idl) {
    try {
        // Get the authenticated client
        const authClient = await getAuthClient();

        // Initialize the HttpAgent with the authenticated identity
        const agent = new HttpAgent({
            host: HOST,
            identity: authClient.getIdentity(),
        });

        // Fetch the root key in local environments (necessary for non-production)
        if (process.env.NODE_ENV !== "production") {
            await agent.fetchRootKey();
        }

        // Create and return the actor for the specified canister
        return Actor.createActor(idl, {
            agent,
            canisterId,
        });
    } catch (error) {
        console.error("Failed to create canister actor:", error);
        throw error;
    }
}
