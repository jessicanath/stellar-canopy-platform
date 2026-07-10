#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, symbol_short};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Tree {
    pub id: u64,
    pub species: String,
    pub planter: Address,
    pub sponsor: Address,
    pub location: String,      // GPS e.g. "45.123,-12.456"
    pub photo_ipfs: String,    // IPFS hash of photo
    pub status: Symbol,        // e.g. Sponsored, Planted, Verified
    pub creation_time: u64,
}

#[contract]
pub struct TreeRegistry;

const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const COUNTER_KEY: Symbol = symbol_short!("COUNTER");

#[contractimpl]
impl TreeRegistry {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&COUNTER_KEY, &0u64);
    }

    pub fn mint_tree(
        env: Env,
        caller: Address,
        species: String,
        planter: Address,
        sponsor: Address,
        location: String,
        photo_ipfs: String,
    ) -> u64 {
        caller.require_auth();
        
        let mut count: u64 = env.storage().instance().get(&COUNTER_KEY).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&COUNTER_KEY, &count);

        let tree = Tree {
            id: count,
            species,
            planter,
            sponsor,
            location,
            photo_ipfs,
            status: symbol_short!("Sponsrd"), // Sponsored
            creation_time: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&count, &tree);
        count
    }

    pub fn update_tree_status(
        env: Env,
        authority: Address,
        id: u64,
        new_status: Symbol,
        new_photo_ipfs: String,
    ) {
        authority.require_auth();
        
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).expect("not initialized");
        
        let mut tree: Tree = env.storage().persistent().get(&id).expect("tree not found");
        
        // Only admin or the planter can update progress
        if authority != admin && authority != tree.planter {
            panic!("unauthorized status update");
        }

        tree.status = new_status;
        if new_photo_ipfs.len() > 0 {
            tree.photo_ipfs = new_photo_ipfs;
        }

        env.storage().persistent().set(&id, &tree);
    }

    pub fn get_tree(env: Env, id: u64) -> Option<Tree> {
        env.storage().persistent().get(&id)
    }

    pub fn get_total_trees(env: Env) -> u64 {
        env.storage().instance().get(&COUNTER_KEY).unwrap_or(0)
    }
}
