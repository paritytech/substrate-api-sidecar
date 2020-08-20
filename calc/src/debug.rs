#[cfg(feature = "debug")]
pub fn setup() {
    console_error_panic_hook::set_once();
    console_log::init_with_level(log::Level::Debug).ok();
}

#[cfg(not(feature = "debug"))]
pub fn setup() {}
