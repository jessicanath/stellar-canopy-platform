#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Symbol, symbol_short};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowAgreement {
    pub tree_id: u64,
    pub sponsor: Address,
    pub planter: Address,
    pub token: Address,
    pub amount: i128,
    pub status: Symbol, // Locked, Released, Refunded
    pub release_time: u64,
}

#[contract]
pub struct Escrow;

const ADMIN_KEY: Symbol = symbol_short!("ADMIN");

#[contractimpl]
impl Escrow {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
    }

    pub fn lock_funds(
        env: Env,
        sponsor: Address,
        tree_id: u64,
        planter: Address,
        token: Address,
        amount: i128,
    ) {
        sponsor.require_auth();

        let agreement_key = tree_id;
        if env.storage().persistent().has(&agreement_key) {
            panic!("escrow already exists for this tree");
        }

        // Transfer funds from sponsor to this contract
        let client = token::Client::new(&env, &token);
        client.transfer(&sponsor, &env.current_contract_address(), &amount);

        let agreement = EscrowAgreement {
            tree_id,
            sponsor,
            planter,
            token,
            amount,
            status: symbol_short!("Locked"),
            release_time: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&agreement_key, &agreement);
    }

    pub fn release_funds(env: Env, authority: Address, tree_id: u64) {
        authority.require_auth();

        let admin: Address = env.storage().instance().get(&ADMIN_KEY).expect("not initialized");
        if authority != admin {
            panic!("only admin can release escrow funds");
        }

        let agreement_key = tree_id;
        let mut agreement: EscrowAgreement = env.storage().persistent().get(&agreement_key).expect("no escrow found");
        
        if agreement.status != symbol_short!("Locked") {
            panic!("escrow is not in Locked status");
        }

        // Transfer funds from contract to planter
        let client = token::Client::new(&env, &agreement.token);
        client.transfer(&env.current_contract_address(), &agreement.planter, &agreement.amount);

        agreement.status = symbol_short!("Releasd"); // Released
        env.storage().persistent().set(&agreement_key, &agreement);
    }

    pub fn refund_funds(env: Env, authority: Address, tree_id: u64) {
        authority.require_auth();

        let agreement_key = tree_id;
        let mut agreement: EscrowAgreement = env.storage().persistent().get(&agreement_key).expect("no escrow found");

        if agreement.status != symbol_short!("Locked") {
            panic!("escrow is not in Locked status");
        }

        let admin: Address = env.storage().instance().get(&ADMIN_KEY).expect("not initialized");
        let ledger_time = env.ledger().timestamp();
        
        // Sponsor can refund after 30 days, or admin can refund immediately
        let is_sponsor_after_deadline = authority == agreement.sponsor && ledger_time > agreement.release_time + 2592000;
        let is_admin = authority == admin;

        if !is_admin && !is_sponsor_after_deadline {
            panic!("refund unauthorized or deadline not reached");
        }

        // Transfer funds back to sponsor
        let client = token::Client::new(&env, &agreement.token);
        client.transfer(&env.current_contract_address(), &agreement.sponsor, &agreement.amount);

        agreement.status = symbol_short!("Refundd"); // Refunded
        env.storage().persistent().set(&agreement_key, &agreement);
    }

    pub fn get_escrow(env: Env, tree_id: u64) -> Option<EscrowAgreement> {
        env.storage().persistent().get(&tree_id)
    }
}
