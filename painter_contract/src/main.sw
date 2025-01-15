contract;

use std::storage::storage_vec::*;

abi PainterContract {
    #[storage(read, write)]
    fn initialize_pixels();

    #[storage(read, write)]
    fn paint_pixel(row: u64, col: u64, color: Color);

    #[storage(read)]
    fn is_initialized() -> bool;

    #[storage(read)]
    fn get_pixels() -> [[Color; 8]; 8];
}

struct Color {
    red: u8,
    green: u8,
    blue: u8,
}

storage {
    pixels: StorageVec<StorageVec<Color>> = StorageVec {},
    is_initialized: bool = false,
}

impl PainterContract for Contract {
    #[storage(read)]
    fn is_initialized() -> bool {
        return storage.is_initialized.read();
    }

    #[storage(read)]
    fn get_pixels() -> [[Color; 8]; 8] {
        let mut px: [[Color; 8]; 8] = [[Color {
                red: 255,
                green: 255,
                blue: 255,
            }; 8]; 8        ];
        let mut i = 0;
        while i < storage.pixels.len() {
            let mut j = 0;
            while j < storage.pixels.get(i).unwrap().len() {
                px[i][j] = storage.pixels.get(i).unwrap().get(j).unwrap().read();
                j += 1;
            }
            i += 1;
        }
        return px;
    }

    #[storage(read, write)]
    fn initialize_pixels() {
        if storage.is_initialized.read() {
            revert(0);
        }

        let mut i = 0;
        while i < 8 {
            let mut j = 0;
            storage.pixels.push(StorageVec {});
            let mut row = storage.pixels.get(i).unwrap();
            while j < 8 {
                row.push(Color {
                    red: 255,
                    green: 255,
                    blue: 255,
                });
                j = j + 1;
            }
            i = i + 1;
        }

        storage.is_initialized.write(true);
    }

    #[storage(read, write)]
    fn paint_pixel(row: u64, col: u64, color: Color) {
        if storage.is_initialized.read() == false {
            revert(0);
        }

        if row >= 8 || col >= 8 {
            revert(1);
        }

        let row = storage.pixels.get(row).unwrap();
        row.set(col, color);
    }
}
