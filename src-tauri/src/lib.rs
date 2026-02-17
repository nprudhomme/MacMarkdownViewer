use tauri::Emitter;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};

#[tauri::command]
fn print_webview(webview: tauri::Webview) -> Result<(), String> {
    webview.print().map_err(|e| e.to_string())
}

#[cfg(target_os = "macos")]
#[tauri::command]
async fn export_pdf(webview: tauri::Webview, output_path: String) -> Result<(), String> {
    use block2::RcBlock;
    use objc2::MainThreadMarker;
    use objc2_foundation::NSData;
    use objc2_foundation::NSError;
    use objc2_web_kit::{WKPDFConfiguration, WKWebView};

    let (tx, rx) = tokio::sync::oneshot::channel::<Result<Vec<u8>, String>>();
    let tx = std::sync::Mutex::new(Some(tx));

    webview
        .with_webview(move |wv| unsafe {
            let wk: &WKWebView = &*(wv.inner().cast::<WKWebView>());
            let mtm = MainThreadMarker::new().expect("with_webview runs on main thread");
            let config = WKPDFConfiguration::new(mtm);

            let block = RcBlock::new(move |data: *mut NSData, error: *mut NSError| {
                let result = if !error.is_null() {
                    let desc = (*error).localizedDescription();
                    Err(format!("PDF generation failed: {desc}"))
                } else if data.is_null() {
                    Err("PDF generation returned no data".to_string())
                } else {
                    Ok((*data).to_vec())
                };
                if let Some(sender) = tx.lock().unwrap().take() {
                    let _ = sender.send(result);
                }
            });

            wk.createPDFWithConfiguration_completionHandler(Some(&config), &block);
        })
        .map_err(|e| e.to_string())?;

    let pdf_data = rx
        .await
        .map_err(|_| "PDF generation channel closed".to_string())??;
    std::fs::write(&output_path, &pdf_data).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
async fn export_pdf(_output_path: String) -> Result<(), String> {
    Err("PDF export is only supported on macOS".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(folder_arg: Option<String>) {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![print_webview, export_pdf])
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(move |app| {
            // Build native menu
            let open_folder = MenuItemBuilder::with_id("open_folder", "Open Folder…")
                .accelerator("CmdOrCtrl+O")
                .build(app)?;

            let menu = MenuBuilder::new(app)
                .items(&[
                    &SubmenuBuilder::new(app, "File")
                        .items(&[&open_folder])
                        .separator()
                        .close_window()
                        .build()?,
                ])
                .build()?;

            app.set_menu(menu)?;

            let app_handle = app.handle().clone();
            app.on_menu_event(move |_app, event| {
                if event.id().0 == "open_folder" {
                    let _ = app_handle.emit("menu-open-folder", ());
                }
            });

            // Pass CLI arg to frontend
            if let Some(ref folder) = folder_arg {
                let folder = folder.clone();
                let handle = app.handle().clone();
                // Emit after the window is ready
                tauri::async_runtime::spawn(async move {
                    // Small delay to ensure frontend is loaded
                    tokio::time::sleep(std::time::Duration::from_millis(500)).await;
                    let _ = handle.emit("open-folder", folder);
                });
            }

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
