#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CarbonOffset {
    pub sponsor: Address,
    pub total_trees: u32,
    pub total_offset_kg: u64,
}

#[contract]
pub struct CarbonCredits;

const ADMIN_KEY: Symbol = symbol_short!("ADMIN");

#[contractimpl]
impl CarbonCredits {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
    }

    pub fn add_offset(env: Env, authority: Address, sponsor: Address, offset_kg: u64) {
        authority.require_auth();

        let admin: Address = env.storage().instance().get(&ADMIN_KEY).expect("not initialized");
        if authority != admin {
            panic!("only admin can update carbon offset");
        }

        let key = sponsor.clone();
        let mut offset = env.storage().persistent().get(&key).unwrap_or(CarbonOffset {
            sponsor: sponsor.clone(),
            total_trees: 0,
            total_offset_kg: 0,
        });

        offset.total_trees += 1;
        offset.total_offset_kg += offset_kg;

        env.storage().persistent().set(&key, &offset);
    }

    pub fn get_offset(env: Env, sponsor: Address) -> CarbonOffset {
        let key = sponsor.clone();
        env.storage().persistent().get(&key).unwrap_or(CarbonOffset {
            sponsor,
            total_trees: 0,
            total_offset_kg: 0,
        })
    }
}
