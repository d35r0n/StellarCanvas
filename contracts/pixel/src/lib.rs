#![no_std]

use soroban_sdk::{contract, contractevent, contractimpl, contracttype, Address, Env, Vec};

const CANVAS_SIZE: u32 = 64;

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Pixel {
    pub owner: Address,
    pub color: u32,
    pub timestamp: u64,
}

#[contractevent]
pub struct PixelPainted {
    #[topic]
    pub painter: Address,
    pub x: u32,
    pub y: u32,
    pub color: u32,
}

#[contracttype]
pub enum DataKey {
    Pixel(u32, u32),
    Admin,
    PixelCount,
}

fn pixel_key(x: u32, y: u32) -> DataKey {
    DataKey::Pixel(x, y)
}

#[contract]
pub struct PixelContract;

#[contractimpl]
impl PixelContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PixelCount, &0u32);
    }

    pub fn paint_pixel(env: Env, painter: Address, x: u32, y: u32, color: u32) {
        painter.require_auth();

        if x >= CANVAS_SIZE || y >= CANVAS_SIZE {
            panic!("coordinates out of bounds");
        }

        let key = pixel_key(x, y);
        let timestamp = env.ledger().sequence() as u64;

        let pixel = Pixel {
            owner: painter.clone(),
            color,
            timestamp,
        };

        env.storage().persistent().set(&key, &pixel);

        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::PixelCount)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::PixelCount, &(count + 1));

        PixelPainted {
            painter,
            x,
            y,
            color,
        }
        .publish(&env);
    }

    pub fn get_pixel(env: Env, x: u32, y: u32) -> Option<Pixel> {
        if x >= CANVAS_SIZE || y >= CANVAS_SIZE {
            return None;
        }
        env.storage().persistent().get(&pixel_key(x, y))
    }

    pub fn get_canvas_slice(env: Env, start_row: u32, end_row: u32) -> Vec<Option<Pixel>> {
        if start_row >= CANVAS_SIZE || end_row > CANVAS_SIZE || start_row >= end_row {
            panic!("invalid canvas slice bounds");
        }
        let mut slice = Vec::new(&env);
        for y in start_row..end_row {
            for x in 0..CANVAS_SIZE {
                slice.push_back(env.storage().persistent().get(&pixel_key(x, y)));
            }
        }
        slice
    }

    pub fn get_pixel_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::PixelCount)
            .unwrap_or(0)
    }

    pub fn canvas_size() -> u32 {
        CANVAS_SIZE
    }
}

#[cfg(test)]
mod test {
    use crate::{PixelContract, PixelContractClient};
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_init_and_canvas_size() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(PixelContract, ());
        let client = PixelContractClient::new(&env, &contract_id);

        client.init(&admin);

        assert_eq!(client.canvas_size(), 64);
        assert_eq!(client.get_pixel_count(), 0);
    }

    #[test]
    #[should_panic(expected = "already initialized")]
    fn test_double_init_panics() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(PixelContract, ());
        let client = PixelContractClient::new(&env, &contract_id);

        client.init(&admin);
        client.init(&admin);
    }

    #[test]
    fn test_paint_and_get_pixel() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let painter = Address::generate(&env);

        let contract_id = env.register(PixelContract, ());
        let client = PixelContractClient::new(&env, &contract_id);

        client.init(&admin);

        let color: u32 = 0xFF_8C_52_FF;
        client.paint_pixel(&painter, &10, &20, &color);

        let pixel = client.get_pixel(&10, &20).unwrap();
        assert_eq!(pixel.color, color);
        assert_eq!(pixel.owner, painter);

        assert_eq!(client.get_pixel_count(), 1);
    }

    #[test]
    #[should_panic(expected = "coordinates out of bounds")]
    fn test_paint_out_of_bounds() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let painter = Address::generate(&env);

        let contract_id = env.register(PixelContract, ());
        let client = PixelContractClient::new(&env, &contract_id);

        client.init(&admin);
        client.paint_pixel(&painter, &64, &0, &0xFF000000);
    }

    #[test]
    fn test_get_canvas_slice_single_row() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let painter = Address::generate(&env);

        let contract_id = env.register(PixelContract, ());
        let client = PixelContractClient::new(&env, &contract_id);

        client.init(&admin);

        client.paint_pixel(&painter, &0, &0, &0xFFFF0000);
        client.paint_pixel(&painter, &63, &0, &0xFF00FF00);
        client.paint_pixel(&painter, &10, &0, &0xFF0000FF);

        let row0 = client.get_canvas_slice(&0, &1);
        assert_eq!(row0.len(), 64);

        let p00 = row0.get(0).unwrap();
        assert_eq!(p00.unwrap().color, 0xFFFF0000);

        let p10 = row0.get(10).unwrap();
        assert_eq!(p10.unwrap().color, 0xFF0000FF);

        let p63 = row0.get(63).unwrap();
        assert_eq!(p63.unwrap().color, 0xFF00FF00);

        let p1 = row0.get(1).unwrap();
        assert!(p1.is_none());
    }

    #[test]
    #[should_panic(expected = "invalid canvas slice bounds")]
    fn test_canvas_slice_invalid_bounds() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(PixelContract, ());
        let client = PixelContractClient::new(&env, &contract_id);

        client.init(&admin);
        client.get_canvas_slice(&64, &65);
    }

    #[test]
    fn test_overwrite_pixel() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let painter = Address::generate(&env);

        let contract_id = env.register(PixelContract, ());
        let client = PixelContractClient::new(&env, &contract_id);

        client.init(&admin);

        client.paint_pixel(&painter, &5, &5, &0xFF0000FF);
        client.paint_pixel(&painter, &5, &5, &0xFFFF5500);

        let pixel = client.get_pixel(&5, &5).unwrap();
        assert_eq!(pixel.color, 0xFFFF5500);
        assert_eq!(client.get_pixel_count(), 2);
    }
}
