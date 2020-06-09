pub fn set_hook() {
	#[cfg(feature = "debug")]
	console_error_panic_hook::set_once();
}
