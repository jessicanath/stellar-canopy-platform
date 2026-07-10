#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, symbol_short};

#[contract]
pub struct Governance;

const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const FEE_KEY: Symbol = symbol_short!("FEE");

#[contractimpl]
impl Governance {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&FEE_KEY, &100u32); // default fee: 1% (100 basis points)
    }

    pub fn add_verifier(env: Env, admin_caller: Address, verifier: Address) {
        admin_caller.require_auth();

        let admin: Address = env.storage().instance().get(&ADMIN_KEY).expect("not initialized");
        if admin_caller != admin {
            panic!("only admin can add verifier");
        }

        env.storage().persistent().set(&verifier, &true);
    }

    pub fn remove_verifier(env: Env, admin_caller: Address, verifier: Address) {
        admin_caller.require_auth();

        let admin: Address = env.storage().instance().get(&ADMIN_KEY).expect("not initialized");
        if admin_caller != admin {
            panic!("only admin can remove verifier");
        }

        env.storage().persistent().remove(&verifier);
    }

    pub fn is_verifier(env: Env, verifier: Address) -> bool {
        env.storage().persistent().get(&verifier).unwrap_or(false)
    }

    pub fn set_platform_fee(env: Env, admin_caller: Address, fee_bps: u32) {
        admin_caller.require_auth();

        let admin: Address = env.storage().instance().get(&ADMIN_KEY).expect("not initialized");
        if admin_caller != admin {
            panic!("only admin can set platform fee");
        }

        if fee_bps > 1000 {
            panic!("fee cannot exceed 10%");
        }

        env.storage().instance().set(&FEE_KEY, &fee_bps);
    }

    pub fn get_platform_fee(env: Env) -> u32 {
        env.storage().instance().get(&FEE_KEY).unwrap_or(100)
    }
}
