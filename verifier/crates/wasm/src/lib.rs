// SPDX-License-Identifier: Apache-2.0

pub fn verify_bytes(input: &[u8]) -> Vec<u8> {
    match std::str::from_utf8(input) {
        Ok(source) => kfd_verifier_core::verify_bundle_json(source).into_bytes(),
        Err(error) => kfd_verifier_core::verify_bundle_json(&format!(
            "{{\"invalidUtf8\":{:?}}}",
            error.to_string()
        ))
        .into_bytes(),
    }
}

#[cfg(target_arch = "wasm32")]
#[no_mangle]
pub extern "C" fn kfd_alloc(length: usize) -> *mut u8 {
    let boxed = vec![0_u8; length].into_boxed_slice();
    Box::into_raw(boxed) as *mut u8
}

#[cfg(target_arch = "wasm32")]
#[no_mangle]
pub unsafe extern "C" fn kfd_free(pointer: *mut u8, length: usize) {
    if !pointer.is_null() {
        drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(
            pointer, length,
        )));
    }
}

#[cfg(target_arch = "wasm32")]
#[no_mangle]
pub unsafe extern "C" fn kfd_verify(pointer: *const u8, length: usize) -> u64 {
    let input = std::slice::from_raw_parts(pointer, length);
    let output = verify_bytes(input).into_boxed_slice();
    let output_length = output.len() as u32;
    let output_pointer = Box::into_raw(output) as *mut u8 as u32;
    ((output_pointer as u64) << 32) | output_length as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn core_report_is_returned_byte_for_byte() {
        let input = br#"{"schemaVersion":1,"contract":"invalid","kind":"unknown","primary":"{}","artifacts":{}}"#;
        assert_eq!(
            verify_bytes(input),
            kfd_verifier_core::verify_bundle_json(std::str::from_utf8(input).unwrap()).as_bytes()
        );
    }
}
