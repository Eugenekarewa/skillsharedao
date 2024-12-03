// canister code goes here
import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic, Principal, Result } from 'azle';
import express from 'express';
import cors from 'cors';

// Define a Profile class for Skillshare DAO
class Profile {
    id: string;
    name: string;
    skills: string[];
    role: 'learner' | 'professional';
    reputation: number;
}

// Define a Proposal for DAO governance
class Proposal {
    id: string;
    title: string;
    description: string;
    votes: Record<string, boolean>;
    status: 'open' | 'closed';
}

// Define storage for profiles and proposals
const profiles = new StableBTreeMap<string, Profile>(0); // Profiles storage
const proposals = new StableBTreeMap<string, Proposal>(1); // Proposals storage

// Add or update a profile
function upsertProfile(id: string, name: string, skills: string[], role: 'learner' | 'professional'): string {
    const profile: Profile = {
        id,
        name,
        skills,
        role,
        reputation: 0, // Default reputation
    };
    profiles.insert(id, profile);
    return `Profile for ${name} has been added or updated.`;
}

// Fetch a profile by ID
function getProfile(id: string): Profile | undefined {
    return profiles.get(id);
}

// Create a DAO governance proposal
function createProposal(title: string, description: string): string {
    const proposalId = uuidv4();
    const proposal: Proposal = {
        id: proposalId,
        title,
        description,
        votes: {},
        status: 'open',
    };
    proposals.insert(proposalId, proposal);
    return `Proposal "${title}" created with ID ${proposalId}`;
}

// Vote on a proposal
function voteOnProposal(proposalId: string, userId: string, vote: boolean): string {
    const proposal = proposals.get(proposalId);
    if (!proposal) return `Proposal with ID ${proposalId} not found.`;

    if (proposal.status === 'closed') return `Proposal with ID ${proposalId} is closed.`;

    proposal.votes[userId] = vote;
    proposals.insert(proposalId, proposal);
    return `Vote registered for proposal ${proposalId}`;
}

// Close a proposal
function closeProposal(proposalId: string): string {
    const proposal = proposals.get(proposalId);
    if (!proposal) return `Proposal with ID ${proposalId} not found.`;

    proposal.status = 'closed';
    proposals.insert(proposalId, proposal);
    return `Proposal ${proposalId} has been closed.`;
}

// Express setup for the backend
const app = express();
app.use(express.json());
app.use(cors());

// API Endpoints
app.post('/profile', (req, res) => {
    const { id, name, skills, role } = req.body;
    const result = upsertProfile(id, name, skills, role);
    res.send(result);
});

app.get('/profile/:id', (req, res) => {
    const profile = getProfile(req.params.id);
    if (profile) res.json(profile);
    else res.status(404).send('Profile not found');
});

app.post('/proposal', (req, res) => {
    const { title, description } = req.body;
    const result = createProposal(title, description);
    res.send(result);
});

app.post('/proposal/:id/vote', (req, res) => {
    const { userId, vote } = req.body;
    const result = voteOnProposal(req.params.id, userId, vote);
    res.send(result);
});

app.post('/proposal/:id/close', (req, res) => {
    const result = closeProposal(req.params.id);
    res.send(result);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Skillshare DAO backend is running on http://localhost:${PORT}`);
});
