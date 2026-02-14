use tauri::Emitter;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(folder_arg: Option<String>) {
    tauri::Builder::default()
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
