#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, symbol_short};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Planter {
    pub wallet: Address,
    pub name: String,
    pub region: String,
    pub reputation: i32,
    pub active: bool,
}

#[contract]
pub struct PlanterRegistry;

const ADMIN_KEY: Symbol = symbol_short!("ADMIN");

#[contractimpl]
impl PlanterRegistry {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
    }

    pub fn register_planter(env: Env, planter: Address, name: String, region: String) {
        planter.require_auth();
        
        let key = planter.clone();
        if env.storage().persistent().has(&key) {
            panic!("planter already registered");
        }

        let new_planter = Planter {
            wallet: planter.clone(),
            name,
            region,
            reputation: 100, // starting reputation
            active: true,
        };

        env.storage().persistent().set(&key, &new_planter);
    }

    pub fn update_reputation(env: Env, authority: Address, planter: Address, score_delta: i32) {
        authority.require_auth();
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).expect("not initialized");
        if authority != admin {
            panic!("unauthorized to update reputation");
        }

        let key = planter.clone();
        let mut profile: Planter = env.storage().persistent().get(&key).expect("planter not registered");
        profile.reputation += score_delta;
        env.storage().persistent().set(&key, &profile);
    }

    pub fn get_planter(env: Env, planter: Address) -> Option<Planter> {
        let key = planter.clone();
        env.storage().persistent().get(&key)
    }

    pub fn is_registered(env: Env, planter: Address) -> bool {
        let key = planter.clone();
        env.storage().persistent().has(&key)
    }
}
