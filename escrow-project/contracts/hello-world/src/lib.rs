#![allow(non_snake_case)]
#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, log, Env, Address, symbol_short, Symbol, String};

/// Status of the Escrow agreement
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum EscrowStatus {
    Active,     // Funds locked, waiting for work
    Submitted,  // Freelancer submitted work, waiting for approval
    Released,   // Client approved, funds released to freelancer
    Refunded,   // Deadline passed, funds returned to client
}

/// Structure to store Escrow information
#[contracttype]
#[derive(Clone)]
pub struct EscrowAgreement {
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub deadline: u64,
    pub status: EscrowStatus,
}

/// Mapping escrow_id to EscrowAgreement
#[contracttype]
pub enum EscrowBook {
    Job(u64)
}

/// Counter for generating unique Escrow IDs
const ESCROW_COUNT: Symbol = symbol_short!("E_COUNT");

#[contract]
pub struct FreelanceEscrowContract;

#[contractimpl]
impl FreelanceEscrowContract {
    
    /// Initializes a new escrow agreement
    /// Parameters:
    /// - client: Address of the person paying
    /// - freelancer: Address of the person working
    /// - amount: Amount to lock (in stroops)
    /// - duration: Seconds until the deadline
    pub fn create_escrow(env: Env, client: Address, freelancer: Address, amount: i128, duration: u64) -> u64 {
        client.require_auth();
        
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        
        let mut count: u64 = env.storage().instance().get(&ESCROW_COUNT).unwrap_or(0);
        count += 1;
        
        let deadline = env.ledger().timestamp() + duration;
        
        let agreement = EscrowAgreement {
            client: client.clone(),
            freelancer: freelancer.clone(),
            amount,
            deadline,
            status: EscrowStatus::Active,
        };
        
        env.storage().instance().set(&EscrowBook::Job(count), &agreement);
        env.storage().instance().set(&ESCROW_COUNT, &count);
        
        // Extend storage TTL (~60 days)
        env.storage().instance().extend_ttl(5184000, 5184000);
        
        log!(&env, "Escrow #{} created. Client: {}, Freelancer: {}", count, client, freelancer);
        count
    }
    
    /// Called by the freelancer to signal work completion
    pub fn submit_work(env: Env, escrow_id: u64) {
        let mut agreement = Self::view_escrow(env.clone(), escrow_id);
        
        if agreement.amount == 0 {
            panic!("Escrow not found");
        }
        
        agreement.freelancer.require_auth();
        
        if agreement.status != EscrowStatus::Active {
            panic!("Invalid status for submission");
        }
        
        agreement.status = EscrowStatus::Submitted;
        env.storage().instance().set(&EscrowBook::Job(escrow_id), &agreement);
        
        log!(&env, "Work submitted for Escrow #{}", escrow_id);
    }
    
    /// Called by the client to approve work and release funds
    pub fn release_payment(env: Env, escrow_id: u64) {
        let mut agreement = Self::view_escrow(env.clone(), escrow_id);
        
        if agreement.amount == 0 {
            panic!("Escrow not found");
        }
        
        agreement.client.require_auth();
        
        if agreement.status != EscrowStatus::Submitted {
            panic!("Work must be submitted before releasing payment");
        }
        
        agreement.status = EscrowStatus::Released;
        env.storage().instance().set(&EscrowBook::Job(escrow_id), &agreement);
        
        log!(&env, "Payment released for Escrow #{}", escrow_id);
    }
    
    /// Called by the client to get a refund if the freelancer misses the deadline
    pub fn refund(env: Env, escrow_id: u64) {
        let mut agreement = Self::view_escrow(env.clone(), escrow_id);
        
        if agreement.amount == 0 {
            panic!("Escrow not found");
        }
        
        agreement.client.require_auth();
        
        let current_time = env.ledger().timestamp();
        if current_time < agreement.deadline {
            panic!("Deadline has not passed yet");
        }
        
        if agreement.status != EscrowStatus::Active {
            panic!("Cannot refund once work is submitted or released");
        }
        
        agreement.status = EscrowStatus::Refunded;
        env.storage().instance().set(&EscrowBook::Job(escrow_id), &agreement);
        
        log!(&env, "Refund processed for Escrow #{}", escrow_id);
    }
    
    /// Views details of a specific escrow
    pub fn view_escrow(env: Env, escrow_id: u64) -> EscrowAgreement {
        let key = EscrowBook::Job(escrow_id);
        
        env.storage().instance().get(&key).unwrap_or(EscrowAgreement {
            client: Address::from_string(&String::from_str(&env, "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF")),
            freelancer: Address::from_string(&String::from_str(&env, "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF")),
            amount: 0,
            deadline: 0,
            status: EscrowStatus::Active,
        })
    }
    
    pub fn get_escrow_count(env: Env) -> u64 {
        env.storage().instance().get(&ESCROW_COUNT).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};
    
    #[test]
    fn test_escrow_flow() {
        let env = Env::default();
        let contract_id = env.register_contract(None, FreelanceEscrowContract);
        let client_sdk = FreelanceEscrowContractClient::new(&env, &contract_id);
        
        let client = Address::generate(&env);
        let freelancer = Address::generate(&env);
        
        env.ledger().with_mut(|li| li.timestamp = 1000);
        
        // 1. Create Escrow
        let id = client_sdk.create_escrow(&client, &freelancer, &500, &100);
        assert_eq!(id, 1);
        
        // 2. Submit Work (by Freelancer)
        client_sdk.submit_work(&id);
        let agreement = client_sdk.view_escrow(&id);
        assert_eq!(agreement.status, EscrowStatus::Submitted);
        
        // 3. Release Payment (by Client)
        client_sdk.release_payment(&id);
        let agreement = client_sdk.view_escrow(&id);
        assert_eq!(agreement.status, EscrowStatus::Released);
    }
}