#![no_std]

use soroban_sdk::{contract, contractevent, contractimpl, contracttype, Address, Env, Vec};

const TOP_N: u32 = 10;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct LeaderboardEntry {
    pub address: Address,
    pub score: u32,
}

#[contractevent]
pub struct ScoreAdded {
    pub player: Address,
    pub delta: u32,
    pub total: u32,
}

#[contracttype]
pub enum DataKey {
    Score(Address),
    Admin,
    PlayerList,
}

fn update_player_list(env: &Env, player: &Address) {
    let mut list: Vec<Address> = env
        .storage()
        .instance()
        .get(&DataKey::PlayerList)
        .unwrap_or_else(|| Vec::new(env));

    if !list.contains(player) {
        list.push_back(player.clone());
    }

    env.storage().instance().set(&DataKey::PlayerList, &list);
}

fn compute_top(env: &Env) -> Vec<LeaderboardEntry> {
    let player_list: Vec<Address> = env
        .storage()
        .instance()
        .get(&DataKey::PlayerList)
        .unwrap_or_else(|| Vec::new(env));

    let mut entries = Vec::new(env);
    for player in player_list.iter() {
        let score: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::Score(player.clone()))
            .unwrap_or(0);
        if score > 0 {
            entries.push_back(LeaderboardEntry {
                address: player,
                score,
            });
        }
    }

    if entries.len() <= 1 {
        return entries;
    }

    let n = entries.len();
    for i in 0..n {
        for j in 0..n - i - 1 {
            if entries.get(j).unwrap().score < entries.get(j + 1).unwrap().score {
                let tmp = entries.get(j).unwrap();
                entries.set(j, entries.get(j + 1).unwrap());
                entries.set(j + 1, tmp);
            }
        }
    }

    if entries.len() > TOP_N {
        let mut top = Vec::new(env);
        for i in 0..TOP_N {
            top.push_back(entries.get(i).unwrap());
        }
        top
    } else {
        entries
    }
}

#[contract]
pub struct LeaderboardContract;

#[contractimpl]
impl LeaderboardContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::PlayerList, &Vec::<Address>::new(&env));
    }

    pub fn add_score(env: Env, player: Address, delta: u32) -> u32 {
        let key = DataKey::Score(player.clone());
        let current: u32 = env.storage().persistent().get(&key).unwrap_or(0);
        let new_score = current + delta;
        env.storage().persistent().set(&key, &new_score);

        update_player_list(&env, &player);

        ScoreAdded {
            player,
            delta,
            total: new_score,
        }
        .publish(&env);

        new_score
    }

    pub fn get_score(env: Env, player: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Score(player))
            .unwrap_or(0)
    }

    pub fn get_top_players(env: Env) -> Vec<LeaderboardEntry> {
        compute_top(&env)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_add_and_get_score() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        let contract_id = env.register(LeaderboardContract, ());
        let client = LeaderboardContractClient::new(&env, &contract_id);

        client.init(&admin);
        assert_eq!(client.get_score(&player), 0);

        let s = client.add_score(&player, &5);
        assert_eq!(s, 5);
        assert_eq!(client.get_score(&player), 5);

        let s = client.add_score(&player, &3);
        assert_eq!(s, 8);
    }

    #[test]
    #[should_panic(expected = "already initialized")]
    fn test_double_init_panics() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let contract_id = env.register(LeaderboardContract, ());
        let client = LeaderboardContractClient::new(&env, &contract_id);
        client.init(&admin);
        client.init(&admin);
    }

    #[test]
    fn test_top_players_ordering() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let a = Address::generate(&env);
        let b = Address::generate(&env);
        let c = Address::generate(&env);

        let contract_id = env.register(LeaderboardContract, ());
        let client = LeaderboardContractClient::new(&env, &contract_id);

        client.init(&admin);
        client.add_score(&a, &5);
        client.add_score(&b, &20);
        client.add_score(&c, &15);
        client.add_score(&a, &10);

        let top = client.get_top_players();
        assert_eq!(top.len(), 3);
        assert_eq!(top.get(0).unwrap().score, 20);
        assert_eq!(top.get(1).unwrap().score, 15);
        assert_eq!(top.get(2).unwrap().score, 15);
    }

    #[test]
    fn test_top_players_trims_to_10() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(LeaderboardContract, ());
        let client = LeaderboardContractClient::new(&env, &contract_id);

        client.init(&admin);

        for i in 0..15u32 {
            let player = Address::generate(&env);
            client.add_score(&player, &(i + 1));
        }

        let top = client.get_top_players();
        assert_eq!(top.len(), 10);
        assert_eq!(top.get(0).unwrap().score, 15);
        assert_eq!(top.get(9).unwrap().score, 6);
    }

    #[test]
    fn test_empty_top() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(LeaderboardContract, ());
        let client = LeaderboardContractClient::new(&env, &contract_id);

        client.init(&admin);
        let top = client.get_top_players();
        assert_eq!(top.len(), 0);
    }
}
