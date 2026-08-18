#![no_std]

use soroban_sdk::{contract, contractevent, contractimpl, contracttype, Address, Env, Map, Vec};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Badge {
    pub id: u32,
    pub name: soroban_sdk::String,
    pub description: soroban_sdk::String,
}

#[contractevent]
pub struct BadgeAwarded {
    #[topic]
    pub player: Address,
    pub badge_id: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Badge(u32),
    PlayerBadges(Address),
    BadgeCount,
}

#[contract]
pub struct AchievementContract;

fn create_badges(env: &Env) -> Vec<Badge> {
    let mut badges = Vec::new(env);
    badges.push_back(Badge {
        id: 1,
        name: soroban_sdk::String::from_str(env, "First Pixel"),
        description: soroban_sdk::String::from_str(env, "Paint your first pixel on the canvas"),
    });
    badges.push_back(Badge {
        id: 2,
        name: soroban_sdk::String::from_str(env, "Pixel Artist"),
        description: soroban_sdk::String::from_str(env, "Paint 10 pixels"),
    });
    badges.push_back(Badge {
        id: 3,
        name: soroban_sdk::String::from_str(env, "Pixel Master"),
        description: soroban_sdk::String::from_str(env, "Paint 100 pixels"),
    });
    badges.push_back(Badge {
        id: 4,
        name: soroban_sdk::String::from_str(env, "Top 10"),
        description: soroban_sdk::String::from_str(
            env,
            "Reach the top 10 on the leaderboard",
        ),
    });
    badges
}

#[contractimpl]
impl AchievementContract {
    /// Initialize the contract with an admin and store badge definitions.
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);

        let badges = create_badges(&env);
        for badge in badges.iter() {
            env.storage()
                .instance()
                .set(&DataKey::Badge(badge.id), &badge);
        }
        env.storage()
            .instance()
            .set(&DataKey::BadgeCount, &badges.len());
    }

    /// Award a badge to a player. Returns false if already awarded.
    pub fn award_badge(env: Env, player: Address, badge_id: u32) -> bool {
        let badge: Option<Badge> = env.storage().instance().get(&DataKey::Badge(badge_id));
        if badge.is_none() {
            panic!("badge not found");
        }

        let key = DataKey::PlayerBadges(player.clone());
        let mut player_badges: Map<u32, bool> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Map::new(&env));

        if player_badges.contains_key(badge_id) {
            return false;
        }

        player_badges.set(badge_id, true);
        env.storage().persistent().set(&key, &player_badges);

        BadgeAwarded {
            player,
            badge_id,
        }
        .publish(&env);

        true
    }

    /// Return all badges awarded to a player.
    pub fn get_player_badges(env: Env, player: Address) -> Vec<Badge> {
        let key = DataKey::PlayerBadges(player);
        let player_badges: Option<Map<u32, bool>> = env.storage().persistent().get(&key);
        let empty = Map::new(&env);
        let badges = player_badges.as_ref().unwrap_or(&empty);

        let mut result = Vec::new(&env);
        for badge_id in badges.keys() {
            if let Some(badge) = env.storage().instance().get(&DataKey::Badge(badge_id)) {
                result.push_back(badge);
            }
        }
        result
    }

    /// Return all badge definitions.
    pub fn get_all_badges(env: Env) -> Vec<Badge> {
        create_badges(&env)
    }

    /// Check if a player has a specific badge.
    pub fn has_badge(env: Env, player: Address, badge_id: u32) -> bool {
        let key = DataKey::PlayerBadges(player);
        let player_badges: Option<Map<u32, bool>> = env.storage().persistent().get(&key);
        player_badges
            .map(|b| b.contains_key(badge_id))
            .unwrap_or(false)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_init_and_get_badges() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(AchievementContract, ());
        let client = AchievementContractClient::new(&env, &contract_id);

        client.init(&admin);
        let badges = client.get_all_badges();
        assert_eq!(badges.len(), 4);
        assert_eq!(badges.get(0).unwrap().id, 1);
    }

    #[test]
    fn test_award_badge() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        let contract_id = env.register(AchievementContract, ());
        let client = AchievementContractClient::new(&env, &contract_id);

        client.init(&admin);

        let awarded = client.award_badge(&player, &1);
        assert!(awarded);

        assert!(client.has_badge(&player, &1));
        assert!(!client.has_badge(&player, &2));

        let badges = client.get_player_badges(&player);
        assert_eq!(badges.len(), 1);
        assert_eq!(badges.get(0).unwrap().id, 1);
    }

    #[test]
    fn test_cannot_award_same_badge_twice() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        let contract_id = env.register(AchievementContract, ());
        let client = AchievementContractClient::new(&env, &contract_id);

        client.init(&admin);

        assert!(client.award_badge(&player, &1));
        assert!(!client.award_badge(&player, &1));

        let badges = client.get_player_badges(&player);
        assert_eq!(badges.len(), 1);
    }

    #[test]
    #[should_panic(expected = "badge not found")]
    fn test_award_nonexistent_badge() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        let contract_id = env.register(AchievementContract, ());
        let client = AchievementContractClient::new(&env, &contract_id);

        client.init(&admin);
        client.award_badge(&player, &99);
    }

    #[test]
    fn test_multiple_players() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let alice = Address::generate(&env);
        let bob = Address::generate(&env);

        let contract_id = env.register(AchievementContract, ());
        let client = AchievementContractClient::new(&env, &contract_id);

        client.init(&admin);

        client.award_badge(&alice, &1);
        client.award_badge(&alice, &2);
        client.award_badge(&bob, &1);

        assert_eq!(client.get_player_badges(&alice).len(), 2);
        assert_eq!(client.get_player_badges(&bob).len(), 1);
        assert!(client.has_badge(&alice, &1));
        assert!(client.has_badge(&alice, &2));
        assert!(client.has_badge(&bob, &1));
        assert!(!client.has_badge(&bob, &2));
    }

    #[test]
    #[should_panic(expected = "already initialized")]
    fn test_double_init_panics() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(AchievementContract, ());
        let client = AchievementContractClient::new(&env, &contract_id);

        client.init(&admin);
        client.init(&admin);
    }
}
